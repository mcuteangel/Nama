import { GradientButton, GlassButton } from "@/components/ui/glass-button";
import { ModernLoader } from "@/components/ui/modern-loader";
import { useToast } from "@/components/ui/use-toast";
import { ModernInput } from "@/components/ui/modern-input";
import { PlusCircle, Search, Download, Grid, List } from "lucide-react";
import ContactList from "@/components/ContactList";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDebounce } from '@/hooks/use-performance';
import SuspenseWrapper from '@/components/common/SuspenseWrapper';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from "@/components/ui/modern-tooltip";
import { useGroups } from "@/hooks/use-groups";
import { exportContactsToCsv } from "@/utils/export-contacts";
import { useSession } from "@/integrations/supabase/auth";
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useIsMobile } from '@/hooks/use-mobile';
import { designTokens } from '@/lib/design-tokens';

const Contacts = React.memo(() => {
  const navigate = useNavigate();
  const { groups, fetchGroups } = useGroups();
  const { session } = useSession();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { settings } = useAppSettings();
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("last_name_asc");
  const [isExporting, setIsExporting] = useState(false);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

  // Load default display mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('defaultContactDisplayMode');
    if (savedMode === 'list' || savedMode === 'grid') {
      setDisplayMode(savedMode);
    }
  }, []);

  // Debounce search terms for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedCompanyFilter = useDebounce(companyFilter, 300);

  // Memoize filter values to prevent unnecessary re-renders
  const filterValues = useMemo(() => ({
    searchTerm: debouncedSearchTerm,
    selectedGroup,
    companyFilter: debouncedCompanyFilter,
    sortOption,
  }), [debouncedSearchTerm, selectedGroup, debouncedCompanyFilter, sortOption]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddContactClick = useCallback(() => {
    toast.info(t('notifications.navigating_to_add_contact'));
    navigate("/add-contact");
  }, [navigate, t, toast]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleGroupChange = useCallback((value: string) => {
    setSelectedGroup(value === "all" ? "" : value);
  }, []);

  const handleCompanyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyFilter(event.target.value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortOption(value);
  }, []);

  const handleDisplayModeChange = useCallback((mode: 'grid' | 'list') => {
    setDisplayMode(mode);
  }, []);

  const handleExportClick = useCallback(async () => {
    if (!session?.user) {
      toast.error(t('errors.auth_required'));
      return;
    }

    setIsExporting(true);
    toast.info(t('notifications.export_started'));
    try {
      await exportContactsToCsv(session, filterValues);
      toast.success(t('notifications.export_success'));
    } catch (error) {
      toast.error(t('notifications.export_error'));
    } finally {
      setIsExporting(false);
    }
  }, [session, toast, t, filterValues]);

  return (
    <div
      className={`min-h-screen w-full ${settings.theme === 'dark' ? 'dark' : ''}`}
      style={{
        background: designTokens.gradients.ocean,
        padding: designTokens.spacing[6]
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Compact Header Section */}
        <div
          className="text-center py-8 px-6 rounded-2xl"
          style={{
            background: designTokens.colors.glass.background,
            border: `1px solid ${designTokens.colors.glass.border}`,
            backdropFilter: 'blur(15px)',
            boxShadow: designTokens.shadows.glass
          }}
        >
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              background: designTokens.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: designTokens.typography.fonts.primary
            }}
          >
            {t('pages.contacts.management')}
          </h1>
          <p
            className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            style={{
              fontFamily: designTokens.typography.fonts.secondary
            }}
          >
            {t('pages.contacts.management_description')}
          </p>
        </div>

        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: designTokens.colors.glass.background,
            border: `1px solid ${designTokens.colors.glass.border}`,
            backdropFilter: 'blur(15px)',
            boxShadow: designTokens.shadows.glass
          }}
        >
          {/* Compact Search and Actions Section */}
          <div
            className="px-8 py-6 border-b"
            style={{
              borderColor: designTokens.colors.glass.border,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center justify-between gap-6">
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
                    onChange={handleSearchChange}
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
                      <GradientButton
                        gradientType="primary"
                        onClick={handleAddContactClick}
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
                        onClick={handleExportClick}
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
          </div>

          {/* Compact Filters Section */}
          <div
            className="px-8 py-4"
            style={{
              background: designTokens.colors.glass.background,
              borderBottom: `1px solid ${designTokens.colors.glass.border}`,
              backdropFilter: 'blur(15px)'
            }}
          >
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-stretch ${isMobile ? '' : 'lg:items-center'} gap-4 ${isMobile ? '' : 'lg:justify-between'}`}>
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-stretch ${isMobile ? '' : 'sm:items-center'} gap-4`}>
                {/* Group Filter */}
                <ModernTooltip>
                  <ModernTooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <ModernSelect onValueChange={handleGroupChange} value={selectedGroup || "all"}>
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
                        placeholder={t('pages.contacts.company_placeholder')}
                        className="w-full sm:w-48 rounded-xl focus:ring-4 focus:ring-blue-500/30 text-gray-800 dark:text-gray-100 rtl:text-right ltr:text-left"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: `2px solid ${designTokens.colors.glass.border}`,
                          backdropFilter: 'blur(10px)',
                          fontSize: designTokens.typography.sizes.sm,
                          boxShadow: designTokens.shadows.glass
                        }}
                        value={companyFilter}
                        onChange={handleCompanyChange}
                      />
                    </div>
                  </ModernTooltipTrigger>
                  <ModernTooltipContent>
                    <p>{t('contact_form.company')}</p>
                  </ModernTooltipContent>
                </ModernTooltip>

                {/* Sort Filter */}
                <ModernTooltip>
                  <ModernTooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <ModernSelect onValueChange={handleSortChange} value={sortOption}>
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
              </div>

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
                        onClick={() => handleDisplayModeChange('grid')}
                      >
                        <Grid size={18} />
                      </GlassButton>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent>
                      <p>نمایش کارتی</p>
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
                        onClick={() => handleDisplayModeChange('list')}
                      >
                        <List size={18} />
                      </GlassButton>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent>
                      <p>نمایش لیستی</p>
                    </ModernTooltipContent>
                  </ModernTooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Contact List Section */}
          <div
            className="p-8"
            style={{
              background: 'rgba(255,255,255,0.05)',
              minHeight: '500px'
            }}
          >
            <SuspenseWrapper>
              <ContactList
                searchTerm={filterValues.searchTerm}
                selectedGroup={filterValues.selectedGroup}
                companyFilter={filterValues.companyFilter}
                sortOption={filterValues.sortOption}
                displayMode={displayMode}
              />
            </SuspenseWrapper>
          </div>
        </div>
      </div>
    </div>
  );
});

Contacts.displayName = 'Contacts';

export default Contacts;