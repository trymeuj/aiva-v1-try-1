'use client'

import React, { useState } from 'react'

export default function GmailToolsHelp() {
  const [isExpanded, setIsExpanded] = useState(false)

  const tools = [
    {
      name: "list",
      description: "List emails from your inbox",
      parameters: ["maxResults", "query", "includeBody"],
      example: "@gmail list maxResults:5 query:\"is:unread\""
    },
    {
      name: "search",
      description: "Search for specific emails",
      parameters: ["query", "maxResults", "includeBody"],
      example: "@gmail search query:\"from:example@gmail.com has:attachment\" maxResults:10"
    },
    {
      name: "get",
      description: "Get a single email by ID",
      parameters: ["id"],
      example: "@gmail get id:18e046d9a8b26397"
    },
    {
      name: "send",
      description: "Send a new email",
      parameters: ["to", "subject", "body", "cc", "bcc"],
      example: "@gmail send to:\"recipient@example.com\" subject:\"Hello from AI\" body:\"This is a test email.\""
    },
    {
      name: "modify",
      description: "Modify email labels",
      parameters: ["id", "addLabels", "removeLabels"],
      example: "@gmail modify id:18e046d9a8b26397 addLabels:\"UNREAD,IMPORTANT\" removeLabels:\"INBOX\""
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-gray-900">
          Available @gmail Commands
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
            Use the @gmail prefix followed by one of these commands to interact with Gmail:
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
                    <td className="px-6 py-4 whitespace-nowrap text-purple-600 font-medium">
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
              <code className="text-sm text-gray-800">@gmail list maxResults:5 query:"is:unread"</code>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
            <h4 className="text-sm font-medium mb-2">Common Gmail Search Queries:</h4>
            <ul className="text-xs space-y-1">
              <li><code>is:unread</code> - Unread emails</li>
              <li><code>has:attachment</code> - Emails with attachments</li>
              <li><code>from:someone@example.com</code> - From specific sender</li>
              <li><code>subject:meeting</code> - With specific subject</li>
              <li><code>after:2025/01/01</code> - After specific date</li>
              <li><code>before:2025/01/31</code> - Before specific date</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}