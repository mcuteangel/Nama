"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ImageUpload from '@/components/ui/image-upload';

interface ContactAvatarUploadProps {
  initialAvatarUrl?: string | null;
  onAvatarChange: (url: string | null) => void;
  disabled?: boolean;
}

const ContactAvatarUpload: React.FC<ContactAvatarUploadProps> = React.memo(({ initialAvatarUrl, onAvatarChange, disabled }) => {
  const { t } = useTranslation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl || null);
  }, [initialAvatarUrl]);

  const handleAvatarChange = (url: string | null) => {
    setAvatarUrl(url);
    onAvatarChange(url);
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6 p-6 rounded-xl glass">
      <ImageUpload
        value={avatarUrl}
        onChange={handleAvatarChange}
        disabled={disabled}
        size="lg"
        variant="avatar"
        layout="vertical"
        uploadOptions={{
          bucket: 'avatars',
          maxSize: 5 * 1024 * 1024, // 5MB
        }}
        placeholder={
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-500">
              <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h1.586a1 1 0 0 1 .707.293l.707.707A1 1 0 0 0 13.414 11H15m-3-3v2a1 1 0 0 0 1 1h2"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
        }
        className="h-32 w-32"
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.initialAvatarUrl === nextProps.initialAvatarUrl &&
    prevProps.disabled === nextProps.disabled
  );
});

ContactAvatarUpload.displayName = 'ContactAvatarUpload';

export default ContactAvatarUpload;