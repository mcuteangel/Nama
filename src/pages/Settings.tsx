import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from "@/components/ThemeToggle";
import CalendarTypeSetting from "@/components/CalendarTypeSetting";
import LanguageSetting from "@/components/LanguageSetting";
import GeminiSettings from "@/components/GeminiSettings"; // Updated import to GeminiSettings
import { Download, User, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { exportContactsToCsv } from "@/utils/export-contacts";
import { useSession } from "@/integrations/supabase/auth";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();

  const handleExport = () => {
    exportContactsToCsv(session, {
      searchTerm: "",
      selectedGroup: "",
      companyFilter: "",
      sortOption: "first_name_asc",
    });
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
              <Sparkles size={20} /> {t('settings.ai_settings')}
            </h3>
            <div className="p-4 glass rounded-lg shadow-sm">
              <GeminiSettings /> {/* Use the new GeminiSettings component */}
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
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
              >
                <Download size={20} />
                {t('settings.export_contacts')}
              </Button>
              <Button
                variant="outline"
                disabled
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold shadow-md transition-all duration-300 transform hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600"
              >
                <Download size={20} />
                {t('settings.import_contacts')}
              </Button>
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