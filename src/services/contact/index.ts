import { fetchContacts } from "./contactQueryService";
import { searchContacts } from "./searchService";
import { sortContacts } from "@/utils/sort";
import { DuplicateContactService } from "./duplicateService";
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
        return { data: null, error: error || 'خطا در دریافت اطلاعات مخاطبین' };
      }

      // اعمال جستجو
      const searchedData = searchTerm ? searchContacts(data, searchTerm) : data;

      // اعمال مرتب‌سازی
      const sortedData = sortContacts(searchedData, sortOption);

      return { data: sortedData, error: null };
    } catch (error) {
      console.error('خطا در پردازش لیست مخاطبین:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'خطای ناشناخته در پردازش لیست مخاطبین'
      };
    }
  }
};

export { DuplicateContactService };
export type { DuplicatePair, DuplicateManagementStats };
