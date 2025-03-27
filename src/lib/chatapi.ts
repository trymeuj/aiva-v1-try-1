export interface Message {
    role: string;
    content: string;
  }
  
  export interface ChatResponse {
    success: boolean;
    reply?: string;
    conversationHistory?: Message[];
    error?: string;
  }
  
  export async function sendChatMessage(message: string, conversationHistory: Message[] = []): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }