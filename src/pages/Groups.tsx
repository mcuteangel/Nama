import { GradientButton, GlassButton } from "@/components/ui/glass-button";
import { useToast } from "@/components/ui/use-toast";
import { ModernInput } from "@/components/ui/modern-input";
import { PlusCircle, Search, Grid, List } from "lucide-react";
import GroupsList from "@/components/groups/GroupsList";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDebounce } from '@/hooks/use-performance';
import SuspenseWrapper from '@/components/common/SuspenseWrapper';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from "@/components/ui/modern-tooltip";
import { useGroups } from "@/hooks/use-groups";
import { designTokens } from '@/lib/design-tokens';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useIsMobile } from '@/hooks/use-mobile';
import PageHeader from "@/components/ui/PageHeader";
import { motion } from 'framer-motion';

const Groups = React.memo(() => {
  const navigate = useNavigate();
  const { groups, fetchGroups } = useGroups();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { settings } = useAppSettings();
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("name_asc");
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

  // Load default display mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('defaultGroupDisplayMode');
    if (savedMode === 'list' || savedMode === 'grid') {
      setDisplayMode(savedMode);
    }
  }, []);

  // Debounce search terms for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoize filter values to prevent unnecessary re-renders
  const filterValues = useMemo(() => ({
    searchTerm: debouncedSearchTerm,
    selectedColor,
    sortOption,
  }), [debouncedSearchTerm, selectedColor, sortOption]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddGroupClick = useCallback(() => {
    toast.success(t('settings.notifications.navigating_to_add_group'));
    navigate("/add-group");
  }, [navigate, t, toast]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleColorChange = useCallback((value: string) => {
    setSelectedColor(value === "all" ? "" : value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortOption(value);
  }, []);

  const handleDisplayModeChange = useCallback((mode: 'grid' | 'list') => {
    setDisplayMode(mode);
  }, []);

  // Get unique colors for filter
  const availableColors = useMemo(() => {
    const colors = new Set(groups.map(group => group.color).filter(color => color !== undefined));
    return Array.from(colors);
  }, [groups]);

  return (
    <div className={`min-h-screen w-full ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader
          title={t('pages.groups.management')}
          description={t('pages.groups.management_description')}
          className="mb-"
        />

        <div className="mb-12"></div>

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
                    placeholder={t('pages.groups.search_placeholder')}
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
                        onClick={handleAddGroupClick}
                        className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl"
                        style={{
                          background: designTokens.gradients.primary,
                          boxShadow: designTokens.shadows.primary,
                          fontFamily: designTokens.typography.fonts.primary,
                          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                        }}
                      >
                        <PlusCircle size={20} />
                        <span className="hidden sm:inline">{t('actions.add_group')}</span>
                      </GradientButton>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent>
                      <p>{t('actions.add_group')}</p>
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
                {/* Color Filter */}
                <ModernTooltip>
                  <ModernTooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <ModernSelect onValueChange={handleColorChange} value={selectedColor || "all"}>
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
                          <ModernSelectValue placeholder={t('pages.groups.all_colors')} />
                        </ModernSelectTrigger>
                        <ModernSelectContent
                          className="rtl:text-right ltr:text-left"
                          style={{
                            background: designTokens.colors.glass.background,
                            border: `1px solid ${designTokens.colors.glass.border}`,
                            backdropFilter: 'blur(15px)'
                          }}
                        >
                          <ModernSelectItem value="all">{t('pages.groups.all_colors')}</ModernSelectItem>
                          {availableColors.map((color) => (
                            <ModernSelectItem key={color} value={color}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                {color}
                              </div>
                            </ModernSelectItem>
                          ))}
                        </ModernSelectContent>
                      </ModernSelect>
                    </div>
                  </ModernTooltipTrigger>
                  <ModernTooltipContent>
                    <p>{t('pages.groups.filter_by_color')}</p>
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
                          <ModernSelectItem value="name_asc">{t('sorting.name_asc')}</ModernSelectItem>
                          <ModernSelectItem value="name_desc">{t('sorting.name_desc')}</ModernSelectItem>
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
                      <p>{t('display_modes.grid')}</p>
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
                      <p>{t('display_modes.list')}</p>
                    </ModernTooltipContent>
                  </ModernTooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Groups List Section */}
          <div
            className="p-8"
            style={{
              background: 'rgba(255,255,255,0.05)',
              minHeight: '500px'
            }}
          >
            <SuspenseWrapper>
              <GroupsList
                searchTerm={filterValues.searchTerm}
                selectedColor={filterValues.selectedColor}
                sortOption={filterValues.sortOption}
                displayMode={displayMode}
                groups={groups}
              />
            </SuspenseWrapper>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <ModernTooltip>
            <ModernTooltipTrigger asChild>
              <GlassButton
                onClick={handleAddGroupClick}
                className="w-14 h-14 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
                style={{
                  background: designTokens.gradients.primary,
                  border: `2px solid rgba(255,255,255,0.2)`,
                  backdropFilter: 'blur(15px)',
                  boxShadow: `0 20px 40px -12px ${designTokens.colors.primary[500]}40`
                }}
              >
                <PlusCircle size={24} style={{ color: 'white' }} />
              </GlassButton>
            </ModernTooltipTrigger>
            <ModernTooltipContent>
              <p>{t('actions.add_group')}</p>
            </ModernTooltipContent>
          </ModernTooltip>
        </motion.div>
      )}
    </div>
  );
});

Groups.displayName = 'Groups';

export default Groups;
