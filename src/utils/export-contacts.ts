import { ContactListService } from "@/services/contact-list-service";
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
    const { data: contacts, error } = await ContactListService.getFilteredContacts(
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

    // Process contacts in batches to prevent UI blocking
    const batchSize = 100;
    const csvRows: string[] = [];
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      const batchRows = batch.map(contact => {
        const phoneNumbers = contact.phone_numbers
          .map(p => `${p.phone_number} (${p.phone_type}${p.extension ? ` - داخلی: ${p.extension}` : ''})`)
          .join('; ');
        
        const emailAddresses = contact.email_addresses
          .map(e => `${e.email_address} (${e.email_type})`)
          .join('; ');

        const socialLinks = contact.social_links
          .map(s => `${s.type}: ${s.url}`)
          .join('; ');

        // Safely access group name using optional chaining
        const groupName = contact.contact_groups?.[0]?.groups?.[0]?.name || '';

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
          contact.street || '',
          contact.city || '',
          contact.state || '',
          contact.zip_code || '',
          contact.country || '',
          contact.notes || '',
          contact.birthday ? new Date(contact.birthday).toLocaleDateString('fa-IR') : '',
          phoneNumbers,
          emailAddresses,
          socialLinks,
          groupName,
          contact.avatar_url || '',
          preferredContactMethodLabel,
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      });
      
      csvRows.push(...batchRows);
    }

    const csvContent = [headers.map(h => `"${h}"`).join(','), ...csvRows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });

    // Use a more reliable download method
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess("فایل مخاطبین با موفقیت دانلود شد.");
    } else {
      // Fallback for browsers that don't support download attribute
      const reader = new FileReader();
      reader.onload = function() {
        const dataUrl = reader.result as string;
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        showSuccess("فایل مخاطبین با موفقیت دانلود شد.");
      };
      reader.readAsDataURL(blob);
    }
  } catch (err: unknown) {
    console.error("Error exporting contacts:", err);
    if (err instanceof Error) {
      showError(`خطا در خروجی گرفتن از مخاطبین: ${err.message || "خطای ناشناخته"}`);
    } else {
      showError("خطا در خروجی گرفتن از مخاطبین: خطای ناشناخته");
    }
  } finally {
    dismissToast(toastId);
  }
};