import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Download, FileDown, FileUp } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { useSession } from '@/integrations/supabase/auth';
import { exportContactsToCsv } from '@/utils/export-contacts';
import ImportContactsDialog from '@/components/ImportContactsDialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SettingsSection from './SettingsSection';
import SettingsCard from './SettingsCard';

interface DataManagementSettingsProps {
  onImportSuccess?: () => void;
}

const DataManagementSettings: React.FC<DataManagementSettingsProps> = ({ onImportSuccess }) => {
  const { t } = useTranslation();
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
    console.log("Contacts imported successfully, refreshing data...");
    onImportSuccess?.();
  };

  return (
    <SettingsSection
      title={t('settings.data_management')}
      description={t('settings.data_management_description')}
      icon={<Database size={20} />}
      variant="glass"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsCard
          title={t('settings.export_contacts')}
          description="Export all your contacts to a CSV file for backup or migration"
          icon={<FileDown size={16} />}
          gradient="green"
        >
          <GlassButton
            onClick={handleExport}
            disabled={isExporting}
            variant="gradient-success"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold"
          >
            {isExporting ? (
              <>
                <LoadingSpinner size={16} />
                {t('common.exporting')}
              </>
            ) : (
              <>
                <Download size={20} />
                {t('settings.export_contacts')}
              </>
            )}
          </GlassButton>
        </SettingsCard>

        <SettingsCard
          title={t('settings.import_contacts')}
          description="Import contacts from a CSV file to add them to your collection"
          icon={<FileUp size={16} />}
          gradient="blue"
        >
          <ImportContactsDialog onImportSuccess={handleImportSuccess} />
        </SettingsCard>
      </div>
    </SettingsSection>
  );
};

export default DataManagementSettings;