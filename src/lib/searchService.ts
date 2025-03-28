import { ChatResponse } from '@/components/chat/types';

export interface SearchRequest {
  query: string;
  num_results?: number;
}

/**
 * Send a search query to the backend
 * @param query The search query text
 * @param numResults Optional number of results to return (default: 5)
 * @returns ChatResponse with search results
 */
export async function searchWeb(query: string, numResults: number = 5): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        num_results: numResults,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error performing web search:', error);
    throw error;
  }
}