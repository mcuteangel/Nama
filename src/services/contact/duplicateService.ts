import { supabase } from '@/integrations/supabase/client';
import { ContactCrudService } from '@/services/contact-crud-service';
import { invalidateCache } from '@/utils/cache-helpers';
import { ErrorManager } from '@/lib/error-manager';
import i18n from 'i18next';
import {
  DuplicateContact,
  DuplicatePair,
  DuplicateManagementStats,
  FullContactData
} from '@/types/contact.types';

export interface DuplicateServiceResult<T> {
  data: T | null;
  error: string | null;
}

export class DuplicateContactService {
  /**
   * دریافت تمام مخاطبین برای بررسی تکراری‌ها
   */
  static async fetchContactsForDuplicates(userId: string): Promise<DuplicateServiceResult<DuplicateContact[]>> {
    try {
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
        .eq('user_id', userId);

      if (contactsError) {
        throw new Error(contactsError.message);
      }

      return { data: contacts as DuplicateContact[], error: null };
    } catch (error) {
      ErrorManager.logError(error, {
        component: 'DuplicateContactService',
        action: 'fetchContactsForDuplicates',
        userId
      });
      return {
        data: null,
        error: error instanceof Error ? error.message : i18n.t('errors.fetch_contacts_error')
      };
    }
  }

