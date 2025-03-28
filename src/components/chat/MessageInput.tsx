'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  onSearch: (query: string) => void
}

interface CommandSuggestion {
  command: string;
  description: string;
}

export default function MessageInput({ onSendMessage, onSearch }: MessageInputProps): React.ReactElement {
  const [message, setMessage] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions: CommandSuggestion[] = [
    { command: 'create-doc', description: 'Create a new Google Doc' },
    { command: 'read-doc', description: 'Read content from a Google Doc' },
    { command: 'rewrite-document', description: 'Update a Google Doc' },
    { command: 'read-comments', description: 'View comments on a Google Doc' },
    { command: 'create-comment', description: 'Add a comment to a Google Doc' },
  ]

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    if (message.trim()) {
      if (isSearchMode) {
        onSearch(message)
      } else {
        onSendMessage(message)
      }
      setMessage('')
      setShowSuggestions(false)
    }
  }

  const handleInputChange = (text: string): void => {
    setMessage(text)
    
    // Show suggestions if the user types @docs
    if (text.endsWith('@docs') || text.includes('@docs ')) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const insertSuggestion = (command: string): void => {
    // If @docs is already in the message
    if (message.includes('@docs')) {
      // Replace @docs with @docs command
      setMessage(message.replace('@docs', `@docs ${command} `))
    } else {
      // Otherwise append the command
      setMessage(`${message}@docs ${command} `)
    }
    
    // Hide suggestions and focus on the input
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Toggle search mode
  const toggleSearchMode = (): void => {
    setIsSearchMode(!isSearchMode)
    inputRef.current?.focus()
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false)
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div className="bg-white border-t border-gray-200 p-4 relative">
      {isSearchMode && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3/4 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-0.5 rounded-full shadow-sm">
          Web Search Mode
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center">
        {/* Docs button */}
        <button 
          type="button"
          className="p-2 mr-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          title="Insert @docs command"
          onClick={(e) => {
            e.stopPropagation()
            setMessage(message + '@docs ')
            setShowSuggestions(true)
            setIsSearchMode(false)
            inputRef.current?.focus()
          }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </button>

        {/* Search button */}
        <button 
          type="button"
          className={`p-2 mr-3 rounded-full ${
            isSearchMode 
              ? 'text-blue-600 bg-blue-100 ring-2 ring-blue-300' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={isSearchMode ? "Exit search mode" : "Enable web search"}
          onClick={toggleSearchMode}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>

        <div className="flex-1 border border-gray-300 rounded-lg flex items-center">
          <input 
            ref={inputRef}
            type="text" 
            placeholder={isSearchMode ? "Search the web..." : "Type your message... (Use @docs for document commands)"}
            className="flex-1 p-3 bg-transparent outline-none rounded-lg"
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            type="button" 
            className="p-3 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
          
          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div 
              className="absolute bottom-full left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 mb-1 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">Available Commands</div>
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={index}
                      className="px-2 py-1.5 hover:bg-blue-50 cursor-pointer rounded"
                      onClick={() => insertSuggestion(suggestion.command)}
                    >
                      <div className="font-medium text-blue-600">{suggestion.command}</div>
                      <div className="text-xs text-gray-500">{suggestion.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <button 
          type="submit"
          className={`ml-2 p-3 text-white rounded-lg ${
            isSearchMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={!message.trim()}
          title={isSearchMode ? "Search the web" : "Send message"}
        >
          {isSearchMode ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          )}
        </button>
      </form>
    </div>
  )
}