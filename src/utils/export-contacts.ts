import { ContactService } from "@/services/contact-service";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { Session } from "@supabase/supabase-js";

interface ExportOptions {
  searchTerm: string;
  selectedGroup: string;
  companyFilter: string;
  sortOption: string;
}

export const exportContactsToCsv = async (session: Session | null, options: ExportOptions) => {
  if (!session?.user) {
    showError("برای خروجی گرفتن از مخاطبین باید وارد شوید.");
    return;
  }

  const toastId = showLoading("در حال آماده‌سازی فایل خروجی...");

  try {
    const { data: contacts, error } = await ContactService.getFilteredContacts(
      session.user.id,
      options.searchTerm,
      options.selectedGroup,
      options.companyFilter,
      options.sortOption
    );

    if (error) {
      throw new Error(error);
    }

    if (!contacts || contacts.length === 0) {
      showError("هیچ مخاطبی برای خروجی گرفتن یافت نشد.");
      dismissToast(toastId);
      return;
    }

    // Define CSV headers and map data
    const headers = [
      "نام", "نام خانوادگی", "جنسیت", "سمت", "شرکت", "خیابان", "شهر", "استان", "کد پستی", "کشور", "یادداشت‌ها", "تاریخ تولد",
      "شماره تلفن‌ها", "ایمیل‌ها", "لینک‌های اجتماعی", "گروه", "URL آواتار", "روش ارتباط ترجیحی"
    ];

    const csvRows = contacts.map(contact => {
      const phoneNumbers = contact.phone_numbers
        .map((p: any) => `${p.phone_number} (${p.phone_type}${p.extension ? ` - داخلی: ${p.extension}` : ''})`)
        .join('; ');
      
      const emailAddresses = contact.email_addresses
        .map((e: any) => `${e.email_address} (${e.email_type})`)
        .join('; ');

      const socialLinks = contact.social_links
        .map((s: any) => `${s.type}: ${s.url}`)
        .join('; ');

      const groupName = contact.contact_groups && contact.contact_groups.length > 0 && contact.contact_groups[0].groups
        ? contact.contact_groups[0].groups[0].name
        : '';

      const preferredContactMethodLabel = (() => {
        switch (contact.preferred_contact_method) {
          case 'email': return 'ایمیل';
          case 'phone': return 'تلفن';
          case 'sms': return 'پیامک';
          case 'any': return 'هر کدام';
          default: return '';
        }
      })();

      return [
        contact.first_name || '',
        contact.last_name || '',
        contact.gender === "male" ? "مرد" : contact.gender === "female" ? "زن" : "نامشخص",
        contact.position || '',
        contact.company || '',
        contact.street || '', // New: Detailed address field
        contact.city || '',    // New: Detailed address field
        contact.state || '',   // New: Detailed address field
        contact.zip_code || '', // New: Detailed address field
        contact.country || '', // New: Detailed address field
        contact.notes || '',
        contact.birthday ? new Date(contact.birthday).toLocaleDateString('fa-IR') : '', // Format date for Persian calendar
        phoneNumbers,
        emailAddresses,
        socialLinks,
        groupName,
        contact.avatar_url || '', // New: Avatar URL
        preferredContactMethodLabel, // New: Preferred contact method
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','); // Escape double quotes and join
    });

    const csvContent = [headers.map(h => `"${h}"`).join(','), ...csvRows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for UTF-8 encoding

    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'contacts.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess("فایل مخاطبین با موفقیت دانلود شد.");
    } else {
      showError("مرورگر شما از دانلود فایل پشتیبانی نمی‌کند.");
    }
  } catch (err: any) {
    console.error("Error exporting contacts:", err);
    showError(`خطا در خروجی گرفتن از مخاطبین: ${err.message || "خطای ناشناخته"}`);
  } finally {
    dismissToast(toastId);
  }
};