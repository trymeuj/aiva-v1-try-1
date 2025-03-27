'use client'

import { useState } from 'react'
import Link from 'next/link'
import SoftwareCard from './SoftwareCard'

// Software options data
const softwareOptions = [
  {
    id: 'docs',
    title: 'Document Processing',
    description: 'Analyze documents, extract text, and answer questions about content.',
    info: 'Works with PDF, Word, and text files',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    tagColor: 'bg-blue-100 text-blue-800',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
    )
  },
  {
    id: 'email',
    title: 'Email Management',
    description: 'Draft emails, prioritize inbox, and schedule follow-ups automatically.',
    info: 'Integrates with Gmail, Outlook',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100',
    tagColor: 'bg-purple-100 text-purple-800',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
    )
  },
  {
    id: 'analytics',
    title: 'Data Analysis',
    description: 'Analyze data, generate reports, and extract insights automatically.',
    info: 'Works with Excel, CSV, Google Sheets',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100',
    tagColor: 'bg-green-100 text-green-800',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
    )
  },
  {
    id: 'media',
    title: 'Media Management',
    description: 'Process images and videos, generate transcripts and summaries.',
    info: 'Supports JPG, PNG, MP4, MP3',
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100',
    tagColor: 'bg-red-100 text-red-800',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>
    )
  },
  {
    id: 'calendar',
    title: 'Calendar & Scheduling',
    description: 'Manage appointments, optimize schedules, and send reminders.',
    info: 'Works with Google Calendar, Apple Calendar',
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    tagColor: 'bg-yellow-100 text-yellow-800',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    )
  },
  {
    id: 'messaging',
    title: 'Communication Tools',
    description: 'Manage messages across platforms, draft responses, and organize conversations.',
    info: 'Works with Slack, Teams, Discord',
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    tagColor: 'bg-indigo-100 text-indigo-800',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
      </svg>
    )
  }
];

export default function SoftwareSelection() {
  const [selectedSoftware, setSelectedSoftware] = useState<Record<string, boolean>>(
    Object.fromEntries(softwareOptions.map(option => [option.id, false]))
  );

  const handleSoftwareChange = (id: string, checked: boolean) => {
    setSelectedSoftware(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const anySelected = Object.values(selectedSoftware).some(value => value);

  return (
    <div id="software-selection" className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Select Software for Your AI Agent</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose which applications your AI agent should have access to. Select multiple options as needed.
          </p>
        </div>

        {/* Selection Area */}
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwareOptions.map((option) => (
              <SoftwareCard
                key={option.id}
                id={option.id}
                title={option.title}
                description={option.description}
                info={option.info}
                iconColor={option.iconColor}
                bgColor={option.bgColor}
                icon={option.icon}
                checked={selectedSoftware[option.id]}
                onChange={handleSoftwareChange}
              />
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Capabilities</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {softwareOptions.map((option) => (
              <span 
                key={option.id}
                className={`px-3 py-1 ${option.tagColor} rounded-full text-sm ${!selectedSoftware[option.id] ? 'hidden' : ''}`}
              >
                {option.title}
              </span>
            ))}
            {!anySelected && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm italic">
                No capabilities selected
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            Your AI agent will be customized based on your selected software capabilities.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <Link 
            href="/" 
            className="mb-4 sm:mb-0 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back
            </div>
          </Link>
          <Link 
            href="/chat" 
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <div className="flex items-center">
              Continue
              <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}