'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import MessageInput from './MessageInput'
import FeaturesBar from './FeaturesBar'
import { Message, MessageType, ApiMessage, ChatResponse } from './types'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      type: 'ai',
      text: "Hello! I'm your personal AI assistant powered by Gemini. How can I help you today?",
      timestamp: new Date(),
    }
  ])

  // Track backend conversation history
  const [conversationHistory, setConversationHistory] = useState<ApiMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your personal AI assistant powered by Gemini. How can I help you today?"
    }
  ])

  const [isTyping, setIsTyping] = useState(false)

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

  const handleSendMessage = async (text: string) => {
    // Add user message to UI
    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      text,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Show typing indicator
    setIsTyping(true)
    
    try {
      // Add user message to conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: text }
      ];
      
      // Send message to backend
      const response = await sendChatMessage(text, conversationHistory)
      
      // Handle error
      if (!response.success || !response.reply) {
        throw new Error(response.error || 'Failed to get response')
      }
      
      // Update conversation history for backend
      if (response.conversationHistory) {
        setConversationHistory(response.conversationHistory)
      }
      
      // Add AI response to UI
      const aiResponse: Message = {
        id: uuidv4(),
        type: 'ai',
        text: response.reply,
        timestamp: new Date(),
      }
      
      setIsTyping(false)
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing-indicator'), aiResponse])
      
    } catch (error) {
      console.error('Error getting response:', error)
      
      // Show error message
      const errorMessage: Message = {
        id: uuidv4(),
        type: 'ai',
        text: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
      }
      
      setIsTyping(false)
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing-indicator'), errorMessage])
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
      <ChatMessages messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
      <FeaturesBar />
    </div>
  )
}