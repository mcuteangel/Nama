import { supabase } from '@/integrations/supabase/client';

// Define proper types for the contact data as returned by Supabase
interface PhoneNumber {
  id: string;
  phone_number: string;
  phone_type: string;
  extension?: string | null;
}

interface EmailAddress {
  id: string;
  email_address: string;
  email_type: string;
}

interface SocialLink {
  type: string;
  url: string;
}

interface Group {
  name: string;
  color?: string;
}

interface ContactGroup {
  group_id: string;
  groups: Group[];
}

interface CustomFieldTemplate {
  name: string;
  type: string;
  options?: string | null;
}

interface CustomField {
  id: string;
  template_id: string;
  field_value: string;
  custom_field_templates: CustomFieldTemplate[];
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  position?: string | null;
  company?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  birthday?: string | null;
  phone_numbers: PhoneNumber[];
  email_addresses: EmailAddress[];
  social_links: SocialLink[];
  contact_groups: ContactGroup[];
  custom_fields: CustomField[];
  avatar_url?: string | null;
  preferred_contact_method?: string | null;
}



// Helper function to sort contacts
const sortContacts = (contacts: Contact[], sortOption: string): Contact[] => {
  const sorted = [...contacts];
  
  sorted.sort((a, b) => {
    switch (sortOption) {
      case "first_name_asc":
        return (a.first_name || '').localeCompare(b.first_name || '', 'fa');
      case "first_name_desc":
        return (b.first_name || '').localeCompare(a.first_name || '', 'fa');
      case "last_name_asc":
        return (a.last_name || '').localeCompare(b.last_name || '', 'fa');
      case "last_name_desc":
        return (b.last_name || '').localeCompare(a.last_name || '', 'fa');
      case "created_at_asc":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "created_at_desc":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
  
  return sorted;
};

export const ContactListService = {
  async getFilteredContacts(
    userId: string,
    searchTerm: string = '',
    selectedGroup: string = '',
    companyFilter: string = '',
    sortOption: string = 'last_name_asc',
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Contact[] | null; error: string | null; total: number }> {
    try {
      // ابتدا تمام مخاطبین را با فیلترهای اولیه دریافت می‌کنیم
      let query = supabase
        .from("contacts")
        .select(`
          id, 
          first_name, 
          last_name, 
          gender, 
          position, 
          company, 
          street, 
          city, 
          state, 
          zip_code, 
          country, 
          notes, 
          created_at, 
          updated_at, 
          birthday,
          phone_numbers(
            id, 
            phone_number, 
            phone_type, 
            extension
          ), 
          email_addresses(
            id, 
            email_address, 
            email_type
          ), 
          social_links(
            type, 
            url
          ), 
          contact_groups(
            group_id, 
            groups(
              name, 
              color
            )
          ), 
          custom_fields(
            id, 
            template_id, 
            field_value, 
            custom_field_templates(
              name, 
              type, 
              options
            )
          )
        `)
        .eq("user_id", userId);

      // اعمال فیلتر گروه در صورت انتخاب
      if (selectedGroup) {
        query = query.filter('contact_groups.group_id', 'eq', selectedGroup);
      }

      // اعمال فیلتر شرکت در صورت وجود
      if (companyFilter) {
        query = query.ilike('company', `%${companyFilter}%`);
      }

      // دریافت داده‌ها از دیتابیس
      const { data, error } = await query;
      
      if (error) {
        console.error('خطای پایگاه داده:', error);
        return { data: null, error: 'خطا در دریافت اطلاعات از پایگاه داده', total: 0 };
      }
      
      // اعمال فیلتر جستجو در صورت وجود عبارت جستجو
      let filteredData = data as Contact[];
      
      const trimmedSearch = searchTerm.trim();
      if (trimmedSearch.length >= 2) {
        const cleanSearchTerm = trimmedSearch.replace(/\D/g, '').toLowerCase();
        const searchTermLower = trimmedSearch.toLowerCase();
        const isNumericSearch = /^\d+$/.test(trimmedSearch);
        
        filteredData = filteredData.filter(contact => {
          // اگر جستجوی عددی بود، فقط شماره تلفن‌ها را بررسی کن
          if (isNumericSearch) {
            return contact.phone_numbers?.some(phone => {
              const cleanPhone = phone.phone_number?.replace(/\D/g, '').toLowerCase() || '';
              return cleanPhone.includes(cleanSearchTerm);
            }) || false;
          }
          
          // در غیر این صورت فقط فیلدهای متنی را جستجو کن
          const matchesFirstName = contact.first_name?.toLowerCase().includes(searchTermLower) || false;
          const matchesLastName = contact.last_name?.toLowerCase().includes(searchTermLower) || false;
          const matchesCompany = contact.company?.toLowerCase().includes(searchTermLower) || false;
          
          // برای جستجوی دو حرفی، بررسی می‌کنیم که حتماً با ابتدای کلمه تطابق داشته باشد
          const isMatch = 
            (matchesFirstName && contact.first_name?.toLowerCase().startsWith(searchTermLower)) ||
            (matchesLastName && contact.last_name?.toLowerCase().startsWith(searchTermLower)) ||
            (matchesCompany && contact.company?.toLowerCase().includes(searchTermLower));
          
          // لاگ برای دیباگ
          if (isMatch) {
            console.log('مورد مطابقت یافت شد:', {
              id: contact.id,
              name: `${contact.first_name} ${contact.last_name}`,
              company: contact.company,
              searchTerm: searchTerm,
              isNumericSearch: isNumericSearch,
              matches: {
                firstName: matchesFirstName,
                lastName: matchesLastName,
                company: matchesCompany
              }
            });
          }
          
          return isMatch;
        });
      }
      
      // اعمال مرتب‌سازی
      const sortedData = sortContacts(filteredData, sortOption);
      
      // اعمال pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = sortedData.slice(startIndex, endIndex);
      
      return { data: paginatedData, error: null, total: sortedData.length };
    } catch (error) {
      console.error('خطا در پردازش لیست مخاطبین:', error);
      return { 
        data: null, 
        error: 'خطا در پردازش لیست مخاطبین',
        total: 0
      };
    }
  }
};