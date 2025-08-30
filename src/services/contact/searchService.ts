import { Contact } from "@/types/contact.types";

export const searchContacts = (
  contacts: Contact[], 
  searchTerm: string
): Contact[] => {
  if (!searchTerm.trim()) return contacts;
  
  const trimmedSearch = searchTerm.trim();
  if (trimmedSearch.length < 2) return [];
  
  const cleanSearchTerm = trimmedSearch.replace(/\D/g, '').toLowerCase();
  const searchTermLower = trimmedSearch.toLowerCase();
  const isNumericSearch = /^\d+$/.test(trimmedSearch);
  
  return contacts.filter(contact => {
    // اگر جستجوی عددی بود، فقط شماره تلفن‌ها را بررسی کن
    if (isNumericSearch) {
      return contact.phone_numbers?.some(phone => {
        const cleanPhone = phone.phone_number?.replace(/\D/g, '').toLowerCase() || '';
        return cleanPhone.includes(cleanSearchTerm);
      }) || false;
    }
    
    // بررسی سایر فیلدها
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
};
