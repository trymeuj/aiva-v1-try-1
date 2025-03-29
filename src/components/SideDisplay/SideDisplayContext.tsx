'use client'

import React, { createContext, useState, useContext, ReactNode } from 'react'

interface SideDisplayContextType {
  isOpen: boolean;
  title: string;
  content: ReactNode | null;
  contentType: 'document' | 'code' | 'info';
  width: 'narrow' | 'medium' | 'wide';
  openSideDisplay: (params: OpenSideDisplayParams) => void;
  closeSideDisplay: () => void;
}

interface OpenSideDisplayParams {
  title: string;
  content: ReactNode;
  contentType?: 'document' | 'code' | 'info';
  width?: 'narrow' | 'medium' | 'wide';
}

interface SideDisplayProviderProps {
  children: ReactNode;
}

// Create the context with default values
const SideDisplayContext = createContext<SideDisplayContextType>({
  isOpen: false,
  title: '',
  content: null,
  contentType: 'document',
  width: 'medium',
  openSideDisplay: () => {},
  closeSideDisplay: () => {}
});

// Provider component that wraps your app and makes the side display context available
export function SideDisplayProvider({ children }: SideDisplayProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ReactNode | null>(null);
  const [contentType, setContentType] = useState<'document' | 'code' | 'info'>('document');
  const [width, setWidth] = useState<'narrow' | 'medium' | 'wide'>('medium');

  // Function to open the side display with content
  const openSideDisplay = ({ 
    title, 
    content, 
    contentType = 'document', 
    width = 'medium' 
  }: OpenSideDisplayParams) => {
    setTitle(title);
    setContent(content);
    setContentType(contentType);
    setWidth(width);
    setIsOpen(true);
  };

  // Function to close the side display
  const closeSideDisplay = () => {
    setIsOpen(false);
  };

  // The context value that will be supplied to any descendants of this provider
  const contextValue = {
    isOpen,
    title,
    content,
    contentType,
    width,
    openSideDisplay,
    closeSideDisplay
  };

  return (
    <SideDisplayContext.Provider value={contextValue}>
      {children}
    </SideDisplayContext.Provider>
  );
}

// Custom hook that lets components easily consume the side display context
export function useSideDisplay() {
  return useContext(SideDisplayContext);
}