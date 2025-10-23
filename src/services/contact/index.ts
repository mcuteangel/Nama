import { fetchContacts } from "./contactQueryService";
import i18n from "i18next";
import { searchContacts } from "./searchService";
import { sortContacts } from "@/utils/sort";
import { DuplicateContactService } from "./duplicateService";
import { GroupAssignmentService } from "./groupAssignmentService";
import { ContactListResponse, DuplicatePair, DuplicateManagementStats } from "@/types/contact.types";

export const ContactService = {
  async getFilteredContacts(
    userId: string,
    searchTerm: string = '',
    selectedGroup: string = '',
    companyFilter: string = '',
    sortOption: string = 'last_name_asc'
  ): Promise<ContactListResponse> {
    try {
      // دریافت مخاطبین با فیلترهای اولیه
      const { data, error } = await fetchContacts(userId, selectedGroup, companyFilter);

      if (error || !data) {
        return { data: null, error: error || i18n.t('errors.fetch_contacts_error') };
      }

      // اعمال جستجو
      const searchedData = searchTerm ? searchContacts(data, searchTerm) : data;

      // اعمال مرتب‌سازی
      const sortedData = sortContacts(searchedData, sortOption);

      return { data: sortedData, error: null };
    } catch (error) {
      console.error('Error processing contact list:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : i18n.t('errors.unknown_processing_error')
      };
    }
  }
};

export { DuplicateContactService, GroupAssignmentService };
export type { DuplicatePair, DuplicateManagementStats };
