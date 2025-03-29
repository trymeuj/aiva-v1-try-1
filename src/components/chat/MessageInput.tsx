'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  onSearch: (query: string) => void
  onResearch: (query: string) => void
}

interface CommandSuggestion {
  command: string;
  description: string;
}

export default function MessageInput({ onSendMessage, onSearch, onResearch }: MessageInputProps): React.ReactElement {
  const [message, setMessage] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [searchMode, setSearchMode] = useState<'none' | 'search' | 'research'>('none')
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [showExpandButton, setShowExpandButton] = useState<boolean>(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Constants for expansion
  const LONG_TEXT_THRESHOLD = 100; // Characters before showing expand button

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
      if (searchMode === 'search') {
        onSearch(message)
      } else if (searchMode === 'research') {
        onResearch(message)
      } else {
        onSendMessage(message)
      }
      setMessage('')
      setShowSuggestions(false)
      setIsExpanded(false)
      setShowExpandButton(false)
    }
  }

  // Check if we need to show the expand button based on text length
  useEffect(() => {
    const needsExpand = message.length > LONG_TEXT_THRESHOLD;
    setShowExpandButton(needsExpand);
    
    // If text becomes short again while expanded, collapse
    if (!needsExpand && isExpanded) {
      setIsExpanded(false);
    }
  }, [message, isExpanded]);

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
    textareaRef.current?.focus()
  }

  // Toggle search modes
  const toggleSearchMode = (mode: 'search' | 'research'): void => {
    setSearchMode(searchMode === mode ? 'none' : mode);
    textareaRef.current?.focus()
  }

  // Toggle expanded view
  const toggleExpand = (): void => {
    setIsExpanded(!isExpanded);
    // Focus the textarea and place cursor at the end
    if (!isExpanded) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 0);
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking on the container or its children
      if (containerRef.current && containerRef.current.contains(e.target as Node)) {
        return;
      }
      setShowSuggestions(false);
      // Don't automatically collapse the expanded view on outside click
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, []);

  return (
    <div ref={containerRef} className="bg-white border-t border-gray-200 p-4 relative">
      {searchMode !== 'none' && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3/4 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-0.5 rounded-full shadow-sm">
          {searchMode === 'search' ? 'Web Search Mode' : 'Deep Research Mode'}
        </div>
      )}
      
      {/* Expanded floating textarea */}
      {isExpanded && (
        <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-300 rounded-t-lg shadow-lg z-10">
          <div className="flex justify-between items-center p-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Edit Message</span>
            <button 
              type="button" 
              className="text-gray-500 hover:text-gray-700"
              onClick={toggleExpand}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full p-4 min-h-[200px] focus:outline-none resize-none"
            placeholder={
              searchMode === 'search' 
                ? "Search the web..." 
                : searchMode === 'research'
                  ? "Research a topic in depth..."
                  : "Type your message... (Use @docs for document commands)"
            }
          />
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
            setSearchMode('none')
            textareaRef.current?.focus()
          }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </button>

        {/* Search button */}
        <button 
          type="button"
          className={`p-2 mr-1 rounded-full ${
            searchMode === 'search' 
              ? 'text-blue-600 bg-blue-100 ring-2 ring-blue-300' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={searchMode === 'search' ? "Exit search mode" : "Enable web search"}
          onClick={() => toggleSearchMode('search')}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>

        {/* Research button */}
        <button 
          type="button"
          className={`p-2 mr-3 rounded-full ${
            searchMode === 'research' 
              ? 'text-green-600 bg-green-100 ring-2 ring-green-300' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={searchMode === 'research' ? "Exit research mode" : "Enable deep research"}
          onClick={() => toggleSearchMode('research')}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        </button>

        <div className="flex-1 border border-gray-300 rounded-lg flex items-center relative">
          {/* Normal single-line input (always visible) */}
          <input 
            type="text" 
            className="flex-1 p-3 bg-transparent outline-none rounded-lg overflow-hidden text-ellipsis"
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={
              searchMode === 'search' 
                ? "Search the web..." 
                : searchMode === 'research'
                  ? "Research a topic in depth..."
                  : "Type your message... (Use @docs for document commands)"
            }
            readOnly={isExpanded}
            onClick={() => {
              if (showExpandButton && !isExpanded) {
                toggleExpand();
              }
            }}
          />
          
          {/* Expand button */}
          {showExpandButton && !isExpanded && (
            <button 
              type="button"
              className="p-2 mx-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              onClick={toggleExpand}
              title="Expand editor"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
          )}
          
          {/* Emoji button */}
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
              className="absolute bottom-full left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 mb-1 z-20"
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
            searchMode === 'search' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : searchMode === 'research'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={!message.trim()}
          title={
            searchMode === 'search' 
              ? "Search the web" 
              : searchMode === 'research'
                ? "Research in depth"
                : "Send message"
          }
        >
          {searchMode === 'search' ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          ) : searchMode === 'research' ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
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