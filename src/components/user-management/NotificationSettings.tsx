import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Label } from '@/components/ui/label';
import { ModernSwitch } from '@/components/ui/modern-switch';
import { 
  ModernSelect, 
  ModernSelectContent, 
  ModernSelectItem, 
  ModernSelectTrigger, 
  ModernSelectValue 
} from '@/components/ui/modern-select';
import useAppSettings from '@/hooks/use-app-settings';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface NotificationSettingsProps {
  className?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = () => {
  const { t } = useTranslation();
  const { settings, updateSettings, isLoaded, error, clearError } = useAppSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Update local settings when app settings change
  useEffect(() => {
    if (isLoaded) {
      setLocalSettings(settings);
    }
  }, [settings, isLoaded]);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      updateSettings(localSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while settings are being loaded
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading_messages.loading_settings')}</p>
        </div>
      </div>
    );
  }

  // Show error if there's an error loading settings
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">{t('errors.settings_load_error')}</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <GlassButton 
            onClick={clearError}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {t('actions.try_again')}
          </GlassButton>
        </div>
      </div>
    );
  }

  const notificationChannels = [
    {
      key: 'emailNotifications',
      label: t('settings.notifications.email'),
      description: t('settings.notifications.email_desc'),
      icon: Mail,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      key: 'pushNotifications',
      label: t('settings.notifications.push'),
      description: t('settings.notifications.push_desc'),
      icon: Bell,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      key: 'smsNotifications',
      label: t('settings.notifications.sms'),
      description: t('settings.notifications.sms_desc'),
      icon: Smartphone,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  const notificationTypes = [
    {
      key: 'contactUpdates',
      label: t('settings.notifications.contact_updates'),
      description: t('settings.notifications.contact_updates_desc'),
    },
    {
      key: 'aiSuggestions',
      label: t('settings.notifications.ai_suggestions'),
      description: t('settings.notifications.ai_suggestions_desc'),
    },
    {
      key: 'systemAlerts',
      label: t('settings.notifications.system_alerts'),
      description: t('settings.notifications.system_alerts_desc'),
    },
    {
      key: 'marketing',
      label: t('settings.notifications.marketing'),
      description: t('settings.notifications.marketing_desc'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-6"
    >
      {/* Notification Channels */}
      <ModernCard
        variant="glass"
        hover="lift"
        className="backdrop-blur-2xl border border-white/30 shadow-2xl"
      >
        <ModernCardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Bell size={20} className="text-blue-500" />
            </div>
            <div>
              <ModernCardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {t('settings.notifications.title')}
              </ModernCardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('settings.notifications.description')}
              </p>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          {notificationChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <motion.div
                key={channel.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start justify-between p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${channel.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={channel.color} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      {channel.label}
                    </Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {channel.description}
                    </p>
                  </div>
                </div>
                <ModernSwitch
                  checked={localSettings[channel.key as keyof typeof localSettings] as boolean}
                  onCheckedChange={(checked) => handleSettingChange(channel.key, checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </motion.div>
            );
          })}
        </ModernCardContent>
      </ModernCard>

      {/* Notification Types */}
      <ModernCard
        variant="glass"
        hover="lift"
        className="backdrop-blur-2xl border border-white/30 shadow-2xl"
      >
        <ModernCardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
              <MessageSquare size={20} className="text-purple-500" />
            </div>
            <div>
              <ModernCardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {t('settings.notifications.notification_types')}
              </ModernCardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('settings.notifications.notification_types_desc')}
              </p>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          {notificationTypes.map((type, index) => (
            <motion.div
              key={type.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start justify-between p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
            >
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  {type.label}
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </div>
              <ModernSwitch
                checked={localSettings[type.key as keyof typeof localSettings] as boolean || false}
                onCheckedChange={(checked) => handleSettingChange(type.key, checked)}
                className="data-[state=checked]:bg-green-500"
              />
            </motion.div>
          ))}
        </ModernCardContent>
      </ModernCard>

      {/* Frequency Settings */}
      <ModernCard
        variant="glass"
        hover="lift"
        className="backdrop-blur-2xl border border-white/30 shadow-2xl"
      >
        <ModernCardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <Smartphone size={20} className="text-green-500" />
            </div>
            <div>
              <ModernCardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {t('settings.notifications.frequency')}
              </ModernCardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('settings.notifications.frequency_desc')}
              </p>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t('settings.notifications.daily_summary')}
              </Label>
              <ModernSelect 
                value={localSettings.dailySummaryTime as string || '09:00'}
                onValueChange={(value) => handleSettingChange('dailySummaryTime', value)}
              >
                <ModernSelectTrigger 
                  variant="glass" 
                  className="w-full bg-white/30 dark:bg-gray-800/30 border border-white/30 dark:border-gray-700/30"
                >
                  <ModernSelectValue />
                </ModernSelectTrigger>
                <ModernSelectContent 
                  variant="glass" 
                  className="bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-700/30"
                >
                  <ModernSelectItem value="08:00">8:00 AM</ModernSelectItem>
                  <ModernSelectItem value="09:00">9:00 AM</ModernSelectItem>
                  <ModernSelectItem value="10:00">10:00 AM</ModernSelectItem>
                  <ModernSelectItem value="12:00">12:00 PM</ModernSelectItem>
                  <ModernSelectItem value="18:00">6:00 PM</ModernSelectItem>
                  <ModernSelectItem value="20:00">8:00 PM</ModernSelectItem>
                </ModernSelectContent>
              </ModernSelect>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {t('settings.notifications.daily_summary_desc')}
              </p>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="flex justify-center"
      >
        <ModernCard
          variant="glass"
          hover="lift"
          className="backdrop-blur-2xl border border-white/30 shadow-2xl p-6"
        >
          <div className="flex items-center justify-center gap-4">
            <GlassButton
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : saved ? (
                  <CheckCircle size={20} />
                ) : (
                  <Save size={20} />
                )}
                <span>
                  {loading
                    ? t('settings.saving')
                    : saved
                    ? t('settings.saved')
                    : t('settings.save_changes')
                  }
                </span>
              </div>
            </GlassButton>
            {saved && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-green-600 dark:text-green-400"
              >
                <CheckCircle size={16} />
                <span className="text-sm font-medium">{t('settings.changes_saved')}</span>
              </motion.div>
            )}
          </div>
        </ModernCard>
      </motion.div>
    </motion.div>
  );
};

export default NotificationSettings;