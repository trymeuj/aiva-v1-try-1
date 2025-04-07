'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSideDisplay } from './SideDisplayContext';
import WorkflowDisplay from './WorkflowDisplay';

// Define types for workflow steps and plan
export interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  value?: string;
}

export interface ApiInfo {
  name: string;
  description: string;
}

export interface WorkflowStep {
  id: string;
  software: string;
  api: ApiInfo;
  parameters: Record<string, string>;
  reasoning: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'needs_clarification' | 'skipped';
  required_parameters: Parameter[];
  error?: string;
}

export interface WorkflowPlan {
  session_id: string;
  plan: WorkflowStep[];
}

interface WorkflowContextType {
  isOpen: boolean;
  workflowPlan: WorkflowPlan | null;
  currentStepId: string | null;
  openWorkflow: (plan: WorkflowPlan) => void;
  closeWorkflow: () => void;
  updateStepStatus: (stepId: string, status: WorkflowStep['status'], error?: string) => void;
  updateStepParameters: (stepId: string, parameters: Record<string, string>) => void;
  reorderSteps: (stepId: string, newPosition: number) => void;
  skipStep: (stepId: string) => void;
  modifyStep: (stepId: string, updatedStep: Partial<WorkflowStep>) => void;
  setCurrentStepId: (stepId: string | null) => void;
  addContext: (stepId: string) => void;
  runStep: (stepId: string) => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [workflowPlan, setWorkflowPlan] = useState<WorkflowPlan | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);

  // Open workflow sidebar with a plan
  const openWorkflow = (plan: WorkflowPlan) => {
    setWorkflowPlan(plan);
    setIsOpen(true);
    // Set first step as current if available
    if (plan.plan.length > 0) {
      setCurrentStepId(plan.plan[0].id);
    }
  };

  // Close workflow sidebar
  const closeWorkflow = () => {
    setIsOpen(false);
    setWorkflowPlan(null);
    setCurrentStepId(null);
  };

  // Update status of a specific step
  const updateStepStatus = (stepId: string, status: WorkflowStep['status'], error?: string) => {
    if (!workflowPlan) return;
    
    setWorkflowPlan(prevPlan => {
      if (!prevPlan) return null;
      
      return {
        ...prevPlan,
        plan: prevPlan.plan.map(step => 
          step.id === stepId 
            ? { ...step, status, ...(error ? { error } : {}) }
            : step
        )
      };
    });
  };

  // Update parameters of a specific step
  const updateStepParameters = (stepId: string, parameters: Record<string, string>) => {
    if (!workflowPlan) return;
    
    setWorkflowPlan(prevPlan => {
      if (!prevPlan) return null;
      
      return {
        ...prevPlan,
        plan: prevPlan.plan.map(step => 
          step.id === stepId 
            ? { ...step, parameters: { ...step.parameters, ...parameters } }
            : step
        )
      };
    });
  };

  // Reorder a step to a new position
  const reorderSteps = (stepId: string, newPosition: number) => {
    if (!workflowPlan) return;
    
    setWorkflowPlan(prevPlan => {
      if (!prevPlan) return null;
      
      const plan = [...prevPlan.plan];
      const oldIndex = plan.findIndex(step => step.id === stepId);
      if (oldIndex === -1) return prevPlan;
      
      // Remove the step from its current position
      const [step] = plan.splice(oldIndex, 1);
      
      // Insert it at the new position
      const adjustedPosition = Math.min(Math.max(0, newPosition), plan.length);
      plan.splice(adjustedPosition, 0, step);
      
      return {
        ...prevPlan,
        plan
      };
    });
  };

  // Skip a step
  const skipStep = (stepId: string) => {
    updateStepStatus(stepId, 'skipped');
  };

  // Modify a step
  const modifyStep = (stepId: string, updatedStep: Partial<WorkflowStep>) => {
    if (!workflowPlan) return;
    
    setWorkflowPlan(prevPlan => {
      if (!prevPlan) return null;
      
      return {
        ...prevPlan,
        plan: prevPlan.plan.map(step => 
          step.id === stepId 
            ? { ...step, ...updatedStep }
            : step
        )
      };
    });
  };

  // Add context to a step - this will be handled by the parent component
  const addContext = (stepId: string) => {
    setCurrentStepId(stepId);
    // The actual context addition will be handled by the chat interface
  };

  // Run a step - will call the backend API
  const runStep = async (stepId: string) => {
    if (!workflowPlan) return;
    
    try {
      updateStepStatus(stepId, 'in_progress');
      
      const step = workflowPlan.plan.find(s => s.id === stepId);
      if (!step) throw new Error('Step not found');

      // Call the backend to execute the step
      const response = await fetch('/api/workflow/execute-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: workflowPlan.session_id,
          step_id: stepId,
        }),
      });
      
      const result = await response.json();
      
      if (result.status === 'completed') {
        updateStepStatus(stepId, 'completed');
        // If there's a next step, set it as current
        const currentIndex = workflowPlan.plan.findIndex(s => s.id === stepId);
        if (currentIndex < workflowPlan.plan.length - 1) {
          setCurrentStepId(workflowPlan.plan[currentIndex + 1].id);
        }
      } else if (result.status === 'needs_clarification') {
        updateStepStatus(stepId, 'needs_clarification');
        // Keep current step as is
      } else if (result.status === 'error') {
        updateStepStatus(stepId, 'failed', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error executing step:', error);
      updateStepStatus(stepId, 'failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const value = {
    isOpen,
    workflowPlan,
    currentStepId,
    openWorkflow,
    closeWorkflow,
    updateStepStatus,
    updateStepParameters,
    reorderSteps,
    skipStep,
    modifyStep,
    setCurrentStepId,
    addContext,
    runStep,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = (): WorkflowContextType => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}; 