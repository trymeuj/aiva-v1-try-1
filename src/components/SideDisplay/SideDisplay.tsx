'use client'

import { useState, useEffect, ReactNode } from 'react'

interface SideDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
  contentType?: 'document' | 'code' | 'info';
  width?: 'narrow' | 'medium' | 'wide';
}

export default function SideDisplay({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  contentType = 'document',
  width = 'medium' 
}: SideDisplayProps) {
  const [isVisible, setIsVisible] = useState(isOpen);
  
  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Short timeout to allow animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Don't render if not visible
  if (!isVisible && !isOpen) {
    return null;
  }
  
  // Width classes based on the width prop
  const widthClasses = {
    narrow: 'w-80',
    medium: 'w-96',
    wide: 'w-1/3'
  };
  
  // Content wrapper classes based on content type
  const contentWrapperClasses = {
    document: 'bg-white p-6 overflow-y-auto',
    code: 'bg-gray-50 p-6 font-mono text-sm overflow-y-auto',
    info: 'bg-blue-50 p-6 overflow-y-auto'
  };
  
  return (
    <div 
      className={`fixed right-0 top-0 h-full ${widthClasses[width]} 
        bg-white shadow-lg border-l border-gray-200 z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
        <h2 className="text-lg font-medium text-gray-800">{title}</h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
          aria-label="Close side panel"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      {/* Content area */}
      <div className={`h-[calc(100%-4rem)] ${contentWrapperClasses[contentType]}`}>
        {content}
      </div>
    </div>
  );
}