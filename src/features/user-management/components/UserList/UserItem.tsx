import React, { useState } from 'react';
import { Edit, Trash2, User as UserIcon } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import FormDialogWrapper from '@/components/common/FormDialogWrapper';
import { GlassButton } from '@/components/ui/glass-button';
import { ModernCard } from '@/components/ui/modern-card';
import { useDeleteUser } from '@/features/user-management/hooks/useUsers';
import { UserProfile } from '@/features/user-management/types/user.types';
import { ErrorManager } from '@/lib/error-manager';
import { UserForm } from '@/features/user-management/components';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';

interface UserItemProps {
  user: UserProfile;
  onUserUpdated: () => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onUserUpdated }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { t } = useTranslation();
  const { formatDate } = useJalaliCalendar();
  const deleteUser = useDeleteUser();

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(user.id);
      ErrorManager.notifyUser(t('user_management.user_deleted_success'), 'success');
      onUserUpdated();
    } catch (error) {
      ErrorManager.logError(error, { component: 'UserItem', action: 'deleteUser', userId: user.id });
    }
  };

  return (
    <ModernCard 
      variant="glass-3d" 
      hover="glass-3d"
      className="flex items-center justify-between p-6 rounded-2xl transition-all duration-500 backdrop-blur-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        transform: 'translateY(0) scale(1)',
        transition: 'all 0.3s ease-in-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
        e.currentTarget.style.boxShadow = '0 15px 35px 0 rgba(31, 38, 135, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.15)';
      }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg backdrop-blur-sm border border-white/20">
            <UserIcon size={24} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-500 flex items-center justify-center shadow-md">
            {user.role === 'admin' ? (
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">A</span>
            ) : (
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">U</span>
            )}
          </div>
        </div>
        <div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {user.first_name || user.email} {user.last_name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700' 
                  : user.role === 'moderator'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
              }`}>
                {user.role === 'admin' 
                  ? t('user_management.role_admin') 
                  : user.role === 'moderator'
                  ? t('user_management.role_moderator')
                  : t('user_management.role_user')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400" title={new Date(user.created_at).toLocaleString()}>
                {formatDate(new Date(user.created_at))}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <GlassButton
              variant="ghost"
              size="icon"
              className="opacity-100 transition-all duration-300 hover:scale-110 rounded-2xl text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">{t('common.edit')}</span>
            </GlassButton>
          </DialogTrigger>
          <FormDialogWrapper
            title={t('user_management.edit_user')}
            description={t('user_management.edit_user_description')}
          >
            <UserForm
              initialData={user}
              onSuccess={() => {
                onUserUpdated();
                setIsEditDialogOpen(false);
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </FormDialogWrapper>
        </Dialog>
        <GlassButton
          variant="ghost"
          size="icon"
          className="opacity-100 transition-all duration-300 hover:scale-110 rounded-2xl text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          disabled={deleteUser.isPending}
        >
          {deleteUser.isPending ? (
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="sr-only">{t('common.delete')}</span>
        </GlassButton>
      </div>
    </ModernCard>
  );
};
export default UserItem;
