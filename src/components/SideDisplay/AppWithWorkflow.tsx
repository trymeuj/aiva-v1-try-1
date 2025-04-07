'use client'

import React from 'react';
import { WorkflowProvider, useWorkflow } from './WorkflowContext';
import { SideDisplayProvider, useSideDisplay } from './SideDisplayContext';
import WorkflowDisplay from './WorkflowDisplay';
import SideDisplayContainer from './SideDisplayContainer';

// Wrapper component that integrates WorkflowDisplay with SideDisplay
const WorkflowIntegration: React.FC = () => {
  const { isOpen, workflowPlan } = useWorkflow();
  const { openSideDisplay, closeSideDisplay } = useSideDisplay();

  // Effect to open or close the side display based on workflow state
  React.useEffect(() => {
    if (isOpen && workflowPlan) {
      openSideDisplay({
        title: 'Action Plan',
        content: <WorkflowDisplay />,
        contentType: 'info',
        width: 'wide'
      });
    } else {
      closeSideDisplay();
    }
  }, [isOpen, workflowPlan, openSideDisplay, closeSideDisplay]);

  return null;
};

// Wrapper for the entire application
const AppWithWorkflow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SideDisplayProvider>
      <WorkflowProvider>
        <div className="flex min-h-screen">
          <main className="flex-grow">
            <WorkflowIntegration />
            {children}
          </main>
          <SideDisplayContainer />
        </div>
      </WorkflowProvider>
    </SideDisplayProvider>
  );
};

export default AppWithWorkflow; 