import React from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Switch } from '@/components/ui/switch';
import { GlassButton } from "@/components/ui/glass-button";
import { Bug, Info, Zap, TestTube, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDebugMode } from '@/hooks/use-debug-mode';
import { EdgeFunctionDebugger } from '@/utils/edge-function-debugger';
import { ErrorManager } from '@/lib/error-manager';

const DebugSettings: React.FC = () => {
  const { t } = useTranslation();
  const { isDebugMode, toggleDebugMode, isDevelopment } = useDebugMode();

  // Only show in development environment
  if (!isDevelopment) {
    return null;
  }

  const handleTestConnection = async () => {
    ErrorManager.notifyUser('🔍 شروع تست اتصال...', 'info');
    
    const result = await EdgeFunctionDebugger.testConnection();
    const directResult = await EdgeFunctionDebugger.testDirectFetch();
    
    console.log('🔧 Debug test results:', { connection: result, direct: directResult });
    
    if (result.success) {
      ErrorManager.notifyUser(
        `✅ اتصال موفق - ${result.details.usersCount || 0} کاربر یافت شد`,
        'success'
      );
    } else {
      ErrorManager.notifyUser(
        `❌ خطا: ${result.details.error}`,
        'error'
      );
    }
  };

  const handleClearCache = () => {
    // Clear all localStorage items that start with cache key prefixes
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('user_list_') || key.includes('cache_'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    ErrorManager.notifyUser(`🗑️ ${keysToRemove.length} آیتم cache پاک شد`, 'success');
    console.log('🧹 Cleared cache keys:', keysToRemove);
  };

  const handleShowStorageInfo = () => {
    const storageInfo = {
      localStorage: {
        length: localStorage.length,
        keys: Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
          .filter(Boolean) as string[]
      },
      sessionStorage: {
        length: sessionStorage.length,
        keys: Array.from({ length: sessionStorage.length }, (_, i) => sessionStorage.key(i))
          .filter(Boolean) as string[]
      }
    };
    
    console.log('💾 Storage Information:', storageInfo);
    ErrorManager.notifyUser('اطلاعات Storage در Console نمایش داده شد', 'info');
  };

  const debugTools = [
    {
      icon: <Bug size={14} />,
      label: 'تست Edge Function',
      action: handleTestConnection,
      color: 'border-orange-200 hover:bg-orange-100'
    },
    {
      icon: <Zap size={14} />,
      label: 'پاک کردن Cache',
      action: handleClearCache,
      color: 'border-orange-200 hover:bg-orange-100'
    },
    {
      icon: <Info size={14} />,
      label: 'اطلاعات Storage',
      action: handleShowStorageInfo,
      color: 'border-orange-200 hover:bg-orange-100'
    }
  ];

  return (
    <ModernCard variant="glass" className="w-full rounded-xl p-6">
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <Cpu size={20} />
          {t('settings.debug_mode', 'حالت دیباگ')}
          <span className="text-xs bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded-full">
            DEV ONLY
          </span>
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {/* Debug Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-orange-500" />
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {t('settings.enable_debug_mode', 'فعال‌سازی حالت دیباگ')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.debug_mode_description', 'نمایش ابزارهای تشخیص عیب در کامپوننت‌ها')}
              </p>
            </div>
          </div>
          <Switch
            checked={isDebugMode}
            onCheckedChange={toggleDebugMode}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>

        {/* Debug Tools - Only show when debug mode is enabled */}
        {isDebugMode && (
          <div className="space-y-3 p-3 border-l-4 border-orange-300 bg-orange-50 dark:bg-orange-950 rounded-r-lg">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200 flex items-center gap-2">
              <TestTube size={16} />
              ابزارهای تشخیص عیب
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {debugTools.map((tool, index) => (
                <GlassButton
                  key={index}
                  onClick={tool.action}
                  variant="outline"
                  size="sm"
                  className={`justify-start ${tool.color}`}
                >
                  {tool.icon}
                  <span className="ms-2">{tool.label}</span>
                </GlassButton>
              ))}
            </div>
            
            <div className="text-xs text-orange-700 dark:text-orange-300 mt-2">
              💡 همه نتایج در Browser Console نمایش داده می‌شوند
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          ⚠️ این تنظیمات فقط در محیط Development در دسترس هستند
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};

export default DebugSettings;