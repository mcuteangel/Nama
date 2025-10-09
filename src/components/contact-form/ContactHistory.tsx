import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModernLoader } from '@/components/ui/modern-loader';
import { FormSection } from '@/components/ui/FormSection';
import { FormCard } from '@/components/ui/FormCard';
import { ContactHistoryService, ContactHistoryEntry } from '@/services/contact-history-service';
import { useSession } from '@/integrations/supabase/auth';
import { Clock, User, Edit3, Plus, Trash2, History, ArrowRight, Calendar } from 'lucide-react';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';

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
        return Plus;
      case 'updated':
        return Edit3;
      case 'deleted':
        return Trash2;
      default:
        return Clock;
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
        return '#22c55e';
      case 'updated':
        return '#3b82f6';
      case 'deleted':
        return '#ef4444';
      default:
        return '#6b7280';
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
    <FormSection
      icon={History}
      title="تاریخچه تغییرات"
      description="تمام تغییرات اعمال شده روی این مخاطب را مشاهده کنید"
      className="space-y-4"
    >
      {loading ? (
        <FormCard
          title="در حال بارگذاری..."
          description="تاریخچه تغییرات در حال بارگذاری است"
          icon={ModernLoader}
          iconColor="#8b5cf6"
        >
          <div className="flex items-center justify-center py-8">
            <ModernLoader variant="spinner" size="sm" />
            <span className="mr-3 text-slate-600 dark:text-slate-400">در حال بارگذاری تاریخچه...</span>
          </div>
        </FormCard>
      ) : error ? (
        <FormCard
          title="خطا در بارگذاری"
          description={error}
          icon={Trash2}
          iconColor="#ef4444"
        >
          <div className="text-center py-8">
            <Trash2 size={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-slate-600 dark:text-slate-400">بارگذاری تاریخچه با خطا مواجه شد</p>
          </div>
        </FormCard>
      ) : history.length === 0 ? (
        <FormCard
          title="هیچ تاریخچه‌ای وجود ندارد"
          description="این مخاطب هنوز هیچ تغییری نداشته است"
          icon={History}
          iconColor="#8b5cf6"
        >
          <div className="text-center py-8">
            <History size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400">هنوز هیچ تغییری ثبت نشده است</p>
          </div>
        </FormCard>
      ) : (
        <div className="space-y-4">
          {history.map((entry, index) => {
            const ActionIcon = getActionIcon(entry.action);
            const actionColor = getActionColor(entry.action);

            return (
              <FormCard
                key={entry.id}
                title={`تغییر ${history.length - index}`}
                description={`${entry.user_email} - ${getActionLabel(entry.action)}`}
                icon={ActionIcon}
                iconColor={actionColor}
                className="group"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <User size={16} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {entry.user_email}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                    <div className="flex-1" />
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: actionColor }}
                    >
                      {getActionLabel(entry.action)}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">فیلد:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white bg-white/50 dark:bg-slate-600/50 px-2 py-1 rounded-lg">
                        {entry.field_name}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <ArrowRight size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">مقدار جدید:</span>
                          <p className="text-sm text-slate-900 dark:text-white mt-1 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-800/30 break-words">
                            {entry.new_value || 'خالی'}
                          </p>
                        </div>
                      </div>

                      {entry.old_value && (
                        <div className="flex items-start gap-2">
                          <ArrowRight size={16} className="text-red-500 mt-0.5 flex-shrink-0 rotate-180" />
                          <div className="flex-1">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">مقدار قبلی:</span>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-800/30 line-through break-words">
                              {entry.old_value}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </FormCard>
            );
          })}
        </div>
      )}
    </FormSection>
  );
};

export default ContactHistory;