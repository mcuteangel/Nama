import React from "react";
import * as XLSX from 'xlsx';
import { FileSpreadsheet } from "lucide-react";
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from "@/components/ui/modern-tooltip";
import { GradientButton } from "@/components/ui/glass-button";
import { useTranslation } from "react-i18next";

interface ExportToExcelProps {
  data: {
    overview: {
      totalContacts: number;
      groupCount: number;
      companyCount: number;
      monthlyAverage: number;
    };
    genderStats?: Array<{ gender: string; count: number }> | null;
    groupStats?: Array<{ name: string; count: number }> | null;
    companyStats?: Array<{ company: string; count: number }> | null;
    positionStats?: Array<{ position: string; count: number }> | null;
    contactMethodStats?: Array<{ method: string; count: number }> | null;
    timelineStats?: Array<{ month_year: string; count: number }> | null;
    upcomingBirthdays?: Array<{ first_name: string; last_name: string; birthday: string; days_until_birthday: number }> | null;
  };
  filters?: {
    quickRange: string;
    fromDate?: string;
    toDate?: string;
    selectedCompany?: string;
    selectedPosition?: string;
    selectedContactMethod?: string;
  };
}

const ExportToExcel: React.FC<ExportToExcelProps> = ({ data, filters }) => {
  const { t } = useTranslation();
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // صفحه خلاصه
    const summaryData = [
      [t('statistics.export_excel.summary_title')],
      [''],
      [t('statistics.export_excel.total_contacts'), data.overview.totalContacts],
      [t('statistics.export_excel.group_count'), data.overview.groupCount],
      [t('statistics.export_excel.company_count'), data.overview.companyCount],
      [t('statistics.export_excel.monthly_average'), data.overview.monthlyAverage],
      [''],
      [t('statistics.export_excel.applied_filters')],
      [t('statistics.export_excel.time_range'), filters?.quickRange || t('statistics.export_excel.all_period')],
      [t('statistics.export_excel.from_date'), filters?.fromDate || t('statistics.export_excel.unspecified')],
      [t('statistics.export_excel.to_date'), filters?.toDate || t('statistics.export_excel.unspecified')],
      [t('statistics.export_excel.company'), filters?.selectedCompany || t('statistics.export_excel.all')],
      [t('statistics.export_excel.position'), filters?.selectedPosition || t('statistics.export_excel.all')],
      [t('statistics.export_excel.contact_method'), filters?.selectedContactMethod || t('statistics.export_excel.all')],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, t('statistics.export_excel.summary_sheet'));

    // صفحه آمار جنسیت
    if (data.genderStats && data.genderStats.length > 0) {
      const genderData = [
        [t('statistics.export_excel.gender_stats_title')],
        [t('statistics.export_excel.gender'), t('statistics.export_excel.count')],
        ...data.genderStats.map(item => [item.gender, item.count])
      ];
      const genderSheet = XLSX.utils.aoa_to_sheet(genderData);
      XLSX.utils.book_append_sheet(workbook, genderSheet, t('statistics.export_excel.gender_sheet'));
    }

    // صفحه آمار گروه‌ها
    if (data.groupStats && data.groupStats.length > 0) {
      const groupData = [
        [t('statistics.export_excel.groups_stats_title')],
        [t('statistics.export_excel.group_name'), t('statistics.export_excel.contact_count')],
        ...data.groupStats.map(item => [item.name, item.count])
      ];
      const groupSheet = XLSX.utils.aoa_to_sheet(groupData);
      XLSX.utils.book_append_sheet(workbook, groupSheet, t('statistics.export_excel.groups_sheet'));
    }

    // صفحه آمار شرکت‌ها
    if (data.companyStats && data.companyStats.length > 0) {
      const companyData = [
        [t('statistics.export_excel.companies_stats_title')],
        [t('statistics.export_excel.company_name'), t('statistics.export_excel.contact_count')],
        ...data.companyStats.map(item => [item.company, item.count])
      ];
      const companySheet = XLSX.utils.aoa_to_sheet(companyData);
      XLSX.utils.book_append_sheet(workbook, companySheet, t('statistics.export_excel.companies_sheet'));
    }

    // صفحه آمار موقعیت‌های شغلی
    if (data.positionStats && data.positionStats.length > 0) {
      const positionData = [
        [t('statistics.export_excel.positions_stats_title')],
        [t('statistics.export_excel.position_name'), t('statistics.export_excel.contact_count')],
        ...data.positionStats.map(item => [item.position, item.count])
      ];
      const positionSheet = XLSX.utils.aoa_to_sheet(positionData);
      XLSX.utils.book_append_sheet(workbook, positionSheet, t('statistics.export_excel.positions_sheet'));
    }

    // صفحه روش‌های ارتباط
    if (data.contactMethodStats && data.contactMethodStats.length > 0) {
      const methodData = [
        [t('statistics.export_excel.methods_stats_title')],
        [t('statistics.export_excel.method_name'), t('statistics.export_excel.contact_count')],
        ...data.contactMethodStats.map(item => [item.method, item.count])
      ];
      const methodSheet = XLSX.utils.aoa_to_sheet(methodData);
      XLSX.utils.book_append_sheet(workbook, methodSheet, t('statistics.export_excel.communication_sheet'));
    }

    // صفحه روند زمانی
    if (data.timelineStats && data.timelineStats.length > 0) {
      const timelineData = [
        [t('statistics.export_excel.timeline_stats_title')],
        [t('statistics.export_excel.month_year'), t('statistics.export_excel.new_contacts_count')],
        ...data.timelineStats.map(item => [item.month_year, item.count])
      ];
      const timelineSheet = XLSX.utils.aoa_to_sheet(timelineData);
      XLSX.utils.book_append_sheet(workbook, timelineSheet, t('statistics.export_excel.timeline_sheet'));
    }

    // صفحه تولدها
    if (data.upcomingBirthdays && data.upcomingBirthdays.length > 0) {
      const birthdayData = [
        [t('statistics.export_excel.birthdays_title')],
        [t('statistics.export_excel.first_name'), t('statistics.export_excel.last_name'), t('statistics.export_excel.birth_date'), t('statistics.export_excel.days_until_birthday')],
        ...data.upcomingBirthdays.map(item => [
          item.first_name,
          item.last_name,
          item.birthday,
          item.days_until_birthday
        ])
      ];
      const birthdaySheet = XLSX.utils.aoa_to_sheet(birthdayData);
      XLSX.utils.book_append_sheet(workbook, birthdaySheet, t('statistics.export_excel.birthdays_sheet'));
    }

    // تنظیمات استایل
    const sheetNames = workbook.SheetNames;
    sheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      // تنظیم عرض ستون‌ها
      worksheet['!cols'] = [
        { wch: 20 }, // ستون اول
        { wch: 15 }, // ستون دوم
        { wch: 15 }, // ستون سوم
        { wch: 15 }, // ستون چهارم
      ];
    });

    // ذخیره فایل
    const fileName = `${t('statistics.export_excel.export_filename')}_${new Date().toLocaleDateString('fa-IR')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <ModernTooltip>
      <ModernTooltipTrigger asChild>
        <GradientButton
          gradientType="primary"
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl"
        >
          <FileSpreadsheet size={18} />
          <span className="hidden sm:inline">{t('statistics.export_excel.export_button')}</span>
        </GradientButton>
      </ModernTooltipTrigger>
      <ModernTooltipContent>
        <p>{t('statistics.export_excel.export_tooltip')}</p>
      </ModernTooltipContent>
    </ModernTooltip>
  );
};

export default ExportToExcel;
