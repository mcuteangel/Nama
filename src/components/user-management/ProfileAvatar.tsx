import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, User, Edit3, AlertCircle, Trash2 } from 'lucide-react';
import { GlassButton } from "@/components/ui/glass-button";
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/auth';
import { showSuccess, showError } from '@/utils/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  onAvatarUpdate: (url: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarUrl,
  onAvatarUpdate,
  size = 'md',
  editable = true
}) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError(t('errors.invalid_file_type'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError(t('errors.file_too_large'));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setShowPreviewDialog(true);
    };
    reader.readAsDataURL(file);
  };

  const confirmUpload = async () => {
    if (!previewUrl) return;

    const fileInput = fileInputRef.current?.files?.[0];
    if (!fileInput) return;

    setIsUploading(true);
    setShowPreviewDialog(false);

    try {
      // Upload to Supabase Storage
      const fileExt = fileInput.name.split('.').pop();
      const fileName = `${session?.user?.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileInput, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: data.publicUrl })
          .eq('id', session?.user?.id);

        if (updateError) {
          throw updateError;
        }

        onAvatarUpdate(data.publicUrl);
        showSuccess(t('system_messages.avatar_updated'));
        setShowUploadOptions(false);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showError(t('errors.avatar_upload_failed'));
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', session?.user?.id);

      if (error) throw error;

      onAvatarUpdate('');
      showSuccess(t('system_messages.avatar_removed'));
      setShowUploadOptions(false);
      setShowRemoveDialog(false);
    } catch (error) {
      showError(t('errors.avatar_remove_failed'));
    }
  };

  const currentAvatarUrl = previewUrl || avatarUrl;

  return (
    <div className="relative">
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white/20 dark:border-gray-700/50 shadow-xl`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {currentAvatarUrl ? (
          <motion.img
            src={currentAvatarUrl}
            alt={t('profile.avatar_alt')}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <motion.div
            className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <User size={iconSizes[size] * 0.6} className="text-primary/60" />
          </motion.div>
        )}

        {/* Upload overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit button */}
        {editable && !isUploading && (
          <motion.button
            onClick={() => setShowUploadOptions(!showUploadOptions)}
            className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/80 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={t('profile.edit_avatar')}
          >
            <Edit3 size={14} className="text-white" />
          </motion.button>
        )}
      </motion.div>

      {/* Upload options menu */}
      <AnimatePresence>
        {showUploadOptions && editable && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-3 min-w-48">
              <div className="space-y-2">
                <GlassButton
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full justify-start gap-3 text-left"
                  variant="ghost"
                >
                  <Upload size={16} />
                  {t('profile.upload_new')}
                </GlassButton>

                {avatarUrl && (
                  <GlassButton
                    onClick={() => setShowRemoveDialog(true)}
                    className="w-full justify-start gap-3 text-left text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    variant="ghost"
                  >
                    <Trash2 size={16} />
                    {t('profile.remove_avatar')}
                  </GlassButton>
                )}

                <GlassButton
                  onClick={() => setShowUploadOptions(false)}
                  className="w-full justify-start gap-3 text-left"
                  variant="ghost"
                >
                  <X size={16} />
                  {t('actions.cancel')}
                </GlassButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label={t('profile.select_image')}
      />

      {/* Click outside to close */}
      {showUploadOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUploadOptions(false)}
        />
      )}

      {/* Image Preview Dialog */}
      <AlertDialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('profile.preview_avatar')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('profile.preview_avatar_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-4">
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt={t('profile.avatar_preview')} 
                className="max-w-full max-h-64 rounded-lg object-contain"
              />
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setPreviewUrl(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}>
              {t('actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpload}>
              {t('actions.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Avatar Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-red-500" />
              {t('profile.remove_avatar_confirm_title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('profile.remove_avatar_confirm_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveAvatar}
              className="bg-red-500 hover:bg-red-600"
            >
              {t('actions.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileAvatar;