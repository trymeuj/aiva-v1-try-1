'use client'

import React, { useState } from 'react'
import { useSideDisplay } from '@/components/SideDisplay/SideDisplayContext'

interface AttachmentViewerProps {
  messageId: string;
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
}

export default function AttachmentViewer({ 
  messageId, 
  attachmentId, 
  filename, 
  mimeType, 
  size 
}: AttachmentViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);
  const { openSideDisplay } = useSideDisplay();
  
  // Format file size to be human-readable
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Handle attachment download
  const handleDownload = async () => {
    const downloadUrl = `/api/gmail/download/${messageId}/${attachmentId}/${filename}`;
    window.open(downloadUrl, '_blank');
  };
  
  // Handle attachment preview
  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gmail/attachment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          attachmentId,
          includeData: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to retrieve attachment data');
      }
      
      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('No attachment data received');
      }
      
      setData(result.data);
      
      // Display the attachment in the side panel based on file type
      if (mimeType.startsWith('image/')) {
        // Image preview
        openSideDisplay({
          title: `Preview: ${filename}`,
          content: (
            <div className="flex flex-col items-center">
              <img 
                src={`data:${mimeType};base64,${result.data}`} 
                alt={filename}
                className="max-w-full h-auto"
              />
              <button
                onClick={handleDownload}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Download
              </button>
            </div>
          ),
          contentType: 'document',
          width: 'wide'
        });
      } else if (mimeType === 'application/pdf') {
        // PDF preview
        openSideDisplay({
          title: `PDF Preview: ${filename}`,
          content: (
            <div className="flex flex-col h-full">
              <iframe 
                src={`data:application/pdf;base64,${result.data}`}
                className="flex-1 w-full min-h-[70vh] border-0"
                title={`PDF preview of ${filename}`}
              />
              <div className="py-4 flex justify-center">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Download PDF
                </button>
              </div>
            </div>
          ),
          contentType: 'document',
          width: 'wide'
        });
      } else if (mimeType.startsWith('text/')) {
        // Text preview
        try {
          const textData = atob(result.data);
          openSideDisplay({
            title: `Preview: ${filename}`,
            content: (
              <div className="flex flex-col">
                <pre className="whitespace-pre-wrap break-words p-4 bg-gray-50 rounded border border-gray-200 max-h-[70vh] overflow-auto">
                  {textData}
                </pre>
                <div className="py-4 flex justify-center">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Download
                  </button>
                </div>
              </div>
            ),
            contentType: 'code',
            width: 'wide'
          });
        } catch (e) {
          // If we can't decode as text, show base64 data
          showBase64DataView(result.data, filename);
        }
      } else {
        // For other files, show base64 data view with download option
        showBase64DataView(result.data, filename);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to display base64 data with instructions
  const showBase64DataView = (base64Data: string, filename: string) => {
    openSideDisplay({
      title: `Attachment: ${filename}`,
      content: (
        <div className="flex flex-col p-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
            <h3 className="text-lg font-medium text-green-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Attachment Retrieved Successfully
            </h3>
            <p className="text-green-700 mt-2">
              The attachment data has been retrieved. The data is in base64 format.
            </p>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">To save the attachment:</h4>
            <ol className="space-y-6">
              <li className="flex">
                <span className="flex-shrink-0 font-medium mr-2">1.</span>
                <div>
                  <p>You can download it directly using:</p>
                  <button
                    onClick={handleDownload}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download File
                  </button>
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 font-medium mr-2">2.</span>
                <div>
                  <p>Or you can convert the base64 data to a file using:</p>
                  <div className="mt-2">
                    <h5 className="font-medium mb-2">Browser:</h5>
                    <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
{`const byteCharacters = atob(base64Data);
const byteArray = new Uint8Array(byteCharacters.length);
for (let i = 0; i < byteCharacters.length; i++) {
  byteArray[i] = byteCharacters.charCodeAt(i);
}
const blob = new Blob([byteArray], {type: "${mimeType}"});
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "${filename}";
a.click();`}
                    </pre>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Node.js:</h5>
                    <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
{`import { writeFileSync } from 'fs';
writeFileSync('${filename}', Buffer.from(base64Data, 'base64'));`}
                    </pre>
                  </div>
                </div>
              </li>
            </ol>
          </div>
          
          {/* First few characters of base64 data as preview */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Base64 Data Preview:</h4>
            <div className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto font-mono">
              {base64Data.substring(0, 100)}...
            </div>
          </div>
        </div>
      ),
      contentType: 'document',
      width: 'wide'
    });
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 mt-2 bg-gray-50">
      <div className="flex items-center">
        <div className="h-10 w-10 flex-shrink-0">
          {mimeType.includes('pdf') ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500 h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v-4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14h4" />
            </svg>
          ) : mimeType.includes('image') ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-500 h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ) : mimeType.includes('word') || mimeType.includes('document') ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-500 h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9h6" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17h6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500 h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        
        <div className="ml-4 flex-1">
          <h3 className="text-base font-medium text-gray-800">{filename}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <span>{mimeType}</span>
            <span className="mx-2">•</span>
            <span>{formatFileSize(size)}</span>
          </div>
        </div>
        
        <div className="ml-4 flex items-center space-x-2">
          <button 
            onClick={handlePreview}
            disabled={loading}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center"
          >
            {loading ? 'Loading...' : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Preview
              </>
            )}
          </button>
          
          <button 
            onClick={handleDownload}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          Error: {error}
        </div>
      )}
    </div>
  );
}