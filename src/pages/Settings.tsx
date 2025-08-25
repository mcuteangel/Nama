import React, { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom"; // Removed useNavigate
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from "@/components/ThemeToggle";
import CalendarTypeSetting from "@/components/CalendarTypeSetting";
import LanguageSetting from "@/components/LanguageSetting";
import GeminiSettings from "@/components/GeminiSettings";
import { Download, User, Settings as SettingsIcon } from "lucide-react"; // Removed Sparkles, UploadCloud
import { exportContactsToCsv } from "@/utils/export-contacts";
import { useSession } from "@/integrations/supabase/auth";
import { Label } from "@/components/ui/label";
import ImportContactsDialog from "@/components/ImportContactsDialog";
import LoadingSpinner from '@/components/LoadingSpinner';

const Settings = () => {
  const { t } = useTranslation();
  // Removed navigate as it's not directly used here
  const { session } = useSession();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await exportContactsToCsv(session, {
      searchTerm: "",
      selectedGroup: "",
      companyFilter: "",
      sortOption: "first_name_asc",
    });
    setIsExporting(false);
  };

  const handleImportSuccess = () => {
    // Optionally refresh contact list or show a global success message
    console.log("Contacts imported successfully, refreshing data...");
    // Invalidate relevant caches if needed, e.g., contacts_list
    // For now, the DataImportService already invalidates caches.
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <Card className="w-full max-w-3xl glass rounded-xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {t('settings.title')}
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            {t('settings.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4 flex items-center gap-2">
              <SettingsIcon size={20} /> {t('settings.display_settings')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 glass rounded-lg shadow-sm">
                <Label className="text-gray-700 dark:text-gray-200">{t('settings.theme')}</Label>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between p-4 glass rounded-lg shadow-sm">
                <CalendarTypeSetting />
              </div>
              <div className="flex items-center justify-between p-4 glass rounded-lg shadow-sm">
                <LanguageSetting />
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4 flex items-center gap-2">
              <Download size={20} /> {t('settings.ai_settings')} {/* Changed icon to Download for consistency */}
            </h3>
            <div className="p-4 glass rounded-lg shadow-sm">
              <GeminiSettings />
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4 flex items-center gap-2">
              <Download size={20} /> {t('settings.data_management')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
              >
                {isExporting && <LoadingSpinner size={16} className="me-2" />}
                <Download size={20} />
                {t('settings.export_contacts')}
              </Button>
              <ImportContactsDialog onImportSuccess={handleImportSuccess} />
            </div>
          </div>

          {/* User Profile Link */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4 flex items-center gap-2">
              <User size={20} /> {t('common.profile')}
            </h3>
            <Button
              asChild
              className="w-full px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
            >
              <Link to="/profile">
                {t('settings.user_profile')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default Settings;