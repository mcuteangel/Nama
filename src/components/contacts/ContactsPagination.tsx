import React from 'react';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from '@/components/ui/glass-button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { designTokens } from '@/lib/design-tokens';
import type { ContactsPaginationProps } from '@/types/contact-page.types';

export const ContactsPagination: React.FC<ContactsPaginationProps> = ({
  currentPage,
  itemsPerPage,
  totalItems,
  isMobile,
  onPageChange,
  onItemsPerPageChange,
  className,
}) => {
  if (totalItems === 0) return null;

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center ${isMobile ? 'gap-4' : 'justify-center'} gap-4 ${className || ''}`}>
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <ModernSelect
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            onItemsPerPageChange(Number(value));
            onPageChange(1); // Reset to first page
          }}
        >
          <ModernSelectTrigger className="w-20 h-8 text-xs rtl:text-left ltr:text-right">
            <ModernSelectValue />
          </ModernSelectTrigger>
          <ModernSelectContent className="rtl:text-left ltr:text-right rtl:right-0 ltr:left-0 w-20" position="popper">
            <ModernSelectItem value="10">۱۰</ModernSelectItem>
            <ModernSelectItem value="20">۲۰</ModernSelectItem>
            <ModernSelectItem value="50">۵۰</ModernSelectItem>
            <ModernSelectItem value="100">۱۰۰</ModernSelectItem>
          </ModernSelectContent>
        </ModernSelect>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          در صفحه
        </span>
      </div>

      {/* Modern Pagination with page numbers */}
      <div className="flex items-center gap-1">
        {/* Next button - اول در RTL */}
        <GlassButton
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0 rounded-md"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: `1px solid ${designTokens.colors.glass.border}`,
          }}
        >
          <ChevronRight size={14} />
        </GlassButton>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber = Math.max(1, currentPage - 2) + i;
            if (pageNumber > totalPages) return null;

            return (
              <GlassButton
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`h-8 w-8 p-0 rounded-md text-xs ${
                  pageNumber === currentPage
                    ? 'bg-blue-500 text-white'
                    : 'bg-transparent text-gray-600 dark:text-gray-400'
                }`}
                style={{
                  background: pageNumber === currentPage ? designTokens.colors.primary[500] : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${designTokens.colors.glass.border}`,
                }}
              >
                {pageNumber}
              </GlassButton>
            );
          })}
        </div>

        {/* Previous button - دوم در RTL */}
        <GlassButton
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0 rounded-md"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: `1px solid ${designTokens.colors.glass.border}`,
          }}
        >
          <ChevronLeft size={14} />
        </GlassButton>
      </div>

      {/* Page info */}
      <div className="text-xs text-gray-600 dark:text-gray-400">
        صفحه {currentPage} از {Math.max(1, totalPages)}
      </div>
    </div>
  );
};

ContactsPagination.displayName = 'ContactsPagination';
