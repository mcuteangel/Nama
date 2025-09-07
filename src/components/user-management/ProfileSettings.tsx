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
  Sun,
  Shield,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProfileSettingsProps {
  className?: string;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = () => {
  const { t, i18n } = useTranslation();
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

  const settingGroups = [
    {
      title: t('settings.notifications.title'),
      icon: Bell,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      items: [
        {
          key: 'emailNotifications',
          label: t('settings.notifications.email'),
          type: 'toggle',
          description: t('settings.notifications.email_desc'),
        },
        {
          key: 'pushNotifications',
          label: t('settings.notifications.push'),
          type: 'toggle',
          description: t('settings.notifications.push_desc'),
        },
        {
          key: 'smsNotifications',
          label: t('settings.notifications.sms'),
          type: 'toggle',
          description: t('settings.notifications.sms_desc'),
        },
      ],
    },
    {
      title: t('settings.appearance.title'),
      icon: Sun,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      items: [
        {
          key: 'theme',
          label: t('settings.appearance.theme'),
          type: 'select',
          options: [
            { value: 'system', label: t('settings.appearance.system') },
            { value: 'light', label: t('settings.appearance.light') },
            { value: 'dark', label: t('settings.appearance.dark') },
          ],
          description: t('settings.appearance.theme_desc'),
        },
        {
          key: 'language',
          label: t('settings.appearance.language'),
          type: 'select',
          options: [
            { value: 'en', label: 'English' },
            { value: 'fa', label: 'فارسی' },
          ],
          description: t('settings.appearance.language_desc'),
        },
        {
          key: 'calendarType',
          label: t('settings.appearance.calendar'),
          type: 'select',
          options: [
            { value: 'jalali', label: t('settings.appearance.jalali') },
            { value: 'gregorian', label: t('settings.appearance.gregorian') },
          ],
          description: t('settings.appearance.calendar_desc'),
        },
      ],
    },
    {
      title: t('settings.privacy.title'),
      icon: Shield,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      items: [
        {
          key: 'profileVisibility',
          label: t('settings.privacy.visibility'),
          type: 'select',
          options: [
            { value: 'public', label: t('settings.privacy.public') },
            { value: 'private', label: t('settings.privacy.private') },
            { value: 'contacts', label: t('settings.privacy.contacts') },
          ],
          description: t('settings.privacy.visibility_desc'),
        },
        {
          key: 'twoFactorAuth',
          label: t('settings.privacy.two_factor'),
          type: 'toggle',
          description: t('settings.privacy.two_factor_desc'),
        },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-6"
    >
      {settingGroups.map((group, groupIndex) => {
        const GroupIcon = group.icon;
        return (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
          >
            <ModernCard
              variant="glass"
              hover="lift"
              className="backdrop-blur-2xl border border-white/30 shadow-2xl"
            >
              <ModernCardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${group.bgColor} rounded-xl flex items-center justify-center`}>
                    <GroupIcon size={20} className={group.color} />
                  </div>
                  <div>
                    <ModernCardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {group.title}
                    </ModernCardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('settings.group_description', { group: group.title.toLowerCase() })}
                    </p>
                  </div>
                </div>
              </ModernCardHeader>
              <ModernCardContent className="space-y-6">
                {group.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (groupIndex * 0.1) + (itemIndex * 0.05) }}
                    className="flex items-start justify-between p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        {item.label}
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {item.type === 'toggle' && (
                        <ModernSwitch
                          checked={localSettings[item.key as keyof typeof localSettings] as boolean}
                          onCheckedChange={(checked) => handleSettingChange(item.key, checked)}
                          className="data-[state=checked]:bg-green-500"
                        />
                      )}
                      {item.type === 'select' && (
                        <ModernSelect 
                          value={localSettings[item.key as keyof typeof localSettings] as string}
                          onValueChange={(value) => handleSettingChange(item.key, value)}
                        >
                          <ModernSelectTrigger 
                            variant="glass" 
                            className="w-40 bg-white/30 dark:bg-gray-800/30 border border-white/30 dark:border-gray-700/30"
                          >
                            <ModernSelectValue />
                          </ModernSelectTrigger>
                          <ModernSelectContent 
                            variant="glass" 
                            className="bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-700/30"
                          >
                            {item.options?.map((option) => (
                              <ModernSelectItem 
                                key={option.value} 
                                value={option.value}
                                className="hover:bg-white/20 dark:hover:bg-gray-700/50"
                              >
                                {option.label}
                              </ModernSelectItem>
                            ))}
                          </ModernSelectContent>
                        </ModernSelect>
                      )}
                    </div>
                  </motion.div>
                ))}
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        );
      })}

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

export default ProfileSettings;