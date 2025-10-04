import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Copy, Merge, XCircle, Info, AlertTriangle, Zap, TrendingUp, Target, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import LoadingMessage from "./common/LoadingMessage";
import { supabase } from '@/integrations/supabase/client';
import { invalidateCache } from '@/utils/cache-helpers';
import { ContactCrudService } from '@/services/contact-crud-service';
import EmptyState from './common/EmptyState';
import LoadingSpinner from './common/LoadingSpinner';
import { GlassButton } from "@/components/ui/glass-button";
import AIBaseCard from './ai/AIBaseCard';

interface DuplicateContact {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: Array<{ email_address: string }>;
  phone_numbers: Array<{ phone_number: string }>;
  company?: string;
  position?: string;
  notes?: string;
  avatar_url?: string;
}

interface FullContactData {
  id: string;
  first_name: string;
  last_name: string;
  company?: string;
  position?: string;
  notes?: string;
  avatar_url?: string;
  birthday?: string;
  preferred_contact_method?: string;
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  email_addresses: Array<{ id?: string; email_address: string; contact_id: string }>;
  phone_numbers: Array<{ id?: string; phone_number: string; contact_id: string }>;
  social_links: Array<{ id?: string; url: string; contact_id: string }>;
  contact_groups: Array<{ id?: string; group_id: string; contact_id: string }>;
  custom_fields: Array<{ id?: string; template_id: string; contact_id: string }>;
}

type PhoneNumber = { id?: string; phone_number: string; contact_id: string };
type EmailAddress = { id?: string; email_address: string; contact_id: string };
type SocialLink = { id?: string; url: string; contact_id: string };
type ContactGroup = { id?: string; group_id: string; contact_id: string };
type CustomField = { id?: string; template_id: string; contact_id: string };

interface DuplicatePair {
  mainContact: DuplicateContact;
  duplicateContact: DuplicateContact;
  reason: string;
}

