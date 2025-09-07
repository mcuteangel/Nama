import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/modern-input';
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  User,
  Mail,
  Phone,
  Save,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ProfileSettingsProps {}

const ProfileSettings: React.FC<ProfileSettingsProps> = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    darkMode: false,
    language: i18n.language,
    timezone: 'Asia/Tehran',
    twoFactorAuth: false,
    profileVisibility: 'public',
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Determine if we're in RTL mode
  const isRTL = React.useMemo(() => i18n.dir() === 'rtl', [i18n]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
          key: 'darkMode',
          label: t('settings.appearance.theme'),
          type: 'toggle',
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
                        <GlassButton
                          variant={settings[item.key as keyof typeof settings] ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleSettingChange(item.key, !settings[item.key as keyof typeof settings])}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                            settings[item.key as keyof typeof settings]
                              ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                              : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          {settings[item.key as keyof typeof settings] ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle size={14} />
                              <span className="text-xs">{t('settings.enabled')}</span>
                            </div>
                          ) : (
                            <span className="text-xs">{t('settings.disabled')}</span>
                          )}
                        </GlassButton>
                      )}
                      {item.type === 'select' && (
                        <select
                          value={settings[item.key as keyof typeof settings] as string}
                          onChange={(e) => handleSettingChange(item.key, e.target.value)}
                          className="px-3 py-2 bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-sm text-gray-800 dark:text-gray-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        >
                          {item.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
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