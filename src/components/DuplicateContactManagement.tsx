import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Merge, XCircle, Info } from "lucide-react";
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
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent } from "@/components/ui/modern-card";
import { GlassButton } from "@/components/ui/glass-button";

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

const DuplicateContactManagement: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();

  const [duplicatePairs, setDuplicatePairs] = useState<DuplicatePair[]>([]);
  const [isScanning, setIsScanning] = useState(false);

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

      const { error: deleteDuplicateError } = await ContactCrudService.deleteContact(duplicateContact.id); // Updated service call

      if (deleteDuplicateError) throw new Error(deleteDuplicateError);

      ErrorManager.notifyUser(t('ai_suggestions.contacts_merged_success'), 'success');
      invalidateCache(`contacts_list_${session.user.id}_`);
      invalidateCache(`statistics_dashboard_${session.user.id}`);
      fetchAllContactsForDuplicates();
    } catch (err: unknown) {
      ErrorManager.logError(err, { component: 'DuplicateContactManagement', action: 'mergeContacts', mainContact, duplicateContact });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_merging_contacts')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    } finally {
      // dismissToast(toastId);
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
      <ModernCard variant="glass" className="rounded-xl p-4">
        <ModernCardHeader className="pb-2">
          <ModernCardTitle className="text-xl font-bold flex items-center gap-2">
            <Copy size={20} className="text-orange-500" /> {t('ai_suggestions.duplicate_contact_management_title')}
          </ModernCardTitle>
          <ModernCardDescription>
            {t('ai_suggestions.duplicate_contact_management_description')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <GlassButton
            onClick={fetchAllContactsForDuplicates}
            disabled={isScanning}
            variant="gradient-sunset"
            className="w-full flex items-center gap-2 px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
          >
            {isScanning && <LoadingSpinner size={16} className="me-2" />}
            <Merge size={16} className="me-2" />
            {t('ai_suggestions.scan_for_duplicates')}
          </GlassButton>

          {duplicatePairs.length === 0 && !isScanning && (
            <EmptyState
              icon={Copy}
              title={t('ai_suggestions.no_duplicates_found')}
              description={t('ai_suggestions.no_duplicates_found_description')}
            />
          )}

          {duplicatePairs.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('ai_suggestions.pending_duplicate_suggestions')}</h4>
              {duplicatePairs.map((pair, index) => (
                <div key={index} className="flex flex-col p-3 glass rounded-lg shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <Info size={16} className="text-blue-500" /> {t('ai_suggestions.duplicate_reason')}: {pair.reason}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700">
                      <p className="font-medium text-gray-800 dark:text-gray-100">{t('ai_suggestions.main_contact')}: {pair.mainContact.first_name} {pair.mainContact.last_name}</p>
                      {pair.mainContact.email_addresses.map((e, i) => <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{e.email_address}</p>)}
                      {pair.mainContact.phone_numbers.map((p, i) => <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{p.phone_number}</p>)}
                    </div>
                    <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700">
                      <p className="font-medium text-gray-800 dark:text-gray-100">{t('ai_suggestions.duplicate_contact')}: {pair.duplicateContact.first_name} {pair.duplicateContact.last_name}</p>
                      {pair.duplicateContact.email_addresses.map((e, i) => <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{e.email_address}</p>)}
                      {pair.duplicateContact.phone_numbers.map((p, i) => <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{p.phone_number}</p>)}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMergeContacts(pair.mainContact, pair.duplicateContact)}
                      className="text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-gray-600/50"
                    >
                      <Merge size={20} />
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDiscardDuplicate(pair.duplicateContact.id)}
                      className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50"
                    >
                      <XCircle size={20} />
                    </GlassButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default DuplicateContactManagement;