  /**
   * پیدا کردن مخاطبین تکراری
   */
  static findDuplicates(contacts: DuplicateContact[]): DuplicatePair[] {
    const duplicates: DuplicatePair[] = [];
    const processedContactIds = new Set<string>();

    for (let i = 0; i < contacts.length; i++) {
      if (processedContactIds.has(contacts[i].id)) continue;

      for (let j = i + 1; j < contacts.length; j++) {
        if (processedContactIds.has(contacts[j].id)) continue;

        const contact1 = contacts[i];
        const contact2 = contacts[j];
        const reason = this.getDuplicateReason(contact1, contact2);

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

    return duplicates;
  }

  /**
   * محاسبه دلیل تکراری بودن دو مخاطب
   */
  private static getDuplicateReason(contact1: DuplicateContact, contact2: DuplicateContact): string | null {
    const namesMatch = contact1.first_name === contact2.first_name && contact1.last_name === contact2.last_name;
    const emailsOverlap = contact1.email_addresses.some(e1 =>
      contact2.email_addresses.some(e2 => e1.email_address === e2.email_address)
    );
    const phonesOverlap = contact1.phone_numbers.some(p1 =>
      contact2.phone_numbers.some(p2 => p1.phone_number === p2.phone_number)
    );

    if (namesMatch && (emailsOverlap || phonesOverlap)) {
      return i18n.t('duplicate_reasons.same_name_and_contact');
    } else if (emailsOverlap) {
      return i18n.t('duplicate_reasons.same_email');
    } else if (phonesOverlap) {
      return i18n.t('duplicate_reasons.same_phone');
    }

    return null;
  }

  /**
   * محاسبه آمار مدیریت مخاطبین تکراری
   */
  static calculateStats(duplicatePairs: DuplicatePair[]): DuplicateManagementStats {
    const total = duplicatePairs.length;
    const highConfidence = duplicatePairs.filter(p =>
      p.reason.includes(i18n.t('duplicate_reasons.name')) && (p.reason.includes(i18n.t('duplicate_reasons.email')) || p.reason.includes(i18n.t('duplicate_reasons.phone')))
    ).length;
    const mediumConfidence = duplicatePairs.filter(p =>
      p.reason.includes(i18n.t('duplicate_reasons.email')) || p.reason.includes(i18n.t('duplicate_reasons.phone'))
    ).length - highConfidence;

    return {
      total,
      highConfidence,
      mediumConfidence,
    };
  }

  /**
   * ادغام دو مخاطب
   */
  static async mergeContacts(
    mainContact: DuplicateContact,
    duplicateContact: DuplicateContact,
    userId: string
  ): Promise<DuplicateServiceResult<boolean>> {
    try {
      // دریافت اطلاعات کامل مخاطبین
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
        throw new Error(
          mainError?.message ||
          duplicateError?.message ||
          i18n.t('errors.failed_to_fetch_contact_details')
        );
      }

      // ادغام اطلاعات
      const mergedData = this.mergeContactData(mainContactFull, duplicateContactFull);

      // بروزرسانی مخاطب اصلی
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
        .eq('user_id', userId);

      if (updateMainError) throw new Error(updateMainError.message);

      // حذف اطلاعات قدیمی و اضافه کردن اطلاعات جدید
      await this.updateContactRelatedData(mainContact.id, userId, mergedData);

      // حذف مخاطب تکراری
      const { error: deleteDuplicateError } = await ContactCrudService.deleteContact(duplicateContact.id);
      if (deleteDuplicateError) throw new Error(deleteDuplicateError);

      // پاک کردن کش
      invalidateCache(`contacts_list_${userId}_`);
      invalidateCache(`statistics_dashboard_${userId}`);

      return { data: true, error: null };
    } catch (error) {
      ErrorManager.logError(error, {
        component: 'DuplicateContactService',
        action: 'mergeContacts',
        mainContact,
        duplicateContact
      });
      return {
        data: null,
        error: error instanceof Error ? error.message : i18n.t('errors.merge_contacts_error')
      };
    }
  }

  /**
   * ادغام اطلاعات دو مخاطب
   */
  private static mergeContactData(mainContact: FullContactData, duplicateContact: FullContactData): FullContactData {
    const mergedData: FullContactData = { ...mainContact };

    // ادغام فیلدهای متنی (اگر اصلی خالی بود از تکراری استفاده کن)
    if (!mergedData.company && duplicateContact.company) mergedData.company = duplicateContact.company;
    if (!mergedData.position && duplicateContact.position) mergedData.position = duplicateContact.position;
    if (!mergedData.notes && duplicateContact.notes) mergedData.notes = duplicateContact.notes;
    if (!mergedData.avatar_url && duplicateContact.avatar_url) mergedData.avatar_url = duplicateContact.avatar_url;
    if (!mergedData.birthday && duplicateContact.birthday) mergedData.birthday = duplicateContact.birthday;
    if (!mergedData.preferred_contact_method && duplicateContact.preferred_contact_method) {
      mergedData.preferred_contact_method = duplicateContact.preferred_contact_method;
    }
    if (!mergedData.street && duplicateContact.street) mergedData.street = duplicateContact.street;
    if (!mergedData.city && duplicateContact.city) mergedData.city = duplicateContact.city;
    if (!mergedData.state && duplicateContact.state) mergedData.state = duplicateContact.state;
    if (!mergedData.zip_code && duplicateContact.zip_code) mergedData.zip_code = duplicateContact.zip_code;
    if (!mergedData.country && duplicateContact.country) mergedData.country = duplicateContact.country;

    return mergedData;
  }

  /**
   * بروزرسانی اطلاعات مرتبط با مخاطب (ایمیل، تلفن، گروه‌ها و ...)
   */
  private static async updateContactRelatedData(
    contactId: string,
    userId: string,
    mergedData: FullContactData
  ): Promise<void> {
    // حذف اطلاعات قدیمی
    await Promise.all([
      supabase.from('phone_numbers').delete().eq('contact_id', contactId).eq('user_id', userId),
      supabase.from('email_addresses').delete().eq('contact_id', contactId).eq('user_id', userId),
      supabase.from('social_links').delete().eq('contact_id', contactId).eq('user_id', userId),
      supabase.from('contact_groups').delete().eq('contact_id', contactId).eq('user_id', userId),
      supabase.from('custom_fields').delete().eq('contact_id', contactId).eq('user_id', userId),
    ]);

    // اضافه کردن اطلاعات جدید
    await Promise.all([
      mergedData.phone_numbers.length > 0
        ? supabase.from('phone_numbers').insert(
            mergedData.phone_numbers.map(p => ({ ...p, id: undefined }))
          )
        : Promise.resolve(),
      mergedData.email_addresses.length > 0
        ? supabase.from('email_addresses').insert(
            mergedData.email_addresses.map(e => ({ ...e, id: undefined }))
          )
        : Promise.resolve(),
      mergedData.social_links.length > 0
        ? supabase.from('social_links').insert(
            mergedData.social_links.map(s => ({ ...s, id: undefined }))
          )
        : Promise.resolve(),
      mergedData.contact_groups.length > 0
        ? supabase.from('contact_groups').insert(
            mergedData.contact_groups.map(cg => ({ ...cg, id: undefined }))
          )
        : Promise.resolve(),
      mergedData.custom_fields.length > 0
        ? supabase.from('custom_fields').insert(
            mergedData.custom_fields.map(cf => ({ ...cf, id: undefined }))
          )
        : Promise.resolve(),
    ]);
  }
}
