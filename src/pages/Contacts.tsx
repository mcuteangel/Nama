import { 
  ModernCard, 
  ModernCardContent, 
  ModernCardDescription, 
  ModernCardHeader, 
  ModernCardTitle 
} from "@/components/ui/modern-card";
import { GradientButton, ModernButton } from "@/components/ui/modern-button";
import { ModernLoader } from "@/components/ui/modern-loader";
import { useToast } from "@/components/ui/use-toast";
import { ModernInput } from "@/components/ui/modern-input";
import { PlusCircle, Search, Download } from "lucide-react";
import ContactList from "@/components/ContactList";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { useDebounce } from '@/hooks/use-performance';
import SuspenseWrapper from '@/components/common/SuspenseWrapper';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { useGroups } from "@/hooks/use-groups";
import { exportContactsToCsv } from "@/utils/export-contacts";
import { useSession } from "@/integrations/supabase/auth";

const Contacts = React.memo(() => {
  const navigate = useNavigate();
  const { groups, fetchGroups } = useGroups();
  const { session } = useSession();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("last_name_asc");
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search terms for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedCompanyFilter = useDebounce(companyFilter, 300);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddContactClick = useCallback(() => {
    toast.info('انتقال به افزودن مخاطب جدید...');
    navigate("/add-contact");
  }, [navigate, toast]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleGroupChange = useCallback((value: string) => {
    setSelectedGroup(value === "all" ? "" : value);
  }, []);

  const handleCompanyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyFilter(event.target.value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortOption(value);
  }, []);

  const handleExportClick = useCallback(async () => {
    setIsExporting(true);
    toast.info('شروع خروجی مخاطبین...');
    try {
      await exportContactsToCsv(session, {
        searchTerm: debouncedSearchTerm,
        selectedGroup,
        companyFilter: debouncedCompanyFilter,
        sortOption,
      });
      toast.success('خروجی مخاطبین با موفقیت انجام شد!');
    } catch (error) {
      toast.error('خطا در خروجی مخاطبین');
    } finally {
      setIsExporting(false);
    }
  }, [session, debouncedSearchTerm, selectedGroup, debouncedCompanyFilter, sortOption, toast]);

  return (
    <div className="flex flex-col items-stretch justify-center p-0 sm:p-4 h-full w-full">
      <ModernCard 
        variant="glass" 
        className="w-full sm:max-w-4xl sm:mx-auto rounded-none sm:rounded-xl p-2 sm:p-6 fade-in-up border border-white/20"
      >
        <ModernCardHeader className="text-center p-4 sm:p-6">
          <ModernCardTitle gradient className="heading-1 mb-2">
            مدیریت مخاطبین
          </ModernCardTitle>
          <ModernCardDescription className="body-large">
            ثبت، جستجو و سازماندهی مخاطبین شما
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-center">
            <div className="relative flex-grow w-full sm:w-auto">
              <ModernInput
                type="text"
                placeholder="جستجوی مخاطبین..."
                variant="glass"
                className="w-full ps-10 pe-4 py-2 rounded-lg bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 rtl:pr-10 rtl:pl-4"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className="absolute inset-inline-start-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 rtl:right-3 rtl:left-auto" size={20} />
            </div>
            <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
              <GradientButton
                gradientType="primary"
                onClick={handleAddContactClick}
                className="flex items-center gap-2 sm:gap-2 px-4 sm:px-6 py-3 sm:py-2 text-base sm:text-base flex-grow sm:flex-grow-0 font-persian neomorphism"
              >
                <PlusCircle size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">افزودن مخاطب جدید</span>
                <span className="sm:hidden">جدید</span>
              </GradientButton>
              <ModernButton
                variant="glass"
                onClick={handleExportClick}
                disabled={isExporting}
                className="flex items-center gap-2 sm:gap-2 px-4 sm:px-6 py-3 sm:py-2 text-base sm:text-base flex-grow sm:flex-grow-0 font-persian backdrop-blur-md border border-white/20 hover:bg-white/10 dark:hover:bg-white/5"
              >
                {isExporting ? (
                  <ModernLoader variant="spinner" size="sm" className="me-2" />
                ) : (
                  <Download size={18} className="sm:w-5 sm:h-5" />
                )}
                <span className="hidden sm:inline">خروجی</span>
                <span className="sm:hidden">خروجی</span>
              </ModernButton>
            </div>
          </div>

          {/* Compact filter and sorting section */}
          <div className="bg-white/20 dark:bg-gray-700/20 rounded-lg p-3 border border-white/30 dark:border-gray-600/30 backdrop-blur-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label htmlFor="group-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">گروه:</label>
                <ModernSelect onValueChange={handleGroupChange} value={selectedGroup || "all"}>
                  <ModernSelectTrigger id="group-filter" variant="glass" className="w-full backdrop-blur-md border border-white/20 hover:bg-white/10 dark:hover:bg-white/5">
                    <ModernSelectValue placeholder="همه گروه‌ها" />
                  </ModernSelectTrigger>
                  <ModernSelectContent variant="glass" className="backdrop-blur-md border border-white/20">
                    <ModernSelectItem value="all">همه گروه‌ها</ModernSelectItem>
                    {groups.map((group) => (
                      <ModernSelectItem key={group.id} value={group.id}>
                        {group.name}
                      </ModernSelectItem>
                    ))}
                  </ModernSelectContent>
                </ModernSelect>
              </div>

              <div>
                <label htmlFor="company-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">شرکت:</label>
                <ModernInput
                  id="company-filter"
                  type="text"
                  placeholder="نام شرکت..."
                  variant="glass"
                  className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-md"
                  value={companyFilter}
                  onChange={handleCompanyChange}
                />
              </div>

              <div>
                <label htmlFor="sort-option" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">مرتب‌سازی:</label>
                <ModernSelect onValueChange={handleSortChange} value={sortOption}>
                  <ModernSelectTrigger id="sort-option" variant="glass" className="w-full backdrop-blur-md border border-white/20 hover:bg-white/10 dark:hover:bg-white/5">
                    <ModernSelectValue placeholder="مرتب‌سازی" />
                  </ModernSelectTrigger>
                  <ModernSelectContent variant="glass" className="backdrop-blur-md border border-white/20">
                    <ModernSelectItem value="first_name_asc">نام (صعودی)</ModernSelectItem>
                    <ModernSelectItem value="first_name_desc">نام (نزولی)</ModernSelectItem>
                    <ModernSelectItem value="last_name_asc">نام خانوادگی (صعودی)</ModernSelectItem>
                    <ModernSelectItem value="last_name_desc">نام خانوادگی (نزولی)</ModernSelectItem>
                    <ModernSelectItem value="created_at_desc">تاریخ ایجاد (جدیدترین)</ModernSelectItem>
                    <ModernSelectItem value="created_at_asc">تاریخ ایجاد (قدیمی‌ترین)</ModernSelectItem>
                  </ModernSelectContent>
                </ModernSelect>
              </div>
            </div>
          </div>

          <SuspenseWrapper>
            <ContactList
              searchTerm={debouncedSearchTerm}
              selectedGroup={selectedGroup}
              companyFilter={debouncedCompanyFilter}
              sortOption={sortOption}
            />
          </SuspenseWrapper>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
});

Contacts.displayName = 'Contacts';

export default Contacts;