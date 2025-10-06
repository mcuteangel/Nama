import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { useTranslation } from 'react-i18next';
import { UserListFilters } from '@/features/user-management/types/user.types';

interface PaginationProps {
  filters: UserListFilters;
  totalPages: number;
  onFiltersChange: (filters: UserListFilters) => void;
}

const Pagination: React.FC<PaginationProps> = ({ filters, totalPages, onFiltersChange }) => {
  const { t } = useTranslation();
  const currentPage = filters.page || 1;

  const handlePageChange = (page: number) => {
    onFiltersChange({ ...filters, page });
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // همیشه صفحه اول و آخر را نشان بده
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {t('user_management.page_info', { current: currentPage, total: totalPages })}
      </div>

      <div className="flex items-center gap-1">
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-2"
        >
          <ChevronsLeft size={16} />
        </GlassButton>

        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2"
        >
          <ChevronLeft size={16} />
        </GlassButton>

        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <GlassButton
                variant={currentPage === page ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handlePageChange(page as number)}
                className={`px-3 py-2 min-w-[40px] ${
                  currentPage === page
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {page}
              </GlassButton>
            )}
          </React.Fragment>
        ))}

        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2"
        >
          <ChevronRight size={16} />
        </GlassButton>

        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2"
        >
          <ChevronsRight size={16} />
        </GlassButton>
      </div>
    </div>
  );
};

export default Pagination;