const DuplicateContactManagement: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();

  const [duplicatePairs, setDuplicatePairs] = useState<DuplicatePair[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hoveredPair, setHoveredPair] = useState<string | null>(null);

  // محاسبه آمار پیشرفته با useMemo برای عملکرد بهتر
  const stats = useMemo(() => ({
    total: duplicatePairs.length,
    highConfidence: duplicatePairs.filter(p =>
      p.reason.includes('name') && (p.reason.includes('email') || p.reason.includes('phone'))
    ).length,
    mediumConfidence: duplicatePairs.filter(p =>
      p.reason.includes('email') || p.reason.includes('phone')
    ).length - duplicatePairs.filter(p =>
      p.reason.includes('name') && (p.reason.includes('email') || p.reason.includes('phone'))
    ).length,
  }), [duplicatePairs]);

  const findDuplicates = useCallback((contacts: DuplicateContact[]) => {
    const duplicates: DuplicatePair[] = [];
    const processedContactIds = new Set<string>();

    for (let i = 0; i < contacts.length; i++) {
      if (processedContactIds.has(contacts[i].id)) continue;

      for (let j = i + 1; j < contacts.length; j++) {
        if (processedContactIds.has(contacts[j].id)) continue;

        const contact1 = contacts[i];
        const contact2 = contacts[j];
        let reason = '';

        const namesMatch = contact1.first_name === contact2.first_name && contact1.last_name === contact2.last_name;
        const emailsOverlap = contact1.email_addresses.some(e1 => contact2.email_addresses.some(e2 => e1.email_address === e2.email_address));
        const phonesOverlap = contact1.phone_numbers.some(p1 => contact2.phone_numbers.some(p2 => p1.phone_number === p2.phone_number));

        if (namesMatch && (emailsOverlap || phonesOverlap)) {
          reason = t('ai_suggestions.duplicate_reason_name_email_phone');
        } else if (emailsOverlap) {
          reason = t('ai_suggestions.duplicate_reason_email');
        } else if (phonesOverlap) {
          reason = t('ai_suggestions.duplicate_reason_phone');
        }

        if (reason) {
          duplicates.push({
            mainContact: contact1,
            duplicateContact: contact2,
            reason: reason,
          });
          processedContactIds.add(contact1.id);
          processedContactIds.add(contact2.id);
        }
      }
    }
    setDuplicatePairs(duplicates);
    setIsScanning(false);
    if (duplicates.length === 0) {
      ErrorManager.notifyUser(t('ai_suggestions.no_duplicates_found'), 'info');
    } else {
      ErrorManager.notifyUser(t('ai_suggestions.duplicates_found', { count: duplicates.length }), 'warning');
    }
  }, [t]);

  const onSuccessFetchContacts = useCallback((result: { data: DuplicateContact[] | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      findDuplicates(result.data);
    }
  }, [findDuplicates]);

  const onErrorFetchContacts = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'DuplicateContactManagement', action: 'fetchAllContactsForDuplicates' });
    ErrorManager.notifyUser(t('ai_suggestions.error_fetching_contacts_for_duplicates'), 'error');
  }, [t]);

  const {
    isLoading: isLoadingContacts,
    executeAsync: executeFetchContacts,
  } = useErrorHandler(null, {
    showToast: false,
    onSuccess: onSuccessFetchContacts,
    onError: onErrorFetchContacts,
  });

  const fetchAllContactsForDuplicates = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setDuplicatePairs([]);
      return;
    }

    setIsScanning(true);
    await executeFetchContacts(async () => {
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          id,
          first_name,
          last_name,
          company,
          position,
          notes,
          avatar_url,
          email_addresses(email_address),
          phone_numbers(phone_number)
        `)
        .eq('user_id', session.user.id);

      if (contactsError) throw new Error(contactsError.message);

      return { data: contacts as DuplicateContact[], error: null, fromCache: false };
    });
    setIsScanning(false);
  }, [session, isSessionLoading, executeFetchContacts]);

  useEffect(() => {
    fetchAllContactsForDuplicates();
  }, [fetchAllContactsForDuplicates]);

  const handleMergeContacts = useCallback(async (mainContact: DuplicateContact, duplicateContact: DuplicateContact) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      return;
    }

    ErrorManager.notifyUser(t('ai_suggestions.merging_contacts'), 'info');
    try {
      const { data: mainContactFull, error: mainError } = await supabase
        .from('contacts')
        .select(`
          *,
          email_addresses(*),
          phone_numbers(*),
          social_links(*),
          contact_groups(*),
          custom_fields(*)
        `)
        .eq('id', mainContact.id)
        .single();

      const { data: duplicateContactFull, error: duplicateError } = await supabase
        .from('contacts')
        .select(`
          *,
          email_addresses(*),
          phone_numbers(*),
          social_links(*),
          contact_groups(*),
          custom_fields(*)
        `)
        .eq('id', duplicateContact.id)
        .single();

      if (mainError || duplicateError || !mainContactFull || !duplicateContactFull) {
        throw new Error(mainError?.message || duplicateError?.message || 'Failed to fetch full contact details for merging.');
      }

      const mergedData: FullContactData = { ...mainContactFull };

      if (!mergedData.company && duplicateContactFull.company) mergedData.company = duplicateContactFull.company;
      if (!mergedData.position && duplicateContactFull.position) mergedData.position = duplicateContactFull.position;
      if (!mergedData.notes && duplicateContactFull.notes) mergedData.notes = duplicateContactFull.notes;
      if (!mergedData.avatar_url && duplicateContactFull.avatar_url) mergedData.avatar_url = duplicateContactFull.avatar_url;
      if (!mergedData.birthday && duplicateContactFull.birthday) mergedData.birthday = duplicateContactFull.birthday;
      if (!mergedData.preferred_contact_method && duplicateContactFull.preferred_contact_method) mergedData.preferred_contact_method = duplicateContactFull.preferred_contact_method;
      if (!mergedData.street && duplicateContactFull.street) mergedData.street = duplicateContactFull.street;
      if (!mergedData.city && duplicateContactFull.city) mergedData.city = duplicateContactFull.city;
      if (!mergedData.state && duplicateContactFull.state) mergedData.state = duplicateContactFull.state;
      if (!mergedData.zip_code && duplicateContactFull.zip_code) mergedData.zip_code = duplicateContactFull.zip_code;
      if (!mergedData.country && duplicateContactFull.country) mergedData.country = duplicateContactFull.country;


      const mergedPhoneNumbers = [...mainContactFull.phone_numbers];
      duplicateContactFull.phone_numbers.forEach((dp: PhoneNumber) => {
        if (!mergedPhoneNumbers.some((mp: PhoneNumber) => mp.phone_number === dp.phone_number)) {
          mergedPhoneNumbers.push({ ...dp, contact_id: mainContact.id });
        }
      });

      const mergedEmailAddresses = [...mainContactFull.email_addresses];
      duplicateContactFull.email_addresses.forEach((de: EmailAddress) => {
        if (!mergedEmailAddresses.some((me: EmailAddress) => me.email_address === de.email_address)) {
          mergedEmailAddresses.push({ ...de, contact_id: mainContact.id });
        }
      });

      const mergedSocialLinks = [...mainContactFull.social_links];
      duplicateContactFull.social_links.forEach((ds: SocialLink) => {
        if (!mergedSocialLinks.some((ms: SocialLink) => ms.url === ds.url)) {
          mergedSocialLinks.push({ ...ds, contact_id: mainContact.id });
        }
      });

      const mergedContactGroups = [...mainContactFull.contact_groups];
      duplicateContactFull.contact_groups.forEach((dg: ContactGroup) => {
        if (!mergedContactGroups.some((mg: ContactGroup) => mg.group_id === dg.group_id)) {
          mergedContactGroups.push({ ...dg, contact_id: mainContact.id });
        }
      });

      const mergedCustomFields = [...mainContactFull.custom_fields];
      duplicateContactFull.custom_fields.forEach((dcf: CustomField) => {
        if (!mergedCustomFields.some((mcf: CustomField) => mcf.template_id === dcf.template_id)) {
          mergedCustomFields.push({ ...dcf, contact_id: mainContact.id });
        }
      });

      const { error: updateMainError } = await supabase
        .from('contacts')
        .update({
          company: mergedData.company,
          position: mergedData.position,
          notes: mergedData.notes,
          avatar_url: mergedData.avatar_url,
          birthday: mergedData.birthday,
          preferred_contact_method: mergedData.preferred_contact_method,
          street: mergedData.street,
          city: mergedData.city,
          state: mergedData.state,
          zip_code: mergedData.zip_code,
          country: mergedData.country,
        })
        .eq('id', mainContact.id)
        .eq('user_id', session.user.id);

      if (updateMainError) throw new Error(updateMainError.message);

      await Promise.all([
        supabase.from('phone_numbers').delete().eq('contact_id', mainContact.id).eq('user_id', session.user.id),
        supabase.from('email_addresses').delete().eq('contact_id', mainContact.id).eq('user_id', session.user.id),
        supabase.from('social_links').delete().eq('contact_id', mainContact.id).eq('user_id', session.user.id),
        supabase.from('contact_groups').delete().eq('contact_id', mainContact.id).eq('user_id', session.user.id),
        supabase.from('custom_fields').delete().eq('contact_id', mainContact.id).eq('user_id', session.user.id),
      ]);

      await Promise.all([
        mergedPhoneNumbers.length > 0 ? supabase.from('phone_numbers').insert(mergedPhoneNumbers.map(p => ({ ...p, id: undefined }))) : Promise.resolve(),
        mergedEmailAddresses.length > 0 ? supabase.from('email_addresses').insert(mergedEmailAddresses.map(e => ({ ...e, id: undefined }))) : Promise.resolve(),
        mergedSocialLinks.length > 0 ? supabase.from('social_links').insert(mergedSocialLinks.map(s => ({ ...s, id: undefined }))) : Promise.resolve(),
        mergedContactGroups.length > 0 ? supabase.from('contact_groups').insert(mergedContactGroups.map(cg => ({ ...cg, id: undefined }))) : Promise.resolve(),
        mergedCustomFields.length > 0 ? supabase.from('custom_fields').insert(mergedCustomFields.map(cf => ({ ...cf, id: undefined }))) : Promise.resolve(),
      ]);

      const { error: deleteDuplicateError } = await ContactCrudService.deleteContact(duplicateContact.id);

      if (deleteDuplicateError) throw new Error(deleteDuplicateError);

      ErrorManager.notifyUser(t('ai_suggestions.contacts_merged_success'), 'success');
      invalidateCache(`contacts_list_${session.user.id}_`);
      invalidateCache(`statistics_dashboard_${session.user.id}`);
      fetchAllContactsForDuplicates();
    } catch (err: unknown) {
      ErrorManager.logError(err, { component: 'DuplicateContactManagement', action: 'mergeContacts', mainContact, duplicateContact });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_merging_contacts')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    }
  }, [session, t, fetchAllContactsForDuplicates]);

  const handleDiscardDuplicate = useCallback((duplicateId: string) => {
    setDuplicatePairs(prev => prev.filter(pair => pair.duplicateContact.id !== duplicateId));
    ErrorManager.notifyUser(t('ai_suggestions.duplicate_discarded'), 'info');
  }, [t]);

  if (isSessionLoading || isLoadingContacts) {
    return <LoadingMessage message={t('ai_suggestions.loading_duplicate_management_data')} />;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-br from-orange-50/60 via-red-50/40 to-pink-50/20 dark:from-orange-900/20 dark:via-red-900/10 dark:to-pink-900/5 rounded-3xl p-6 border-2 border-orange-200/30 dark:border-orange-800/30 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5"></div>
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl transform transition-all duration-300 hover:scale-110">
              <Copy size={32} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {t('ai_suggestions.duplicate_contact_management_title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('ai_suggestions.duplicate_contact_management_description')}
            </p>
          </div>
        </div>

        {/* Enhanced Statistics */}
        {stats.total > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20 rounded-2xl p-4 border border-orange-200/30 dark:border-orange-800/30 backdrop-blur-sm text-center">
              <Activity size={24} className="text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.total}</div>
              <div className="text-sm text-orange-500 dark:text-orange-300">{t('common.total', 'کل')}</div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 rounded-2xl p-4 border border-red-200/30 dark:border-red-800/30 backdrop-blur-sm text-center">
              <TrendingUp size={24} className="text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.highConfidence}</div>
              <div className="text-sm text-red-500 dark:text-red-300">{t('ai_suggestions.high_confidence', 'بالا')}</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 dark:from-yellow-500/20 dark:to-yellow-600/20 rounded-2xl p-4 border border-yellow-200/30 dark:border-yellow-800/30 backdrop-blur-sm text-center">
              <Target size={24} className="text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.mediumConfidence}</div>
              <div className="text-sm text-yellow-500 dark:text-yellow-300">{t('ai_suggestions.medium_confidence', 'متوسط')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Scan Button */}
      <GlassButton
        onClick={fetchAllContactsForDuplicates}
        disabled={isScanning}
        variant="gradient-primary"
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm"
        aria-label={t('ai_suggestions.scan_for_duplicates')}
      >
        {isScanning ? (
          <LoadingSpinner size={14} />
        ) : (
          <Merge size={14} />
        )}
        {t('ai_suggestions.scan_for_duplicates')}
      </GlassButton>

      {/* Scanning Animation */}
      {isScanning && (
        <div className="bg-gradient-to-r from-orange-50/60 to-red-50/60 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200/30 dark:border-orange-800/30 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Copy size={32} className="text-orange-500 animate-pulse" />
              <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {t('ai_suggestions.scanning_contacts', 'در حال اسکن مخاطبین')}
              </h3>
              <p className="text-sm text-orange-500 dark:text-orange-300">
                {t('ai_suggestions.analyzing_duplicates', 'در حال تحلیل تکراری‌ها...')}
              </p>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('ai_suggestions.processing_step', 'مرحله: مقایسه اطلاعات مخاطبین')}
          </p>
        </div>
      )}

      {duplicatePairs.length === 0 && !isScanning && (
        <EmptyState
          icon={Copy}
          title={t('ai_suggestions.no_duplicates_found')}
          description={t('ai_suggestions.no_duplicates_found_description')}
        />
      )}

      {duplicatePairs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50/60 to-orange-50/60 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl border border-red-200/30 dark:border-red-800/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-red-500 animate-pulse" />
              <div>
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {t('ai_suggestions.pending_duplicate_suggestions')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('ai_suggestions.duplicates_detected', 'تکراری‌های شناسایی شده نیاز به بررسی دارند')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-semibold">
                {duplicatePairs.length}
              </div>
              <Zap size={20} className="text-red-500" />
            </div>
          </div>

          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {duplicatePairs.map((pair, index) => (
              <div
                key={index}
                className={`
                  group bg-gradient-to-r from-white/60 via-white/40 to-white/20
                  dark:from-gray-800/60 dark:via-gray-700/40 dark:to-gray-600/20
                  p-6 rounded-2xl border-2 backdrop-blur-sm shadow-lg
                  transition-all duration-500 ease-out
                  hover:shadow-2xl hover:shadow-red-500/20 hover:scale-[1.02]
                  ${hoveredPair === pair.mainContact.id ? 'border-red-300/70 shadow-red-500/30' : 'border-white/40 dark:border-gray-600/40'}
                  animate-slide-in
                `}
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredPair(pair.mainContact.id)}
                onMouseLeave={() => setHoveredPair(null)}
                role="region"
                aria-labelledby={`duplicate-${index}`}
              >
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 mb-4">
                  <Info size={14} className="text-blue-500" />
                  <span id={`duplicate-${index}`} className="font-semibold">{t('ai_suggestions.duplicate_reason')}: {pair.reason}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-blue-200/30 dark:border-blue-800/30 rounded-xl bg-gradient-to-br from-blue-50/30 to-blue-100/20 dark:from-blue-900/20 dark:to-blue-800/10">
                    <p className="font-bold text-lg text-blue-800 dark:text-blue-200 mb-2">
                      {t('ai_suggestions.main_contact')}: {pair.mainContact.first_name} {pair.mainContact.last_name}
                    </p>
                    {pair.mainContact.email_addresses.slice(0, 1).map((e, i) => (
                      <p key={i} className="text-sm text-gray-600 dark:text-gray-300 truncate">{e.email_address}</p>
                    ))}
                    {pair.mainContact.phone_numbers.slice(0, 1).map((p, i) => (
                      <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{p.phone_number}</p>
                    ))}
                  </div>
                  <div className="p-4 border-2 border-red-200/30 dark:border-red-800/30 rounded-xl bg-gradient-to-br from-red-50/30 to-red-100/20 dark:from-red-900/20 dark:to-red-800/10">
                    <p className="font-bold text-lg text-red-800 dark:text-red-200 mb-2">
                      {t('ai_suggestions.duplicate_contact')}: {pair.duplicateContact.first_name} {pair.duplicateContact.last_name}
                    </p>
                    {pair.duplicateContact.email_addresses.slice(0, 1).map((e, i) => (
                      <p key={i} className="text-sm text-gray-600 dark:text-gray-300 truncate">{e.email_address}</p>
                    ))}
                    {pair.duplicateContact.phone_numbers.slice(0, 1).map((p, i) => (
                      <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{p.phone_number}</p>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMergeContacts(pair.mainContact, pair.duplicateContact)}
                    className="w-10 h-10 rounded-2xl bg-green-500/10 hover:bg-green-500/20 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-600 hover:text-green-700 transition-all duration-300 hover:scale-110 border-2 border-green-200/50 dark:border-green-800/50"
                    aria-label={t('ai_suggestions.merge_contacts')}
                  >
                    <Merge size={18} />
                  </GlassButton>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDiscardDuplicate(pair.duplicateContact.id)}
                    className="w-10 h-10 rounded-2xl bg-red-500/10 hover:bg-red-500/20 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-110 border-2 border-red-200/50 dark:border-red-800/50"
                    aria-label={t('common.discard')}
                  >
                    <XCircle size={18} />
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

DuplicateContactManagement.displayName = 'DuplicateContactManagement';

export default DuplicateContactManagement;