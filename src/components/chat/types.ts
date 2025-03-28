export type MessageType = 'user' | 'ai' | 'typing';

// Source of the message - to track where messages come from
export type MessageSource = 'llm' | 'websearch' | 'mcp' | 'user';

export interface Message {
  id: string;
  type: MessageType;
  text: string;
  timestamp: Date;
  components?: MessageComponent[];
}

// Extended Message with source information for memory storage
export interface MemoryMessage extends Message {
  source: MessageSource;
  storedAt: string; // ISO timestamp when stored
  metadata?: Record<string, any>; // Optional metadata (like document IDs, search queries, etc.)
}

// Session structure to group messages
export interface ConversationSession {
  id: string;
  createdAt: string; // ISO timestamp
  title?: string;
  messages: MemoryMessage[];
}

export interface MessageComponent {
  id: string;
  type: 'text' | 'calendar' | 'chart';
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