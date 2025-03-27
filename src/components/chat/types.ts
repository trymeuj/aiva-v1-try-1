export type MessageType = 'user' | 'ai' | 'typing';

export interface Message {
  id: string;
  type: MessageType;
  text: string;
  timestamp: Date;
  components?: MessageComponent[];
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