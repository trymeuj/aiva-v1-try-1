'use client'

import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Message } from './types'

// Time Display Component
function TimeDisplay({ date }: { date: Date }) {
  const [displayTime, setDisplayTime] = useState<string>('')

  useEffect(() => {
    try {
      const dateObj = new Date(date);
      setDisplayTime(dateObj.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    } catch (error) {
      console.error('Error formatting date:', error);
      setDisplayTime('');
    }
  }, [date]);

  return <>{displayTime}</>;
}

interface ChatMessagesProps {
  messages: Message[]
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedMessageId(messageId)

    // Reset icon after 1 second
    setTimeout(() => setCopiedMessageId(null), 1000)
  }

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user'
    const isAI = message.type === 'ai'

    return (
      <div key={message.id} className={`flex items-start ${isUser ? 'justify-end' : ''}`}>
        {!isUser && (
          <div className="flex-shrink-0 mr-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        )}

        <div className="relative group max-w-md">
          <div className={`p-4 shadow-sm rounded-2xl ${isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
            {isAI ? (
              <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p {...props} className="prose prose-sm" />
              }}
            >
              {message.text}
            </ReactMarkdown>
            
            ) : (
              <p>{message.text}</p>
            )}

            <span className={`text-xs ${isUser ? 'text-blue-200' : 'text-gray-500'} mt-2 block`}>
              <TimeDisplay date={message.timestamp} />
            </span>
          </div>

          {/* Copy Button - Appears on Hover */}
          <button
            onClick={() => copyToClipboard(message.text, message.id)}
            className="absolute bottom-1 right-2 hidden group-hover:flex items-center text-gray-400 hover:text-gray-600 transition"
            title="Copy message"
          >
            {copiedMessageId === message.id ? '✔️' : '📋'}
          </button>
        </div>

        {isUser && (
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
        )}
      </div>
    )
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
