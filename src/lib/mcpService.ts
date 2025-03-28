// src/lib/mcpService.ts
import { ChatResponse } from '@/components/chat/types';

export interface MCPToolParameter {
  [key: string]: string;
}

export interface MCPToolRequest {
  tool: string;
  parameters: MCPToolParameter;
}

export interface MCPResponse {
  status: string;
  result?: {
    content?: string;
    document_id?: string;
    [key: string]: any;
  };
  error?: string;
}

/**
 * Parse a command string like "@docs create-doc title:My Document"
 * into a structured tool request
 */
export function parseCommand(command: string): MCPToolRequest | null {
  // Remove the "@docs " prefix
  const trimmedCommand = command.replace(/^@docs\s+/, '').trim();
  
  // Split the first word as the tool name
  const parts = trimmedCommand.split(' ');
  const tool = parts[0];
  
  if (!tool) {
    return null;
  }
  
  // Parse the rest as parameters in format key:value
  const parameters: MCPToolParameter = {};
  
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
    parameters[key] = value;
  }
  
  return {
    tool,
    parameters
  };
}

/**
 * Call the MCP server with a tool request
 */
export async function callMCPServer(toolRequest: MCPToolRequest): Promise<ChatResponse> {
  try {
     // Define required parameters for each tool
     const requiredParams: Record<string, string[]> = {
      'create-doc': ['title'],
      'read-doc': ['document_id'],
      'rewrite-document': ['document_id', 'final_text'],
      'read-comments': ['document_id'],
      'create-comment': ['document_id', 'content'],
      // Add other tools and their required parameters
    };
    // Check if all required parameters are present
    const toolRequirements = requiredParams[toolRequest.tool] || [];
    const missingParams = toolRequirements.filter(param => 
      !toolRequest.parameters[param] || toolRequest.parameters[param].trim() === ''
    );

    if (missingParams.length > 0) {
      return {
        success: true,
        reply: `Missing required parameters. Please Provide ${missingParams.join(', ')} parameter for ${toolRequest.tool} tool `
      };
    }
    // Use the Next.js rewrite route instead of direct call to avoid CORS
    const url = `/mcp/${toolRequest.tool}`;
    
    let requestBody: any = {};
    
    // For read operations that use document_id, include it in the request body
    if (toolRequest.tool === 'read-doc' && toolRequest.parameters.document_id) {
      requestBody = { document_id: toolRequest.parameters.document_id };
    } else {
      // For other operations, include all parameters in the request body
      requestBody = toolRequest.parameters;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`MCP server error: ${response.statusText}`);
    }

    const mcpResponse: MCPResponse = await response.json();
    
    if (mcpResponse.status !== 'success') {
      return {
        success: false,
        error: mcpResponse.error || 'Unknown error from MCP server'
      };
    }
    
    // Format the response in a user-friendly way
    let replyContent = '';
    
    if (toolRequest.tool === 'create-doc') {
      replyContent = `✅ Document created successfully!\nDocument ID: ${mcpResponse.result?.document_id}\n${mcpResponse.result?.content || ''}`;
    } else if (toolRequest.tool === 'read-doc') {
      replyContent = `📄 Document content:\n\n${mcpResponse.result?.content}`;
    } else if (toolRequest.tool === 'rewrite-document') {
      replyContent = `✅ Document updated successfully!`;
    } else if (toolRequest.tool === 'read-comments') {
      replyContent = `💬 Comments:\n\n${mcpResponse.result?.content}`;
    } else {
      replyContent = `Operation completed successfully: ${JSON.stringify(mcpResponse.result, null, 2)}`;
    }
    
    return {
      success: true,
      reply: replyContent
    };
  } catch (error) {
    console.error('Error calling MCP server:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error calling MCP server'
    };
  }
}

/**
 * Check if a message is a command for the MCP server
 */
export function isMCPCommand(text: string): boolean {
  return text.trim().startsWith('@docs');
}