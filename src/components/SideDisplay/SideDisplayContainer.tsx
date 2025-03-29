'use client'

import SideDisplay from './SideDisplay'
import { useSideDisplay } from './SideDisplayContext'

export default function SideDisplayContainer() {
  const { isOpen, title, content, contentType, width, closeSideDisplay } = useSideDisplay();
  
  return (
    <SideDisplay
      isOpen={isOpen}
      onClose={closeSideDisplay}
      title={title}
      content={content}
      contentType={contentType}
      width={width}
    />
  );
}