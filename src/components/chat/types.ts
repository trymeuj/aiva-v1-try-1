export type MessageType = 'user' | 'ai' | 'typing';

// Update this type to include 'gmail' and 'calendar'
export type MessageSource = 'user' | 'llm' | 'mcp' | 'websearch' | 'research' | 'gmail' | 'calendar';

export interface Message {
  id: string;
  type: MessageType;
  text: string;
  timestamp: Date;
  components?: MessageComponent[];
}

// Enhanced Message type for storage in memory system
export interface MemoryMessage extends Message {
  source: MessageSource;
  storedAt: string; // ISO string of storage timestamp
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