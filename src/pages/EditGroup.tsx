import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useGroup } from '@/hooks/use-group';
import GroupForm from '@/components/groups/GroupForm';
import PageHeader from '@/components/ui/PageHeader';

const EditGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { group, isLoading, error } = useGroup(id);
  const { t } = useTranslation();
  const { settings } = useAppSettings();

  const handleSuccess = (updatedGroupId?: string) => {
    if (updatedGroupId) {
      navigate(`/groups/${updatedGroupId}`);
    } else {
      navigate('/groups');
    }
  };

  const handleCancel = () => {
    navigate(`/groups/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <div className="w-10 h-10 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              {t('errors.group_load_failed')}
            </h3>
            <p className="text-red-500 dark:text-red-300 text-sm">
              {error?.message || t('groups.not_found')}
            </p>
          </div>
          <button
            onClick={() => navigate('/groups')}
            className="px-6 py-3 rounded-2xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            {t('actions.back_to_groups')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="max-w-4xl mx-auto p-6">
        <PageHeader
          title={t('groups.edit_title')}
          description={t('groups.edit_description')}
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
              initialData={{
                id: group.id,
                name: group.name,
                color: group.color || '#60A5FA'
              }}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditGroup;
