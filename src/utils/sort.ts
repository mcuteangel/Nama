import { Contact } from "@/types/contact.types";

export const sortContacts = (contacts: Contact[], sortOption: string): Contact[] => {
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
