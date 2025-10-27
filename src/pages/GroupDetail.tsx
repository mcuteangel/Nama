import { useParams, useNavigate } from 'react-router-dom';
import { useGroup } from '@/hooks/use-group';
import { useGroups } from '@/hooks/use-groups';
import LoadingMessage from '@/components/common/LoadingMessage';
import StandardizedDeleteDialog from '@/components/common/StandardizedDeleteDialog';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/hooks/use-app-settings';
import { GlassButton } from '@/components/ui/glass-button';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import GroupInfoCard from '@/components/groups/GroupInfoCard';
import GroupContactsSection from '@/components/groups/GroupContactsSection';
import { Group } from '@/types/group.types';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { group, isLoading, error } = useGroup(id);
  const { deleteGroup } = useGroups();
  const { t } = useTranslation();
  const { settings } = useAppSettings();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto animate-spin"></div>
          <LoadingMessage message={t('common.loading')} />
        </div>
      </div>
    );
  }

  if (error) {
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
              {error.message}
            </p>
          </div>
          <GlassButton
            onClick={() => navigate('/groups')}
            className="px-6 py-3 rounded-2xl font-semibold"
          >
            {t('actions.back_to_groups')}
          </GlassButton>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <div className="text-gray-400 text-2xl">👥</div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
              {t('groups.not_found')}
            </h3>
            <p className="text-gray-500 dark:text-gray-300 text-sm">
              {t('groups.not_found_description')}
            </p>
          </div>
          <GlassButton
            onClick={() => navigate('/groups')}
            className="px-6 py-3 rounded-2xl font-semibold"
          >
            {t('actions.back_to_groups')}
          </GlassButton>
        </div>
      </div>
    );
  }

  const handleContactDeleted = (_id: string) => {
    toast.success(t('contacts.contact_deleted_success'));
  };

  const handleContactEdited = (_id: string) => {
    toast.success(t('contacts.contact_updated_success'));
  };

  const handleEditGroup = () => {
    navigate(`/groups/${group.id}/edit`);
  };

  const handleDeleteGroup = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!group?.id) return;

    setIsDeleting(true);
    try {
      await deleteGroup(group.id);
      toast.success(t('groups.delete_success'));
      navigate('/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error(t('groups.delete_error'));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className={`min-h-screen w-full ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <PageHeader
          title={group.name}
          description={group.description || t('groups.group_description')}
          showBackButton={true}
          className="mb-"
        />

        {/* Spacer */}
        <div className="h-8"></div>

        {/* Group Info Card */}
        <GroupInfoCard
          group={group as Group}
          onEdit={handleEditGroup}
          onDelete={handleDeleteGroup}
        />

        {/* Contacts Section */}
        <GroupContactsSection
          contacts={group.contacts as any}
          onContactDeleted={handleContactDeleted}
          onContactEdited={handleContactEdited}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <StandardizedDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={t('groups.confirm_delete_title')}
        description={t('groups.confirm_delete_description', { name: group.name })}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default GroupDetail;
