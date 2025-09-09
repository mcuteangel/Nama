import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImageUpload from '@/components/ui/image-upload';
import AvatarDisplay from '@/components/ui/avatar-display';
import { User, Shield } from 'lucide-react';

interface UserProfileImageUploadProps {
  initialImageUrl?: string | null;
  onImageChange: (url: string | null) => void;
  disabled?: boolean;
  userName?: string;
  userRole?: string;
  isCurrentUser?: boolean;
}

const UserProfileImageUpload: React.FC<UserProfileImageUploadProps> = ({
  initialImageUrl,
  onImageChange,
  disabled = false,
  userName,
  userRole,
  isCurrentUser = false
}) => {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);

  const handleImageChange = (url: string | null) => {
    setImageUrl(url);
    onImageChange(url);
  };

  const getRoleIcon = () => {
    if (userRole === 'admin') {
      return <Shield size={16} className="text-red-500" />;
    }
    return <User size={16} className="text-blue-500" />;
  };

  const getRoleColor = () => {
    if (userRole === 'admin') {
      return 'border-red-400 dark:border-red-600';
    }
    return 'border-blue-400 dark:border-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center p-6 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/30 dark:border-blue-800/30">
        <div className="relative inline-block">
          <AvatarDisplay
            src={imageUrl}
            alt={userName || t('users.profile_image')}
            size="xl"
            fallback={
              <div className="flex items-center justify-center">
                <User size={48} className="text-blue-600 dark:text-blue-400" />
              </div>
            }
            borderColor={getRoleColor()}
            onClick={() => {/* Handle click if needed */}}
          />

          {/* Role Badge */}
          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 border-2 border-white dark:border-gray-700 shadow-lg">
            {getRoleIcon()}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {userName || t('users.profile_image')}
          </h3>
          {userRole && (
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2 mt-1">
              {getRoleIcon()}
              {t(`users.roles.${userRole}`)}
            </p>
          )}
          {isCurrentUser && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              {t('users.current_user')}
            </p>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div className="p-6 rounded-xl glass">
        <div className="text-center mb-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            {t('users.update_profile_image')}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('users.profile_image_description')}
          </p>
        </div>

        <ImageUpload
          value={imageUrl}
          onChange={handleImageChange}
          disabled={disabled}
          size="lg"
          variant="card"
          layout="vertical"
          uploadOptions={{
            bucket: 'user-profiles',
            folder: 'profiles',
            maxSize: 8 * 1024 * 1024, // 8MB for profile images
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
          }}
          uploadButtonText={t('users.upload_profile_image')}
          deleteButtonText={t('users.delete_profile_image')}
          placeholder={
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
                <User size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('users.drop_profile_image')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('users.supported_formats')}: JPG, PNG, WebP
                </p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

UserProfileImageUpload.displayName = 'UserProfileImageUpload';

export default UserProfileImageUpload;