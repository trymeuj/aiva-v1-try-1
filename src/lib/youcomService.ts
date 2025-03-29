// src/lib/youcomService.ts
import { ChatResponse } from '@/components/chat/types';

// Define interfaces for You.com API
interface YouSmartSearchRequest {
  query: string;
  instructions?: string;
}

interface YouResearchRequest {
  query: string;
  depth?: 'basic' | 'comprehensive';
}

// You.com API URLs through Next.js rewrites
const YOU_SMART_API_URL = '/api/you/smart-search';
const YOU_RESEARCH_API_URL = '/api/you/research';

/**
 * Perform a smart search using You.com API
 * @param query The search query text
 * @param instructions Optional instructions to tailor the response
 * @returns ChatResponse with formatted search results
 */
export async function youSmartSearch(query: string, instructions?: string): Promise<ChatResponse> {
  try {
    console.log(`Sending You.com smart search: "${query}"`);
    
    const response = await fetch(YOU_SMART_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        instructions,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      reply: data.reply || 'No results found for your query.',
    };
  } catch (error) {
    console.error('Error performing You.com smart search:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during search'
    };
  }
}

/**
 * Perform a deep research query using You.com Research API
 * @param query The research query text
 * @param depth Optional research depth: 'basic' or 'comprehensive' (maintained for compatibility)
 * @returns ChatResponse with formatted research results
 */
export async function youResearch(query: string, depth: 'basic' | 'comprehensive' = 'comprehensive'): Promise<ChatResponse> {
  try {
    console.log(`Sending You.com research: "${query}" (depth: ${depth})`);
    
    const response = await fetch(YOU_RESEARCH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        depth, // Maintained for backend compatibility
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      reply: data.reply || 'No research results found for your query.',
    };
  } catch (error) {
    console.error('Error performing You.com research:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during research'
    };
  }
}