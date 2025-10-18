import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { UserCircle, User, Edit3, LogOut, Settings } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';
import SettingsSection from './SettingsSection';
import SettingsCard from './SettingsCard';
import { useUsers } from '@/features/user-management/hooks/useUsers';
import { useSession } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';

const UserProfileSettings: React.FC = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { formatDate } = useJalaliCalendar();
  const { data: users = [] } = useUsers({ page: 1, limit: 1000, sortBy: 'created_at', sortOrder: 'desc' });
  const [stats, setStats] = useState({
    totalContacts: 0,
    successfulExports: 0,
    totalGroups: 0,
    memberSince: new Date()
  });
  const [loading, setLoading] = useState(true);

  // Load real user data and stats
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        // Find current user in users list
        const currentUser = users.find(user => user.email === session.user.email);

        // Get user creation date from user record or session
        const createdAt = currentUser?.created_at
          ? new Date(currentUser.created_at)
          : (session.user.created_at ? new Date(session.user.created_at) : new Date());

        // Get contacts count
        const { count: contactsCount } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);

        // Get groups count
        const { count: groupsCount } = await supabase
          .from('groups')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);

        // Get export history from localStorage
        const exportHistory = JSON.parse(localStorage.getItem('exportHistory') || '[]') as Array<{
          id: string;
          status: string;
          recordCount?: number;
        }>;
        const successfulExports = exportHistory.filter((item) => item.status === 'success').length;

        setStats({
          totalContacts: contactsCount || 0,
          successfulExports,
          totalGroups: groupsCount || 0,
          memberSince: createdAt
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [session, users]);

  if (loading) {
    return (
      <SettingsSection
        title={t('settings.user_profile')}
        description={t('settings.user_profile_description')}
        icon={<UserCircle size={20} />}
        variant="glass"
      >
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </SettingsSection>
    );
  }

  if (!session?.user) {
    return (
      <SettingsSection
        title={t('settings.user_profile')}
        description={t('settings.user_profile_description')}
        icon={<UserCircle size={20} />}
        variant="glass"
      >
        <SettingsCard
          title={t('common.auth_required')}
          description={t('common.auth_required_description')}
          icon={<User size={16} />}
          gradient="red"
        >
          <GlassButton
            asChild
            className="w-full group relative overflow-hidden rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200/50 dark:border-blue-700/50 hover:border-blue-300 dark:hover:border-blue-600 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
          >
            <Link to="/login" className="flex items-center justify-center gap-2">
              <User size={14} />
              {t('common.login_button')}
            </Link>
          </GlassButton>
        </SettingsCard>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title={t('settings.user_profile')}
      description={t('settings.user_profile_description')}
      icon={<UserCircle size={20} />}
      variant="glass"
    >
      <div className="space-y-6">
        {/* User Info Card */}
        <SettingsCard
          title={t('settings.profile_information')}
          description={t('settings.profile_information_description')}
          icon={<User size={16} />}
          gradient="blue"
        >
          <div className="space-y-4">
            {/* User Avatar & Basic Info */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {session.user.user_metadata?.full_name ? session.user.user_metadata.full_name.charAt(0).toUpperCase() : session.user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {session.user.user_metadata?.full_name || t('common.user')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{session.user.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('common.member_since')} {formatDate(stats.memberSince)}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
              <GlassButton
                asChild
                className="group relative overflow-hidden rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200/50 dark:border-blue-700/50 hover:border-blue-300 dark:hover:border-blue-600 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
              >
                <Link to="/profile" className="flex items-center justify-center gap-2">
                  <Edit3 size={14} />
                  {t('common.edit_profile')}
                </Link>
              </GlassButton>
            </div>
          </div>
        </SettingsCard>

        {/* Account Actions */}
        <SettingsCard
          title={t('settings.account_actions')}
          description={t('settings.account_actions_description')}
          icon={<Settings size={16} />}
          gradient="purple"
        >
          <div className="space-y-3">
            <GlassButton
              variant="outline"
              className="w-full group relative overflow-hidden rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200/50 dark:border-red-700/50 hover:border-red-300 dark:hover:border-red-600 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <LogOut size={14} />
                {t('common.logout')}
              </div>
            </GlassButton>
          </div>
        </SettingsCard>

        {/* Account Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalContacts}</div>
            <div className="text-sm text-blue-600 dark:text-blue-300">
              {stats.totalContacts === 1 ? t('contact.single') : t('contact.plural')}
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.successfulExports}</div>
            <div className="text-sm text-green-600 dark:text-green-300">{t('common.successful_exports')}</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalGroups}</div>
            <div className="text-sm text-purple-600 dark:text-purple-300">{t('common.group')}</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.floor((new Date().getTime() - stats.memberSince.getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-300">{t('common.membership_days')}</div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
};

export default UserProfileSettings;