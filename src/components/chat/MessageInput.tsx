'use client'

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  onSearch: (query: string) => void
}

interface CommandSuggestion {
  command: string;
  description: string;
  parameters: CommandParameter[];
}

interface CommandParameter {
  name: string;
  description: string;
  required: boolean;
}

export default function MessageInput({ onSendMessage, onSearch }: MessageInputProps): React.ReactElement {
  const [message, setMessage] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false)
  const [ghostText, setGhostText] = useState<string>('')
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null)
  const [currentParameterIndex, setCurrentParameterIndex] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)

  // Enhanced commands with parameter information
  const suggestions: CommandSuggestion[] = [
    { 
      command: 'create-doc', 
      description: 'Create a new Google Doc', 
      parameters: [
        { name: 'title', description: 'Title of the document', required: true },
        { name: 'org', description: 'Organization domain', required: false },
        { name: 'role', description: 'Permission role (e.g. writer, reader)', required: false }
      ]
    },
    { 
      command: 'read-doc', 
      description: 'Read content from a Google Doc', 
      parameters: [
        { name: 'document_id', description: 'ID of the document to read', required: true }
      ]
    },
    { 
      command: 'rewrite-document', 
      description: 'Update a Google Doc', 
      parameters: [
        { name: 'document_id', description: 'ID of the document to update', required: true },
        { name: 'final_text', description: 'New content for the document', required: true }
      ]
    },
    { 
      command: 'read-comments', 
      description: 'View comments on a Google Doc', 
      parameters: [
        { name: 'document_id', description: 'ID of the document', required: true }
      ]
    },
    { 
      command: 'create-comment', 
      description: 'Add a comment to a Google Doc', 
      parameters: [
        { name: 'document_id', description: 'ID of the document', required: true },
        { name: 'content', description: 'Comment content', required: true }
      ]
    },
    { 
      command: 'reply-comment', 
      description: 'Reply to a comment on a document', 
      parameters: [
        { name: 'document_id', description: 'ID of the document', required: true },
        { name: 'comment_id', description: 'ID of the comment to reply to', required: true },
        { name: 'reply', description: 'Reply content', required: true }
      ]
    },
    { 
      command: 'delete-reply', 
      description: 'Delete a reply from a comment', 
      parameters: [
        { name: 'document_id', description: 'ID of the document', required: true },
        { name: 'comment_id', description: 'ID of the comment', required: true },
        { name: 'reply_id', description: 'ID of the reply to delete', required: true }
      ]
    }
  ]

  // Get parameters for the currently selected command
  const getCommandParameters = (): CommandParameter[] => {
    if (!selectedCommand) return [];
    const command = suggestions.find(s => s.command === selectedCommand);
    return command ? command.parameters : [];
  }

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    if (message.trim()) {
      if (isSearchMode) {
        onSearch(message)
      } else {
        onSendMessage(message)
      }
      setMessage('')
      setGhostText('')
      setShowSuggestions(false)
      setSelectedCommand(null)
      setCurrentParameterIndex(0)
    }
  }

  // Update ghost text suggestions based on current input
  const updateGhostText = () => {
    if (!selectedCommand) {
      setGhostText('');
      return;
    }

    // Check if we still have the command in the message
    if (!message.includes(`@docs ${selectedCommand}`)) {
      setSelectedCommand(null);
      setGhostText('');
      return;
    }

    const parameters = getCommandParameters();
    if (parameters.length <= currentParameterIndex) {
      setGhostText('');
      return;
    }

    // Parse the current message to find the command and already entered parameters
    const regex = new RegExp(`@docs\\s+${selectedCommand}\\s+(.*?)$`);
    const match = message.match(regex);
    const paramsText = match ? match[1] : '';

    // Look for parameters in the format param:"value"
    const paramRegex = /(\w+):"([^"]*)"/g;
    const params: Record<string, string> = {};
    let paramMatch;
    
    // Extract all parameters that have been entered
    while ((paramMatch = paramRegex.exec(paramsText)) !== null) {
      const [_, paramName, paramValue] = paramMatch;
      params[paramName] = paramValue;
    }
    
    // Check for incomplete parameter (parameter with quotes but not closed)
    const incompleteParamMatch = paramsText.match(/(\w+):"([^"]*)$/);
    
    if (incompleteParamMatch) {
      // Currently typing a parameter value
      const [_, paramName, paramValue] = incompleteParamMatch;
      
      // If there's some value already typed AND there are more parameters to suggest
      if (paramValue && parameters.length > Object.keys(params).length + 1) {
        // Find index of current parameter
        const currentParamIndex = parameters.findIndex(p => p.name === paramName);
        if (currentParamIndex !== -1 && currentParamIndex + 1 < parameters.length) {
          // Suggest the next parameter
          const nextParam = parameters[currentParamIndex + 1];
          setGhostText(`" ${nextParam.name}:"" `);
          return;
        }
      }
      
      // Otherwise don't show suggestion while typing a parameter value
      setGhostText('');
    } else {
      // Not currently typing inside quotes, check for missing parameters
      
      // Find first parameter that hasn't been entered yet
      for (let i = 0; i < parameters.length; i++) {
        const param = parameters[i];
        if (!params[param.name]) {
          // This parameter hasn't been entered, suggest it
          setGhostText(`${param.name}:"" `);
          setCurrentParameterIndex(i);
          return;
        }
      }
      
      // All parameters have been entered
      setGhostText('');
    }
  }

  const handleInputChange = (text: string): void => {
    setMessage(text);
    
    // Clear ghost text when input is cleared
    if (!text.trim()) {
      setGhostText('');
      setSelectedCommand(null);
      setCurrentParameterIndex(0);
      return;
    }
    
    // Show command suggestions if the user types @docs
    if (text.includes('@docs ') && !selectedCommand) {
      const commandParts = text.split('@docs ')[1].trim().split(' ');
      
      if (commandParts.length === 1 && !commandParts[0].includes(':')) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else if (text.endsWith('@docs')) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    
    // Check if a command is selected or being typed
    if (selectedCommand) {
      // If we deleted the command, clear everything
      if (!text.includes(`@docs ${selectedCommand}`)) {
        setSelectedCommand(null);
        setGhostText('');
        setCurrentParameterIndex(0);
      } else {
        updateGhostText();
      }
    } else if (text.includes('@docs ')) {
      // Check if user has typed a full command
      const commandPart = text.split('@docs ')[1].trim().split(' ')[0];
      const matchedCommand = suggestions.find(s => s.command === commandPart);
      
      if (matchedCommand) {
        setSelectedCommand(matchedCommand.command);
        setCurrentParameterIndex(0);
        updateGhostText();
      }
    }
  }

  const insertSuggestion = (command: string): void => {
    // If @docs is already in the message
    if (message.includes('@docs')) {
      // Replace @docs with @docs command
      setMessage(message.replace('@docs', `@docs ${command} `));
    } else {
      // Otherwise append the command
      setMessage(`${message}@docs ${command} `);
    }
    
    // Set the selected command
    setSelectedCommand(command);
    setShowSuggestions(false);
    setCurrentParameterIndex(0);
    
    // Update ghost text for parameter suggestion
    setTimeout(() => {
      updateGhostText();
      // Focus on the input
      inputRef.current?.focus();
    }, 0);
  }

  // Complete the current ghost text suggestion
  const completeGhostText = (): void => {
    if (!ghostText) return;
    
    const newMessage = message + ghostText;
    setMessage(newMessage);
    
    // When adding a parameter, temporarily hide ghost text until user starts typing a value
    setGhostText('');
    
    // Focus back on input with cursor at the right position
    setTimeout(() => {
      const inputElement = inputRef.current;
      if (inputElement) {
        // Position cursor between quotes to make it easy to type the value
        const cursorPosition = message.length + ghostText.indexOf('""') + 1;
        inputElement.focus();
        inputElement.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    // Tab key for parameter completion
    if (e.key === 'Tab' && ghostText) {
      e.preventDefault();
      completeGhostText();
    }
  }

  // Toggle search mode
  const toggleSearchMode = (): void => {
    setIsSearchMode(!isSearchMode);
    setGhostText('');
    inputRef.current?.focus();
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    }
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    }
  }, []);

  // Synchronize ghost text position with input text and handle message changes
  useEffect(() => {
    // First, update the ghost text based on the current message
    if (selectedCommand) {
      updateGhostText();
    }

    // Then, handle the ghost text positioning
    if (inputRef.current && ghostRef.current && ghostText) {
      // Measure the width of the input text
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        const computedStyle = window.getComputedStyle(inputRef.current);
        context.font = computedStyle.font;
        const textWidth = context.measureText(message).width;
        
        // Set the left position of the ghost text
        ghostRef.current.style.left = `${textWidth + 8}px`; // 8px is the padding
      }
    }
  }, [message, selectedCommand, ghostText]);

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

        <div className="flex-1 border border-gray-300 rounded-lg flex items-center relative">
          <div className="relative flex-1">
            <input 
              ref={inputRef}
              type="text" 
              placeholder={isSearchMode ? "Search the web..." : "Type your message... (Use @docs for document commands)"}
              className="w-full p-3 bg-transparent outline-none rounded-lg"
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
            />
            {/* Ghost text for inline parameter suggestion */}
            {ghostText && (
              <span 
                ref={ghostRef}
                className="absolute top-0 p-3 text-gray-400 pointer-events-none whitespace-pre"
                style={{ left: '8px' }} // This will be adjusted by the effect
              >
                {ghostText}
              </span>
            )}
          </div>
          
          {/* Tab hint */}
          {ghostText && (
            <div className="px-2 py-1 mr-2 bg-gray-100 text-gray-500 text-xs rounded">
              Tab
            </div>
          )}
          
          <button 
            type="button" 
            className="p-3 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
          
          {/* Command suggestions dropdown */}
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
                      <div className="text-xs text-gray-400 mt-1">
                        Parameters: {suggestion.parameters.map(p => p.name).join(', ')}
                      </div>
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