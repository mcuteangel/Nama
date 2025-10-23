import { supabase } from "@/integrations/supabase/client";
import i18n from "i18next";

export interface GroupAssignmentResult {
  success: boolean;
  error?: string;
  addedCount?: number;
  failedCount?: number;
}

export class GroupAssignmentService {
  /**
   * اضافه کردن مخاطبین به گروه
   */
  static async addContactsToGroup(
    userId: string,
    contactIds: string[],
    groupId: string
  ): Promise<GroupAssignmentResult> {
    try {
      // بررسی اینکه مخاطبین متعلق به کاربر هستند
      const { data: existingContacts, error: contactError } = await supabase
        .from("contacts")
        .select("id")
        .in("id", contactIds)
        .eq("user_id", userId);

      if (contactError) {
        return {
          success: false,
          error: contactError.message || i18n.t('errors.contact_verification_error')
        };
      }

      if (!existingContacts || existingContacts.length !== contactIds.length) {
        return {
          success: false,
          error: i18n.t('errors.some_contacts_not_found')
        };
      }

      // بررسی اینکه گروه متعلق به کاربر است
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .select("id, name")
        .eq("id", groupId)
        .eq("user_id", userId)
        .single();

      if (groupError || !group) {
        return {
          success: false,
          error: i18n.t('errors.group_not_found')
        };
      }

      // بررسی مخاطبینی که قبلاً در گروه هستند
      const { data: existingAssignments, error: assignmentError } = await supabase
        .from("contact_groups")
        .select("contact_id")
        .eq("group_id", groupId)
        .in("contact_id", contactIds);

      if (assignmentError) {
        return {
          success: false,
          error: assignmentError.message || i18n.t('errors.assignment_check_error')
        };
      }

      const existingContactIds = existingAssignments?.map(a => a.contact_id) || [];
      const newContactIds = contactIds.filter(id => !existingContactIds.includes(id));

      // اضافه کردن مخاطبین جدید به گروه
      if (newContactIds.length > 0) {
        const assignments = newContactIds.map(contactId => ({
          contact_id: contactId,
          group_id: groupId,
          user_id: userId
        }));

        const { error: insertError } = await supabase
          .from("contact_groups")
          .insert(assignments);

        if (insertError) {
          return {
            success: false,
            error: insertError.message || i18n.t('errors.assignment_insert_error')
          };
        }
      }

      const addedCount = newContactIds.length;
      const failedCount = contactIds.length - addedCount;

      return {
        success: true,
        addedCount,
        failedCount
      };

    } catch (error) {
      console.error('Error adding contacts to group:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : i18n.t('errors.unknown_error')
      };
    }
  }

  /**
   * حذف مخاطبین از گروه
   */
  static async removeContactsFromGroup(
    userId: string,
    contactIds: string[],
    groupId: string
  ): Promise<GroupAssignmentResult> {
    try {
      const { error } = await supabase
        .from("contact_groups")
        .delete()
        .eq("user_id", userId)
        .eq("group_id", groupId)
        .in("contact_id", contactIds);

      if (error) {
        return {
          success: false,
          error: error.message || i18n.t('errors.assignment_delete_error')
        };
      }

      return {
        success: true,
        addedCount: 0,
        failedCount: 0
      };

    } catch (error) {
      console.error('Error removing contacts from group:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : i18n.t('errors.unknown_error')
      };
    }
  }
}
