'use client'

import React from 'react'

interface SoftwareCardProps {
  id: string
  title: string
  description: string
  info: string
  iconColor: string
  bgColor: string
  icon: React.ReactNode
  checked: boolean
  onChange: (id: string, checked: boolean) => void
}

export default function SoftwareCard({
  id,
  title,
  description,
  info,
  iconColor,
  bgColor,
  icon,
  checked,
  onChange
}: SoftwareCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`h-12 w-12 ${bgColor} rounded-lg flex items-center justify-center`}>
            <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
          </div>
          <div className="relative">
            <input 
              type="checkbox" 
              id={`${id}-checkbox`} 
              className="sr-only peer"
              checked={checked}
              onChange={(e) => onChange(id, e.target.checked)}
            />
            <label 
              htmlFor={`${id}-checkbox`} 
              className={`h-6 w-6 flex items-center justify-center peer-checked:${iconColor} peer-checked:bg-${iconColor.split('-')[1]} peer-checked:text-white border border-gray-300 rounded cursor-pointer hover:bg-gray-100 transition-colors`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            </label>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{info}</span>
        </div>
      </div>
    </div>
  )
}