'use client'

import { useState } from 'react'

export default function PreferencesSection() {
  const [preferences, setPreferences] = useState({
    emailNotifications: false,
    taskCompletionAlerts: true,
    dataCollection: true,
    saveConversationHistory: true,
    language: 'en',
    textSize: 'medium'
  })

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleResetToDefault = () => {
    setPreferences({
      emailNotifications: false,
      taskCompletionAlerts: true,
      dataCollection: true,
      saveConversationHistory: true,
      language: 'en',
      textSize: 'medium'
    })
  }

  const handleSavePreferences = () => {
    // In a real app, you would save preferences to backend here
    alert('Preferences saved successfully!')
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
        <p className="mt-1 text-sm text-gray-600">Customize your AI agent experience.</p>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {/* Notification Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="emailNotifications" className="text-gray-700">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive updates about your AI agents via email</p>
                </div>
                <div className="relative">
                  <button 
                    className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      preferences.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    onClick={() => handleToggle('emailNotifications')}
                  >
                    <span 
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        preferences.emailNotifications ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="taskCompletionAlerts" className="text-gray-700">Task Completion Alerts</label>
                  <p className="text-sm text-gray-500">Get notified when your AI agent completes assigned tasks</p>
                </div>
                <div className="relative">
                  <button 
                    className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      preferences.taskCompletionAlerts ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    onClick={() => handleToggle('taskCompletionAlerts')}
                  >
                    <span 
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        preferences.taskCompletionAlerts ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="dataCollection" className="text-gray-700">Data Collection</label>
                  <p className="text-sm text-gray-500">Allow data collection to improve AI performance</p>
                </div>
                <div className="relative">
                  <button 
                    className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      preferences.dataCollection ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    onClick={() => handleToggle('dataCollection')}
                  >
                    <span 
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        preferences.dataCollection ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="saveConversationHistory" className="text-gray-700">Save Conversation History</label>
                  <p className="text-sm text-gray-500">Store chat logs for future reference</p>
                </div>
                <div className="relative">
                  <button 
                    className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      preferences.saveConversationHistory ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    onClick={() => handleToggle('saveConversationHistory')}
                  >
                    <span 
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        preferences.saveConversationHistory ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Language & Accessibility */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Language &amp; Accessibility</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select 
                  id="language" 
                  name="language" 
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={preferences.language}
                  onChange={handleSelectChange}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                </select>
              </div>
              <div>
                <label htmlFor="textSize" className="block text-sm font-medium text-gray-700 mb-1">Text Size</label>
                <select 
                  id="textSize" 
                  name="textSize" 
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={preferences.textSize}
                  onChange={handleSelectChange}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            type="button" 
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50"
            onClick={handleResetToDefault}
          >
            Reset to Default
          </button>
          <button 
            type="button" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleSavePreferences}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}