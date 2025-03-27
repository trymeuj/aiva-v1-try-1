'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Agent {
  id: string
  name: string
  icon: string
  iconColor: string
  bgColor: string
  createdDate: string
  lastUsed: string
  capabilities: {
    name: string
    color: string
  }[]
}

export default function AIAgentsSection() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Productivity Assistant',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      createdDate: 'May 12, 2023',
      lastUsed: '2 days ago',
      capabilities: [
        { name: 'Document Processing', color: 'bg-blue-100 text-blue-800' },
        { name: 'Email Management', color: 'bg-purple-100 text-purple-800' },
        { name: 'Calendar & Scheduling', color: 'bg-yellow-100 text-yellow-800' }
      ]
    },
    {
      id: '2',
      name: 'Research Assistant',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      createdDate: 'June 3, 2023',
      lastUsed: '5 hours ago',
      capabilities: [
        { name: 'Document Processing', color: 'bg-blue-100 text-blue-800' },
        { name: 'Data Analysis', color: 'bg-green-100 text-green-800' },
        { name: 'Media Management', color: 'bg-red-100 text-red-800' }
      ]
    }
  ]);

  const handleDeleteAgent = (id: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== id));
  };

  return (
    <div className="bg-white shadow rounded-lg mb-8">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Your AI Agents</h2>
        <p className="mt-1 text-sm text-gray-600">Manage your created AI assistants.</p>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {agents.map(agent => (
            <div key={agent.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-12 w-12 ${agent.bgColor} rounded-lg flex items-center justify-center ${agent.iconColor}`}>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={agent.icon}></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">Created on {agent.createdDate}</span>
                      <span className="h-1 w-1 rounded-full bg-gray-500 mr-2"></span>
                      <span>Last used {agent.lastUsed}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href="/chat" className="p-2 text-blue-600 rounded hover:bg-blue-50">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                  </Link>
                  <button className="p-2 text-gray-500 rounded hover:bg-gray-50">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="p-2 text-red-500 rounded hover:bg-red-50"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((capability, index) => (
                    <span key={index} className={`px-2 py-1 text-xs ${capability.color} rounded-full`}>
                      {capability.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Link 
            href="/software" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create New Agent
          </Link>
        </div>
      </div>
    </div>
  )
}