import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { useSession } from "@/integrations/supabase/auth";
import { ErrorManager } from "@/lib/error-manager";
import { invalidateCache } from '@/utils/cache-helpers';
import { DuplicateContactService } from '@/services/contact/duplicateService';
import { DuplicatePair, DuplicateManagementStats, DuplicateContact } from '@/types/contact.types';

export interface UseDuplicateContactManagementReturn {
  duplicatePairs: DuplicatePair[];
  isScanning: boolean;
  hoveredPair: string | null;
  stats: DuplicateManagementStats;
  isLoading: boolean;
  setHoveredPair: (id: string | null) => void;
  fetchDuplicates: () => Promise<void>;
  mergeContacts: (mainContact: DuplicateContact, duplicateContact: DuplicateContact) => Promise<void>;
  discardDuplicate: (duplicateId: string) => void;
}

export const useDuplicateContactManagement = (): UseDuplicateContactManagementReturn => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();

  const [duplicatePairs, setDuplicatePairs] = useState<DuplicatePair[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hoveredPair, setHoveredPair] = useState<string | null>(null);

  // محاسبه آمار پیشرفته
  const stats: DuplicateManagementStats = DuplicateContactService.calculateStats(duplicatePairs);

  const fetchDuplicates = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setDuplicatePairs([]);
      return;
    }

    setIsScanning(true);
    const result = await DuplicateContactService.fetchContactsForDuplicates(session.user.id);

    if (result.error) {
      ErrorManager.logError(new Error(result.error), {
        component: 'useDuplicateContactManagement',
        action: 'fetchDuplicates'
      });
      ErrorManager.notifyUser(t('ai_suggestions.error_fetching_contacts_for_duplicates'), 'error');
      setIsScanning(false);
    } else if (result.data) {
      const duplicates = DuplicateContactService.findDuplicates(result.data);
      setDuplicatePairs(duplicates);
      setIsScanning(false);

      if (duplicates.length === 0) {
        ErrorManager.notifyUser(t('ai_suggestions.no_duplicates_found'), 'info');
      } else {
        ErrorManager.notifyUser(t('ai_suggestions.duplicates_found', { count: duplicates.length }), 'warning');
      }
    }
  }, [session, isSessionLoading, t]);

  const mergeContacts = useCallback(async (mainContact: DuplicateContact, duplicateContact: DuplicateContact) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      return;
    }

    ErrorManager.notifyUser(t('ai_suggestions.merging_contacts'), 'info');

    const result = await DuplicateContactService.mergeContacts(mainContact, duplicateContact, session.user.id);

    if (result.error) {
      ErrorManager.notifyUser(`${t('ai_suggestions.error_merging_contacts')}: ${result.error}`, 'error');
    } else {
      ErrorManager.notifyUser(t('ai_suggestions.contacts_merged_success'), 'success');
      invalidateCache(`contacts_list_${session.user.id}_`);
      invalidateCache(`statistics_dashboard_${session.user.id}`);
      fetchDuplicates();
    }
  }, [session, t, fetchDuplicates]);

  const discardDuplicate = useCallback((duplicateId: string) => {
    setDuplicatePairs(prev => prev.filter(pair => pair.duplicateContact.id !== duplicateId));
    ErrorManager.notifyUser(t('ai_suggestions.duplicate_discarded'), 'info');
  }, [t]);

  useEffect(() => {
    fetchDuplicates();
  }, [fetchDuplicates]);

  return {
    duplicatePairs,
    isScanning,
    hoveredPair,
    stats,
    isLoading: isSessionLoading,
    setHoveredPair,
    fetchDuplicates,
    mergeContacts,
    discardDuplicate,
  };
};
