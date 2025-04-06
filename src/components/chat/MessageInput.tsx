'use client'

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  onSearch: (query: string) => void
  onResearch?: (query: string) => void
}

interface CommandParameter {
  name: string;
  description: string;
  required: boolean;
}

interface CommandSuggestion {
  command: string;
  description: string;
  parameters: CommandParameter[];
}

export default function MessageInput({ onSendMessage, onSearch, onResearch }: MessageInputProps): React.ReactElement {
  const [message, setMessage] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false)
  const [ghostText, setGhostText] = useState<string>('')
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null)
  const [commandType, setCommandType] = useState<'docs' | 'gmail' | 'calendar' | null>(null)
  const [currentParameterIndex, setCurrentParameterIndex] = useState<number>(0)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [showExpandButton, setShowExpandButton] = useState<boolean>(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)
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

  // Enhanced commands with parameter information for docs
  const docsSuggestions: CommandSuggestion[] = [
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
  ];

  // Gmail suggestions
  const gmailSuggestions: CommandSuggestion[] = [
    { 
      command: 'list', 
      description: 'List emails from your inbox', 
      parameters: [
        { name: 'maxResults', description: 'Number of emails to return', required: false },
        { name: 'query', description: 'Gmail search query', required: false },
        { name: 'includeBody', description: 'Include email body in results', required: false }
      ] 
    },
    { 
      command: 'search', 
      description: 'Search for specific emails', 
      parameters: [
        { name: 'query', description: 'Gmail search query', required: true },
        { name: 'maxResults', description: 'Number of emails to return', required: false },
        { name: 'includeBody', description: 'Include email body in results', required: false }
      ] 
    },
    { 
      command: 'get', 
      description: 'Get a single email by ID', 
      parameters: [
        { name: 'id', description: 'Email ID to retrieve', required: true }
      ] 
    },
    { 
      command: 'send', 
      description: 'Send a new email', 
      parameters: [
        { name: 'to', description: 'Recipient email address', required: true },
        { name: 'subject', description: 'Email subject', required: true },
        { name: 'body', description: 'Email body content', required: true },
        { name: 'cc', description: 'CC recipients', required: false },
        { name: 'bcc', description: 'BCC recipients', required: false }
      ] 
    },
    { 
      command: 'modify', 
      description: 'Modify email labels', 
      parameters: [
        { name: 'id', description: 'Email ID to modify', required: true },
        { name: 'addLabels', description: 'Labels to add (comma separated)', required: false },
        { name: 'removeLabels', description: 'Labels to remove (comma separated)', required: false }
      ] 
    }
  ];

  // Calendar suggestions
  const calendarSuggestions: CommandSuggestion[] = [
    { 
      command: 'list', 
      description: 'List upcoming calendar events', 
      parameters: [
        { name: 'maxResults', description: 'Number of events to return', required: false },
        { name: 'timeMin', description: 'Start time (ISO format)', required: false },
        { name: 'timeMax', description: 'End time (ISO format)', required: false }
      ] 
    },
    { 
      command: 'create', 
      description: 'Create a new calendar event', 
      parameters: [
        { name: 'summary', description: 'Event title', required: true },
        { name: 'location', description: 'Event location', required: false },
        { name: 'description', description: 'Event description', required: false },
        { name: 'start', description: 'Start time (ISO format)', required: true },
        { name: 'end', description: 'End time (ISO format)', required: true },
        { name: 'attendees', description: 'Comma-separated list of attendee emails', required: false }
      ] 
    },
    { 
      command: 'update', 
      description: 'Update an existing calendar event', 
      parameters: [
        { name: 'eventId', description: 'ID of the event to update', required: true },
        { name: 'summary', description: 'New event title', required: false },
        { name: 'location', description: 'New event location', required: false },
        { name: 'description', description: 'New event description', required: false },
        { name: 'start', description: 'New start time (ISO format)', required: false },
        { name: 'end', description: 'New end time (ISO format)', required: false },
        { name: 'attendees', description: 'New comma-separated list of attendee emails', required: false }
      ] 
    },
    { 
      command: 'delete', 
      description: 'Delete a calendar event', 
      parameters: [
        { name: 'eventId', description: 'ID of the event to delete', required: true }
      ] 
    }
  ];

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
      setCommandType(null)
      setCurrentParameterIndex(0)
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
  // Get parameters for the currently selected command
  const getCommandParameters = (): CommandParameter[] => {
    if (!selectedCommand || !commandType) return [];
    
    // Determine which command set to use based on the command type
    let matchedCommand: CommandSuggestion | undefined;
    
    switch (commandType) {
      case 'docs':
        matchedCommand = docsSuggestions.find(s => s.command === selectedCommand);
        break;
      case 'gmail':
        matchedCommand = gmailSuggestions.find(s => s.command === selectedCommand);
        break;
      case 'calendar':
        matchedCommand = calendarSuggestions.find(s => s.command === selectedCommand);
        break;
    }
    
    return matchedCommand ? matchedCommand.parameters : [];
  }

  // Update ghost text suggestions based on current input
  const updateGhostText = () => {
    if (!selectedCommand || !commandType) {
      setGhostText('');
      return;
    }

    // Get the command prefix based on type
    const commandPrefix = `@${commandType}`;

    // Check if we still have the command in the message
    if (!message.includes(`${commandPrefix} ${selectedCommand}`)) {
      setSelectedCommand(null);
      setCommandType(null);
      setGhostText('');
      return;
    }

    const parameters = getCommandParameters();
    if (parameters.length <= currentParameterIndex) {
      setGhostText('');
      return;
    }

    // Parse the current message to find the command and already entered parameters
    const regex = new RegExp(`${commandPrefix}\\s+${selectedCommand}\\s+(.*?)$`);
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
      setCommandType(null);
      setCurrentParameterIndex(0);
      return;
    }
    
    // Detect command types and show suggestions
    if (text.includes('@docs ') && !selectedCommand) {
      const commandParts = text.split('@docs ')[1].trim().split(' ');
      if (commandParts.length === 1 && !commandParts[0].includes(':')) {
        setShowSuggestions(true);
        setCommandType('docs');
      } else {
        setShowSuggestions(false);
      }
    } 
    else if (text.includes('@gmail ') && !selectedCommand) {
      const commandParts = text.split('@gmail ')[1].trim().split(' ');
      if (commandParts.length === 1 && !commandParts[0].includes(':')) {
        setShowSuggestions(true);
        setCommandType('gmail');
      } else {
        setShowSuggestions(false);
      }
    }
    else if (text.includes('@calendar ') && !selectedCommand) {
      const commandParts = text.split('@calendar ')[1].trim().split(' ');
      if (commandParts.length === 1 && !commandParts[0].includes(':')) {
        setShowSuggestions(true);
        setCommandType('calendar');
      } else {
        setShowSuggestions(false);
      }
    }
    else if (text.endsWith('@docs')) {
      setShowSuggestions(true);
      setCommandType('docs');
    }
    else if (text.endsWith('@gmail')) {
      setShowSuggestions(true);
      setCommandType('gmail');
    }
    else if (text.endsWith('@calendar')) {
      setShowSuggestions(true);
      setCommandType('calendar');
    } 
    else {
      setShowSuggestions(false);
    }
    
    // Check if a command is selected or being typed
    if (selectedCommand && commandType) {
      // If we deleted the command, clear everything
      const commandPrefix = `@${commandType}`;
      if (!text.includes(`${commandPrefix} ${selectedCommand}`)) {
        setSelectedCommand(null);
        setCommandType(null);
        setGhostText('');
        setCurrentParameterIndex(0);
      } else {
        updateGhostText();
      }
    } else {
      // Check for docs command
      if (text.includes('@docs ')) {
        const commandPart = text.split('@docs ')[1].trim().split(' ')[0];
        const matchedCommand = docsSuggestions.find(s => s.command === commandPart);
        
        if (matchedCommand) {
          setSelectedCommand(matchedCommand.command);
          setCommandType('docs');
          setCurrentParameterIndex(0);
          updateGhostText();
        }
      }
      // Check for gmail command
      else if (text.includes('@gmail ')) {
        const commandPart = text.split('@gmail ')[1].trim().split(' ')[0];
        const matchedCommand = gmailSuggestions.find(s => s.command === commandPart);
        
        if (matchedCommand) {
          setSelectedCommand(matchedCommand.command);
          setCommandType('gmail');
          setCurrentParameterIndex(0);
          updateGhostText();
        }
      }
      // Check for calendar command
      else if (text.includes('@calendar ')) {
        const commandPart = text.split('@calendar ')[1].trim().split(' ')[0];
        const matchedCommand = calendarSuggestions.find(s => s.command === commandPart);
        
        if (matchedCommand) {
          setSelectedCommand(matchedCommand.command);
          setCommandType('calendar');
          setCurrentParameterIndex(0);
          updateGhostText();
        }
      }
    }
  }

  const insertSuggestion = (command: string): void => {
    if (!commandType) return;
    
    // Get the command prefix based on type
    const prefix = `@${commandType}`;
    
    // If the command prefix is already in the message
    if (message.includes(prefix)) {
      // Replace the prefix with prefix + command
      setMessage(message.replace(prefix, `${prefix} ${command} `));
    } else {
      // Otherwise append the command with proper prefix
      setMessage(`${message}${prefix} ${command} `);
    }
    
    // Set the selected command
    setSelectedCommand(command);
    setShowSuggestions(false);
    setCurrentParameterIndex(0);
    
    // Update ghost text for parameter suggestion
    setTimeout(() => {
      updateGhostText();
      // Focus on the input
      textAreaRef.current?.focus();
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
      const inputElement = textAreaRef.current;
      if (inputElement) {
        // Position cursor between quotes to make it easy to type the value
        const cursorPosition = message.length + ghostText.indexOf('""') + 1;
        inputElement.focus();
        inputElement.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    // Tab key for parameter completion
    if (e.key === 'Tab' && ghostText) {
      e.preventDefault();
      completeGhostText();
    }
    
    // Enter without shift to submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  // Toggle search mode
  const toggleSearchMode = (): void => {
    setIsSearchMode(!isSearchMode);
    setGhostText('');
    textAreaRef.current?.focus();
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
  
  // Synchronize ghost text position with input text and handle message changes
  useEffect(() => {
    // First, update the ghost text based on the current message
    if (selectedCommand) {
      updateGhostText();
    }

    // Then, handle the ghost text positioning
    // Then, handle the ghost text positioning
    if (textAreaRef.current && ghostRef.current && ghostText) {
      // Position ghost text at cursor position
      const textArea = textAreaRef.current;
      const cursorPosition = textArea.selectionStart;
      
      // Calculate the line and column of the cursor
      const textBeforeCursor = message.substring(0, cursorPosition);
      const lines = textBeforeCursor.split('\n');
      const currentLineIndex = lines.length - 1;
      const currentLine = lines[currentLineIndex];
      
      // Measure the width of the current line
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        const computedStyle = window.getComputedStyle(textArea);
        context.font = computedStyle.font;
        const textWidth = context.measureText(currentLine).width;
        
        // Get line height and padding
        const lineHeight = parseInt(computedStyle.lineHeight || '20');
        const paddingTop = parseInt(computedStyle.paddingTop || '0');
        
        // Calculate position based on cursor position (line and column)
        const top = paddingTop + (currentLineIndex * lineHeight);
        
        // Add extra space between cursor and ghost text (6px)
        ghostRef.current.style.left = `${textWidth + 14}px`;
        ghostRef.current.style.top = `${top}px`;
        ghostRef.current.style.lineHeight = `${lineHeight}px`;
      }
    }
  }, [message, selectedCommand, ghostText]);

  // Helper function to determine which suggestions to show based on the command type
  const getSuggestionsToShow = () => {
    switch (commandType) {
      case 'docs':
        return docsSuggestions;
      case 'gmail':
        return gmailSuggestions;
      case 'calendar':
        return calendarSuggestions;
      default:
        return [];
    }
  };

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
          className="p-2 mr-1 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-100"
          title="Insert @docs command"
          onClick={(e) => {
            e.stopPropagation()
            setMessage(message + '@docs ')
            setShowSuggestions(true)
            setCommandType('docs')
            setIsSearchMode(false)
            textAreaRef.current?.focus()
          }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </button>

        {/* Gmail button */}
        <button 
          type="button"
          className="p-2 mr-1 rounded-full text-purple-600 hover:text-purple-800 hover:bg-purple-100"
          title="Insert @gmail command"
          onClick={(e) => {
            e.stopPropagation()
            setMessage(message + '@gmail ')
            setShowSuggestions(true)
            setCommandType('gmail')
            setIsSearchMode(false)
            textAreaRef.current?.focus()
          }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </button>

        {/* Calendar button */}
        <button 
          type="button"
          className="p-2 mr-1 rounded-full text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
          title="Insert @calendar command"
          onClick={(e) => {
            e.stopPropagation()
            setMessage(message + '@calendar ')
            setShowSuggestions(true)
            setCommandType('calendar')
            setIsSearchMode(false)
            textAreaRef.current?.focus()
          }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
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
            {/* Replaced input with textarea */}
            <textarea 
              ref={textAreaRef}
              placeholder={isSearchMode ? "Search the web..." : "Type your message... (Use @docs, @gmail, or @calendar for commands)"}
              className="w-full p-3 bg-transparent outline-none rounded-lg resize-none overflow-y-auto"
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ maxHeight: isExpanded ? '300px' : '120px' }}
            />
            {/* Ghost text for inline parameter suggestion */}
            {ghostText && (
              <span 
                ref={ghostRef}
                className="absolute top-3 text-gray-400 pointer-events-none whitespace-pre"
                style={{ left: '8px' }} // Will be adjusted by the effect
              >
                {ghostText}
              </span>
            )}
            
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
          
          {/* Tab hint */}
          {ghostText && (
            <div className="px-2 py-1 mr-2 bg-gray-100 text-gray-500 text-xs rounded">
              Press Tab
            </div>
          )}
          
          {/* <button 
            type="button" 
            className="p-3 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button> */}
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
                              
          {/* Command suggestions dropdown */}
          {showSuggestions && commandType && (
            <div 
              className="absolute bottom-full left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 mb-1 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                  Available {commandType.charAt(0).toUpperCase() + commandType.slice(1)} Commands
                </div>
                <ul>
                {getSuggestionsToShow().map((suggestion, index) => (
                    <li 
                      key={index}
                      className="px-2 py-1.5 hover:bg-blue-50 cursor-pointer rounded"
                      onClick={() => insertSuggestion(suggestion.command)}
                    >
                      <div className={`font-medium ${
                        commandType === 'docs' ? 'text-blue-600' :
                        commandType === 'gmail' ? 'text-purple-600' : 
                        'text-yellow-600'
                      }`}>
                        {suggestion.command}
                      </div>
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