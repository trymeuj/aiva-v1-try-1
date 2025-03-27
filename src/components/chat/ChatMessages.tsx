'use client'

import { useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Message, MessageType } from './types'

interface ChatMessagesProps {
  messages: Message[]
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Format timestamp to display only hours and minutes
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Render different message types
  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'user':
        return (
          <div key={message.id} className="flex items-start justify-end">
            <div className="bg-blue-600 rounded-2xl rounded-tr-none p-4 shadow-sm max-w-md">
              <p className="text-white">{message.text}</p>
              <span className="text-xs text-blue-200 mt-2 block">{formatTime(message.timestamp)}</span>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://placehold.co/100x100?text=User" 
                  alt="User avatar" 
                  className="h-full w-full object-cover" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://placehold.co/100x100';
                  }} 
                  width="40" 
                  height="40"
                />
              </div>
            </div>
          </div>
        )
      
      case 'ai':
        // Format asterisks as markdown bullet points
        const formattedText = message.text
          .replace(/\*\*\*/g, '\n\n* ')  // Convert *** to markdown bullet points
          .replace(/\*\*/g, '**');        // Keep regular bold formatting

        return (
          <div key={message.id} className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <div className="space-y-3 max-w-md">
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="text-gray-800 prose prose-sm">
                  <ReactMarkdown>
                    {formattedText}
                  </ReactMarkdown>
                </div>
                <span className="text-xs text-gray-500 mt-2 block">{formatTime(message.timestamp)}</span>
              </div>
              
              {message.components?.map((component, index) => (
                <div key={`${message.id}-comp-${index}`} className="bg-white rounded-2xl p-4 shadow-sm">
                  {component.type === 'calendar' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Monday</span>
                        <span className="text-sm text-gray-500">2 events</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Tuesday</span>
                        <span className="text-sm text-gray-500">1 event</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Wednesday</span>
                        <span className="text-sm text-gray-500">3 events</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Thursday</span>
                        <span className="text-sm text-gray-500">Free</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Friday</span>
                        <span className="text-sm text-gray-500">2 events</span>
                      </div>
                    </div>
                  )}
                  <span className="text-xs text-gray-500 mt-2 block">{formatTime(message.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'typing':
        return (
          <div key={message.id} className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map(message => renderMessage(message))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}