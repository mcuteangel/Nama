import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModernCard } from '@/components/ui/modern-card';
import { ModernLoader } from '@/components/ui/modern-loader';
import { ContactHistoryService, ContactHistoryEntry } from '@/services/contact-history-service';
import { useSession } from '@/integrations/supabase/auth';
import { Clock, User, Edit3, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { useAppSettings } from '@/hooks/use-app-settings';

interface ContactHistoryProps {
  contactId: string;
}

const ContactHistory: React.FC<ContactHistoryProps> = ({ contactId }) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { settings } = useAppSettings();
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
        return <Plus size={16} className="text-green-500" />;
      case 'updated':
        return <Edit3 size={16} className="text-blue-500" />;
      case 'deleted':
        return <Trash2 size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getActionLabel = (action: ContactHistoryEntry['action']) => {
    switch (action) {
      case 'created':
        return t('contact_history.created');
      case 'updated':
        return t('contact_history.updated');
      case 'deleted':
        return t('contact_history.deleted');
      default:
        return action;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Use Jalali calendar if enabled
      if (settings.calendarType === 'jalali') {
        // For simplicity, we're using Gregorian formatting here
        // In a real implementation, you would use a Jalali date library
        return format(date, 'PPP p', { locale: faIR });
      }
      return format(date, 'PPP p');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <ModernCard variant="glass" className="p-6">
        <div className="flex justify-center items-center h-32">
          <ModernLoader variant="spinner" size="lg" />
        </div>
      </ModernCard>
    );
  }

  if (error) {
    return (
      <ModernCard variant="glass" className="p-6">
        <div className="text-center text-red-500 dark:text-red-400">
          <p>{error}</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <ModernCard variant="glass" className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Clock size={20} />
        {t('contact_history.title')}
      </h2>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t('contact_history.no_history')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div 
              key={entry.id} 
              className="flex items-start gap-4 p-4 rounded-xl bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors duration-200"
            >
              <div className="mt-1">
                {getActionIcon(entry.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {entry.user_email}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getActionLabel(entry.action)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(entry.timestamp)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {entry.field_name}: {entry.new_value}
                </div>
                
                {entry.old_value && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-through">
                    {t('contact_history.previous_value')}: {entry.old_value}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ModernCard>
  );
};

export default ContactHistory;