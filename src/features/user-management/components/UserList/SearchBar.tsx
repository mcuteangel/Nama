import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from '@/components/ui/glass-button';
import { useTranslation } from 'react-i18next';
import { UserListFilters } from '@/features/user-management/types/user.types';

interface SearchBarProps {
  filters: UserListFilters;
  onFiltersChange: (filters: UserListFilters) => void;
  totalUsers: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ filters, onFiltersChange, totalUsers }) => {
  const { t } = useTranslation();

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search, page: 1 });
  };

  const handleRoleChange = (role: 'user' | 'admin' | 'all') => {
    onFiltersChange({ ...filters, role, page: 1 });
  };

  const handleSortChange = (sortBy: 'email' | 'first_name' | 'last_name' | 'created_at') => {
    onFiltersChange({ ...filters, sortBy, page: 1 });
  };

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onFiltersChange({ ...filters, sortOrder, page: 1 });
  };

  const clearFilters = () => {
    onFiltersChange({ page: 1, limit: 10 });
  };

  const hasActiveFilters = filters.search || filters.role !== 'all' || filters.sortBy;

  return (
    <div className="space-y-4">
      {/* جستجو و فیلترها */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <ModernInput
            placeholder={t('user_management.search_users')}
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <ModernSelect
            value={filters.role || 'all'}
            onValueChange={handleRoleChange}
          >
            <ModernSelectTrigger className="w-32">
              <Filter size={16} className="me-2" />
              <ModernSelectValue />
            </ModernSelectTrigger>
            <ModernSelectContent>
              <ModernSelectItem value="all">{t('user_management.all_users')}</ModernSelectItem>
              <ModernSelectItem value="admin">{t('user_management.role_admin')}</ModernSelectItem>
              <ModernSelectItem value="user">{t('user_management.role_user')}</ModernSelectItem>
            </ModernSelectContent>
          </ModernSelect>

          <ModernSelect
            value={filters.sortBy || 'created_at'}
            onValueChange={handleSortChange}
          >
            <ModernSelectTrigger className="w-40">
              <ModernSelectValue />
            </ModernSelectTrigger>
            <ModernSelectContent>
              <ModernSelectItem value="created_at">{t('user_management.sort_by_date')}</ModernSelectItem>
              <ModernSelectItem value="email">{t('user_management.sort_by_email')}</ModernSelectItem>
              <ModernSelectItem value="first_name">{t('user_management.sort_by_name')}</ModernSelectItem>
              <ModernSelectItem value="last_name">{t('user_management.sort_by_last_name')}</ModernSelectItem>
            </ModernSelectContent>
          </ModernSelect>

          <ModernSelect
            value={filters.sortOrder || 'desc'}
            onValueChange={handleSortOrderChange}
          >
            <ModernSelectTrigger className="w-24">
              <ModernSelectValue />
            </ModernSelectTrigger>
            <ModernSelectContent>
              <ModernSelectItem value="asc">↑</ModernSelectItem>
              <ModernSelectItem value="desc">↓</ModernSelectItem>
            </ModernSelectContent>
          </ModernSelect>

          {hasActiveFilters && (
            <GlassButton
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </GlassButton>
          )}
        </div>
      </div>

      {/* اطلاعات نتایج */}
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <span>
          {t('user_management.showing_users', { count: totalUsers })}
        </span>
        {hasActiveFilters && (
          <span className="text-blue-600 dark:text-blue-400">
            {t('user_management.filters_applied')}
          </span>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
