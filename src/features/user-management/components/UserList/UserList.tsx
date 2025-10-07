import React, { useState, useMemo } from 'react';
import { PlusCircle, Users } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/integrations/supabase/auth';
import FormDialogWrapper from '@/components/common/FormDialogWrapper';
import { ModernCard } from '@/components/ui/modern-card';
import { useUsers } from '@/features/user-management/hooks/useUsers';
import { ErrorManager } from '@/lib/error-manager';
import EmptyState from '@/components/common/EmptyState';
import UserItem from './UserItem';
import { UserForm } from '@/features/user-management/components';
import { ModernInput } from '@/components/ui/modern-input';
import {
  ModernSelect,
  ModernSelectContent,
  ModernSelectItem,
  ModernSelectTrigger,
  ModernSelectValue,
} from '@/components/ui/modern-select';
import Pagination from './Pagination';
import { UserListFilters } from '@/features/user-management/types/user.types';

type SortField = 'email' | 'created_at' | 'first_name' | 'last_name';
type SortOrder = 'asc' | 'desc';

interface UserListState {
  page: number;
  limit: number;
  sortBy: SortField;
  sortOrder: SortOrder;
  role?: 'user' | 'admin' | 'all';
  search?: string;
}

const UserList: React.FC = () => {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [filters, setFilters] = useState<UserListState>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
    role: 'all'
  });

  const { t } = useTranslation();
  const { session } = useSession();
  const { data: users = [], isLoading, error, refetch } = useUsers(filters);
  
  // محاسبه اطلاعات صفحه‌بندی
  const totalUsers = users.length;
  const itemsPerPage = filters.limit || 10;
  const totalPages = Math.max(1, Math.ceil(totalUsers / itemsPerPage));
  const currentPage = Math.min(Math.max(1, filters.page || 1), totalPages);
  
  // مرتب‌سازی کاربران بر اساس فیلترها
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'email':
          comparison = (a.email || '').localeCompare(b.email || '');
          break;
        case 'first_name':
          comparison = (a.first_name || '').localeCompare(b.first_name || '');
          break;
        case 'last_name':
          comparison = (a.last_name || '').localeCompare(b.last_name || '');
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [users, filters.sortBy, filters.sortOrder]);
  
  // فیلتر کردن کاربران بر اساس نقش
  const filteredUsers = useMemo(() => {
    if (filters.role === 'all') return sortedUsers;
    return sortedUsers.filter(user => user.role === filters.role);
  }, [sortedUsers, filters.role]);
  
  // کاربران صفحه جاری
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // اگر کاربر ادمین نیست، دسترسی ندارد
  if (session?.user?.user_metadata.role !== 'admin') {
    return (
      <ModernCard variant="glass" className="text-center text-red-500 dark:text-red-400 p-4">
        <p>{t('user_management.admin_access_required')}</p>
      </ModernCard>
    );
  }

  if (isLoading && !users.length) {
    return (
      <ModernCard variant="glass" className="text-center p-4">
        <p className="text-gray-600 dark:text-gray-300">{t('user_management.loading_users')}</p>
      </ModernCard>
    );
  }

  if (error && !users.length) {
    ErrorManager.logError(error, { component: 'UserList', action: 'fetchUsers' });
    return (
      <ModernCard variant="glass" className="text-center text-red-500 dark:text-red-400 p-4">
        <p>{t('user_management.error_loading_users')}</p>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-auto">
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="group relative w-full md:w-auto px-6 py-3 rounded-xl font-semibold overflow-hidden transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl"
                style={{
                  background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3), 0 8px 30px rgba(79, 70, 229, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                  style={{
                    maskImage: 'radial-gradient(circle at 50% 50%, black, transparent)'
                  }}
                />
                <span className="relative flex items-center justify-center gap-2 text-white">
                  <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{t('user_management.add_new_user')}</span>
                </span>
              </button>
            </DialogTrigger>
        <FormDialogWrapper
          title={t('user_management.add_user_title')}
          description={t('user_management.add_user_description')}
        >
          <UserForm
            onSuccess={() => {
              refetch();
            }}
            onCancel={() => setIsAddUserDialogOpen(false)}
          />
            </FormDialogWrapper>
          </Dialog>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('user_management.no_users_found')}
            description={t('user_management.no_users_found_description')}
          />
        ) : (
          <>
            <div className="mb-6 p-5 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
              <ModernInput
                type="text"
                placeholder={t('common.search')}
                variant="glass"
                className="w-full"
                value={filters.search || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const search = e.target.value;
                  setFilters(prev => ({ ...prev, search, page: 1 }));
                }}
              />
              <ModernSelect
                value={filters.role || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, role: value as UserListFilters['role'], page: 1 }))}
              >
                <ModernSelectTrigger variant="glass" className="w-[180px]">
                  <ModernSelectValue placeholder={t('user_management.select_role_placeholder')} />
                </ModernSelectTrigger>
                <ModernSelectContent>
                  <ModernSelectItem value="all">
                    {t('user_management.all_roles')}
                  </ModernSelectItem>
                  <ModernSelectItem value="admin">
                    {t('user_management.roles.admin')}
                  </ModernSelectItem>
                  <ModernSelectItem value="user">
                    {t('user_management.roles.user')}
                  </ModernSelectItem>
                </ModernSelectContent>
              </ModernSelect>
              <ModernSelect
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('_') as [SortField, SortOrder];
                  setFilters(prev => ({
                    ...prev,
                    sortBy,
                    sortOrder,
                    page: 1 // Reset to first page when changing sort
                  }));
                }}
              >
                <ModernSelectTrigger variant="glass" className="w-[200px]">
                  <ModernSelectValue placeholder={t('user_management.sort_placeholder')} />
                </ModernSelectTrigger>
                <ModernSelectContent>
                  <ModernSelectItem value="created_at_desc">
                    {t('user_management.sort.newest')}
                  </ModernSelectItem>
                  <ModernSelectItem value="created_at_asc">
                    {t('user_management.sort.oldest')}
                  </ModernSelectItem>
                  <ModernSelectItem value="first_name_asc">
                    {t('user_management.sort.name_asc')}
                  </ModernSelectItem>
                  <ModernSelectItem value="first_name_desc">
                    {t('user_management.sort.name_desc')}
                  </ModernSelectItem>
                  <ModernSelectItem value="email_asc">
                    {t('user_management.sort.email_asc')}
                  </ModernSelectItem>
                  <ModernSelectItem value="email_desc">
                    {t('user_management.sort.email_desc')}
                  </ModernSelectItem>
                </ModernSelectContent>
              </ModernSelect>
            </div>
            </div>

            <div className="space-y-4 p-1">
            {paginatedUsers.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                onUserUpdated={refetch}
              />
            ))}
            </div>

            <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={(page: number) => setFilters(prev => ({
              ...prev,
              page: Math.max(1, Math.min(page, totalPages))
            }))}
            totalItems={filteredUsers.length}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;
