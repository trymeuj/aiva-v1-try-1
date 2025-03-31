// src/components/chat/EmailAttachmentHelper.tsx - Modified to include attachment data

import React from 'react';
import AttachmentViewer from './AttachmentViewer';

interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
  data?: string; // Added data field
}

interface EmailAttachmentHelperProps {
  messageId: string;
  attachments: Attachment[];
}

export default function EmailAttachmentHelper({ messageId, attachments }: EmailAttachmentHelperProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments ({attachments.length})</h4>
      <div className="space-y-2">
        {attachments.map((attachment, index) => (
          <AttachmentViewer
            key={index}
            messageId={messageId}
            attachmentId={attachment.attachmentId}
            filename={attachment.filename}
            mimeType={attachment.mimeType}
            size={attachment.size}
            data={attachment.data} // Pass the data if available
          />
        ))}
      </div>
    </div>
  );
}