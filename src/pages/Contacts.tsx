import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Download, Users } from "lucide-react";
import ContactList from "@/components/ContactList";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDebounce } from '@/hooks/use-performance';
import SuspenseWrapper from '@/components/common/SuspenseWrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGroups } from "@/hooks/use-groups";
import { exportContactsToCsv } from "@/utils/export-contacts";
import { useSession } from "@/integrations/supabase/auth";
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Contacts = React.memo(() => {
  const navigate = useNavigate();
  const { groups, loadingGroups, fetchGroups } = useGroups();
  const { session } = useSession();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("last_name_asc"); // Changed default sort option here
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search terms for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedCompanyFilter = useDebounce(companyFilter, 300);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddContactClick = useCallback(() => {
    navigate("/add-contact");
  }, [navigate]);

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
    await exportContactsToCsv(session, {
      searchTerm: debouncedSearchTerm,
      selectedGroup,
      companyFilter: debouncedCompanyFilter,
      sortOption,
    });
    setIsExporting(false);
  }, [session, debouncedSearchTerm, selectedGroup, debouncedCompanyFilter, sortOption]);

  return (
    <div className="flex flex-col items-stretch justify-center p-0 sm:p-4 h-full w-full">
      <Card className="w-full sm:max-w-4xl sm:mx-auto glass rounded-none sm:rounded-xl p-2 sm:p-6">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            مدیریت مخاطبین
          </CardTitle>
          <CardDescription className="text-lg sm:text-lg text-gray-600 dark:text-gray-300">
            ثبت، جستجو و سازماندهی مخاطبین شما
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-center">
            <div className="relative flex-grow w-full sm:w-auto">
              <Input
                type="text"
                placeholder="جستجوی مخاطبین..."
                className="w-full ps-10 pe-4 py-2 rounded-lg bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 rtl:pr-10 rtl:pl-4"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className="absolute inset-inline-start-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 rtl:right-3 rtl:left-auto" size={20} />
            </div>
            <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
              <Button
                onClick={handleAddContactClick}
                className="flex items-center gap-2 sm:gap-2 px-4 sm:px-6 py-3 sm:py-2 text-base sm:text-base rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105 flex-grow sm:flex-grow-0"
              >
                <PlusCircle size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">افزودن مخاطب جدید</span>
                <span className="sm:hidden">جدید</span>
              </Button>
              <Button
                onClick={handleExportClick}
                variant="outline"
                disabled={isExporting}
                className="flex items-center gap-2 sm:gap-2 px-4 sm:px-6 py-3 sm:py-2 text-base sm:text-base rounded-lg text-gray-700 font-semibold shadow-md transition-all duration-300 transform hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600 flex-grow sm:flex-grow-0"
              >
                {isExporting && <LoadingSpinner size={16} className="me-2" />}
                <Download size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">خروجی</span>
                <span className="sm:hidden">خروجی</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-4">
            <div>
              <label htmlFor="group-filter" className="block text-sm sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">فیلتر بر اساس گروه:</label>
              <Select onValueChange={handleGroupChange} value={selectedGroup || "all"}>
                <SelectTrigger id="group-filter" className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                  <SelectValue placeholder="همه گروه‌ها" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                  <SelectItem value="all">همه گروه‌ها</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="company-filter" className="block text-sm sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">فیلتر بر اساس شرکت:</label>
              <Input
                id="company-filter"
                type="text"
                placeholder="نام شرکت..."
                className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                value={companyFilter}
                onChange={handleCompanyChange}
              />
            </div>

            <div>
              <label htmlFor="sort-option" className="block text-sm sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">مرتب‌سازی بر اساس:</label>
              <Select onValueChange={handleSortChange} value={sortOption}>
                <SelectTrigger id="sort-option" className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                  <SelectValue placeholder="مرتب‌سازی" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                  <SelectItem value="first_name_asc">نام (صعودی)</SelectItem>
                  <SelectItem value="first_name_desc">نام (نزولی)</SelectItem>
                  <SelectItem value="last_name_asc">نام خانوادگی (صعودی)</SelectItem>
                  <SelectItem value="last_name_desc">نام خانوادگی (نزولی)</SelectItem>
                  <SelectItem value="created_at_desc">تاریخ ایجاد (جدیدترین)</SelectItem>
                  <SelectItem value="created_at_asc">تاریخ ایجاد (قدیمی‌ترین)</SelectItem>
                </SelectContent>
              </Select>
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
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
});

Contacts.displayName = 'Contacts';

export default Contacts;