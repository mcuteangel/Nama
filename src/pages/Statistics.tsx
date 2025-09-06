import React, { Suspense, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  Calendar,
  Award,
  PieChart} from "lucide-react";

import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { ModernTabs, ModernTabsList, ModernTabsTrigger, ModernTabsContent } from "@/components/ui/modern-tabs";
import { MasonryGrid, ResponsiveGrid } from "@/components/ui/modern-grid";
import { ModernLoader } from "@/components/ui/modern-loader";

import { StatisticsProvider } from "@/components/statistics/StatisticsContext";
import { useStatistics } from "@/components/statistics/useStatistics";
import StatisticsCompactStats from "@/components/statistics/StatisticsCompactStats";
import TotalContactsCard from "@/components/statistics/TotalContactsCard";
import ContactsByGenderChart from "@/components/statistics/ContactsByGenderChart";
import ContactsByGroupChart from "@/components/statistics/ContactsByGroupChart";
import ContactsByPreferredMethodChart from "@/components/statistics/ContactsByPreferredMethodChart";
import UpcomingBirthdaysList from "@/components/statistics/UpcomingBirthdaysList";
import ContactsByCreationTimeChart from "@/components/statistics/ContactsByCreationTimeChart";
import TopCompaniesList from "@/components/statistics/TopCompaniesList";
import TopPositionsList from "@/components/statistics/TopPositionsList";
import StatisticsDateFilter from "@/components/statistics/StatisticsDateFilter";
import ComparativeStatistics from "@/components/statistics/ComparativeStatistics";
import StatisticsHeader from "../components/statistics/StatisticsHeader";
import StatisticsLoading from "../components/statistics/StatisticsLoading";
import StatisticsError from "../components/statistics/StatisticsError";
import StatisticsFooter from "../components/statistics/StatisticsFooter";

// Define type for dashboard settings
interface DashboardSettings {
  layoutMode: 'masonry' | 'grid';
  showSettings: boolean;
  voiceEnabled: boolean;
  showComparison: boolean;
}

