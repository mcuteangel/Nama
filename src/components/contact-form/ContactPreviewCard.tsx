import React from 'react';
import { useTranslation } from 'react-i18next';
import { ContactFormValues } from '@/types/contact';
import { Phone, Mail, Building, MapPin, Calendar, Users, Tag, Sparkles, Heart, Briefcase } from 'lucide-react';
import { FormCard } from '@/components/ui/FormCard';
import { FormSection } from '@/components/ui/FormSection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tag as TagComponent } from '@/components/ui/tag';
import { cn } from '@/lib/utils';
import { useGroups } from '@/hooks/use-groups';

interface ContactPreviewCardProps {
  contact: ContactFormValues;
}

const ContactPreviewCard: React.FC<ContactPreviewCardProps> = ({ contact }) => {
  const { groups } = useGroups();
  const { t } = useTranslation();

  // Get the first phone number and email for preview
  const primaryPhone = contact.phoneNumbers?.[0];
  const primaryEmail = contact.emailAddresses?.[0];

  // Get the full name
  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();

  // Get the first letter of the name for avatar fallback
  const initials = fullName.split(' ').map(n => n[0]).join(' ').toUpperCase() || 'U';

  // Format birthday for display
  const formattedBirthday = contact.birthday
    ? new Date(contact.birthday).toLocaleDateString('fa-IR')
    : null;

  // Get group info
  const groupInfo = contact.groupId ? groups.find(g => g.id === contact.groupId) : null;

  return (
    <FormCard
      title={t('contact_form.preview_title')}
      description={t('contact_form.preview_description')}
      icon={Sparkles}
      iconColor="#3b82f6"
    >
      <div className="space-y-2">
        {/* Header Section */}
        <FormSection
          variant="card"
          title=""
          className="relative"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="relative flex-shrink-0">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                {contact.avatarUrl ? (
                  <AvatarImage src={contact.avatarUrl} alt={fullName} className="object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full text-lg font-bold">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              {contact.gender && contact.gender !== 'not_specified' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Heart
                    size={10}
                    className={cn(
                      'sm:w-3',
                      contact.gender === 'male' ? 'text-blue-500' : 'text-pink-500'
                    )}
                  />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">
                {fullName || t('contact_form.unnamed_contact')}
              </h2>

              {contact.position && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm">
                    <Briefcase size={10} className="sm:w-3 text-white" />
                  </div>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                    {contact.position}
                    {contact.company && ` ${t('common.at')} ${contact.company}`}
                  </p>
                </div>
              )}

              {contact.company && !contact.position && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-sm">
                    <Building size={10} className="sm:w-3 text-white" />
                  </div>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                    {contact.company}
                  </p>
                </div>
              )}
            </div>
          </div>
        </FormSection>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Phone */}
          {primaryPhone && (
            <FormSection
              variant="card"
              title=""
              className="relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Phone size={10} className="text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('contact_form.phone_number')}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {primaryPhone.phone_number}
                  {primaryPhone.extension && ` (${t('contact_form.extension', { extension: primaryPhone.extension })})`}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {primaryPhone.phone_type}
                </p>
              </div>
            </FormSection>
          )}

          {/* Email */}
          {primaryEmail && (
            <FormSection
              variant="card"
              title=""
              className="relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Mail size={10} className="text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('contact_form.email_address')}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white break-all">
                  {primaryEmail.email_address}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {primaryEmail.email_type}
                </p>
              </div>
            </FormSection>
          )}

          {/* Address */}
          {(contact.street || contact.city || contact.state || contact.zipCode || contact.country) && (
            <FormSection
              variant="card"
              title=""
              className="relative sm:col-span-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <MapPin size={10} className="text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('contact_form.address')}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {[contact.street, contact.city, contact.state, contact.zipCode, contact.country]
                  .filter(Boolean)
                  .join('، ')}
              </p>
            </FormSection>
          )}

          {/* Birthday */}
          {formattedBirthday && (
            <FormSection
              variant="card"
              title=""
              className="relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Calendar size={10} className="text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('contact_form.birthday')}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formattedBirthday}
              </p>
            </FormSection>
          )}

          {/* Group */}
          {contact.groupId && (
            <FormSection
              variant="card"
              title=""
              className="relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Users size={10} className="text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('contact_form.group')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-bold px-2 py-1 rounded-lg"
                  style={{
                    color: groupInfo?.color || '#3b82f6',
                    backgroundColor: `${groupInfo?.color || '#3b82f6'}20`
                  }}
                >
                  {groupInfo?.name || contact.groupId}
                </span>
              </div>
            </FormSection>
          )}
        </div>

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <FormSection
            variant="card"
            title=""
            className="relative"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Tag size={10} className="text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('contact_form.tags')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag) => (
                <TagComponent
                  key={tag.id}
                  tag={{
                    id: tag.id,
                    name: tag.name,
                    color: tag.color,
                    user_id: tag.user_id || 'temp-user',
                    created_at: tag.created_at || new Date().toISOString(),
                    updated_at: tag.updated_at || new Date().toISOString()
                  }}
                  size="sm"
                  className="text-sm font-medium"
                />
              ))}
            </div>
          </FormSection>
        )}

        {/* Gender */}
        {contact.gender && contact.gender !== 'not_specified' && (
          <FormSection
            variant="card"
            title=""
            className="relative"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Heart size={10} className="text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('contact_form.gender')}
              </span>
            </div>
            <Badge
              variant={contact.gender === 'male' ? 'default' : 'secondary'}
              className={cn(
                "px-3 py-1 text-sm font-bold rounded-lg border-0",
                contact.gender === 'male'
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
              )}
            >
              {contact.gender === 'male' ? t('contact_form.male') : t('contact_form.female')}
            </Badge>
          </FormSection>
        )}
      </div>
    </FormCard>
  );
};

export default ContactPreviewCard;