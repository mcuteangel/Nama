import React, { useState } from 'react';
import { Wrench, Cpu, RefreshCw, Database, Eye, EyeOff, Settings as SettingsIcon, Activity, Monitor } from 'lucide-react';
import { useTranslation } from "react-i18next";

// Extend the Performance interface to include memory property
declare global {
  interface Performance {
    memory?: {
      jsHeapSizeLimit?: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
  }
}

import { GlassButton } from '@/components/ui/glass-button';
import SettingsCard from './SettingsCard';
import { useDebugMode } from '@/hooks/useDebugMode';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';
import { useToast } from '@/hooks/use-toast';

const DebugSettings: React.FC = () => {
  const {
    isDebugMode,
    enableDebugMode,
    disableDebugMode,
    isDevelopment
  } = useDebugMode();

  const { toast } = useToast();
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const { t } = useTranslation();

  const [systemInfo] = useState(() => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    localStorageSize: getStorageSize(localStorage),
    sessionStorageSize: getStorageSize(sessionStorage),
    memoryUsage: getMemoryUsage(),
    connection: getConnectionInfo()
  }));

  // Helper functions

  function getStorageSize(storage: Storage): string {
    try {
      let total = 0;
      for (const key in storage) {
        if (Object.prototype.hasOwnProperty.call(storage, key)) {
          total += storage[key].length + key.length;
        }
      }
      return `${(total / 1024).toFixed(2)} KB`;
    } catch {
      return t('common.not_available');
    }
  }

  function getMemoryUsage(): string {
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize / 1024 / 1024;
      const total = performance.memory.totalJSHeapSize / 1024 / 1024;
      return `${used.toFixed(1)} ${t('common.mb')} / ${total.toFixed(1)} ${t('common.mb')}`;
    }
    return t('common.not_available');
  }

  function getConnectionInfo(): string {
    // @ts-expect-error - navigator.connection is not available in all browsers
    if (navigator.connection) {
      // @ts-expect-error - navigator.connection properties are not in TypeScript definitions
      const conn = navigator.connection;
      return `${conn.effectiveType || t('common.unknown')} (${conn.downlink || 0} ${t('common.mbps')})`;
    }
    return t('common.not_available');
  }

  const handleClearStorage = () => {
    if (confirm(t('common.confirm_clear_storage'))) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const handleTestError = () => {
    const errorMessage = t('debug.test_error.message');
    console.error(errorMessage);
    toast({
      title: t('debug.test_error.title'),
      description: t('debug.test_error.description'),
      variant: "error",
    });
    // Still throw the error for debugging
    throw new Error(errorMessage);
  };

  const debugActions = [
    {
      title: t('debug.actions.refresh_system_info.title'),
      description: t('debug.actions.refresh_system_info.description'),
      icon: <RefreshCw size={14} />,
      action: () => window.location.reload(),
      variant: '3d-gradient-ocean' as const,
    },
    {
      title: t('debug.actions.clear_storage.title'),
      description: t('debug.actions.clear_storage.description'),
      icon: <Database size={14} />,
      action: handleClearStorage,
      variant: '3d-gradient-danger' as const,
    },
    {
      title: t('debug.actions.test_error.title'),
      description: t('debug.actions.test_error.description'),
      icon: <SettingsIcon size={14} />,
      action: handleTestError,
      variant: '3d-gradient-danger' as const,
    },
  ];

  if (!isDebugMode && !isDevelopment) {
    return (
      <SettingsCard
        title={t('debug.developer_mode.title')}
        description={t('debug.developer_mode.description')}
        icon={<Wrench size={16} />}
        gradient="pink"
      >
        <GlassButton
          onClick={enableDebugMode}
          variant="3d-gradient-success"
          effect="lift"
          className="w-full flex items-center justify-center gap-2 font-medium"
        >
          <SettingsIcon size={16} />
          {t('debug.developer_mode.button')}
        </GlassButton>
      </SettingsCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Information */}
      <SettingsCard
        title={t('debug.system_info.title')}
        description={t('debug.system_info.description')}
        icon={<Monitor size={16} />}
        gradient="cyan"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('debug.system_info.browser')}</span>
              <span className="font-medium">{systemInfo.userAgent.split(' ')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('debug.system_info.platform')}</span>
              <span className="font-medium">{systemInfo.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('debug.system_info.language')}</span>
              <span className="font-medium">{systemInfo.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('debug.system_info.screen')}</span>
              <span className="font-medium">{systemInfo.screenResolution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('debug.system_info.online')}</span>
              <span className={`font-medium ${systemInfo.onLine ? 'text-green-600' : 'text-red-600'}`}>
                {systemInfo.onLine ? t('debug.status.online') : t('debug.status.offline')}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('debug.system_info.memory')}</span>
              <span className="font-medium">{systemInfo.memoryUsage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('debug.system_info.connection')}</span>
              <span className="font-medium">{systemInfo.connection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('debug.system_info.local_storage')}</span>
              <span className="font-medium">{systemInfo.localStorageSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('debug.system_info.session_storage')}</span>
              <span className="font-medium">{systemInfo.sessionStorageSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('debug.system_info.timezone')}</span>
              <span className="font-medium">{systemInfo.timezone}</span>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Debug Mode Toggle */}
      <SettingsCard
        title={t('developer_mode.title')}
        description={isDevelopment ? t('developer_mode.development_description') : t('developer_mode.description')}
        icon={<Wrench size={16} />}
        gradient="pink"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={14} />
            <span className="text-sm">
              {isDebugMode ? t('developer_mode.active') : t('developer_mode.inactive')}
            </span>
          </div>
          <div className="flex gap-2">
            {isDevelopment && (
              <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                {t('developer_mode.dev_badge')}
              </div>
            )}
            <GlassButton
              onClick={isDebugMode ? disableDebugMode : enableDebugMode}
              variant={isDebugMode ? "3d-gradient-warning" : "3d-gradient-success"}
              size="sm"
              effect="lift"
              className="font-medium"
            >
              {isDebugMode ? <EyeOff size={14} /> : <Eye size={14} />}
              {isDebugMode ? t('developer_mode.disable') : t('developer_mode.enable')}
            </GlassButton>
          </div>
        </div>
      </SettingsCard>

      {/* Performance Dashboard Toggle */}
      <SettingsCard
        title={t('performance_dashboard.title')}
        description={t('performance_dashboard.description')}
        icon={<Activity size={16} />}
        gradient="blue"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} />
            <span className="text-sm">
              {showPerformanceDashboard ? t('performance_dashboard.visible') : t('performance_dashboard.hidden')}
            </span>
          </div>
          <GlassButton
            onClick={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
            variant={showPerformanceDashboard ? "3d-gradient-warning" : "3d-gradient-info"}
            size="sm"
            effect="lift"
            className="font-medium"
          >
            {showPerformanceDashboard ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPerformanceDashboard ? t('performance_dashboard.hide') : t('performance_dashboard.show')}
          </GlassButton>
        </div>
      </SettingsCard>

      {/* Performance Dashboard */}
      {showPerformanceDashboard && (
        <div className="mt-6">
          <PerformanceDashboard />
        </div>
      )}

      {/* Debug Actions */}
      <SettingsCard
        title={t('debug_actions.title')}
        description={t('debug_actions.description')}
        icon={<SettingsIcon size={16} />}
        gradient="purple"
      >
        <div className="grid grid-cols-1 gap-3">
          {debugActions.map((action, index) => (
            <GlassButton
              key={index}
              onClick={action.action}
              variant={action.variant}
              effect="lift"
              className="w-full justify-start gap-3 text-sm font-medium p-3"
            >
              {action.icon}
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs opacity-70">{action.description}</div>
              </div>
            </GlassButton>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
};

export default DebugSettings;