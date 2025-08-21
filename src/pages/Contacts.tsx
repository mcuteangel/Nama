import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Download } from "lucide-react"; // Import Download icon
import ContactList from "@/components/ContactList";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGroups } from "@/hooks/use-groups";
import { exportContactsToCsv } from "@/utils/export-contacts"; // Import export utility
import { useSession } from "@/integrations/supabase/auth"; // Import useSession

const Contacts = () => {
  const navigate = useNavigate();
  const { groups, loadingGroups, fetchGroups } = useGroups();
  const { session } = useSession(); // Get session for export function

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("first_name_asc");

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddContactClick = () => {
    navigate("/add-contact");
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value === "all" ? "" : value);
  };

  const handleCompanyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyFilter(event.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const handleExportClick = () => {
    exportContactsToCsv(session, {
      searchTerm,
      selectedGroup,
      companyFilter,
      sortOption,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <Card className="w-full max-w-4xl glass rounded-xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            مدیریت مخاطبین
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            ثبت، جستجو و سازماندهی مخاطبین شما
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="جستجوی مخاطبین..."
                className="w-full ps-10 pe-4 py-2 rounded-lg bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className="absolute inset-inline-start-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
            </div>
            <Button
              onClick={handleAddContactClick}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
            >
              <PlusCircle size={20} />
              افزودن مخاطب جدید
            </Button>
          </div>

          {/* Filter and Sort Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="group-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">فیلتر بر اساس گروه:</label>
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
              <label htmlFor="company-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">فیلتر بر اساس شرکت:</label>
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
              <label htmlFor="sort-option" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">مرتب‌سازی بر اساس:</label>
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

          <Button
            onClick={handleExportClick}
            className="w-full flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <Download size={20} />
            خروجی گرفتن از مخاطبین (CSV)
          </Button>

          <ContactList
            searchTerm={searchTerm}
            selectedGroup={selectedGroup}
            companyFilter={companyFilter}
            sortOption={sortOption}
          />
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default Contacts;