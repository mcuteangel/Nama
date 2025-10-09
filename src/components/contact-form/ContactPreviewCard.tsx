import React from 'react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, Building, MapPin, Calendar, Users, Tag, Sparkles, Heart, Briefcase } from 'lucide-react';
import { FormSection } from '@/components/ui/FormSection';
import { FormCard } from '@/components/ui/FormCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tag as TagComponent } from '@/components/ui/tag';
import { cn } from '@/lib/utils';

interface ContactPreviewCardProps {
  contact: ContactFormValues;
  className?: string;
}

const ContactPreviewCard: React.FC<ContactPreviewCardProps> = ({ contact, className }) => {
  useTranslation();

  // Get the first phone number and email for preview
  const primaryPhone = contact.phoneNumbers?.[0];
  const primaryEmail = contact.emailAddresses?.[0];

  // Get the full name
  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();

  // Get the first letter of the name for avatar fallback
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  // Format birthday for display
  const formattedBirthday = contact.birthday
    ? new Date(contact.birthday).toLocaleDateString('fa-IR')
    : null;

  return (
    <FormSection
      icon={Sparkles}
      title="پیش نمایش مخاطب"
      description="اطلاعات مخاطب را قبل از ذخیره مشاهده کنید"
      className="space-y-4"
    >
      <FormCard
        title={fullName || 'مخاطب بدون نام'}
        description={contact.position ? `${contact.position}${contact.company ? ` در ${contact.company}` : ''}` : contact.company || 'اطلاعات شغلی مشخص نشده'}
        icon={Heart}
        iconColor="#3b82f6"
        className="group"
      >
        <div className="space-y-6">
          {/* Header with avatar and name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative flex-shrink-0">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-slate-200 dark:border-slate-700 shadow-xl">
                {contact.avatarUrl ? (
                  <AvatarImage src={contact.avatarUrl} alt={fullName} className="object-cover rounded-2xl" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              {contact.gender && contact.gender !== 'not_specified' && (
                <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <Heart
                    size={12}
                    className={cn(
                      'sm:w-4',
                      contact.gender === 'male' ? 'text-blue-500' : 'text-pink-500'
                    )}
                  />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {fullName || 'مخاطب بدون نام'}
              </h2>

              {contact.position && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Briefcase size={12} className="sm:w-4 text-white" />
                  </div>
                  <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium">
                    {contact.position}
                    {contact.company && ` در ${contact.company}`}
                  </p>
                </div>
              )}

              {contact.company && !contact.position && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                    <Building size={12} className="sm:w-4 text-white" />
                  </div>
                  <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium">
                    {contact.company}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact information cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {primaryPhone && (
              <FormCard
                title="شماره تلفن"
                description={primaryPhone.phone_type}
                icon={Phone}
                iconColor="#3b82f6"
              >
                <div className="space-y-2">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {primaryPhone.phone_number}
                    {primaryPhone.extension && ` (داخلی: ${primaryPhone.extension})`}
                  </p>
                </div>
              </FormCard>
            )}

            {primaryEmail && (
              <FormCard
                title="آدرس ایمیل"
                description={primaryEmail.email_type}
                icon={Mail}
                iconColor="#22c55e"
              >
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white break-all">
                    {primaryEmail.email_address}
                  </p>
                </div>
              </FormCard>
            )}

            {(contact.street || contact.city || contact.state || contact.zipCode || contact.country) && (
              <div className="sm:col-span-2">
                <FormCard
                  title="آدرس"
                  description="آدرس کامل مخاطب"
                  icon={MapPin}
                  iconColor="#8b5cf6"
                >
                  <div className="space-y-2">
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {[contact.street, contact.city, contact.state, contact.zipCode, contact.country]
                        .filter(Boolean)
                        .join('، ')}
                    </p>
                  </div>
                </FormCard>
              </div>
            )}

            {formattedBirthday && (
              <FormCard
                title="تاریخ تولد"
                description="تاریخ تولد مخاطب"
                icon={Calendar}
                iconColor="#f97316"
              >
                <div className="space-y-2">
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {formattedBirthday}
                  </p>
                </div>
              </FormCard>
            )}

            {contact.groupId && (
              <FormCard
                title="گروه"
                description="گروه مخاطب"
                icon={Users}
                iconColor="#06b6d4"
              >
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-sm font-bold px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                    {contact.groupId}
                  </Badge>
                </div>
              </FormCard>
            )}
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <FormCard
              title="تگ‌ها"
              description="تگ‌های مرتبط با مخاطب"
              icon={Tag}
              iconColor="#eab308"
            >
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
            </FormCard>
          )}

          {/* Gender badge */}
          {contact.gender && contact.gender !== 'not_specified' && (
            <FormCard
              title="جنسیت"
              description="جنسیت مخاطب"
              icon={Heart}
              iconColor="#ec4899"
            >
              <div className="space-y-2">
                <Badge
                  variant={contact.gender === 'male' ? 'default' : 'secondary'}
                  className={cn(
                    "px-4 py-2 text-sm font-bold rounded-xl border-0",
                    contact.gender === 'male'
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                  )}
                >
                  {contact.gender === 'male' ? 'آقا' : 'خانم'}
                </Badge>
              </div>
            </FormCard>
          )}
        </div>
      </FormCard>
    </FormSection>
  );
};

export default ContactPreviewCard;