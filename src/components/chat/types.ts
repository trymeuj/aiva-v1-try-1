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