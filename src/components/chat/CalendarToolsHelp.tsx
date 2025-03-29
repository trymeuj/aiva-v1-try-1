'use client'

import React, { useState } from 'react'

export default function CalendarToolsHelp() {
  const [isExpanded, setIsExpanded] = useState(false)

  const tools = [
    {
      name: "list",
      description: "List upcoming calendar events",
      parameters: ["maxResults", "timeMin", "timeMax"],
      example: "@calendar list maxResults:10 timeMin:\"2025-03-01T00:00:00Z\" timeMax:\"2025-04-30T23:59:59Z\""
    },
    {
      name: "create",
      description: "Create a new calendar event",
      parameters: ["summary", "location", "description", "start", "end", "attendees"],
      example: "@calendar create summary:\"Team Meeting\" location:\"Conference Room\" start:\"2025-04-05T10:00:00Z\" end:\"2025-04-05T11:00:00Z\" attendees:\"colleague1@example.com,colleague2@example.com\""
    },
    {
      name: "update",
      description: "Update an existing calendar event",
      parameters: ["eventId", "summary", "location", "description", "start", "end", "attendees"],
      example: "@calendar update eventId:\"abc123def456ghi789\" summary:\"Updated Meeting Title\" start:\"2025-04-05T11:00:00Z\" end:\"2025-04-05T12:00:00Z\""
    },
    {
      name: "delete",
      description: "Delete a calendar event",
      parameters: ["eventId"],
      example: "@calendar delete eventId:\"abc123def456ghi789\""
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-gray-900">
          Available @calendar Commands
        </h3>
        <button 
          className="text-gray-400 hover:text-gray-600"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse tools help" : "Expand tools help"}
        >
          <svg className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">
            Use the @calendar prefix followed by one of these commands to interact with Google Calendar:
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Command
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parameters
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tools.map((tool, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-yellow-600 font-medium">
                      {tool.name}
                    </td>
                    <td className="px-6 py-4">
                      {tool.description}
                    </td>
                    <td className="px-6 py-4">
                      {tool.parameters.map(param => (
                        <span key={param} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                          {param}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Example Usage:</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <code className="text-sm text-gray-800">@calendar list maxResults:10 timeMin:"2025-03-01T00:00:00Z"</code>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
            <h4 className="text-sm font-medium mb-2">Calendar Event Tips:</h4>
            <ul className="text-xs space-y-1">
              <li>Use ISO 8601 format for dates and times: <code>YYYY-MM-DDThh:mm:ssZ</code></li>
              <li>Separate multiple attendees with commas</li>
              <li>You can create all-day events by using the date only</li>
              <li>The eventId is required for updating or deleting events</li>
              <li>Set timeMin to current date to see only upcoming events</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}