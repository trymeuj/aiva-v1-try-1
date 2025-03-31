// src/lib/gmailService.ts
import { ChatResponse } from '@/components/chat/types';

// Add this interface to define the return type of formatEmailDetails
export interface EmailDetailsResult {
  textContent: string;
  hasAttachments: boolean;
  attachments: any[];
  emailId: string;
}

export interface GmailToolParameter {
  [key: string]: string | boolean | number | string[];
}

export interface GmailToolRequest {
  tool: string;
  parameters: GmailToolParameter;
}

export interface GmailResponse {
  status?: string;
  success?: boolean;
  messageId?: string;
  message?: string;
  result?: any;
  error?: string;
}

/**
 * Parse a command string like "@gmail list maxResults:5 query:is:unread"
 * into a structured tool request
 */
export function parseCommand(command: string): GmailToolRequest | null {
  // Remove the "@gmail " prefix
  const trimmedCommand = command.replace(/^@gmail\s+/, '').trim();
  
  // Split the first word as the tool name
  const parts = trimmedCommand.split(' ');
  const tool = parts[0];
  
  if (!tool) {
    return null;
  }
  
  // Parse the rest as parameters in format key:value
  const parameters: GmailToolParameter = {};
  
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
    
    // Special handling for comma-separated values that should be arrays
    if (key === 'attachments' && typeof value === 'string') {
      parameters[key] = value.split(',').map(item => item.trim());
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
 * Call the MCP server for Gmail operations
 */
export async function callGmailServer(toolRequest: GmailToolRequest): Promise<ChatResponse> {
  try {
    // Define required parameters for each tool
    const requiredParams: Record<string, string[]> = {
      'list': [],
      'search': ['query'],
      'get': ['id'],
      'send': ['to', 'subject', 'body'],
      'modify': ['id'],
      'attachment': ['messageId', 'attachmentId'],
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
    const url = `http://localhost:4100/api/gmail/${toolRequest.tool}`;
    
    console.log("Calling Gmail API at:", url);
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
      throw new Error(`Gmail server error: ${response.statusText}`);
    }

    // Extract the JSON data from the response
    const responseData = await response.json();
    console.log("Gmail API Response data:", responseData);

    // Format the response based on the tool
    let replyContent = '';

    switch(toolRequest.tool) {
      case 'list':
        // The response appears to be the array of emails directly
        replyContent = formatEmailsList(responseData);
        break;
      case 'search':
        // The response appears to be the array of emails directly
        replyContent = formatEmailsList(responseData);
        break;
      case 'get':
        replyContent = formatEmailDetails(responseData).textContent;
        break;
      case 'send':
        replyContent = `✅ Email sent successfully! Message ID: ${responseData.messageId || 'N/A'}`;
        break;
      case 'modify':
        replyContent = `✅ Email modified successfully. Message ID: ${responseData.messageId || 'N/A'}`;
        break;
      case 'attachment':
        replyContent = formatAttachmentDetails(responseData);
        break;
      default:
        replyContent = `Operation completed: ${JSON.stringify(responseData, null, 2)}`;
    }
    
    return {
      success: true,
      reply: replyContent
    };
  } catch (error) {
    console.error('Error calling Gmail server:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error calling Gmail server'
    };
  }
}

/**
 * Check if a message is a command for the Gmail server
 */
export function isGmailCommand(text: string): boolean {
  return text.trim().startsWith('@gmail');
}

/**
 * Format a list of emails for display
 */
function formatEmailsList(emails: any[]): string {
  console.log("Formatting emails list. Data:", JSON.stringify(emails));
  console.log("Type of emails:", typeof emails);
  console.log("Is array:", Array.isArray(emails));
  console.log("Length:", emails ? emails.length : 'undefined');
  
  // Make sure we have an array of emails
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return 'No emails found matching your criteria.';
  }
  
  let result = `### 📨 Found ${emails.length} email${emails.length > 1 ? 's' : ''}:\n\n`;
  
  emails.forEach((email, index) => {
    result += `#### ${index + 1}. ${email.subject || 'No subject'}\n\n`;
    result += `* **From:** ${email.from || 'Unknown sender'}\n`;
    result += `* **Date:** ${email.date || 'Unknown date'}\n`;
    
    // Add attachment information if available
    if (email.hasAttachments) {
      const attachmentCount = email.attachments ? email.attachments.length : '?';
      result += `* **Attachments:** ${attachmentCount} file(s)\n`;
      
      // If we have attachment details, list them
      if (email.attachments && email.attachments.length > 0) {
        result += `* **Files:**\n`;
        email.attachments.forEach((attachment: any, i: number) => {
          result += `  * ${attachment.filename} (${formatFileSize(attachment.size)})\n`;
        });
      }
    }
    
    result += `* **ID:** \`${email.id}\`\n\n`;
    
    if (index < emails.length - 1) {
      result += `---\n\n`;
    }
  });
  
  result += `\n> **Tip:** To view a specific email, use: \`@gmail get id:"[email_id]"\``;
  
  return result;
}

/**
 * Format email details for display
 */
function formatEmailDetails(email: any): EmailDetailsResult {
  if (!email) {
    return {
      textContent: 'Email not found or unable to retrieve details.',
      hasAttachments: false,
      attachments: [],
      emailId: ''
    };
  }
  
  let result = `### 📧 **Email Details**\n\n`;
  
  result += `#### Subject: ${email.subject || 'No subject'}\n\n`;
  result += `* **From:** ${email.from || 'Unknown sender'}\n`;
  result += `* **To:** ${email.to || 'No recipients'}\n`;
  result += `* **Date:** ${email.date || 'Unknown date'}\n`;
  
  if (email.labelIds && email.labelIds.length > 0) {
    result += `* **Labels:** ${email.labelIds.join(', ')}\n`;
  }
  
  result += `\n#### Message Content:\n\n`;
  
  // If we have HTML content, add a note
  if (email.body && email.body.includes('<')) {
    result += `> *Note: HTML content converted to text*\n\n`;
    
    // Basic extraction of text from HTML (very simple approach)
    const textContent = email.body
      .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim();
    
    result += textContent;
  } else {
    result += email.body || email.snippet || 'No content';
  }
  
  return {
    textContent: result,
    hasAttachments: email.hasAttachments || false,
    attachments: email.attachments || [],
    emailId: email.id || ''
  };
}

/**
 * Format attachment details for display
 */
function formatAttachmentDetails(response: any): string {
  if (!response || !response.success) {
    return 'Unable to retrieve attachment.';
  }
  
  // If we have base64 data, it's too long to display directly
  if (response.data) {
    return `### ✅ Attachment Retrieved Successfully

The attachment data has been retrieved. The data is in base64 format.

**To save the attachment:**
1. You can download it directly using:
   \`GET /api/gmail/download/:messageId/:attachmentId/:filename\`
   
2. Or you can convert the base64 data to a file using:
   
   **Browser:**
   \`\`\`javascript
   const byteCharacters = atob(base64Data);
   const byteArray = new Uint8Array(byteCharacters.length);
   for (let i = 0; i < byteCharacters.length; i++) {
     byteArray[i] = byteCharacters.charCodeAt(i);
   }
   const blob = new Blob([byteArray], {type: "application/octet-stream"});
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = "filename";
   a.click();
   \`\`\`

   **Node.js:**
   \`\`\`javascript
   import { writeFileSync } from 'fs';
   writeFileSync('filename', Buffer.from(base64Data, 'base64'));
   \`\`\`
    `;
  }
  
  return `### Attachment Information

Unable to display attachment information. Please check the response format.`;
}

/**
 * Format file size in a human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'Unknown size';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}