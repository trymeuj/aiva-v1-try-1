export enum MessageType {
  User = 'user',
  AI = 'ai',
  Typing = 'typing'
}

export enum MessageSource {
  Chat = 'chat',
  Workflow = 'workflow',
  Tool = 'tool',
  User = 'user',
  LLM = 'llm',
  MCP = 'mcp',
  Gmail = 'gmail',
  Calendar = 'calendar',
  WebSearch = 'websearch',
  Research = 'research'
}

export interface Message {
  id: string;
  type: string;
  text: string;
  timestamp: Date;
  source?: MessageSource;
  components?: MessageComponent[];
}

// Enhanced Message type for storage in memory system
export interface MemoryMessage extends Message {
  source: MessageSource;
  storedAt: string; // ISO string of storage timestamp
}

export interface MessageComponent {
  id: string;
  type: string;
  content: any;
}

// API communication types for backend integration
export interface ApiMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory: ApiMessage[];
}

export interface ChatResponse {
  success: boolean;
  reply?: string;
  conversationHistory?: ApiMessage[];
  error?: string;
}

export interface SearchRequest {
  query: string;
  num_results?: number;
  instructions?: string;
}

export interface ResearchRequest {
  query: string;
  depth?: 'basic' | 'comprehensive';
}

export interface Command {
  tool: string;
  params: Record<string, string>;
}

export interface WorkflowResult {
  status: 'completed' | 'needs_clarification' | 'error';
  step_id?: string;
  error?: string;
  questions?: string;
  missing_params?: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }>;
}