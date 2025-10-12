import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Trash2, History, User, ArrowRight } from 'lucide-react';
import { FormCard } from '@/components/ui/FormCard';
import { FormSection } from '@/components/ui/FormSection';
import { ContactHistoryService, ContactHistoryEntry } from '@/services/contact-history-service';
import { useSession } from '@/integrations/supabase/auth';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';

interface ContactHistoryProps {
  contactId: string;
}

const ContactHistory: React.FC<ContactHistoryProps> = ({ contactId }) => {
  const { t } = useTranslation();
  const { session } = useSession();
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
          // Update user_email with actual session user email
          const updatedData = data.map(entry => ({
            ...entry,
            user_email: session.user?.email || 'کاربر ناشناس'
          }));
          setHistory(updatedData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.unknown_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [contactId, session, t]);

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
      return formatJalaliDate(date, 'jYYYY/jMM/jDD HH:mm');
    } catch {
      return dateString;
    }
  };

  return (
    <FormCard
      title="تاریخچه تغییرات"
      description="تمام تغییرات اعمال شده روی این مخاطب را مشاهده کنید"
      icon={History}
      iconColor="#8b5cf6"
    >
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Clock size={24} className="mx-auto mb-2 opacity-50 animate-pulse" />
            <p className="text-sm">در حال بارگذاری تاریخچه...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Trash2 size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">بارگذاری تاریخچه با خطا مواجه شد</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <History size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">هنوز هیچ تغییری ثبت نشده است</p>
          </div>
        ) : (
          <>
            {history.map((entry) => {
              const actionColor = getActionColor(entry.action);

              return (
                <FormSection
                  key={entry.id}
                  variant="card"
                  title=""
                  className="relative"
                >
                  {/* Header with user info and action */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <User size={16} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {entry.user_email}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                    <div
                      className="px-2 py-1 rounded-xl text-xs font-bold text-white"
                      style={{ backgroundColor: actionColor }}
                    >
                      {getActionLabel(entry.action)}
                    </div>
                  </div>

                  {/* Field changes */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">فیلد:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white bg-white/50 dark:bg-slate-600/50 px-2 py-1 rounded-xl">
                        {entry.field_name}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <ArrowRight size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">مقدار جدید:</span>
                          <p className="text-sm text-slate-900 dark:text-white mt-1 bg-green-50 dark:bg-green-900/20 p-2 rounded-xl border border-green-200 dark:border-green-800/30 break-words">
                            {entry.new_value || 'خالی'}
                          </p>
                        </div>
                      </div>

                      {entry.old_value && (
                        <div className="flex items-start gap-2">
                          <ArrowRight size={14} className="text-red-500 mt-0.5 flex-shrink-0 rotate-180" />
                          <div className="flex-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">مقدار قبلی:</span>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-xl border border-red-200 dark:border-red-800/30 line-through break-words">
                              {entry.old_value}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </FormSection>
              );
            })}
          </>
        )}
      </div>
    </FormCard>
  );
};

export default ContactHistory;