import React, { useState } from 'react';
import { Wrench, Cpu, RefreshCw, Database, Eye, EyeOff, Settings as SettingsIcon, Activity, Monitor } from 'lucide-react';
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

  const [systemInfo] = useState({
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
  });

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
      return 'N/A';
    }
  }

  function getMemoryUsage(): string {
    // @ts-expect-error - performance.memory is not available in all browsers
    if (performance.memory) {
      // @ts-expect-error - performance.memory properties are not in TypeScript definitions
      const used = performance.memory.usedJSHeapSize / 1024 / 1024;
      // @ts-expect-error - performance.memory properties are not in TypeScript definitions
      const total = performance.memory.totalJSHeapSize / 1024 / 1024;
      return `${used.toFixed(1)}MB / ${total.toFixed(1)}MB`;
    }
    return 'N/A';
  }

  function getConnectionInfo(): string {
    // @ts-expect-error - navigator.connection is not available in all browsers
    if (navigator.connection) {
      // @ts-expect-error - navigator.connection properties are not in TypeScript definitions
      const conn = navigator.connection;
      return `${conn.effectiveType || 'unknown'} (${conn.downlink || 0} Mbps)`;
    }
    return 'N/A';
  }

  const handleClearStorage = () => {
    if (confirm('Are you sure you want to clear all local storage? This will log you out.')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const handleTestError = () => {
    console.error('🔧 Test error thrown by debug panel');
    toast({
      title: "Test Error Triggered",
      description: "A test error has been thrown for debugging purposes. Check the console for details.",
      variant: "destructive",
    });
    // Still throw the error for debugging
    throw new Error('Test error from debug panel');
  };

  const debugActions = [
    {
      title: 'Refresh System Info',
      description: 'Update technical information',
      icon: <RefreshCw size={14} />,
      action: () => window.location.reload(),
      variant: '3d-gradient-ocean' as const,
    },
    {
      title: 'Clear Storage',
      description: 'Clear localStorage & sessionStorage',
      icon: <Database size={14} />,
      action: handleClearStorage,
      variant: '3d-gradient-danger' as const,
    },
    {
      title: 'Throw Test Error',
      description: 'Trigger a test error for debugging',
      icon: <SettingsIcon size={14} />,
      action: handleTestError,
      variant: '3d-gradient-danger' as const,
    },
  ];

  if (!isDebugMode && !isDevelopment) {
    return (
      <SettingsCard
        title="Enable Developer Mode"
        description="Enable debug features and development tools"
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
          Enable Debug Mode
        </GlassButton>
      </SettingsCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Information */}
      <SettingsCard
        title="System Information"
        description="Technical details about your browser and system"
        icon={<Monitor size={16} />}
        gradient="cyan"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Browser:</span>
              <span className="font-medium">{systemInfo.userAgent.split(' ')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Platform:</span>
              <span className="font-medium">{systemInfo.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Language:</span>
              <span className="font-medium">{systemInfo.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Screen:</span>
              <span className="font-medium">{systemInfo.screenResolution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Online:</span>
              <span className={`font-medium ${systemInfo.onLine ? 'text-green-600' : 'text-red-600'}`}>
                {systemInfo.onLine ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Memory:</span>
              <span className="font-medium">{systemInfo.memoryUsage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Connection:</span>
              <span className="font-medium">{systemInfo.connection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Local Storage:</span>
              <span className="font-medium">{systemInfo.localStorageSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Session Storage:</span>
              <span className="font-medium">{systemInfo.sessionStorageSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Timezone:</span>
              <span className="font-medium">{systemInfo.timezone}</span>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Debug Mode Toggle */}
      <SettingsCard
        title="Developer Mode"
        description={isDevelopment ? "Running in development environment" : "Debug features enabled"}
        icon={<Wrench size={16} />}
        gradient="pink"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={14} />
            <span className="text-sm">
              {isDebugMode ? 'Debug Mode Active' : 'Debug Mode Disabled'}
            </span>
          </div>
          <div className="flex gap-2">
            {isDevelopment && (
              <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                DEV
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
              {isDebugMode ? 'Disable' : 'Enable'}
            </GlassButton>
          </div>
        </div>
      </SettingsCard>

      {/* Performance Dashboard Toggle */}
      <SettingsCard
        title="Performance Dashboard"
        description="Real-time Web Vitals and performance monitoring"
        icon={<Activity size={16} />}
        gradient="blue"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} />
            <span className="text-sm">
              {showPerformanceDashboard ? 'Dashboard Visible' : 'Dashboard Hidden'}
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
            {showPerformanceDashboard ? 'Hide' : 'Show'}
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
        title="Debug Actions"
        description="Quick debugging and testing tools"
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