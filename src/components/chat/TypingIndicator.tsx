// src/components/chat/TypingIndicator.tsx
'use client'

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 px-2 py-1">
      <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '600ms' }}></div>
    </div>
  )
}