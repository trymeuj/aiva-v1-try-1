// src/lib/calendarService.ts
import { ChatResponse } from '@/components/chat/types';

export interface CalendarToolParameter {
  [key: string]: string | boolean | number | string[];
}

export interface CalendarToolRequest {
  tool: string;
  parameters: CalendarToolParameter;
}

export interface CalendarResponse {
  status?: string;
  success?: boolean;
  eventId?: string;
  message?: string;
  result?: any;
  error?: string;
  event?: any;
}

/**
 * Parse a command string like "@calendar list timeMin:2025-03-01T00:00:00Z"
 * into a structured tool request
 */
export function parseCommand(command: string): CalendarToolRequest | null {
  // Remove the "@calendar " prefix
  const trimmedCommand = command.replace(/^@calendar\s+/, '').trim();
  
  // Split the first word as the tool name
  const parts = trimmedCommand.split(' ');
  const tool = parts[0];
  
  if (!tool) {
    return null;
  }
  
  // Parse the rest as parameters in format key:value
  const parameters: CalendarToolParameter = {};
  
  // Join the rest of the parts back together
  const paramString = parts.slice(1).join(' ');
  
  // Regex to match parameters with optional quoted values
  // This will match both param:value and param:"value with spaces"
  const paramRegex = /([^:\s]+):(?:"([^"]*)"|([^\s]*))/g;
  let match;
  
  while ((match = paramRegex.exec(paramString)) !== null) {
    const key = match[1];
    // If quoted value exists, use that, otherwise use the unquoted value
    const value = match[2] !== undefined ? match[2] : match[3];
    
    // Special handling for attendees which should be an array
    if (key === 'attendees' && typeof value === 'string') {
      // Split comma-separated emails and trim whitespace
      parameters[key] = value.split(',').map(email => email.trim());
    }
    // Convert boolean and numeric values
    else if (value === 'true') {
      parameters[key] = true;
    } else if (value === 'false') {
      parameters[key] = false;
    } else if (!isNaN(Number(value)) && value !== '') {
      parameters[key] = Number(value);
    } else {
      parameters[key] = value;
    }
  }
  
  return {
    tool,
    parameters
  };
}

/**
 * Call the MCP server for Calendar operations
 */
export async function callCalendarServer(toolRequest: CalendarToolRequest): Promise<ChatResponse> {
  try {
    // Define required parameters for each tool
    const requiredParams: Record<string, string[]> = {
      'list': [],
      'create': ['summary', 'start', 'end'],
      'update': ['eventId'],
      'delete': ['eventId'],
    };
    
    // Check if all required parameters are present
    const toolRequirements = requiredParams[toolRequest.tool] || [];
    const missingParams = toolRequirements.filter(param => 
      !toolRequest.parameters[param] || 
      (typeof toolRequest.parameters[param] === 'string' && toolRequest.parameters[param].toString().trim() === '')
    );

    if (missingParams.length > 0) {
      return {
        success: true,
        reply: `Missing required parameters. Please provide ${missingParams.join(', ')} parameter${missingParams.length > 1 ? 's' : ''} for the ${toolRequest.tool} tool.`
      };
    }
    
    // Use direct URL to the API server instead of relying on rewrites
    const url = `http://localhost:4100/api/calendar/${toolRequest.tool}`;
    
    console.log("Calling Calendar API at:", url);
    console.log("With parameters:", JSON.stringify(toolRequest.parameters));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toolRequest.parameters),
    });

    console.log("response:", response);

    if (!response.ok) {
      throw new Error(`Calendar server error: ${response.statusText}`);
    }

    // Extract the JSON data from the response
    const responseData = await response.json();
    console.log("Calendar API Response data:", responseData);

    // Format the response based on the tool
    let replyContent = '';

    switch(toolRequest.tool) {
      case 'list':
        // The response is likely the array of events directly
        replyContent = formatEventsList(responseData);
        break;
      case 'create':
        replyContent = formatEventCreation(responseData);
        break;
      case 'update':
        replyContent = `✅ Event updated successfully. Event ID: ${responseData.eventId || 'N/A'}`;
        break;
      case 'delete':
        replyContent = `✅ Event deleted successfully. Event ID: ${responseData.eventId || 'N/A'}`;
        break;
      default:
        replyContent = `Operation completed: ${JSON.stringify(responseData, null, 2)}`;
    }
    
    return {
      success: true,
      reply: replyContent
    };
  } catch (error) {
    console.error('Error calling Calendar server:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error calling Calendar server'
    };
  }
}

