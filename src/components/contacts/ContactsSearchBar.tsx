import React from 'react';
import { useTranslation } from 'react-i18next';
import { GradientButton, GlassButton } from '@/components/ui/glass-button';
import { ModernLoader } from '@/components/ui/modern-loader';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/modern-tooltip';
import { PlusCircle, Search, Download, CheckSquare, Square } from 'lucide-react';
import { designTokens } from '@/lib/design-tokens';
import type { ContactsSearchBarProps } from '@/types/contact-page.types';

export const ContactsSearchBar: React.FC<ContactsSearchBarProps> = ({
  searchTerm,
  multiSelectMode,
  selectedContactsCount,
  isExporting,
  session,
  onSearchChange,
  onToggleMultiSelect,
  onDeselectAll,
  onAddContact,
  onExport,
  onBulkDelete,
  onBulkGroup,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center justify-between gap-6 ${className || ''}`}>
      <div className="flex items-center gap-4 flex-grow">
        {/* Search Input */}
        <div className="relative flex-grow max-w-md">
          <ModernInput
            type="text"
            placeholder={t('pages.contacts.search_placeholder')}
            className="w-full pl-12 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-500/30"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: `2px solid ${designTokens.colors.glass.border}`,
              backdropFilter: 'blur(10px)',
              fontSize: designTokens.typography.sizes.base,
              fontFamily: designTokens.typography.fonts.primary,
              boxShadow: designTokens.shadows.glass,
              transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
            }}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2"
            size={18}
            style={{ color: designTokens.colors.gray[500] }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <ModernTooltip>
            <ModernTooltipTrigger asChild>
              <GlassButton
                onClick={onToggleMultiSelect}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                style={{
                  background: multiSelectMode ? designTokens.colors.primary[500] : designTokens.colors.glass.background,
                  border: `2px solid ${multiSelectMode ? designTokens.colors.primary[500] : designTokens.colors.glass.border}`,
                  backdropFilter: 'blur(10px)',
                  boxShadow: designTokens.shadows.glass,
                  fontFamily: designTokens.typography.fonts.primary,
                  transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                }}
              >
                {multiSelectMode ? <CheckSquare size={20} /> : <Square size={20} />}
                <span className="hidden sm:inline">{multiSelectMode ? t('actions.exit_multi_select') : t('actions.multi_select')}</span>
              </GlassButton>
            </ModernTooltipTrigger>
            <ModernTooltipContent>
              <p>{multiSelectMode ? t('actions.exit_multi_select') : t('actions.multi_select')}</p>
            </ModernTooltipContent>
          </ModernTooltip>

          <ModernTooltip>
            <ModernTooltipTrigger asChild>
              <GradientButton
                gradientType="primary"
                onClick={onAddContact}
                className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl"
                style={{
                  background: designTokens.gradients.primary,
                  boxShadow: designTokens.shadows.primary,
                  fontFamily: designTokens.typography.fonts.primary,
                  transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                }}
              >
                <PlusCircle size={20} />
                <span className="hidden sm:inline">{t('actions.add_contact')}</span>
              </GradientButton>
            </ModernTooltipTrigger>
            <ModernTooltipContent>
              <p>{t('actions.add_contact')}</p>
            </ModernTooltipContent>
          </ModernTooltip>

          <ModernTooltip>
            <ModernTooltipTrigger asChild>
              <GlassButton
                onClick={onExport}
                disabled={isExporting || !session?.user}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                style={{
                  background: designTokens.colors.glass.background,
                  border: `2px solid ${designTokens.colors.glass.border}`,
                  backdropFilter: 'blur(10px)',
                  boxShadow: designTokens.shadows.glass,
                  fontFamily: designTokens.typography.fonts.primary,
                  transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                }}
              >
                {isExporting ? (
                  <ModernLoader variant="spinner" size="sm" />
                ) : (
                  <Download size={20} />
                )}
                <span className="hidden sm:inline">{t('actions.export')}</span>
              </GlassButton>
            </ModernTooltipTrigger>
            <ModernTooltipContent>
              <p>{t('actions.export')}</p>
            </ModernTooltipContent>
          </ModernTooltip>
        </div>
      </div>
    </div>
  );
};

ContactsSearchBar.displayName = 'ContactsSearchBar';
