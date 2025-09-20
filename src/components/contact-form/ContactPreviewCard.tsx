import React from 'react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { User, Phone, Mail, Building, MapPin, Calendar, Users, Tag } from 'lucide-react';
import { ModernCard } from '@/components/ui/modern-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tag as TagComponent } from '@/components/ui/tag';
import { cn } from '@/lib/utils';

interface ContactPreviewCardProps {
  contact: ContactFormValues;
  className?: string;
}

const ContactPreviewCard: React.FC<ContactPreviewCardProps> = ({ contact, className }) => {
  const { t } = useTranslation();

  // Get the first phone number and email for preview
  const primaryPhone = contact.phoneNumbers?.[0];
  const primaryEmail = contact.emailAddresses?.[0];
  
  // Get the full name
  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
  
  // Get the first letter of the name for avatar fallback
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  
  // Format birthday for display
  const formattedBirthday = contact.birthday 
    ? new Date(contact.birthday).toLocaleDateString()
    : null;

  return (
    <ModernCard 
      variant="glass" 
      className={cn(
        "w-full max-w-md mx-auto overflow-hidden transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <div className="p-6">
        {/* Header with avatar and name */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16 rounded-2xl">
            {contact.avatarUrl ? (
              <AvatarImage src={contact.avatarUrl} alt={fullName} className="object-cover rounded-2xl" />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-2xl text-xl font-bold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {fullName || t('contact_form.untitled_contact')}
            </h2>
            
            {contact.position && (
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <Building size={14} />
                {contact.position}
                {contact.company && ` at ${contact.company}`}
              </p>
            )}
            
            {contact.company && !contact.position && (
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <Building size={14} />
                {contact.company}
              </p>
            )}
          </div>
        </div>
        
        {/* Contact information */}
        <div className="space-y-4">
          {primaryPhone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Phone size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('contact_form.phone')}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {primaryPhone.phone_number}
                  {primaryPhone.extension && ` ext. ${primaryPhone.extension}`}
                </p>
              </div>
            </div>
          )}
          
          {primaryEmail && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Mail size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('contact_form.email')}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {primaryEmail.email_address}
                </p>
              </div>
            </div>
          )}
          
          {(contact.street || contact.city || contact.state || contact.zipCode || contact.country) && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mt-1">
                <MapPin size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('contact_form.address')}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {[contact.street, contact.city, contact.state, contact.zipCode, contact.country]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          )}
          
          {formattedBirthday && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Calendar size={18} className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('contact_form.birthday')}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formattedBirthday}
                </p>
              </div>
            </div>
          )}
          
          {contact.groupId && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Users size={18} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('contact_form.group')}
                </p>
                <Badge variant="secondary" className="font-medium">
                  {contact.groupId}
                </Badge>
              </div>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('contact_form.tags', 'تگ‌ها')}
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
                  className="text-xs"
                />
              ))}
            </div>
          </div>
        )}

        {/* Gender badge */}
        {contact.gender && contact.gender !== 'not_specified' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Badge
              variant={contact.gender === 'male' ? 'default' : 'secondary'}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full",
                contact.gender === 'male'
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
              )}
            >
              {t(`gender.${contact.gender}`)}
            </Badge>
          </div>
        )}
      </div>
    </ModernCard>
  );
};

export default ContactPreviewCard;