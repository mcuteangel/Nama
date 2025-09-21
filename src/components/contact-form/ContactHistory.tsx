import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModernLoader } from '@/components/ui/modern-loader';
import { ContactHistoryService, ContactHistoryEntry } from '@/services/contact-history-service';
import { useSession } from '@/integrations/supabase/auth';
import { Clock, User, Edit3, Plus, Trash2, History, ArrowRight, Calendar } from 'lucide-react';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';
import { designTokens } from '@/lib/design-tokens';

interface ContactHistoryProps {
  contactId: string;
}

const ContactHistory: React.FC<ContactHistoryProps> = ({ contactId }) => {
  const { t } = useTranslation();
  const { session } = useSession();
  useAppSettings();
  const { formatDate: formatJalaliDate } = useJalaliCalendar();
  const [history, setHistory] = useState<ContactHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const { data, error } = await ContactHistoryService.getContactHistory(contactId, session.user.id);

        if (error) {
          throw new Error(error);
        }

        if (data) {
          setHistory(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.unknown_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [contactId, session, t]);

  const getActionIcon = (action: ContactHistoryEntry['action']) => {
    switch (action) {
      case 'created':
        return <Plus size={20} className="text-green-500" />;
      case 'updated':
        return <Edit3 size={20} className="text-blue-500" />;
      case 'deleted':
        return <Trash2 size={20} className="text-red-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };

  const getActionLabel = (action: ContactHistoryEntry['action']) => {
    switch (action) {
      case 'created':
        return 'ایجاد شد';
      case 'updated':
        return 'ویرایش شد';
      case 'deleted':
        return 'حذف شد';
      default:
        return action;
    }
  };

  const getActionColor = (action: ContactHistoryEntry['action']) => {
    switch (action) {
      case 'created':
        return 'from-green-500 to-emerald-500';
      case 'updated':
        return 'from-blue-500 to-cyan-500';
      case 'deleted':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Use the Jalali calendar hook for proper formatting
      return formatJalaliDate(date, 'jYYYY/jMM/jDD HH:mm');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section with New Design */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
           style={{
             background: designTokens.gradients.purple,
             boxShadow: designTokens.shadows.glass3d
           }}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              <History size={24} className="sm:w-8 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2"
                  style={{ fontFamily: designTokens.typography.fonts.primary }}>
                تاریخچه تغییرات
              </h2>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                تمام تغییرات اعمال شده روی این مخاطب را مشاهده کنید
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <ModernLoader variant="spinner" size="lg" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl animate-pulse"></div>
              </div>
              <div className="mr-4 sm:mr-6">
                <p className="text-lg sm:text-xl font-bold text-white mb-1">در حال بارگذاری...</p>
                <p className="text-white/80 text-sm sm:text-base">تاریخچه تغییرات در حال بارگذاری است</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50/10 backdrop-blur-md border border-red-200/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-red-500/20 flex items-center justify-center shadow-lg mx-auto mb-3 sm:mb-4">
                <Trash2 size={24} className="sm:w-8 text-red-400" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-red-400 mb-2">خطا در بارگذاری</p>
              <p className="text-red-300 text-sm sm:text-base">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg mx-auto mb-4 sm:mb-6">
                <History size={32} className="sm:w-10 text-white/60" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">هیچ تاریخچه‌ای وجود ندارد</p>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg">این مخاطب هنوز هیچ تغییری نداشته است</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {history.map((entry, index) => (
                <div key={entry.id} className="group relative">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${getActionColor(entry.action)} rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>
                  <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.005] sm:hover:scale-[1.01]">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${getActionColor(entry.action)} flex items-center justify-center shadow-lg`}>
                          {getActionIcon(entry.action)}
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shadow-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-700">{history.length - index}</span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center">
                              <User size={12} className="sm:w-4 text-white" />
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base lg:text-lg truncate">
                              {entry.user_email}
                            </span>
                          </div>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r ${getActionColor(entry.action)} self-start`}>
                            {getActionLabel(entry.action)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-300">
                          <Calendar size={14} className="sm:w-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-600/30">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">فیلد:</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white bg-white/50 dark:bg-gray-600/50 px-2 py-1 rounded-lg truncate">
                              {entry.field_name}
                            </span>
                          </div>

                          <div className="flex items-start gap-2">
                            <ArrowRight size={14} className="sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">مقدار جدید:</span>
                              <p className="text-xs sm:text-sm text-gray-900 dark:text-white mt-1 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-800/30 break-words">
                                {entry.new_value || 'خالی'}
                              </p>
                            </div>
                          </div>

                          {entry.old_value && (
                            <div className="flex items-start gap-2 mt-2 sm:mt-3">
                              <ArrowRight size={14} className="sm:w-4 text-red-500 mt-0.5 flex-shrink-0 rotate-180" />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">مقدار قبلی:</span>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-800/30 line-through break-words">
                                  {entry.old_value}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactHistory;