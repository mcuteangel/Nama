import { useParams, useNavigate } from 'react-router-dom';
import { useGroup } from '@/hooks/use-group';
import { useGroups } from '@/hooks/use-groups';
import LoadingMessage from '@/components/common/LoadingMessage';
import ContactItem, { Contact } from '@/components/common/ContactItem';
import StandardizedDeleteDialog from '@/components/common/StandardizedDeleteDialog';
import { PhoneNumber } from '@/types/contact.types';
import { motion } from 'framer-motion';
import { Users, Calendar, Edit, Trash2, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/hooks/use-app-settings';
import { designTokens } from '@/lib/design-tokens';
import { GlassButton, GradientButton } from '@/components/ui/glass-button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/ui/PageHeader';
import { ContactData } from '@/types/group.types';
import { useState } from 'react';

// Define a function to map our contact data to the Contact type expected by ContactItem
const mapToContact = (contact: ContactData): Contact => {
  // Extract phone numbers if they exist in the contact data
  let phoneNumbers: PhoneNumber[] = [];

  // If phone_numbers is an array, use it directly
  if (contact.phone_numbers && Array.isArray(contact.phone_numbers)) {
    phoneNumbers = contact.phone_numbers;
  }
  // If there's a phone_number at the root level, add it to the array
  else if (contact.phone_number) {
    phoneNumbers = [{
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      phone_number: contact.phone_number,
      phone_type: 'mobile',
      extension: null
    }];
  }

  // Ensure phone_numbers is an array with at least one entry if we have a phone number
  if (phoneNumbers.length === 0 && contact.phone_number) {
    phoneNumbers = [{
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      phone_number: contact.phone_number,
      phone_type: 'mobile',
      extension: null
    }];
  }

  // Create a proper Contact object
  const contactData: Contact = {
    id: contact.id,
    first_name: contact.first_name || '',
    last_name: contact.last_name || '',
    gender: 'not_specified', // Default value since gender is not in ContactData
    position: null, // Not in ContactData
    company: null, // Not in ContactData
    street: null, // Not in ContactData
    city: null, // Not in ContactData
    state: null, // Not in ContactData
    zip_code: null, // Not in ContactData
    country: null, // Not in ContactData
    notes: null, // Not in ContactData
    phone_numbers: phoneNumbers.filter(Boolean).map((p: PhoneNumber) => ({
      id: p.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
      phone_number: p.phone_number || '',
      phone_type: p.phone_type || 'mobile',
      extension: p.extension || null
    })),
    email_addresses: [],
    contact_groups: [],
    avatar_url: contact.avatar_url || null
  };

  return contactData;
};

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { group, isLoading, error } = useGroup(id);
  const { deleteGroup } = useGroups();
  const { t, i18n } = useTranslation();
  const { settings } = useAppSettings();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
          />
          <LoadingMessage message={t('common.loading')} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 p-8 max-w-md mx-auto"
        >
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
        </motion.div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 p-8 max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Users size={32} className="text-gray-400" />
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
        </motion.div>
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

  const createdAt = group.created_at
    ? new Date(group.created_at)
    : new Date();

  const formattedDate = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: i18n.language === 'fa' ? faIR : undefined
  });

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div
            className="relative rounded-3xl overflow-hidden p-6"
            style={{
              background: `linear-gradient(135deg, ${group.color}15 0%, ${group.color}05 100%)`,
              border: `2px solid ${group.color}30`,
              backdropFilter: 'blur(15px)',
              boxShadow: `0 25px 50px -12px ${group.color}20`
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, ${group.color} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${group.color} 0%, transparent 50%)`
                }}
              />
            </div>

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Group Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0"
              >
                <div
                  className="relative w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-white/20"
                  style={{ backgroundColor: group.color }}
                >
                  {group.name.charAt(0).toUpperCase()}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                </div>
              </motion.div>

              {/* Group Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-4">
                  {/* Action Buttons - Top */}
                  <div className="flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <GlassButton
                        onClick={handleEditGroup}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50"
                      >
                        <Edit size={18} />
                        <span>{t('actions.edit')}</span>
                      </GlassButton>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <GlassButton
                        onClick={handleDeleteGroup}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/50"
                      >
                        <Trash2 size={18} />
                        <span>{t('actions.delete')}</span>
                      </GlassButton>
                    </motion.div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span className="font-semibold text-foreground">
                        {t('groups.contacts_count', { count: group.contacts.length })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: group.color,
                          color: group.color,
                          backgroundColor: `${group.color}10`
                        }}
                      >
                        {group.color}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contacts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: designTokens.colors.glass.background,
              border: `1px solid ${designTokens.colors.glass.border}`,
              backdropFilter: 'blur(15px)',
              boxShadow: designTokens.shadows.glass
            }}
          >
            {/* Section Header */}
            <div
              className="px-8 py-6 border-b"
              style={{
                borderColor: designTokens.colors.glass.border,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {t('groups.group_contacts')}
                    </h2>
                    <p className="text-muted-foreground">
                      {group.contacts.length === 0
                        ? t('groups.no_contacts_in_group')
                        : t('groups.contacts_in_group_count', { count: group.contacts.length })
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts List */}
            <div className="p-6">
              {group.contacts.length > 0 ? (
                <div className="grid gap-3">
                  {group.contacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 }
                      }}
                      className="group relative bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-800/40 dark:to-gray-900/20 rounded-2xl p-3 hover:from-white/15 hover:to-white/8 dark:hover:from-gray-800/60 dark:hover:to-gray-900/40 transition-all duration-300 border border-white/20 dark:border-gray-700/40 hover:border-white/30 dark:hover:border-gray-600/60 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5"
                    >
                      <ContactItem
                        contact={mapToContact(contact)}
                        onContactDeleted={handleContactDeleted}
                        onContactEdited={handleContactEdited}
                        className="hover:bg-transparent"
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                      <Users size={32} className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                        {t('groups.no_contacts_title')}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-300 mb-6">
                        {t('groups.no_contacts_description')}
                      </p>
                      <GradientButton
                        onClick={() => navigate('/contacts')}
                        className="px-8 py-4 rounded-2xl font-bold"
                      >
                        {t('actions.add_contacts')}
                      </GradientButton>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
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