/**
 * Check if a message is a command for the Calendar server
 */
export function isCalendarCommand(text: string): boolean {
  return text.trim().startsWith('@calendar');
}

/**
 * Format a list of events for display
 */


/**
 * Format a list of events for display
 */
function formatEventsList(events: any[]): string {
    console.log("Formatting events list. Data:", JSON.stringify(events));
    console.log("Type of events:", typeof events);
    console.log("Is array:", Array.isArray(events));
    console.log("Length:", events ? events.length : 'undefined');
    
    // Make sure we have an array of events
    if (!events || !Array.isArray(events) || events.length === 0) {
      return 'No events found matching your criteria.';
    }
    
    let result = `### 📅 Found ${events.length} event${events.length > 1 ? 's' : ''}:\n\n`;
    
    events.forEach((event, index) => {
      const startDate = formatEventDateTime(event.start);
      const endDate = formatEventDateTime(event.end);
      
      result += `#### ${index + 1}. ${event.summary || 'Untitled Event'}\n\n`;
      result += `* **When:** ${startDate} to ${endDate}\n`;
      
      if (event.location) {
        result += `* **Where:** ${event.location}\n`;
      }
  
      if (event.description) {
        const shortDescription = event.description.length > 100 
          ? event.description.substring(0, 100) + '...' 
          : event.description;
        result += `* **Description:** ${shortDescription}\n`;
      }
      
      result += `* **ID:** \`${event.id}\`\n\n`;
      
      if (index < events.length - 1) {
        result += `---\n\n`;
      }
    });
    
    result += `\n> **Tip:** To update an event, use: \`@calendar update eventId:"[event_id]" summary:"New Title"\``;
    
    return result;
  }
  
  /**
   * Format event creation response
   */
  function formatEventCreation(response: any): string {
    if (!response || (!response.event && !response.eventId)) {
      return `✅ Event created successfully.`;
    }
    
    const event = response.event || response;
    const eventId = response.eventId || event.id;
    
    const startDate = event.start ? formatEventDateTime(event.start) : 'Unknown time';
    const endDate = event.end ? formatEventDateTime(event.end) : 'Unknown time';
    
    let result = `### ✅ Event created successfully!\n\n`;
    result += `#### ${event.summary || 'Untitled Event'}\n\n`;
    result += `* **When:** ${startDate} to ${endDate}\n`;
    
    if (event.location) {
      result += `* **Where:** ${event.location}\n`;
    }
    
    if (event.description) {
      result += `* **Description:** ${event.description}\n`;
    }
    
    if (event.attendees && event.attendees.length > 0) {
      const attendeeList = event.attendees.map((a: any) => a.email || a).join(', ');
      result += `* **Attendees:** ${attendeeList}\n`;
    }
    
    result += `* **Event ID:** \`${eventId || 'N/A'}\`\n\n`;
    
    result += `\n> **Tip:** View all events with \`@calendar list\``;
    
    return result;
  }
  
/**
 * Format event date and time for display
 */
function formatEventDateTime(dateTimeObj: any): string {
  if (!dateTimeObj) return 'Unknown time';
  
  try {
    // Check if it's a date-only event
    if (dateTimeObj.date) {
      return new Date(dateTimeObj.date).toLocaleDateString();
    }
    
    // Otherwise format the datetime
    if (dateTimeObj.dateTime) {
      const date = new Date(dateTimeObj.dateTime);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
    
    return 'Unknown time';
  } catch (error) {
    return 'Invalid date';
  }
}