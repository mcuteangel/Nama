import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  BarChart3, 
  RefreshCw, 
  Sparkles, 
  Zap, 
  Activity, 
  Settings, 
  Grid3X3, 
  LayoutGrid, 
  Palette, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX 
} from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernBadge } from "@/components/ui/modern-badge";
import { StatisticsData } from "./types";
import { useAppSettings } from "@/hooks/use-app-settings";

interface DashboardSettings {
  layoutMode: 'masonry' | 'grid';
  showSettings: boolean;
  voiceEnabled: boolean;
  showComparison: boolean;
}

interface StatisticsState {
  data: StatisticsData;
  loading: boolean;
  error: string | null;
  dateRange: { startDate: string | null; endDate: string | null };
  comparisonData: { previousData: StatisticsData | null };
}

interface StatisticsHeaderProps {
  isDarkMode: boolean;
  isRTL: boolean;
  settings: DashboardSettings;
  updateSettings: (newSettings: Partial<DashboardSettings>) => void;
  refreshData: () => void;
  setIsDarkMode: (isDark: boolean) => void;
  state: StatisticsState;
}

const StatisticsHeader: React.FC<StatisticsHeaderProps> = ({ 
  isDarkMode, 
  isRTL, 
  settings, 
  updateSettings, 
  refreshData, 
  setIsDarkMode, 
  state 
}) => {
  const { t } = useTranslation();
  const { settings: appSettings } = useAppSettings();
  const [currentTime, setCurrentTime] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Advanced celebration system for data milestones
  useEffect(() => {
    if (!containerRef.current || !state.data.totalContacts) return;

    const totalContacts = state.data.totalContacts;
    if (totalContacts >= 1000) {
      // Trigger major milestone celebration
      const event = new CustomEvent('celebration', {
        detail: { type: 'major_milestone', contacts: totalContacts }
      });
      window.dispatchEvent(event);
    }
  }, [state.data.totalContacts]);

  // Voice command system
  useEffect(() => {
    if (!settings.voiceEnabled) return;

    const handleVoiceCommand = (event: CustomEvent) => {
      const command = event.detail.command;
      switch (command) {
        case 'refresh':
          refreshData();
          break;
        case 'switch_theme':
          setIsDarkMode(!isDarkMode);
          break;
        case 'show_overview':
          // Switch to overview tab
          break;
        default:
          break;
      }
    };

    window.addEventListener('voiceCommand', handleVoiceCommand as EventListener);
    return () => window.removeEventListener('voiceCommand', handleVoiceCommand as EventListener);
  }, [settings.voiceEnabled, refreshData, isDarkMode, setIsDarkMode]);

  return (
    <div className="text-center py-8 sm:py-12 md:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-2xl blur-2xl animate-pulse group-hover:blur-3xl transition-all duration-500"></div>
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 sm:p-6 rounded-2xl shadow-2xl group-hover:shadow-3xl group-hover:scale-105 transition-all duration-500">
              <BarChart3 size={48} className="text-white animate-pulse" />
            </div>
            <Sparkles size={20} className="absolute -top-2 -right-2 text-yellow-400 animate-bounce" />
            <Zap size={16} className="absolute -bottom-2 -left-2 text-yellow-500 animate-ping" />
            <Activity size={14} className="absolute top-2 left-2 text-green-400 animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4">
          {t('statistics.title', 'آمار پیشرفته')}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
          {t('statistics.description', 'نمای کلی هوشمند از داده‌های شما با تحلیل‌های پیشرفته و پیش‌بینی‌های دقیق')}
        </p>

        {/* Control panel */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms' }}>
          <GlassButton
            variant="glass"
            effect="lift"
            onClick={refreshData}
            className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} hover:bg-opacity-70 shadow-xl px-4 sm:px-6 py-2 sm:py-3 rounded-2xl`}
          >
            <RefreshCw size={16} className="mr-2" />
            <span className="hidden sm:inline">{t('common.refresh', 'به‌روزرسانی')}</span>
          </GlassButton>

          <GlassButton
            variant="glass"
            effect="scale"
            onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
            className={`${settings.voiceEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'} px-4 sm:px-6 py-2 sm:py-3 rounded-2xl`}
          >
            {settings.voiceEnabled ? <Volume2 size={16} className="mr-2" /> : <VolumeX size={16} className="mr-2" />}
            <span className="hidden sm:inline">{settings.voiceEnabled ? 'صدا فعال' : 'صدا غیرفعال'}</span>
          </GlassButton>

          <GlassButton
            variant="ghost"
            effect="scale"
            onClick={() => updateSettings({ showSettings: !settings.showSettings })}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-2xl"
          >
            <Settings size={16} className="mr-2" />
            <span className="hidden sm:inline">تنظیمات</span>
          </GlassButton>

          <GlassButton
            variant="ghost"
            effect="scale"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-2xl"
          >
            {isDarkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
            <span className="hidden sm:inline">{isDarkMode ? 'روشن' : 'تیره'}</span>
          </GlassButton>

          <ModernBadge
            variant="gradient"
            gradientType="success"
            effect="glow"
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm font-semibold"
          >
            <Zap size={14} className="mr-2" />
            {t('statistics.live_data', 'داده‌های زنده')}
          </ModernBadge>
        </div>

        {/* Settings panel */}
        {settings.showSettings && (
          <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 max-w-md mx-auto shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Palette size={18} />
              تنظیمات نمایش
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">طرح‌بندی</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateSettings({ layoutMode: 'masonry' })}
                    className={`p-2 sm:p-3 rounded-xl transition-all ${settings.layoutMode === 'masonry' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => updateSettings({ layoutMode: 'grid' })}
                    className={`p-2 sm:p-3 rounded-xl transition-all ${settings.layoutMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time clock and stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '600ms' }}>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-white mb-1">
              {appSettings.calendarType === 'jalali' 
                ? currentTime.toLocaleTimeString('fa-IR') 
                : currentTime.toLocaleTimeString('en-US')}
            </div>
            <div className="text-xs sm:text-sm text-white/70">زمان فعلی</div>
          </div>

          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-400 mb-1">
              {state.data.totalContacts || 0}
            </div>
            <div className="text-xs sm:text-sm text-white/70">کل مخاطبین</div>
          </div>

          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-400 mb-1">
              {state.data.groupData?.length || 0}
            </div>
            <div className="text-xs sm:text-sm text-white/70">گروه‌ها</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsHeader;