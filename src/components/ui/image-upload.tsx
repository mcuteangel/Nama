import React, { useRef, useState } from 'react';
import { GlassButton } from '@/components/ui/glass-button';
import { ModernLoader } from '@/components/ui/modern-loader';
import { useTranslation } from 'react-i18next';
import { useImageUpload, ImageUploadOptions } from '@/hooks/use-image-upload';
import { UploadCloud, XCircle, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
  uploadOptions: ImageUploadOptions;
  // Display options
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'avatar' | 'card' | 'inline';
  showPreview?: boolean;
  placeholder?: React.ReactNode;
  // Button customization
  uploadButtonText?: string;
  deleteButtonText?: string;
  // Layout options
  layout?: 'vertical' | 'horizontal';
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
  xl: 'h-48 w-48',
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  className,
  uploadOptions,
  size = 'md',
  variant = 'avatar',
  showPreview = true,
  placeholder,
  uploadButtonText,
  deleteButtonText,
  layout = 'vertical',
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState<string | null>(value || null);

  const { uploadImage, deleteImage, isUploading, isDeleting } = useImageUpload({
    ...uploadOptions,
    onSuccess: (url) => {
      setLocalValue(url);
      onChange(url);
    },
  });

  // Sync with external value changes
  React.useEffect(() => {
    setLocalValue(value || null);
  }, [value]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file);
    if (url) {
      setLocalValue(url);
      onChange(url);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!localValue) return;

    const success = await deleteImage(localValue);
    if (success) {
      setLocalValue(null);
      onChange(null);
    }
  };

  const renderPreview = () => {
    if (!showPreview) return null;

    const sizeClass = sizeClasses[size];

    if (variant === 'avatar') {
      return (
        <div className={cn(
          "relative rounded-full border-4 border-blue-400 dark:border-blue-600 shadow-xl overflow-hidden",
          sizeClass,
          className
        )}>
          {localValue ? (
            <img
              src={localValue}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              {placeholder || <Camera size={size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 48} className="text-gray-500" />}
            </div>
          )}
        </div>
      );
    }

    if (variant === 'card') {
      return (
        <div className={cn(
          "relative rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800",
          size === 'sm' ? 'h-20 w-20' : size === 'md' ? 'h-32 w-32' : size === 'lg' ? 'h-48 w-48' : 'h-64 w-64',
          className
        )}>
          {localValue ? (
            <img
              src={localValue}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {placeholder || <Camera size={32} className="text-gray-400" />}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const isLoading = isUploading || isDeleting;

  return (
    <div className={cn(
      "flex gap-4",
      layout === 'vertical' ? 'flex-col items-center' : 'flex-row items-center',
      className
    )}>
      {renderPreview()}

      <div className={cn(
        "flex gap-2",
        layout === 'vertical' ? 'flex-col w-full max-w-xs' : 'flex-col'
      )}>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isLoading}
        />

        <GlassButton
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
          variant="glass-gradient-primary"
          effect="lift"
          className="w-full px-4 py-2 font-medium shadow-md hover:shadow-lg transition-all duration-300"
        >
          {isUploading && <ModernLoader variant="spinner" size="sm" className="me-2" />}
          <UploadCloud size={16} className="mr-2" />
          {uploadButtonText || (isUploading ? t('actions.uploading') : t('actions.upload_image'))}
        </GlassButton>

        {localValue && (
          <GlassButton
            type="button"
            variant="glass-gradient-danger"
            effect="lift"
            onClick={handleDelete}
            disabled={disabled || isLoading}
            className="w-full px-4 py-2 font-medium shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isDeleting && <ModernLoader variant="spinner" size="sm" className="me-2" />}
            <XCircle size={16} className="mr-2" />
            {deleteButtonText || t('actions.delete_image')}
          </GlassButton>
        )}
      </div>
    </div>
  );
};

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;