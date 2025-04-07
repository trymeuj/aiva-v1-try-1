'use client'

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react'

interface MessageInputProps {
  onSendMessage: (message: string, isAgentAction: boolean) => void
  onSearch: (query: string) => void
}

export default function MessageInput({ onSendMessage, onSearch }: MessageInputProps): React.ReactElement {
  const [message, setMessage] = useState<string>('')
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false)
  const [isAgentMode, setIsAgentMode] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [showExpandButton, setShowExpandButton] = useState<boolean>(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Auto-resize the textarea based on content
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      // Reset height to get the correct scrollHeight
      textArea.style.height = 'auto';
      
      // Calculate how many lines we have
      const lineHeight = parseInt(getComputedStyle(textArea).lineHeight);
      const currentLines = Math.floor(textArea.scrollHeight / lineHeight);
      
      // Show expand button if we have more than 5 lines
      setShowExpandButton(currentLines > 5);
      
      // Set the height based on content but constrain it if not expanded
      if (!isExpanded && currentLines > 5) {
        textArea.style.height = `${lineHeight * 5}px`;
      } else {
        textArea.style.height = `${textArea.scrollHeight}px`;
      }
    }
  }, [message, isExpanded]);

  // Function to toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    if (message.trim()) {
      if (isSearchMode) {
        onSearch(message)
      } else {
        onSendMessage(message, isAgentMode)
      }
      setMessage('')
      setIsExpanded(false)
    }
  }

  // Add this function to handle emoji insertion
  const insertEmoji = (emoji: string) => {
    // Insert emoji at cursor position
    const textarea = textAreaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.substring(0, start) + emoji + message.substring(end);
      setMessage(newMessage);
      
      // Set cursor position after the inserted emoji
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start + emoji.length;
        textarea.selectionEnd = start + emoji.length;
      }, 0);
    }
    
    // Hide emoji picker
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    // Submit on Enter (but not with Shift+Enter for newline)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  const toggleSearchMode = (): void => {
    setIsSearchMode(!isSearchMode);
    // Turn off agent mode when switching to search
    if (!isSearchMode) {
      setIsAgentMode(false);
    }
  }

  const toggleAgentMode = (): void => {
    setIsAgentMode(!isAgentMode);
    // Turn off search mode when switching to agent
    if (!isAgentMode) {
      setIsSearchMode(false);
    }
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4 relative">
      {isSearchMode && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3/4 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-0.5 rounded-full shadow-sm">
          Web Search Mode
        </div>
      )}
      {isAgentMode && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3/4 bg-green-100 text-green-700 text-xs font-medium px-3 py-0.5 rounded-full shadow-sm">
          Agent Action Mode
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center">
        {/* Agent Action button */}
        <button 
          type="button"
          className={`p-2 mr-3 rounded-full ${
            isAgentMode 
              ? 'text-green-600 bg-green-100 ring-2 ring-green-300' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={isAgentMode ? "Disable agent actions" : "Enable agent actions"}
          onClick={toggleAgentMode}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
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

        <div className="flex-1 border border-gray-300 rounded-lg flex items-center relative">
          <div className="relative flex-1">
            <textarea 
              ref={textAreaRef}
              placeholder={isSearchMode ? "Search the web..." : isAgentMode ? "What would you like me to do for you?" : "Type your message..."}
              className="w-full p-3 bg-transparent outline-none rounded-lg resize-none overflow-y-auto"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ maxHeight: isExpanded ? '300px' : '120px' }}
            />
            
            {/* Expand/collapse button when there are more than 5 lines */}
            {showExpandButton && (
              <button
                type="button"
                className="absolute bottom-1 right-1 p-1 text-gray-400 hover:text-gray-600 bg-white bg-opacity-80 rounded-md"
                onClick={toggleExpanded}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                <svg 
                  className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
            )}
          </div>
          
          <button 
            type="button" 
            className="p-3 text-gray-400 hover:text-gray-600"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>

          {/* Simple Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 mb-1 z-10">
              <div className="grid grid-cols-8 gap-2">
                {["😀", "😂", "🙂", "😊", "😍", "😎", "🤔", "😐",
                  "😢", "😭", "😡", "🤯", "😴", "🤒", "👍", "👎",
                  "👋", "✌️", "👏", "🙏", "💪", "🧠", "💯", "❤️"].map(emoji => (
                  <button 
                    key={emoji} 
                    className="text-2xl p-1 hover:bg-gray-100 rounded"
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <button type="submit" className="p-3 text-blue-500 hover:text-blue-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}