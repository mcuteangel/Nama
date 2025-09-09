import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImageUpload from '@/components/ui/image-upload';
import AvatarDisplay from '@/components/ui/avatar-display';
import { Users } from 'lucide-react';

interface GroupImageUploadProps {
  initialImageUrl?: string | null;
  onImageChange: (url: string | null) => void;
  disabled?: boolean;
  groupName?: string;
}

const GroupImageUpload: React.FC<GroupImageUploadProps> = ({
  initialImageUrl,
  onImageChange,
  disabled = false,
  groupName
}) => {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);

  const handleImageChange = (url: string | null) => {
    setImageUrl(url);
    onImageChange(url);
  };

  return (
    <div className="space-y-4">
      {/* Current Image Display */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/30 dark:border-purple-800/30">
        <AvatarDisplay
          src={imageUrl}
          alt={groupName || t('groups.group_image')}
          size="lg"
          fallback={
            <div className="flex items-center justify-center">
              <Users size={32} className="text-purple-600 dark:text-purple-400" />
            </div>
          }
          borderColor="border-purple-400 dark:border-purple-600"
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {t('groups.group_image')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {imageUrl ? t('groups.image_uploaded') : t('groups.no_image_uploaded')}
          </p>
        </div>
      </div>

      {/* Upload Component */}
      <div className="p-4 rounded-xl glass">
        <ImageUpload
          value={imageUrl}
          onChange={handleImageChange}
          disabled={disabled}
          size="md"
          variant="card"
          layout="horizontal"
          uploadOptions={{
            bucket: 'group-images',
            folder: 'groups',
            maxSize: 10 * 1024 * 1024, // 10MB for group images
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
          }}
          uploadButtonText={t('groups.upload_group_image')}
          deleteButtonText={t('groups.delete_group_image')}
          placeholder={
            <div className="flex flex-col items-center gap-2">
              <Users size={48} className="text-gray-400" />
              <span className="text-sm text-gray-500">{t('groups.drop_image_here')}</span>
            </div>
          }
        />
      </div>
    </div>
  );
};

GroupImageUpload.displayName = 'GroupImageUpload';

export default GroupImageUpload;