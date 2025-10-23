import React from 'react';
import { designTokens } from '@/lib/design-tokens';
import type { ContactsStatsProps } from '@/types/contact-page.types';

export const ContactsStats: React.FC<ContactsStatsProps> = ({
  totalItems,
  className,
}) => {
  return (
    <div
      className={`px-8 py-4 ${className || ''}`}
      style={{
        background: 'rgba(255,255,255,0.05)',
        borderTop: `1px solid ${designTokens.colors.glass.border}`,
        backdropFilter: 'blur(15px)'
      }}
    >
      <div className="flex items-center justify-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {totalItems > 0
            ? `تعداد کل مخاطبین: ${totalItems}`
            : 'هیچ مخاطبی یافت نشد'
          }
        </span>
      </div>
    </div>
  );
};

ContactsStats.displayName = 'ContactsStats';
