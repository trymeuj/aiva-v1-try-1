'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useMemory } from '@/hooks/useMemory'
import { MessageSource } from './types'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import MessageInput from './MessageInput'
import FeaturesBar from './FeaturesBar'
import MCPToolsHelp from './MCPToolsHelp'
import { Message, MessageType, ApiMessage, ChatResponse } from './types'
import { isMCPCommand, parseCommand, callMCPServer } from '@/lib/mcpService'
import { searchWeb } from '@/lib/searchService'

export default function ChatInterface(): React.ReactElement {
  const welcomeMessage = "Hello! I'm your personal AI assistant powered by Gemini. How can I help you today?\n\nTIP: You can use @docs commands to interact with Google Docs. Click the document icon in the message input or type @docs to see available commands. Click the search icon to search the web.";
  
  // Initialize memory hook
  const { isReady, getMessages, saveMessage } = useMemory()

  // Initialize with welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      type: 'ai',
      text: welcomeMessage,
      timestamp: new Date(),
    }
  ])

  // Track backend conversation history
  const [conversationHistory, setConversationHistory] = useState<ApiMessage[]>([
    {
      role: 'assistant',
      content: welcomeMessage
    }
  ])

  const [isTyping, setIsTyping] = useState<boolean>(false)

  // Load messages from storage after component mounts
  useEffect(() => {
    if (isReady) {
      const storedMessages = getMessages()
      
      if (storedMessages.length > 0) {
        // Use stored messages if available
        setMessages(storedMessages)
        
        // Convert stored messages to API format for conversation history
        const apiMessages: ApiMessage[] = storedMessages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
        
        setConversationHistory(apiMessages)
      } else {
        // No stored messages, store the welcome message
        saveMessage(messages[0], 'llm')
      }
    }
  }, [isReady])

  // Function to send chat message to backend
  const sendChatMessage = async (message: string, history: ApiMessage[]): Promise<ChatResponse> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: history,
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

  const handleSendMessage = async (text: string): Promise<void> => {
    // Add user message to UI
    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      text,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Save user message to memory
    saveMessage(userMessage, 'user');
    
    // Show typing indicator
    setIsTyping(true)
    
    try {
      // Add user message to conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: text }
      ];
      
      let response: ChatResponse;

      // Check if this is an MCP command
      if (isMCPCommand(text)) {
        console.log('Detected MCP command:', text);
        const command = parseCommand(text);
        
        if (command) {
          // Route to MCP server
          response = await callMCPServer(command);
          
          if (response.success && response.reply) {
            // Update conversation history for MCP interaction
            const mcpConversationUpdate = [
              ...updatedHistory,
              { role: 'assistant', content: response.reply }
            ];
            setConversationHistory(mcpConversationUpdate);
          }
        } else {
          response = {
            success: false,
            error: "Invalid command format. Please use format: @docs [tool] [param1:value1] [param2:value2]"
          };
        }
      } else {
        // Route to Gemini for normal chat
        response = await sendChatMessage(text, conversationHistory);
        
        // Update conversation history for backend (only for Gemini)
        if (response.success && response.conversationHistory) {
          setConversationHistory(response.conversationHistory);
        }
      }
      
      // Handle error
      if (!response.success || !response.reply) {
        throw new Error(response.error || 'Failed to get response');
      }
      
      // Add AI response to UI
      const aiResponse: Message = {
        id: uuidv4(),
        type: 'ai',
        text: response.reply,
        timestamp: new Date(),
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing-indicator'), aiResponse]);
      
      // Store AI response in memory with appropriate source
      const source: MessageSource = isMCPCommand(text) ? 'mcp' : 'llm';
      saveMessage(aiResponse, source);
      
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Show error message
      const errorMessage: Message = {
        id: uuidv4(),
        type: 'ai',
        text: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing-indicator'), errorMessage]);
      
      // Store error message in memory
      saveMessage(errorMessage, 'llm');
    }
  }

  // Function to handle web search
  const handleSearch = async (query: string): Promise<void> => {
    // Add user message to UI with search indicator
    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      text: `🔍 Searching for: "${query}"`,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Store search query in memory
    saveMessage(userMessage, 'user');
    
    // Show typing indicator
    setIsTyping(true)
    
    try {
      // Call the search API
      const response = await searchWeb(query);
      
      // Handle error
      if (!response.success || !response.reply) {
        throw new Error(response.error || 'Failed to get search results');
      }
      
      // Add search results to UI
      const searchResponse: Message = {
        id: uuidv4(),
        type: 'ai',
        text: response.reply,
        timestamp: new Date(),
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing-indicator'), searchResponse]);
      
      // Store search results in memory
      saveMessage(searchResponse, 'websearch');
      
      // Add search result to conversation history
      // This makes the search results available for LLM context
      const searchQueryMessage: ApiMessage = { 
        role: 'user', 
        content: `Search query: ${query}` 
      };
      const searchResultMessage: ApiMessage = { 
        role: 'assistant', 
        content: response.reply 
      };
      
      setConversationHistory(prevHistory => [
        ...prevHistory,
        searchQueryMessage,
        searchResultMessage
      ]);
      
    } catch (error) {
      console.error('Error getting search results:', error);
      
      // Show error message
      const errorMessage: Message = {
        id: uuidv4(),
        type: 'ai',
        text: error instanceof Error ? error.message : 'Sorry, I encountered an error during the search. Please try again later.',
        timestamp: new Date(),
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing-indicator'), errorMessage]);
      
      // Store error message in memory
      saveMessage(errorMessage, 'websearch');
    }
  }

  // Add typing indicator when AI is typing
  useEffect(() => {
    if (isTyping) {
      const typingMessage: Message = {
        id: 'typing-indicator',
        type: 'typing',
        text: '',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, typingMessage])
    } else {
      setMessages(prev => prev.filter(message => message.id !== 'typing-indicator'))
    }
  }, [isTyping])

  return (
    <div id="chat-interface" className="min-h-screen bg-gray-50 flex flex-col">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <MCPToolsHelp />
        </div>
        <ChatMessages messages={messages} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} onSearch={handleSearch} />
      <FeaturesBar />
    </div>
  )
}