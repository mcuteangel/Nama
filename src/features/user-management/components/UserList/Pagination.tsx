import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

// کامپوننت دکمه صفحه
const PageButton: React.FC<{
  page: number | string;
  isActive: boolean;
  onClick: () => void;
}> = ({ page, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-primary-600 text-white' 
        : 'text-gray-300 hover:bg-white/10'
    }`}
  >
    {page}
  </button>
);

const Pagination: React.FC<PaginationProps> = ({ 
  totalPages, 
  currentPage, 
  totalItems, 
  onPageChange,
  className = ''
}) => {
  const { t } = useTranslation();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  // تابع برای رندر دکمه‌های صفحه‌بندی
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // اضافه کردن دکمه صفحه اول
    if (startPage > 1) {
      pages.push(
        <React.Fragment key="first">
          <PageButton page={1} isActive={currentPage === 1} onClick={() => handlePageChange(1)} />
          {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
        </React.Fragment>
      );
    }

    // اضافه کردن صفحات میانی
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PageButton 
          key={i}
          page={i}
          isActive={i === currentPage}
          onClick={() => handlePageChange(i)}
        />
      );
    }

    // اضافه کردن دکمه صفحه آخر
    if (endPage < totalPages) {
      pages.push(
        <React.Fragment key="last">
          {endPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
          <PageButton 
            page={totalPages} 
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          />
        </React.Fragment>
      );
    }

    return pages;
  };

  if (totalPages <= 1 || totalItems === 0) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 ${className}`}>
      <div className="w-full sm:w-auto text-center sm:text-left">
        <p className="text-sm text-gray-300">
          {t('common.showing_page', {
            current: Math.min((currentPage - 1) * 10 + 1, totalItems),
            last: Math.min(currentPage * 10, totalItems),
            total: totalItems,
          })}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <GlassButton
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            variant="ghost"
            size="sm"
            className="px-2 py-1"
            title={t('common.first_page') || 'First page'}
          >
            <ChevronsLeft size={16} />
          </GlassButton>
          <GlassButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="ghost"
            size="sm"
            className="px-2 py-1"
            title={t('common.previous') || 'Previous'}
          >
            <ChevronLeft size={16} />
          </GlassButton>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        <div className="flex gap-1">
          <GlassButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="ghost"
            size="sm"
            className="px-2 py-1"
            title={t('common.next') || 'Next'}
          >
            <ChevronRight size={16} />
          </GlassButton>
          <GlassButton
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            variant="ghost"
            size="sm"
            className="px-2 py-1"
            title={t('common.last_page') || 'Last page'}
          >
            <ChevronsRight size={16} />
          </GlassButton>
        </div>
      </div>
      
      <div className="sm:hidden text-sm text-gray-400">
        {currentPage} / {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
