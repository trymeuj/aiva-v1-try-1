'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Message, MessageSource, MemoryMessage } from '@/components/chat/types'

export function useMemory() {
  const [isReady, setIsReady] = useState(false)

  // Initialize on client-side only
  useEffect(() => {
    setIsReady(true)
  }, [])

  // Get all messages from storage
  const getMessages = (): MemoryMessage[] => {
    if (!isReady) return []
    
    try {
      const sessionId = localStorage.getItem('currentSessionId')
      if (!sessionId) return []
      
      const sessionData = localStorage.getItem(`session_${sessionId}`)
      if (!sessionData) return []
      
      const session = JSON.parse(sessionData)
      return session.messages || []
    } catch (error) {
      console.error('Failed to get messages from storage:', error)
      return []
    }
  }

  // Save a message to storage
  const saveMessage = (message: Message, source: MessageSource): void => {
    if (!isReady) return
    
    try {
      // Get or create session ID
      let sessionId = localStorage.getItem('currentSessionId')
      if (!sessionId) {
        sessionId = uuidv4()
        localStorage.setItem('currentSessionId', sessionId)
        localStorage.setItem(`session_${sessionId}`, JSON.stringify({
          id: sessionId,
          createdAt: new Date().toISOString(),
          messages: []
        }))
      }
      
      // Get current session
      const sessionData = localStorage.getItem(`session_${sessionId}`)
      if (!sessionData) return
      
      const session = JSON.parse(sessionData)
      
      // Add message
      const memoryMessage: MemoryMessage = {
        ...message,
        source,
        storedAt: new Date().toISOString()
      }
      
      session.messages.push(memoryMessage)
      
      // Save updated session
      localStorage.setItem(`session_${sessionId}`, JSON.stringify(session))
    } catch (error) {
      console.error('Failed to save message to storage:', error)
    }
  }

  // Clear all messages
  const clearMessages = (): void => {
    if (!isReady) return
    
    try {
      const sessionId = localStorage.getItem('currentSessionId')
      if (sessionId) {
        localStorage.removeItem(`session_${sessionId}`)
      }
      
      // Create a new session
      const newSessionId = uuidv4()
      localStorage.setItem('currentSessionId', newSessionId)
      localStorage.setItem(`session_${newSessionId}`, JSON.stringify({
        id: newSessionId,
        createdAt: new Date().toISOString(),
        messages: []
      }))
    } catch (error) {
      console.error('Failed to clear messages:', error)
    }
  }

  return {
    isReady,
    getMessages,
    saveMessage,
    clearMessages
  }
}