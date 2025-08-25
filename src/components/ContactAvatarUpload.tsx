"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, XCircle, UploadCloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/auth';
import { showError, showSuccess, showLoading } from '@/utils/toast'; // Removed dismissToast as it's not used
import LoadingSpinner from './LoadingSpinner';

interface ContactAvatarUploadProps {
  initialAvatarUrl?: string | null;
  onAvatarChange: (url: string | null) => void;
  disabled?: boolean;
}

const ContactAvatarUpload: React.FC<ContactAvatarUploadProps> = ({ initialAvatarUrl, onAvatarChange, disabled }) => {
  const { session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl || null);
  }, [initialAvatarUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!session?.user) {
      showError("برای آپلود تصویر پروفایل باید وارد شوید.");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError("لطفاً یک فایل تصویری انتخاب کنید.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("حجم فایل نباید بیشتر از 5 مگابایت باشد.");
      return;
    }

    setIsUploading(true);
    const toastId = showLoading("در حال آپلود تصویر...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage // Removed 'data' from destructuring
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!publicUrlData?.publicUrl) {
        throw new Error("خطا در دریافت URL عمومی تصویر.");
      }

      setAvatarUrl(publicUrlData.publicUrl);
      onAvatarChange(publicUrlData.publicUrl);
      showSuccess("تصویر با موفقیت آپلود شد.");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      showError(`خطا در آپلود تصویر: ${error.message || "خطای ناشناخته"}`);
      setAvatarUrl(initialAvatarUrl || null);
    } finally {
      // dismissToast(toastId); // Commented out as per previous instruction
      // The toast is dismissed by the success/error toast itself in sonner
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!session?.user || !avatarUrl) return;

    setIsUploading(true);
    const toastId = showLoading("در حال حذف تصویر...");

    try {
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts.slice(urlParts.indexOf('avatars') + 1).join('/');

      const { error } = await supabase.storage
        .from('avatars')
        .remove([fileName]);

      if (error) {
        throw error;
      }

      setAvatarUrl(null);
      onAvatarChange(null);
      showSuccess("تصویر با موفقیت حذف شد.");
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      showError(`خطا در حذف تصویر: ${error.message || "خطای ناشناخته"}`);
    } finally {
      // dismissToast(toastId); // Commented out as per previous instruction
      // The toast is dismissed by the success/error toast itself in sonner
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <Avatar className="h-28 w-28 border-4 border-blue-400 dark:border-blue-600 shadow-lg">
        <AvatarImage src={avatarUrl || undefined} alt="Contact Avatar" />
        <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-700 text-5xl font-bold flex items-center justify-center">
          <Camera size={48} />
        </AvatarFallback>
      </Avatar>
      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="avatar-upload-input"
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        >
          {isUploading && <LoadingSpinner size={16} className="me-2" />}
          {isUploading ? "در حال آپلود..." : "آپلود تصویر"}
        </Button>
        {avatarUrl && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemoveAvatar}
            disabled={disabled || isUploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-300"
          >
            {isUploading && <LoadingSpinner size={16} className="me-2" />}
            <XCircle size={16} />
            حذف تصویر
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContactAvatarUpload;