'use client'

import React, { useState } from 'react'

export default function MCPToolsHelp() {
  const [isExpanded, setIsExpanded] = useState(false)

  const tools = [
    {
      name: "create-doc",
      description: "Creates a new Google Doc with an optional title",
      parameters: ["title", "org", "role"],
      example: "@docs create-doc title:\"My Meeting Notes\" org:example.com role:writer"
    },
    {
      name: "read-doc",
      description: "Reads content from a Google Doc",
      parameters: ["document_id"],
      example: "@docs read-doc document_id:1F2_jauT6IZLCOkBPvcwIxPJbmOyleXvGRyvQaNP5bI8"
    },
    {
      name: "rewrite-document",
      description: "Rewrites the entire content of a Google Doc",
      parameters: ["document_id", "final_text"],
      example: "@docs rewrite-document document_id:1F2_jauT6IZLCOkBPvcwIxPJbmOyleXvGRyvQaNP5bI8 final_text:\"New content for the document\""
    },
    {
      name: "read-comments",
      description: "Reads comments from a document",
      parameters: ["document_id"],
      example: "@docs read-comments document_id:1F2_jauT6IZLCOkBPvcwIxPJbmOyleXvGRyvQaNP5bI8"
    },
    {
      name: "reply-comment",
      description: "Replies to a comment",
      parameters: ["document_id", "comment_id", "reply"],
      example: "@docs reply-comment document_id:1F2_jauT6IZLCOkBPvcwIxPJbmOyleXvGRyvQaNP5bI8 comment_id:123 reply:\"Thanks for the feedback!\""
    },
    {
      name: "create-comment",
      description: "Creates a new comment",
      parameters: ["document_id", "content"],
      example: "@docs create-comment document_id:1F2_jauT6IZLCOkBPvcwIxPJbmOyleXvGRyvQaNP5bI8 content:\"This looks great!\""
    },
    {
      name: "delete-reply",
      description: "Deletes a reply from a comment",
      parameters: ["document_id", "comment_id", "reply_id"],
      example: "@docs delete-reply document_id:1F2_jauT6IZLCOkBPvcwIxPJbmOyleXvGRyvQaNP5bI8 comment_id:123 reply_id:456"
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-gray-900">
          Available @docs Commands
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
            Use the @docs prefix followed by one of these commands to interact with Google Docs:
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
                    <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-medium">
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
              <code className="text-sm text-gray-800">@docs create-doc title:"Weekly Meeting Notes"</code>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}