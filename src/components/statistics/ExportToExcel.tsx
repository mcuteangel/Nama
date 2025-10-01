import React from "react";
import * as XLSX from 'xlsx';
import { FileSpreadsheet } from "lucide-react";
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from "@/components/ui/modern-tooltip";
import { GradientButton } from "@/components/ui/glass-button";

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
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // صفحه خلاصه
    const summaryData = [
      ['آمار کلی مخاطبین'],
      [''],
      ['کل مخاطبین', data.overview.totalContacts],
      ['تعداد گروه‌ها', data.overview.groupCount],
      ['تعداد شرکت‌ها', data.overview.companyCount],
      ['میانگین ماهانه', data.overview.monthlyAverage],
      [''],
      ['فیلترهای اعمال شده:'],
      ['بازه زمانی', filters?.quickRange || 'تمام دوره'],
      ['از تاریخ', filters?.fromDate || 'نامشخص'],
      ['تا تاریخ', filters?.toDate || 'نامشخص'],
      ['شرکت', filters?.selectedCompany || 'همه'],
      ['موقعیت شغلی', filters?.selectedPosition || 'همه'],
      ['روش ارتباط', filters?.selectedContactMethod || 'همه'],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'خلاصه');

    // صفحه آمار جنسیت
    if (data.genderStats && data.genderStats.length > 0) {
      const genderData = [
        ['آمار توزیع جنسیت'],
        ['جنسیت', 'تعداد'],
        ...data.genderStats.map(item => [item.gender, item.count])
      ];
      const genderSheet = XLSX.utils.aoa_to_sheet(genderData);
      XLSX.utils.book_append_sheet(workbook, genderSheet, 'جنسیت');
    }

    // صفحه آمار گروه‌ها
    if (data.groupStats && data.groupStats.length > 0) {
      const groupData = [
        ['آمار گروه‌ها'],
        ['نام گروه', 'تعداد مخاطب'],
        ...data.groupStats.map(item => [item.name, item.count])
      ];
      const groupSheet = XLSX.utils.aoa_to_sheet(groupData);
      XLSX.utils.book_append_sheet(workbook, groupSheet, 'گروه‌ها');
    }

    // صفحه آمار شرکت‌ها
    if (data.companyStats && data.companyStats.length > 0) {
      const companyData = [
        ['آمار شرکت‌ها'],
        ['نام شرکت', 'تعداد مخاطب'],
        ...data.companyStats.map(item => [item.company, item.count])
      ];
      const companySheet = XLSX.utils.aoa_to_sheet(companyData);
      XLSX.utils.book_append_sheet(workbook, companySheet, 'شرکت‌ها');
    }

    // صفحه آمار موقعیت‌های شغلی
    if (data.positionStats && data.positionStats.length > 0) {
      const positionData = [
        ['آمار موقعیت‌های شغلی'],
        ['نام موقعیت', 'تعداد مخاطب'],
        ...data.positionStats.map(item => [item.position, item.count])
      ];
      const positionSheet = XLSX.utils.aoa_to_sheet(positionData);
      XLSX.utils.book_append_sheet(workbook, positionSheet, 'موقعیت‌ها');
    }

    // صفحه روش‌های ارتباط
    if (data.contactMethodStats && data.contactMethodStats.length > 0) {
      const methodData = [
        ['آمار روش‌های ارتباط'],
        ['روش ارتباط', 'تعداد مخاطب'],
        ...data.contactMethodStats.map(item => [item.method, item.count])
      ];
      const methodSheet = XLSX.utils.aoa_to_sheet(methodData);
      XLSX.utils.book_append_sheet(workbook, methodSheet, 'ارتباط');
    }

    // صفحه روند زمانی
    if (data.timelineStats && data.timelineStats.length > 0) {
      const timelineData = [
        ['روند زمانی مخاطبین'],
        ['ماه/سال', 'تعداد مخاطب جدید'],
        ...data.timelineStats.map(item => [item.month_year, item.count])
      ];
      const timelineSheet = XLSX.utils.aoa_to_sheet(timelineData);
      XLSX.utils.book_append_sheet(workbook, timelineSheet, 'روند زمانی');
    }

    // صفحه تولدها
    if (data.upcomingBirthdays && data.upcomingBirthdays.length > 0) {
      const birthdayData = [
        ['تولدهای پیش رو'],
        ['نام', 'نام خانوادگی', 'تاریخ تولد', 'روزهای تا تولد'],
        ...data.upcomingBirthdays.map(item => [
          item.first_name,
          item.last_name,
          item.birthday,
          item.days_until_birthday
        ])
      ];
      const birthdaySheet = XLSX.utils.aoa_to_sheet(birthdayData);
      XLSX.utils.book_append_sheet(workbook, birthdaySheet, 'تولدها');
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
    const fileName = `آمار_مخاطبین_${new Date().toLocaleDateString('fa-IR')}.xlsx`;
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
          <span className="hidden sm:inline">اکسپورت Excel</span>
        </GradientButton>
      </ModernTooltipTrigger>
      <ModernTooltipContent>
        <p>خروجی Excel از آمارها</p>
      </ModernTooltipContent>
    </ModernTooltip>
  );
};

export default ExportToExcel;
