"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, X, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ContactAvatarUploadProps {
  initialAvatarUrl?: string | null;
  onAvatarChange: (url: string | null) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    container: 'w-20 h-20',
    icon: 'w-8 h-8',
    removeBtn: 'w-6 h-6',
    text: 'text-xs'
  },
  md: {
    container: 'w-32 h-32',
    icon: 'w-12 h-12',
    removeBtn: 'w-8 h-8',
    text: 'text-sm'
  },
  lg: {
    container: 'w-40 h-40',
    icon: 'w-16 h-16',
    removeBtn: 'w-10 h-10',
    text: 'text-base'
  }
};

const ContactAvatarUpload: React.FC<ContactAvatarUploadProps> = React.memo(({
  initialAvatarUrl,
  onAvatarChange,
  disabled = false,
  size = 'md'
}) => {
  const { t } = useTranslation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const currentSize = sizeClasses[size];

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl || null);
  }, [initialAvatarUrl]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('errors.invalid_image_type', 'Please upload an image file'));
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert(t('errors.image_too_large', 'Image must be less than 2MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarUrl(result);
      onAvatarChange(result);
    };
    reader.readAsDataURL(file);
  }, [onAvatarChange, t]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarUrl(null);
    onAvatarChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onAvatarChange]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || !e.dataTransfer.files?.[0]) return;

    const file = e.dataTransfer.files[0];
    const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(event);
  }, [disabled, handleFileChange]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className={cn(
          'relative border-2 border-dashed border-gray-300 rounded-full cursor-pointer transition-colors',
          'hover:border-gray-400 bg-gray-50 hover:bg-gray-100',
          currentSize.container,
          isDragging && 'border-blue-400 bg-blue-50',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        onClick={handleClick}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && handleClick()}
        aria-label={t('upload_avatar', 'Upload profile picture')}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={disabled}
        />

        {avatarUrl ? (
          <>
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover rounded-full"
            />
            {(isHovered || isDragging) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full">
                <Camera className={currentSize.icon} />
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className={cn(
                'absolute -top-2 -right-2 rounded-full',
                currentSize.removeBtn
              )}
              onClick={handleRemove}
              aria-label={t('remove_photo', 'حذف عکس')}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="relative mb-2">
              <User className={cn('text-gray-400', currentSize.icon)} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-sm text-gray-600">
              انتخاب تصویر پروفایل
            </span>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.initialAvatarUrl === nextProps.initialAvatarUrl &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.size === nextProps.size
  );
});

ContactAvatarUpload.displayName = 'ContactAvatarUpload';

export default ContactAvatarUpload;