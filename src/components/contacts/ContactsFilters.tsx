import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/modern-tooltip';
import { GlassButton } from '@/components/ui/glass-button';
import { Grid, List } from 'lucide-react';
import { designTokens } from '@/lib/design-tokens';
import type { ContactsFiltersProps } from '@/types/contact-page.types';

export const ContactsFilters: React.FC<ContactsFiltersProps> = ({
  selectedGroup,
  companyFilter,
  sortOption,
  displayMode,
  groups,
  isMobile,
  onGroupChange,
  onCompanyChange,
  onSortChange,
  onDisplayModeChange,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-stretch ${isMobile ? '' : 'lg:items-center'} gap-4 ${isMobile ? '' : 'lg:justify-between'} ${className || ''}`}>
      <div className={`flex ${isMobile ? 'flex-row items-center justify-between' : 'flex-row'} items-stretch ${isMobile ? '' : 'sm:items-center'} gap-4`}>
        {/* Group Filter */}
        <ModernTooltip>
          <ModernTooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <ModernSelect onValueChange={onGroupChange} value={selectedGroup || 'all'}>
                <ModernSelectTrigger
                  className="w-full sm:w-48 rounded-xl focus:ring-4 focus:ring-blue-500/30 text-gray-800 dark:text-gray-100 rtl:text-right ltr:text-left"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: `2px solid ${designTokens.colors.glass.border}`,
                    backdropFilter: 'blur(10px)',
                    fontSize: designTokens.typography.sizes.sm,
                    boxShadow: designTokens.shadows.glass
                  }}
                >
                  <ModernSelectValue placeholder={t('groups.all_groups')} />
                </ModernSelectTrigger>
                <ModernSelectContent
                  className="rtl:text-right ltr:text-left"
                  style={{
                    background: designTokens.colors.glass.background,
                    border: `1px solid ${designTokens.colors.glass.border}`,
                    backdropFilter: 'blur(15px)'
                  }}
                >
                  <ModernSelectItem value="all">{t('groups.all_groups')}</ModernSelectItem>
                  <ModernSelectItem value="ungrouped">{t('groups.ungrouped')}</ModernSelectItem>
                  {groups.map((group) => (
                    <ModernSelectItem key={group.id} value={group.id}>
                      {group.name}
                    </ModernSelectItem>
                  ))}
                </ModernSelectContent>
              </ModernSelect>
            </div>
          </ModernTooltipTrigger>
          <ModernTooltipContent>
            <p>{t('contact_form.group')}</p>
          </ModernTooltipContent>
        </ModernTooltip>

        {/* Company Filter */}
        <ModernTooltip>
          <ModernTooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <ModernInput
                type="text"
                placeholder={t('contact_form.company')}
                className="w-full sm:w-48 rounded-xl focus:ring-4 focus:ring-blue-500/30 text-gray-800 dark:text-gray-100 rtl:text-right ltr:text-left"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: `2px solid ${designTokens.colors.glass.border}`,
                  backdropFilter: 'blur(10px)',
                  fontSize: designTokens.typography.sizes.sm,
                  boxShadow: designTokens.shadows.glass
                }}
                value={companyFilter}
                onChange={(e) => onCompanyChange(e.target.value)}
              />
            </div>
          </ModernTooltipTrigger>
          <ModernTooltipContent>
            <p>{t('contact_form.company')}</p>
          </ModernTooltipContent>
        </ModernTooltip>
      </div>

      {/* Sort and Display Controls Row */}
      <div className={`flex ${isMobile ? 'flex-row items-center justify-center' : 'flex-row items-center justify-end'} gap-3`}>
        {/* Sort Filter */}
        <ModernTooltip>
          <ModernTooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <ModernSelect onValueChange={onSortChange} value={sortOption}>
                <ModernSelectTrigger
                  className={`${isMobile ? 'w-32' : 'w-full sm:w-48'} rounded-xl focus:ring-4 focus:ring-blue-500/30 text-gray-800 dark:text-gray-100 rtl:text-right ltr:text-left`}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: `2px solid ${designTokens.colors.glass.border}`,
                    backdropFilter: 'blur(10px)',
                    fontSize: designTokens.typography.sizes.sm,
                    boxShadow: designTokens.shadows.glass
                  }}
                >
                  <ModernSelectValue placeholder={t('sorting.sort_by')} />
                </ModernSelectTrigger>
                <ModernSelectContent
                  className="rtl:text-right ltr:text-left"
                  style={{
                    background: designTokens.colors.glass.background,
                    border: `1px solid ${designTokens.colors.glass.border}`,
                    backdropFilter: 'blur(15px)'
                  }}
                >
                  <ModernSelectItem value="first_name_asc">{t('sorting.first_name_asc')}</ModernSelectItem>
                  <ModernSelectItem value="first_name_desc">{t('sorting.first_name_desc')}</ModernSelectItem>
                  <ModernSelectItem value="last_name_asc">{t('sorting.last_name_asc')}</ModernSelectItem>
                  <ModernSelectItem value="last_name_desc">{t('sorting.last_name_desc')}</ModernSelectItem>
                  <ModernSelectItem value="created_at_desc">{t('sorting.created_at_desc')}</ModernSelectItem>
                  <ModernSelectItem value="created_at_asc">{t('sorting.created_at_asc')}</ModernSelectItem>
                </ModernSelectContent>
              </ModernSelect>
            </div>
          </ModernTooltipTrigger>
          <ModernTooltipContent>
            <p>{t('actions.sort')}</p>
          </ModernTooltipContent>
        </ModernTooltip>

        {/* Display Mode Toggle */}
        <div className={`flex items-center ${isMobile ? 'justify-center' : 'justify-end'} gap-2`}>
          <div
            className="flex rounded-xl overflow-hidden border-2"
            style={{
              borderColor: designTokens.colors.glass.border,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              boxShadow: designTokens.shadows.glass
            }}
          >
            <ModernTooltip>
              <ModernTooltipTrigger asChild>
                <GlassButton
                  variant={displayMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center justify-center p-3"
                  style={{
                    background: displayMode === 'grid' ? designTokens.colors.primary[500] : 'transparent',
                    color: displayMode === 'grid' ? 'white' : 'gray',
                    borderRadius: 0,
                    transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                  }}
                  onClick={() => onDisplayModeChange('grid')}
                >
                  <Grid size={18} />
                </GlassButton>
              </ModernTooltipTrigger>
              <ModernTooltipContent>
                <p>{t('common.display_modes.grid')}</p>
              </ModernTooltipContent>
            </ModernTooltip>

            <ModernTooltip>
              <ModernTooltipTrigger asChild>
                <GlassButton
                  variant={displayMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center justify-center p-3"
                  style={{
                    background: displayMode === 'list' ? designTokens.colors.primary[500] : 'transparent',
                    color: displayMode === 'list' ? 'white' : designTokens.colors.gray[600],
                    borderRadius: 0,
                    transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                  }}
                  onClick={() => onDisplayModeChange('list')}
                >
                  <List size={18} />
                </GlassButton>
              </ModernTooltipTrigger>
              <ModernTooltipContent>
                <p>{t('common.display_modes.list')}</p>
              </ModernTooltipContent>
            </ModernTooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

ContactsFilters.displayName = 'ContactsFilters';
