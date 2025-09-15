"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, X } from 'lucide-react';
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
    container: 'w-16 h-16',
    icon: 'w-6 h-6',
    removeBtn: 'w-5 h-5',
    text: 'text-xs'
  },
  md: {
    container: 'w-24 h-24',
    icon: 'w-8 h-8',
    removeBtn: 'w-6 h-6',
    text: 'text-sm'
  },
  lg: {
    container: 'w-32 h-32',
    icon: 'w-10 h-10',
    removeBtn: 'w-8 h-8',
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
    <div className="flex flex-col items-center gap-3">
      <div 
        className={cn(
          'relative rounded-full cursor-pointer transition-all duration-300',
          'border-2 border-dashed border-muted-foreground/20 hover:border-primary/50',
          'bg-muted/30 hover:bg-muted/50',
          'flex items-center justify-center overflow-hidden',
          currentSize.container,
          isDragging && 'ring-2 ring-primary/50 border-primary/70 bg-muted/70',
          disabled && 'opacity-60 cursor-not-allowed',
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
              className={cn(
                'w-full h-full object-cover transition-opacity duration-300',
                isHovered && 'opacity-70'
              )}
            />
            {(isHovered || isDragging) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-2 text-center">
                <Camera className={cn('mb-1', currentSize.icon)} />
                <span className={cn('font-medium', currentSize.text)}>
                  {t('change_photo', 'تغییر عکس')}
                </span>
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className={cn(
                'absolute -top-1 -right-1 rounded-full p-1 shadow-md',
                'hover:scale-105 transition-transform',
                currentSize.removeBtn
              )}
              onClick={handleRemove}
              aria-label={t('remove_photo', 'حذف عکس')}
            >
              <X className="h-3/4 w-3/4" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <Upload className={cn('text-muted-foreground mb-2', currentSize.icon)} />
            <span className={cn('text-muted-foreground font-medium', currentSize.text)}>
              {t('upload_photo', 'آپلود عکس')}
            </span>
            <span className="text-xs text-muted-foreground/70 mt-1">
              {t('or_drag_drop', 'یا رها کنید')}
            </span>
          </div>
        )}
      </div>
      
      {!avatarUrl && (
        <p className={cn('text-muted-foreground/80 text-center max-w-xs', currentSize.text)}>
          {t('avatar_hint', 'فرمت‌های مجاز: JPG, PNG (حداکثر ۲ مگابایت)')}
        </p>
      )}
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