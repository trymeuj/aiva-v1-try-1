'use client'

import React from 'react';
import AttachmentViewer from './AttachmentViewer';

interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
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
    <div className="mt-4">
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
          />
        ))}
      </div>
    </div>
  );
}