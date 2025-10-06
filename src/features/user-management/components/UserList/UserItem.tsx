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

interface UserItemProps {
  user: UserProfile;
  onUserUpdated: () => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onUserUpdated }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { t } = useTranslation();
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
    <ModernCard variant="glass" className="flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover-lift">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white dark:bg-blue-700">
          <UserIcon size={20} />
        </div>
        <div>
          <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">
            {user.first_name || user.email} {user.last_name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {user.email}
          </p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {user.role === 'admin' ? t('user_management.role_admin') : t('user_management.role_user')}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <GlassButton variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200">
              <Edit size={20} />
            </GlassButton>
          </DialogTrigger>
          <FormDialogWrapper
            title={t('user_management.edit_user_title', 'Edit User')}
            description={t('user_management.edit_user_description', 'Form for editing user information')}
          >
            <UserForm
              initialData={user}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                onUserUpdated();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </FormDialogWrapper>
        </Dialog>

        <GlassButton
          variant="ghost"
          size="icon"
          className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200"
          onClick={handleDelete}
          disabled={deleteUser.isPending}
        >
          <Trash2 size={20} />
        </GlassButton>
      </div>
    </ModernCard>
  );
};

export default UserItem;