// Main dashboard content component
const StatisticsDashboard: React.FC = () => {
  const { state, refreshData, setDateRange, fetchComparisonData } = useStatistics();
  const { t, i18n } = useTranslation();
  
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = React.useState<DashboardSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('statisticsPageSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (e) {
      console.warn('Failed to parse dashboard settings from localStorage', e);
    }
    
    // Default settings
    return {
      layoutMode: 'masonry',
      showSettings: false,
      voiceEnabled: false,
      showComparison: false
    };
  });
  
  // Determine if we're in RTL mode based on the current language
  const isRTL = i18n.dir() === 'rtl';
  
  // Determine theme based on system preference or saved setting
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('statisticsPageTheme');
      if (savedTheme !== null) {
        return savedTheme === 'dark';
      }
    } catch (e) {
      console.warn('Failed to parse theme from localStorage', e);
    }
    
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Save settings to localStorage whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem('statisticsPageSettings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save dashboard settings to localStorage', e);
    }
  }, [settings]);
  
  // Save theme preference to localStorage whenever it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('statisticsPageTheme', isDarkMode ? 'dark' : 'light');
    } catch (e) {
      console.warn('Failed to save theme preference to localStorage', e);
    }
  }, [isDarkMode]);

  // Update settings helper
  const updateSettings = React.useCallback((newSettings: Partial<DashboardSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Memoized tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    const gridProps = settings.layoutMode === 'masonry' 
      ? { columns: 3, gap: "lg" } as const
      : { breakpoints: { sm: 1, md: 2, lg: 3, xl: 4 } } as const;
    
    const GridComponent = settings.layoutMode === 'masonry' ? MasonryGrid : ResponsiveGrid;
    
    return (
      <ModernTabs defaultValue="overview" className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <ModernTabsList
          className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 sm:mb-8 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20"
          glassEffect="default"
          hoverEffect="lift"
        >
          <ModernTabsTrigger
            value="overview"
            className="flex items-center gap-1 sm:gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
            hoverEffect="scale"
          >
            <TrendingUp size={14} className={isRTL ? 'rotate-180' : ''} />
            <span className="hidden xs:inline">{t('statistics.overview', 'Overview')}</span>
          </ModernTabsTrigger>

          <ModernTabsTrigger
            value="distribution"
            className="flex items-center gap-1 sm:gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
            hoverEffect="scale"
          >
            <PieChart size={14} className={isRTL ? 'rotate-180' : ''} />
            <span className="hidden xs:inline">{t('statistics.distribution', 'Distribution')}</span>
          </ModernTabsTrigger>

          <ModernTabsTrigger
            value="timeline"
            className="flex items-center gap-1 sm:gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
            hoverEffect="scale"
          >
            <Calendar size={14} className={isRTL ? 'rotate-180' : ''} />
            <span className="hidden xs:inline">{t('statistics.timeline', 'Timeline')}</span>
          </ModernTabsTrigger>

          <ModernTabsTrigger
            value="insights"
            className="flex items-center gap-1 sm:gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
            hoverEffect="scale"
          >
            <Award size={14} className={isRTL ? 'rotate-180' : ''} />
            <span className="hidden xs:inline">{t('statistics.insights', 'Insights')}</span>
          </ModernTabsTrigger>
        </ModernTabsList>

        {/* Overview Tab */}
        <ModernTabsContent value="overview" className="space-y-6 sm:space-y-8">
          <GridComponent {...gridProps} className="animate-in fade-in duration-700">
            <div className="animate-in slide-in-from-left-4 duration-500">
              <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                <TotalContactsCard count={state.data.totalContacts} />
              </Suspense>
            </div>
            <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
              <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                <ContactsByCreationTimeChart data={state.data.creationTimeData} />
              </Suspense>
            </div>
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
              <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                <UpcomingBirthdaysList data={state.data.upcomingBirthdays} />
              </Suspense>
            </div>
          </GridComponent>
        </ModernTabsContent>

        {/* Distribution Tab */}
        <ModernTabsContent value="distribution" className="space-y-6 sm:space-y-8">
          <GridComponent {...gridProps} className="animate-in fade-in duration-700">
            <div className="animate-in slide-in-from-left-4 duration-500">
              <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                <ContactsByGenderChart data={state.data.genderData} />
              </Suspense>
            </div>
            <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
              <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                <ContactsByGroupChart data={state.data.groupData} />
              </Suspense>
            </div>
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
              <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                <ContactsByPreferredMethodChart data={state.data.preferredMethodData} />
              </Suspense>
            </div>
          </GridComponent>
        </ModernTabsContent>

        {/* Timeline Tab */}
        <ModernTabsContent value="timeline" className="space-y-6 sm:space-y-8">
          <GridComponent 
            {...(settings.layoutMode === 'masonry' ? { columns: 2, gap: "lg" } : { breakpoints: { sm: 1, md: 2, lg: 3, xl: 4 } })}
            className="animate-in fade-in duration-700"
          >
            <div className="col-span-2 animate-in slide-in-from-left-4 duration-500">
              <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                <ContactsByCreationTimeChart data={state.data.creationTimeData} />
              </Suspense>
            </div>
            <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
              <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                <UpcomingBirthdaysList data={state.data.upcomingBirthdays} />
              </Suspense>
            </div>
          </GridComponent>
        </ModernTabsContent>

        {/* Insights Tab */}
        <ModernTabsContent value="insights" className="space-y-6 sm:space-y-8">
          <GridComponent 
            {...(settings.layoutMode === 'masonry' ? { columns: 2, gap: "lg" } : { breakpoints: { sm: 1, md: 2, lg: 3, xl: 4 } })}
            className="animate-in fade-in duration-700"
          >
            <div className="animate-in slide-in-from-left-4 duration-500">
              <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                <TopCompaniesList data={state.data.topCompaniesData} />
              </Suspense>
            </div>
            <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
              <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                <TopPositionsList data={state.data.topPositionsData} />
              </Suspense>
            </div>
          </GridComponent>
        </ModernTabsContent>
      </ModernTabs>
    );
  }, [settings.layoutMode, isRTL, t, state.data]);

  // Loading state
  if (state.loading) {
    return <StatisticsLoading isDarkMode={isDarkMode} isRTL={isRTL} />;
  }

  // Error state
  if (state.error) {
    return <StatisticsError error={state.error} onRetry={refreshData} isDarkMode={isDarkMode} />;
  }

  // Main content
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} transition-all duration-700 p-3 sm:p-4 md:p-6 lg:p-8`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <StatisticsHeader 
          isDarkMode={isDarkMode}
          isRTL={isRTL}
          settings={settings}
          updateSettings={updateSettings}
          refreshData={refreshData}
          setIsDarkMode={setIsDarkMode}
          state={state}
        />
        
        {/* Date filter */}
        <StatisticsDateFilter
          onDateRangeChange={setDateRange}
          onComparePeriod={(startDate, endDate) => {
            fetchComparisonData(startDate, endDate);
            updateSettings({ showComparison: true });
          }}
        />

        {/* Comparative analysis */}
        {settings.showComparison && state.comparisonData.previousData && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <ComparativeStatistics
              title="statistics.comparative_analysis"
              data={[
                {
                  label: t('statistics.total_contacts'),
                  current: state.data.totalContacts || 0,
                  previous: state.comparisonData.previousData.totalContacts || 0
                },
                {
                  label: t('statistics.active_groups'),
                  current: state.data.groupData?.length || 0,
                  previous: state.comparisonData.previousData.groupData?.length || 0
                }
              ]}
            />
          </div>
        )}

        {/* Compact stats */}
        <div className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
          <StatisticsCompactStats data={state.data} />
        </div>

        {/* Main content with tabs */}
        <ModernCard variant="glass" hover="lift" className="backdrop-blur-2xl border border-white/30 shadow-2xl">
          <ModernCardContent className="p-4 sm:p-6 md:p-8">
            {tabContent}
          </ModernCardContent>
        </ModernCard>

        <StatisticsFooter isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

/**
 * Main Statistics Page Component
 * Wraps content with StatisticsProvider for data management
 * Includes persistent settings and proper theme handling
 */
const Statistics: React.FC = () => {
  return (
    <StatisticsProvider>
      <StatisticsDashboard />
    </StatisticsProvider>
  );
};

export default Statistics;