'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Helper to determine if link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname?.startsWith(path)) return true
    return false
  }
  
  return (
    <div className="relative">
      {/* Desktop Sidebar */}
      <nav id="layout" className={`hidden lg:flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-white border-r border-gray-200 transition-all duration-300`}>
        <div className={`${isCollapsed ? 'justify-center' : 'px-6'} py-4 flex items-center`}>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
              </svg>
            )}
          </button>
          {!isCollapsed && <h1 className="text-xl font-bold text-gray-800 mr-2">  AIVA</h1>}
        </div>
        
        <div className="flex-1 px-4 py-2">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 rounded-lg ${
                  isActive('/') 
                    ? 'text-gray-700 bg-gray-100' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={isCollapsed ? "Home" : ""}
              >
                <svg className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                {!isCollapsed && "Home"}
              </Link>
            </li>
            <li>
              <Link
                href="/create"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 rounded-lg ${
                  isActive('/create') 
                    ? 'text-gray-700 bg-gray-100' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={isCollapsed ? "Create Agent" : ""}
              >
                <svg className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                {!isCollapsed && "Create Agent"}
              </Link>
            </li>
            <li>
              <Link
                href="/software"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 rounded-lg ${
                  isActive('/software') 
                    ? 'text-gray-700 bg-gray-100' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={isCollapsed ? "Software Selection" : ""}
              >
                <svg className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                </svg>
                {!isCollapsed && "Software Selection"}
              </Link>
            </li>
            <li>
              <Link
                href="/chat"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 rounded-lg ${
                  isActive('/chat') 
                    ? 'text-gray-700 bg-gray-100' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={isCollapsed ? "Chat with Agent" : ""}
              >
                <svg className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                {!isCollapsed && "Chat with Agent"}
              </Link>
            </li>
          </ul>
        </div>
        
        <div className={`${isCollapsed ? 'px-2' : 'px-6'} py-4 border-t border-gray-200`}>
          {isCollapsed ? (
            <div className="flex justify-center">
              <img 
                src="https://placehold.co/40x40?text=User" 
                alt="User Profile" 
                className="w-8 h-8 rounded-full" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://placehold.co/40x40';
                }} 
              />
            </div>
          ) : (
            <div className="flex items-center">
              <img 
                src="https://placehold.co/40x40?text=User" 
                alt="User Profile" 
                className="w-10 h-10 rounded-full" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://placehold.co/40x40';
                }} 
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">User Account</p>
                <p className="text-xs text-gray-500">user@example.com</p>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu button */}
      <button 
        type="button" 
        className="lg:hidden fixed top-4 left-4 z-20 rounded-md p-2 text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-controls="mobile-menu" 
        aria-expanded={isOpen}
      >
        <span className="sr-only">Open main menu</span>
        {!isOpen ? (
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        ) : (
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        )}
      </button>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-10 bg-gray-800/80 backdrop-blur-lg"
          onClick={() => setIsOpen(false)}
        >
          <nav 
            className="flex flex-col h-full pt-16 bg-white w-64"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">AIVA</h1>
            </div>
            
            <div className="flex-1 px-4 py-2">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      isActive('/') 
                        ? 'text-gray-700 bg-gray-100' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create"
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      isActive('/create') 
                        ? 'text-gray-700 bg-gray-100' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create Agent
                  </Link>
                </li>
                <li>
                  <Link
                    href="/software"
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      isActive('/software') 
                        ? 'text-gray-700 bg-gray-100' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                    </svg>
                    Software Selection
                  </Link>
                </li>
                <li>
                  <Link
                    href="/chat"
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      isActive('/chat') 
                        ? 'text-gray-700 bg-gray-100' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                    Chat with Agent
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center">
                <img 
                  src="https://placehold.co/40x40?text=User" 
                  alt="User Profile" 
                  className="w-10 h-10 rounded-full" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://placehold.co/40x40';
                  }} 
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">User Account</p>
                  <p className="text-xs text-gray-500">user@example.com</p>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}