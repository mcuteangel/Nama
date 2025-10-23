import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlassButton } from '@/components/ui/glass-button';
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/modern-tooltip';
import { Square, Trash2, Users } from 'lucide-react';
import { designTokens } from '@/lib/design-tokens';
import type { ContactsMultiSelectActionsProps } from '@/types/contact-page.types';

export const ContactsMultiSelectActions: React.FC<ContactsMultiSelectActionsProps> = ({
  selectedContactsCount,
  onDeselectAll,
  onBulkDelete,
  onBulkGroup,
  className,
}) => {
  const { t } = useTranslation();

  if (selectedContactsCount === 0) return null;

  return (
    <div className={`flex items-center justify-between gap-4 ${className || ''}`}>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium" style={{ color: designTokens.colors.gray[700] }}>
          {t('groups.selected_contacts_count', { count: selectedContactsCount })}
        </span>
        <ModernTooltip>
          <ModernTooltipTrigger asChild>
            <GlassButton
              onClick={onDeselectAll}
              className="flex items-center gap-2 px-3 py-1 rounded-lg font-semibold text-sm"
              style={{
                background: 'rgba(156, 163, 175, 0.15)',
                border: `2px solid ${designTokens.colors.gray[300]}`,
                backdropFilter: 'blur(10px)',
                fontFamily: designTokens.typography.fonts.primary,
                transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
              }}
            >
              <Square size={16} />
              <span className="hidden sm:inline">{t('groups.deselect_all')}</span>
            </GlassButton>
          </ModernTooltipTrigger>
          <ModernTooltipContent>
            <p>{t('groups.deselect_all_contacts')}</p>
          </ModernTooltipContent>
        </ModernTooltip>
      </div>
      <div className="flex items-center gap-3">
        <ModernTooltip>
          <ModernTooltipTrigger asChild>
            <GlassButton
              onClick={onBulkDelete}
              disabled={selectedContactsCount === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: `2px solid ${designTokens.colors.error[300]}`,
                backdropFilter: 'blur(10px)',
                fontFamily: designTokens.typography.fonts.primary,
                transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
              }}
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">{t('groups.delete_selected')}</span>
            </GlassButton>
          </ModernTooltipTrigger>
          <ModernTooltipContent>
            <p>{t('groups.delete_selected_contacts')}</p>
          </ModernTooltipContent>
        </ModernTooltip>

        <ModernTooltip>
          <ModernTooltipTrigger asChild>
            <GlassButton
              onClick={onBulkGroup}
              disabled={selectedContactsCount === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold"
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: `2px solid ${designTokens.colors.success[300]}`,
                backdropFilter: 'blur(10px)',
                fontFamily: designTokens.typography.fonts.primary,
                transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
              }}
            >
              <Users size={16} />
              <span className="hidden sm:inline">{t('groups.add_to_group')}</span>
            </GlassButton>
          </ModernTooltipTrigger>
          <ModernTooltipContent>
            <p>{t('groups.add_to_group')}</p>
          </ModernTooltipContent>
        </ModernTooltip>
      </div>
    </div>
  );
};

ContactsMultiSelectActions.displayName = 'ContactsMultiSelectActions';
