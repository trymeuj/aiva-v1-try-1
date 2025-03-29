'use client'

import { ReactNode } from 'react'
import { SideDisplayProvider } from '@/components/SideDisplay/SideDisplayContext'
import SideDisplayContainer from '@/components/SideDisplay/SideDisplayContainer'

interface AppWithSideDisplayProps {
  children: ReactNode;
}

export default function AppWithSideDisplay({ children }: AppWithSideDisplayProps) {
  return (
    <SideDisplayProvider>
      <div className="relative min-h-screen">
        {children}
        <SideDisplayContainer />
      </div>
    </SideDisplayProvider>
  );
}