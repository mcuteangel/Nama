import React, { Suspense, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, TrendingUp, RefreshCw, Download, Sparkles, Calendar, Home } from "lucide-react";

import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { ModernTabs, ModernTabsList, ModernTabsTrigger, ModernTabsContent } from "@/components/ui/modern-tabs";
import { ModernGrid, GridItem } from "@/components/ui/modern-grid";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernLoader } from "@/components/ui/modern-loader";
import { ModernProgress } from "@/components/ui/modern-progress";
import { ModernBadge } from "@/components/ui/modern-badge";
import { EmptyState } from "@/components/common/EmptyState";

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
import AdaptiveChart from "@/components/statistics/AdaptiveChart";

/**
 * Enhanced Statistics Dashboard Content Component
 * Features modern design with improved UX and visual hierarchy
 */
const StatisticsContent: React.FC = () => {
  const { state, refreshData, setDateRange, fetchComparisonData } = useStatistics();
  const { t } = useTranslation();
  const [showComparison, setShowComparison] = useState(false);

  // Loading state with modern loader
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-900/90 dark:via-purple-900/30 dark:to-pink-900/30 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header with loading animation */}
          <div className="text-center py-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <BarChart3 size={72} className="text-blue-600 animate-pulse" />
                  <Sparkles size={28} className="absolute -top-3 -right-3 text-yellow-500 animate-bounce" />
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                {t('statistics.title')}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                {t('statistics.description')}
              </p>
              <ModernProgress value={75} variant="gradient" animated={true} className="max-w-md mx-auto" />
              <div className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <ModernLoader variant="dots" size="sm" color="primary" />
                {t('common.loading')}
              </div>
            </div>
          </div>

          {/* Loading skeleton grid */}
          <ModernGrid variant="dynamic" gap="lg" className="opacity-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <GridItem key={i}>
                <ModernCard variant="glass" className="h-64 animate-pulse">
                  <div className="h-full bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl" />
                </ModernCard>
              </GridItem>
            ))}
          </ModernGrid>
        </div>
      </div>
    );
  }

  // Error state with enhanced error boundary
  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/80 via-pink-50/80 to-orange-50/80 dark:from-gray-900/90 dark:via-red-900/30 dark:to-pink-900/30 p-6">
        <div className="max-w-4xl mx-auto">
          <EmptyState
            icon={BarChart3}
            title={t('statistics.error_boundary.title', t('error.something_went_wrong'))}
            description={t('statistics.error_boundary.description')}
            className="min-h-[60vh] bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10 border-red-200/50 dark:border-red-800/50"
          >
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <GlassButton
                variant="glass"
                effect="lift"
                onClick={refreshData}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                <RefreshCw size={16} className="mr-2" />
                {t('statistics.error_boundary.retry', t('common.retry'))}
              </GlassButton>
              <GlassButton
                variant="outline"
                effect="lift"
                onClick={() => window.location.href = '/'}
                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/50"
              >
                <Home size={16} className="mr-2" />
                {t('statistics.error_boundary.go_home', t('error.go_home'))}
              </GlassButton>
              <GlassButton
                variant="ghost"
                effect="lift"
                onClick={() => window.location.reload()}
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                <RefreshCw size={16} className="mr-2" />
                {t('statistics.error_boundary.reload_page', t('error.reload_page'))}
              </GlassButton>
            </div>
            <details className="mt-4 text-left bg-red-50 dark:bg-red-950/20 rounded-lg p-4 max-w-2xl mx-auto">
              <summary className="cursor-pointer font-medium text-red-700 dark:text-red-300">
                {t('statistics.error_boundary.technical_details', t('error.technical_details'))}
              </summary>
              <div className="mt-2 space-y-2 text-xs">
                <div>
                  <strong className="text-red-800 dark:text-red-200">
                    {t('statistics.error_boundary.message', t('error.message'))}:
                  </strong>
                  <pre className="mt-1 p-2 bg-red-100 dark:bg-red-900/30 rounded text-red-800 dark:text-red-200 whitespace-pre-wrap">
                    {state.error}
                  </pre>
                </div>
              </div>
            </details>
          </EmptyState>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-900/90 dark:via-purple-900/30 dark:to-pink-900/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Enhanced Header */}
        <div className="text-center py-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <BarChart3 size={72} className="text-blue-600" />
                <Sparkles size={28} className="absolute -top-3 -right-3 text-yellow-500 animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {t('statistics.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              {t('statistics.description')}
            </p>
            
            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4">
              <GlassButton
                variant="glass"
                effect="lift"
                onClick={refreshData}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30"
              >
                <RefreshCw size={16} className="mr-2" />
                {t('common.refresh')}
              </GlassButton>
              
              <ModernBadge 
                variant="gradient" 
                gradientType="success" 
                effect="glow"
                className="px-4 py-2"
              >
                <TrendingUp size={14} className="mr-1" />
                {t('statistics.live_data')}
              </ModernBadge>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <StatisticsDateFilter 
          onDateRangeChange={setDateRange}
          onComparePeriod={(startDate, endDate) => {
            fetchComparisonData(startDate, endDate);
            setShowComparison(true);
          }}
        />

        {/* Comparative Statistics */}
        {showComparison && state.comparisonData.previousData && (
          <div className="mb-8">
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

        {/* Compact Stats Overview */}
        <div className="px-4">
          <StatisticsCompactStats data={state.data} />
        </div>

        {/* Main Statistics Content */}
        <ModernCard variant="glass" hover="lift" className="backdrop-blur-xl border border-white/30">
          <ModernCardContent className="p-8">
            <ModernTabs defaultValue="overview" className="w-full">
              <ModernTabsList 
                className="grid w-full grid-cols-4 mb-8 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20"
                glassEffect="default"
                hoverEffect="lift"
              >
                <ModernTabsTrigger
                  value="overview"
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                  hoverEffect="scale"
                >
                  <TrendingUp size={16} />
                  <span className="hidden sm:inline">{t('statistics.overview')}</span>
                </ModernTabsTrigger>
                <ModernTabsTrigger
                  value="distribution"
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300"
                  hoverEffect="scale"
                >
                  <BarChart3 size={16} />
                  <span className="hidden sm:inline">{t('statistics.distribution')}</span>
                </ModernTabsTrigger>
                <ModernTabsTrigger
                  value="timeline"
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
                  hoverEffect="scale"
                >
                  <BarChart3 size={16} />
                  <span className="hidden sm:inline">{t('statistics.timeline')}</span>
                </ModernTabsTrigger>
                <ModernTabsTrigger
                  value="reports"
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
                  hoverEffect="scale"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">{t('statistics.reports')}</span>
                </ModernTabsTrigger>
              </ModernTabsList>

              {/* Overview Tab */}
              <ModernTabsContent value="overview" className="space-y-8">
                <ModernGrid variant="dynamic" gap="lg" minWidth="320px">
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <TotalContactsCard count={state.data.totalContacts} />
                      </Suspense>
                    </div>
                  </GridItem>
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '200ms' }}>
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <AdaptiveChart
                          data={state.data.creationTimeData}
                          title="statistics.contacts_by_creation_time"
                          icon={Calendar}
                          iconColor="text-indigo-500"
                          emptyMessageKey="statistics.no_creation_time_data"
                          nameKey="month_year"
                          valueKey="count"
                        />
                      </Suspense>
                    </div>
                  </GridItem>
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <UpcomingBirthdaysList data={state.data.upcomingBirthdays} />
                      </Suspense>
                    </div>
                  </GridItem>
                </ModernGrid>
              </ModernTabsContent>

              {/* Distribution Tab */}
              <ModernTabsContent value="distribution" className="space-y-8">
                <ModernGrid variant="dynamic" gap="lg" minWidth="320px">
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <AdaptiveChart
                          data={state.data.genderData}
                          title="statistics.contacts_by_gender"
                          icon={BarChart3}
                          iconColor="text-green-500"
                          emptyMessageKey="statistics.no_gender_data"
                          nameKey="gender"
                          valueKey="count"
                        />
                      </Suspense>
                    </div>
                  </GridItem>
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '200ms' }}>
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <AdaptiveChart
                          data={state.data.groupData}
                          title="statistics.contacts_by_group"
                          icon={BarChart3}
                          iconColor="text-purple-500"
                          emptyMessageKey="statistics.no_group_data"
                          nameKey="name"
                          valueKey="count"
                          colorKey="color"
                        />
                      </Suspense>
                    </div>
                  </GridItem>
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <AdaptiveChart
                          data={state.data.preferredMethodData}
                          title="statistics.contacts_by_preferred_method"
                          icon={BarChart3}
                          iconColor="text-orange-500"
                          emptyMessageKey="statistics.no_preferred_method_data"
                          nameKey="method"
                          valueKey="count"
                        />
                      </Suspense>
                    </div>
                  </GridItem>
                </ModernGrid>
              </ModernTabsContent>

              {/* Timeline Tab */}
              <ModernTabsContent value="timeline" className="space-y-8">
                <ModernGrid variant="dynamic" gap="lg" minWidth="400px">
                  <GridItem colSpan={2}>
                    <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <ContactsByCreationTimeChart data={state.data.creationTimeData} />
                      </Suspense>
                    </div>
                  </GridItem>
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '200ms' }}>
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <UpcomingBirthdaysList data={state.data.upcomingBirthdays} />
                      </Suspense>
                    </div>
                  </GridItem>
                </ModernGrid>
              </ModernTabsContent>

              {/* Reports Tab */}
              <ModernTabsContent value="reports" className="space-y-8">
                <ModernGrid variant="dynamic" gap="lg" minWidth="320px">
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <TopCompaniesList data={state.data.topCompaniesData} />
                      </Suspense>
                    </div>
                  </GridItem>
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '200ms' }}>
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <TopPositionsList data={state.data.topPositionsData} />
                      </Suspense>
                    </div>
                  </GridItem>
                </ModernGrid>
              </ModernTabsContent>
            </ModernTabs>
          </ModernCardContent>
        </ModernCard>

        {/* Footer with AI branding */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/20">
            <Sparkles size={16} className="text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('statistics.powered_by_ai', 'قدرت گرفته از هوش مصنوعی پیشرفته')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Statistics Page Component
 * Wraps content with StatisticsProvider for data management
 */
const Statistics: React.FC = () => {
  return (
    <StatisticsProvider>
      <StatisticsContent />
    </StatisticsProvider>
  );
};

export default Statistics;