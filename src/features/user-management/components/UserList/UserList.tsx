import React, { useState } from 'react';
import { PlusCircle, Users } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/integrations/supabase/auth';
import FormDialogWrapper from '@/components/common/FormDialogWrapper';
import { GlassButton } from '@/components/ui/glass-button';
import { ModernCard } from '@/components/ui/modern-card';
import { useUsers } from '@/features/user-management/hooks/useUsers';
import { ErrorManager } from '@/lib/error-manager';
import EmptyState from '@/components/common/EmptyState';
import UserItem from './UserItem';
import { UserForm } from '@/features/user-management/components';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import { UserListFilters } from '@/features/user-management/types/user.types';

const UserList: React.FC = () => {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [filters, setFilters] = useState<UserListFilters>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
    role: 'all'
  });

  const { t } = useTranslation();
  const { session } = useSession();
  const { data: users, isLoading, error, refetch } = useUsers(filters);

  // اگر کاربر ادمین نیست، دسترسی ندارد
  if (session?.user?.user_metadata.role !== 'admin') {
    return (
      <ModernCard variant="glass" className="text-center text-red-500 dark:text-red-400 p-4">
        <p>{t('user_management.admin_access_required')}</p>
      </ModernCard>
    );
  }

  if (isLoading) {
    return (
      <ModernCard variant="glass" className="text-center p-4">
        <p className="text-gray-600 dark:text-gray-300">{t('user_management.loading_users')}</p>
      </ModernCard>
    );
  }

  if (error) {
    ErrorManager.logError(error, { component: 'UserList', action: 'fetchUsers' });
    return (
      <ModernCard variant="glass" className="text-center text-red-500 dark:text-red-400 p-4">
        <p>{t('user_management.error_loading_users')}</p>
      </ModernCard>
    );
  }

  const totalUsers = users?.length || 0;

  return (
    <div className="space-y-6">
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogTrigger asChild>
          <GlassButton
            variant="gradient-primary"
            className="w-full px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <PlusCircle size={20} className="me-2" />
              {t('user_management.add_new_user')}
            </span>
          </GlassButton>
        </DialogTrigger>
        <FormDialogWrapper
          title={t('user_management.add_user_title', 'Add User')}
          description={t('user_management.add_user_description', 'Form for adding a new user')}
        >
          <UserForm
            onSuccess={() => {
              setIsAddUserDialogOpen(false);
              refetch();
            }}
            onCancel={() => setIsAddUserDialogOpen(false)}
          />
        </FormDialogWrapper>
      </Dialog>

      <SearchBar
        filters={filters}
        onFiltersChange={setFilters}
        totalUsers={totalUsers}
      />

      {users && users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('user_management.no_users_found')}
          description={t('user_management.no_users_found_description')}
        />
      ) : (
        <>
          <div className="space-y-4">
            {users?.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                onUserUpdated={refetch}
              />
            ))}
          </div>

          <Pagination
            filters={filters}
            totalPages={Math.ceil(totalUsers / (filters.limit || 10))}
            onFiltersChange={setFilters}
          />
        </>
      )}
    </div>
  );
};

export default UserList;
