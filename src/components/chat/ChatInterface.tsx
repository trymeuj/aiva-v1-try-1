'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useMemory } from '@/hooks/useMemory'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import MessageInput from './MessageInput'
import FeaturesBar from './FeaturesBar'
import MCPToolsHelp from './MCPToolsHelp'
import GmailToolsHelp from './GmailToolsHelp'
import CalendarToolsHelp from './CalendarToolsHelp'
import { MessageSource, MessageType, WorkflowResult } from './types'
import { Message, ApiMessage, ChatResponse } from './types'
import { isMCPCommand, parseCommand, callMCPServer } from '@/lib/mcpService'
import { isGmailCommand, parseCommand as parseGmailCommand, callGmailServer } from '@/lib/gmailService'
import { isCalendarCommand, parseCommand as parseCalendarCommand, callCalendarServer } from '@/lib/calendarService'
import { searchWeb } from '@/lib/searchService'
import { youSmartSearch, youResearch } from '@/lib/youcomService'
import { useWorkflow, WorkflowPlan } from '../SideDisplay/WorkflowContext'

export default function ChatInterface(): React.ReactElement {
  const welcomeMessage = "Hello! I'm your personal AI assistant powered by Gemini. How can I help you today?\n\nTIP: You can use @docs commands for document operations, @gmail for email management, and @calendar for calendar operations. Click the icons below or type the commands to get started."
  
  // Initialize memory hook
  const { isReady, getMessages, saveMessage } = useMemory()

  // Initialize with welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      type: MessageType.AI,
      text: welcomeMessage,
      timestamp: new Date(),
    }
  ])

  // Track backend conversation history
  const [conversationHistory, setConversationHistory] = useState<ApiMessage[]>([
    {
      role: 'assistant',
      content: welcomeMessage
    }
  ])

  const [isTyping, setIsTyping] = useState<boolean>(false)

  // Track workflow context state
  const [isRespondingToWorkflow, setIsRespondingToWorkflow] = useState<boolean>(false)
  const [currentClarificationStepId, setCurrentClarificationStepId] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Initialize workflow context
  const { 
    openWorkflow, 
    closeWorkflow,
    workflowPlan,
    currentStepId,
    runStep,
    addContext,
    updateStepParameters
  } = useWorkflow()

  // Load messages from storage after component mounts
  useEffect(() => {
    if (isReady) {
      const storedMessages = getMessages()
      
      if (storedMessages.length > 0) {
        // Use stored messages if available
        setMessages(storedMessages)
        
        // Convert stored messages to API format for conversation history
        const apiMessages: ApiMessage[] = storedMessages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
        
        setConversationHistory(apiMessages)
      } else {
        // No stored messages, store the welcome message
        saveMessage(messages[0], MessageSource.LLM)
      }
    }
  }, [isReady])

  // Function to send chat message to backend
  const sendChatMessage = async (message: string, history: ApiMessage[]): Promise<ChatResponse> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: history,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Function to process workflow
  const processWorkflow = async (userPrompt: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/workflow/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt
        }),
      });

      if (!response.ok) {
        console.error('Workflow process error:', response.statusText);
        return false;
      }

      const data = await response.json();

      // Check if there's a workflow intention
      if (data.hasAgentIntention && data.plan && data.plan.length > 0) {
        // Open the workflow sidebar
        openWorkflow(data as WorkflowPlan);
        setCurrentSessionId(data.session_id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error processing workflow:', error);
      return false;
    }
  };

  // Function to check if message is a response to a clarification request
  const handlePossibleClarification = async (text: string): Promise<boolean> => {
    // If we're not responding to a workflow or don't have clarification step, it's not a clarification
    if (!isRespondingToWorkflow || !currentClarificationStepId || !currentSessionId || !workflowPlan) {
      return false;
    }

    try {
      // Reset the responding state
      setIsRespondingToWorkflow(false);
      setCurrentClarificationStepId(null);

      // Create an AI message response acknowledging the input
      const acknowledgeMessage: Message = {
        id: uuidv4(),
        type: MessageType.AI,
        text: "I'll use this information to continue with the workflow step.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, acknowledgeMessage]);
      saveMessage(acknowledgeMessage, MessageSource.LLM);

      // Find the current step
      const currentStep = workflowPlan.plan.find(s => s.id === currentClarificationStepId);
      if (!currentStep) return false;

      // Update the parameters with AI's help
      const aiParamsResponse = await fetch('/api/workflow/extract-params', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: currentStep,
          userInput: text
        }),
      });

      if (!aiParamsResponse.ok) {
        throw new Error(`Failed to extract parameters: ${aiParamsResponse.statusText}`);
      }

      const extractedParams = await aiParamsResponse.json();
      
      // Update the step parameters
      updateStepParameters(currentClarificationStepId, extractedParams.parameters);

      // Now run the step with the updated parameters
      await runStep(currentClarificationStepId);
      const updatedStep = workflowPlan.plan.find(s => s.id === currentClarificationStepId);
      
      // Check if the step now needs clarification
      if (updatedStep && updatedStep.status === 'needs_clarification') {
        // We need to fetch the clarification questions from the backend
        const clarificationResponse = await fetch(`/api/workflow/get-clarification/${currentSessionId}/${currentClarificationStepId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!clarificationResponse.ok) {
          throw new Error(`Failed to get clarification questions: ${clarificationResponse.statusText}`);
        }
        
        const clarificationData = await clarificationResponse.json() as WorkflowResult;
        
        // Add clarification request as AI message
        const clarificationMessage: Message = {
          id: uuidv4(),
          type: MessageType.AI,
          text: clarificationData.questions || "I need more information to complete this step. Please provide additional details.",
          timestamp: new Date(),
          source: MessageSource.Workflow
        };
        setMessages(prev => [...prev, clarificationMessage]);
        saveMessage(clarificationMessage, MessageSource.LLM);

        // Update the current clarification state
        setIsRespondingToWorkflow(true);
        setCurrentClarificationStepId(clarificationData.step_id || currentClarificationStepId);
      }

      return true;
    } catch (error) {
      console.error('Error handling clarification:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        type: MessageType.AI,
        text: `There was an error processing your input: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        source: MessageSource.Workflow
      };
      setMessages(prev => [...prev, errorMessage]);
      saveMessage(errorMessage, MessageSource.LLM);
      
      return true;
    }
  };

  const handleSendMessage = async (text: string, isAgentAction: boolean): Promise<void> => {
    // Add user message to UI
    const userMessage: Message = {
      id: uuidv4(),
      type: MessageType.User,
      text,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Save user message to memory
    saveMessage(userMessage, MessageSource.User);
    
    // Show typing indicator
    setIsTyping(true)
    
    try {
      // Add user message to conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: text }
      ];

      // If agent action is enabled, process with workflow
      if (isAgentAction) {
        const workflowCreated = await processWorkflow(text);
        // Even if workflow processing failed, we still want to provide a response
      }
      
      // For regular text interactions (or as backup if workflow fails), send to LLM
      const response = await sendChatMessage(text, conversationHistory);
      
      // Update conversation history for backend
      if (response.success && response.conversationHistory) {
        setConversationHistory(response.conversationHistory);
      }
      
      // Handle error
      if (!response.success || !response.reply) {
        throw new Error(response.error || 'Failed to get response');
      }
      
      // Add AI response to UI
      const aiResponse: Message = {
        id: uuidv4(),
        type: MessageType.AI,
        text: response.reply,
        timestamp: new Date(),
        // Track if this was from an agent action or regular LLM
        source: isAgentAction ? MessageSource.Workflow : MessageSource.LLM,
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing-indicator'), aiResponse]);
      
      // Store in memory
      saveMessage(aiResponse, isAgentAction ? MessageSource.Workflow : MessageSource.LLM);
      
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Show error message
      const errorMessage: Message = {
        id: uuidv4(),
        type: MessageType.AI,
        text: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing-indicator'), errorMessage]);
      
      // Store error message in memory
      saveMessage(errorMessage, MessageSource.LLM);
    }
  }

  // Function to handle web search using You.com Smart Search
  const handleSearch = async (query: string): Promise<void> => {
    // Add user message to UI with search indicator
    const userMessage: Message = {
      id: uuidv4(),
      type: MessageType.User,
      text: `🔍 Searching for: "${query}"`,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Store search query in memory
    saveMessage(userMessage, MessageSource.User);
    
    // Show typing indicator
    setIsTyping(true)
    
    try {
      // Call the You.com Smart Search API
      const response = await youSmartSearch(query);
      
      // Handle error
      if (!response.success || !response.reply) {
        throw new Error(response.error || 'Failed to get search results');
      }
      
      // Add search results to UI
      const searchResponse: Message = {
        id: uuidv4(),
        type: MessageType.AI,
        text: response.reply,
        timestamp: new Date(),
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing-indicator'), searchResponse]);
      
      // Store search results in memory
      saveMessage(searchResponse, MessageSource.WebSearch);
      
      // Add search result to conversation history
      // This makes the search results available for LLM context
      const searchQueryMessage: ApiMessage = { 
        role: 'user', 
        content: `Search query: ${query}` 
      };
      const searchResultMessage: ApiMessage = { 
        role: 'assistant', 
        content: response.reply 
      };
      
      setConversationHistory(prevHistory => [
        ...prevHistory,
        searchQueryMessage,
        searchResultMessage
      ]);
      
    } catch (error) {
      console.error('Error getting search results:', error);
      
      // Show error message
      const errorMessage: Message = {
        id: uuidv4(),
        type: MessageType.AI,
        text: error instanceof Error ? error.message : 'Sorry, I encountered an error during the search. Please try again later.',
        timestamp: new Date(),
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing-indicator'), errorMessage]);
      
      // Store error message in memory
      saveMessage(errorMessage, MessageSource.WebSearch);
    }
  }

  // Function to handle You.com deep research
  const handleResearch = async (query: string): Promise<void> => {
    // Add user message to UI with research indicator
    const userMessage: Message = {
      id: uuidv4(),
      type: MessageType.User,
      text: `🔬 Researching: "${query}"`,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Store research query in memory
    saveMessage(userMessage, MessageSource.User);
    
    // Show typing indicator
    setIsTyping(true)
    
    try {
      // Call the You.com Research API
      const response = await youResearch(query, 'comprehensive');
      
      // Handle error
      if (!response.success || !response.reply) {
        throw new Error(response.error || 'Failed to get research results');
      }
      
      // Add research results to UI
      const researchResponse: Message = {
        id: uuidv4(),
        type: MessageType.AI,
        text: response.reply,
        timestamp: new Date(),
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing-indicator'), researchResponse]);
      
      // Store research results in memory with a new source type for research
      saveMessage(researchResponse, MessageSource.Research);
      
      // Add research result to conversation history
      // This makes the research results available for LLM context
      const researchQueryMessage: ApiMessage = { 
        role: 'user', 
        content: `Research query: ${query}` 
      };
      const researchResultMessage: ApiMessage = { 
        role: 'assistant', 
        content: response.reply 
      };
      
      setConversationHistory(prevHistory => [
        ...prevHistory,
        researchQueryMessage,
        researchResultMessage
      ]);
      
    } catch (error) {
      console.error('Error getting research results:', error);
      
      // Show error message
      const errorMessage: Message = {
        id: uuidv4(),
        type: MessageType.AI,
        text: error instanceof Error ? error.message : 'Sorry, I encountered an error during research. Please try again later.',
        timestamp: new Date(),
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing-indicator'), errorMessage]);
      
      // Store error message in memory
      saveMessage(errorMessage, MessageSource.Research);
    }
  }

  // Add typing indicator when AI is typing
  useEffect(() => {
    if (isTyping) {
      const typingMessage: Message = {
        id: 'typing-indicator',
        type: MessageType.Typing,
        text: '',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, typingMessage])
    } else {
      setMessages(prev => prev.filter(message => message.id !== 'typing-indicator'))
    }
  }, [isTyping])

  // Handle "Add Context" from workflow display
  const handleWorkflowContextRequest = async (stepId: string) => {
    if (!workflowPlan) return;
    
    // Find the step
    const step = workflowPlan.plan.find(s => s.id === stepId);
    if (!step) return;
    
    // Add an AI message asking for context
    const contextRequestMessage: Message = {
      id: uuidv4(),
      type: MessageType.AI,
      text: `Please provide additional context for the step "${step.api.name}". What specific information should I consider for this action?`,
      timestamp: new Date(),
      source: MessageSource.Workflow
    };
    
    setMessages(prev => [...prev, contextRequestMessage]);
    saveMessage(contextRequestMessage, MessageSource.LLM);
    
    // Update state to indicate we're responding to workflow
    setIsRespondingToWorkflow(true);
    setCurrentClarificationStepId(stepId);
  };

  // Connect the addContext function to our handler
  useEffect(() => {
    if (currentStepId) {
      handleWorkflowContextRequest(currentStepId);
    }
  }, [currentStepId]);

  return (
    <div id="chat-interface" className="min-h-screen bg-gray-50 flex flex-col">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <MCPToolsHelp />
          <GmailToolsHelp />
          <CalendarToolsHelp />
        </div>
        <ChatMessages messages={messages} />
      </div>
      <MessageInput 
        onSendMessage={handleSendMessage} 
        onSearch={handleSearch} 
        onResearch={handleResearch}
      />
      <FeaturesBar />
    </div>
  )
}