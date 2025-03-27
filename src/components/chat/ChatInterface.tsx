'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import MessageInput from './MessageInput'
import FeaturesBar from './FeaturesBar'
import { Message, MessageType } from './types'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      type: 'ai',
      text: "Hello! I'm your personal AI assistant. I've been configured based on your software selections and I'm ready to help you with your tasks. What can I help you with today?",
      timestamp: new Date(),
    }
  ])

  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      text,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Show typing indicator
    setIsTyping(true)
    
    // Simulate AI response after a delay
    setTimeout(() => {
      setIsTyping(false)
      
      if (text.toLowerCase().includes('schedule')) {
        // If message is about schedule, include calendar component
        const aiResponse: Message = {
          id: uuidv4(),
          type: 'ai',
          text: "I'd be happy to help organize your schedule! I can see from your connected calendar that you have several meetings already planned. Here's an overview of your week:",
          timestamp: new Date(),
          components: [
            {
              id: uuidv4(),
              type: 'calendar',
              content: null
            }
          ]
        }
        
        setMessages(prev => [...prev, aiResponse])
        
        // Add follow-up question
        setTimeout(() => {
          const followUpMessage: Message = {
            id: uuidv4(),
            type: 'ai',
            text: "Would you like me to suggest some optimal times for focused work or help reschedule any of your existing commitments?",
            timestamp: new Date(),
          }
          
          setMessages(prev => [...prev, followUpMessage])
        }, 1000)
      } else {
        // Default response
        const aiResponse: Message = {
          id: uuidv4(),
          type: 'ai',
          text: `I understand you're asking about "${text}". How can I assist you with this task?`,
          timestamp: new Date(),
        }
        
        setMessages(prev => [...prev, aiResponse])
      }
    }, 1500)
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