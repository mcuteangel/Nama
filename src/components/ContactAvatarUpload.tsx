"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, X, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { designTokens } from '@/lib/design-tokens';

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
    <div className="space-y-4">
      {/* Compact Header Section */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
           style={{
             background: designTokens.gradients.primary,
             boxShadow: designTokens.shadows.glass3d
           }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              <Sparkles size={24} className="sm:w-8 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2"
                  style={{ fontFamily: designTokens.typography.fonts.primary }}>
                تصویر پروفایل
              </h2>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                تصویری از مخاطب خود انتخاب کنید
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div
              className={cn(
                'relative rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-500 group',
                'border-4 border-dashed border-white/30 hover:border-white/50',
                'bg-white/10 hover:bg-white/20 backdrop-blur-xl',
                'flex items-center justify-center overflow-hidden shadow-2xl',
                currentSize.container,
                isDragging && 'ring-4 ring-white/50 border-white/70 bg-white/30 scale-105',
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
                      'w-full h-full object-cover transition-all duration-500 rounded-3xl',
                      isHovered && 'scale-110 brightness-75'
                    )}
                  />
                  {(isHovered || isDragging) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-4 text-center rounded-3xl backdrop-blur-sm">
                      <Camera className={cn('mb-3', currentSize.icon)} />
                      <span className={cn('font-bold', currentSize.text)}>
                        تغییر عکس
                      </span>
                      <span className="text-xs opacity-80 mt-1">
                        کلیک کنید یا تصویر را رها کنید
                      </span>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className={cn(
                      'absolute -top-3 -right-3 rounded-full p-2 shadow-xl border-4 border-white',
                      'hover:scale-110 transition-all duration-300 bg-red-500 hover:bg-red-600',
                      currentSize.removeBtn
                    )}
                    onClick={handleRemove}
                    aria-label={t('remove_photo', 'حذف عکس')}
                  >
                    <X className="h-4/5 w-4/5" />
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
                      <User size={32} className="text-white/80" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <Upload size={16} className="text-white" />
                    </div>
                  </div>
                  <span className={cn('text-white font-bold mb-2', currentSize.text)}>
                    انتخاب تصویر پروفایل
                  </span>
                  <span className="text-sm text-white/70">
                    کلیک کنید یا تصویر را اینجا رها کنید
                  </span>
                </div>
              )}
            </div>

            {!avatarUrl && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center max-w-md">
                <p className={cn('text-white/90 mb-2', currentSize.text)}>
                  💡 نکات مهم:
                </p>
                <ul className="text-xs sm:text-sm text-white/80 space-y-1">
                  <li>• فرمت‌های مجاز: JPG, PNG, GIF</li>
                  <li>• حداکثر حجم: ۲ مگابایت</li>
                  <li>• بهترین کیفیت: ۵۱۲x۵۱۲ پیکسل</li>
                </ul>
              </div>
            )}

            {avatarUrl && (
              <div className="bg-green-50/10 backdrop-blur-md border border-green-200/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Sparkles size={12} className="sm:w-3.5 text-white" />
                  </div>
                  <span className="text-green-400 font-bold text-sm sm:text-base">تصویر با موفقیت آپلود شد!</span>
                </div>
                <p className="text-green-300 text-xs sm:text-sm">
                  تصویر پروفایل شما آماده ذخیره است
                </p>
              </div>
            )}
          </div>
        </div>
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