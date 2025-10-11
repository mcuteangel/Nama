import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/hooks/use-app-settings';
import GroupForm from '@/components/groups/GroupForm';
import PageHeader from '@/components/ui/PageHeader';

const AddGroup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useAppSettings();

  const handleSuccess = (newGroupId?: string) => {
    if (newGroupId) {
      navigate(`/groups/${newGroupId}`);
    } else {
      navigate('/groups');
    }
  };

  const handleCancel = () => {
    navigate('/groups');
  };

  return (
    <div className={`min-h-screen w-full ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="max-w-4xl mx-auto p-6">
        <PageHeader
          title={t('groups.add_title')}
          description={t('groups.add_description')}
          showBackButton={true}
          className="mb-"
        />

        {/* Spacer */}
        <div className="h-6"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="w-full max-w-2xl">
            <GroupForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddGroup;
