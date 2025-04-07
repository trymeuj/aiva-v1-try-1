'use client'

import React, { useState } from 'react';
import { useWorkflow, WorkflowStep } from './WorkflowContext';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// StepCard component to display each step
const StepCard = ({ step, onRun, onAddContext, onSkip, index, moveStep }: {
  step: WorkflowStep;
  onRun: () => void;
  onAddContext: () => void;
  onSkip: () => void;
  index: number;
  moveStep: (dragIndex: number, hoverIndex: number) => void;
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'STEP',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'STEP',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover(item: { index: number }, monitor) {
      if (!item) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveStep(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // Status to color mapping
  const statusColors = {
    pending: 'bg-gray-100 border-gray-300',
    in_progress: 'bg-blue-50 border-blue-300',
    completed: 'bg-green-50 border-green-300',
    failed: 'bg-red-50 border-red-300',
    needs_clarification: 'bg-yellow-50 border-yellow-300',
    skipped: 'bg-gray-50 border-gray-300 opacity-60'
  };

  // Status to icon mapping
  const statusIcons = {
    pending: '⏱️',
    in_progress: '🔄',
    completed: '✅',
    failed: '❌',
    needs_clarification: '❓',
    skipped: '⏭️'
  };

  const [showDetails, setShowDetails] = useState(false);

  // Format parameters for display
  const formatParameters = () => {
    return Object.entries(step.parameters).map(([key, value]) => {
      // Check if this parameter is required
      const isRequired = step.required_parameters?.some(param => param.name === key && param.required);
      return (
        <div key={key} className="flex flex-col mb-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {key} {isRequired && <span className="text-red-500">*</span>}
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{value || 'Not provided'}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`mb-3 border rounded-lg p-3 ${statusColors[step.status]} shadow-sm transition-all duration-200 ${isDragging ? 'opacity-50' : 'opacity-100'} ${isOver ? 'border-blue-500' : ''}`}
      style={{ cursor: 'move' }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <span className="mr-2">{statusIcons[step.status]}</span>
          <h3 className="font-semibold">{step.api.name}</h3>
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-gray-200">
          {step.software}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-2">{step.api.description}</p>
      
      <div className="my-2">
        <div 
          className="text-sm text-gray-700 bg-gray-50 p-2 rounded"
          title="Reasoning"
        >
          {step.reasoning}
        </div>
      </div>
      
      <button 
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-blue-500 mb-2"
      >
        {showDetails ? 'Hide details' : 'Show details'}
      </button>
      
      {showDetails && (
        <div className="mt-2 p-2 bg-white rounded">
          <h4 className="font-medium text-sm mb-1">Parameters</h4>
          {formatParameters()}
        </div>
      )}
      
      {step.error && (
        <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
          Error: {step.error}
        </div>
      )}
      
      <div className="flex justify-between mt-3">
        <button
          onClick={onRun}
          disabled={step.status === 'completed' || step.status === 'skipped'}
          className={`px-3 py-1 rounded text-sm font-medium ${
            step.status === 'completed' || step.status === 'skipped'
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {step.status === 'failed' ? 'Retry' : 'Run Step'}
        </button>
        
        <div className="flex">
          <button
            onClick={onSkip}
            disabled={step.status === 'completed' || step.status === 'skipped'}
            className={`mr-2 px-3 py-1 rounded text-sm font-medium ${
              step.status === 'completed' || step.status === 'skipped'
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Skip
          </button>
          
          <button
            onClick={onAddContext}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600"
          >
            Add Context
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkflowDisplay = () => {
  const { 
    workflowPlan, 
    runStep, 
    skipStep, 
    addContext,
    reorderSteps
  } = useWorkflow();

  // If there's no workflow plan, show a message
  if (!workflowPlan) {
    return (
      <div className="p-4 text-center text-gray-500">
        No workflow plan available.
      </div>
    );
  }

  // Function to move steps (for drag and drop)
  const moveStep = (dragIndex: number, hoverIndex: number) => {
    const draggedStepId = workflowPlan.plan[dragIndex].id;
    reorderSteps(draggedStepId, hoverIndex);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
        <h2 className="text-xl font-bold mb-4">Step-by-Step Plan</h2>
        
        <div className="mb-3 bg-blue-50 p-3 rounded border border-blue-200">
          <p className="text-sm text-blue-700">
            This is your multi-step execution plan. You can run steps manually, provide context, or skip steps if needed.
            <br />
            Drag and drop to reorder the steps.
          </p>
        </div>
        
        {workflowPlan.plan.map((step, index) => (
          <StepCard
            key={step.id}
            step={step}
            index={index}
            moveStep={moveStep}
            onRun={() => runStep(step.id)}
            onAddContext={() => addContext(step.id)}
            onSkip={() => skipStep(step.id)}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default WorkflowDisplay; 