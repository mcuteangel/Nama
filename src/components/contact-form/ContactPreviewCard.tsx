import React from 'react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, Building, MapPin, Calendar, Users, Tag, Sparkles, Heart, Briefcase } from 'lucide-react';
import { ModernCard } from '@/components/ui/modern-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tag as TagComponent } from '@/components/ui/tag';
import { cn } from '@/lib/utils';
import { designTokens } from '@/lib/design-tokens';

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section with New Design */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
           style={{
             background: designTokens.gradients.primary,
             boxShadow: designTokens.shadows.glass3d
           }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              <Sparkles size={24} className="sm:w-8 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2"
                  style={{ fontFamily: designTokens.typography.fonts.primary }}>
                پیش نمایش مخاطب
              </h2>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                اطلاعات مخاطب را قبل از ذخیره مشاهده کنید
              </p>
            </div>
          </div>

          <ModernCard
            variant="glass"
            className={cn(
              "w-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.005] sm:hover:scale-[1.02]",
              className
            )}
          >
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Header with avatar and name */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl border-4 border-white/20 shadow-xl">
                    {contact.avatarUrl ? (
                      <AvatarImage src={contact.avatarUrl} alt={fullName} className="object-cover rounded-2xl sm:rounded-3xl" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-bold">
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2"
                      style={{ fontFamily: designTokens.typography.fonts.primary }}>
                    {fullName || 'مخاطب بدون نام'}
                  </h2>

                  {contact.position && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <Briefcase size={12} className="sm:w-4 text-white" />
                      </div>
                      <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium">
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
                      <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium">
                        {contact.company}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {primaryPhone && (
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                          <Phone size={20} className="sm:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">شماره تلفن</p>
                          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                            {primaryPhone.phone_number}
                            {primaryPhone.extension && ` (داخلی: ${primaryPhone.extension})`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                            {primaryPhone.phone_type}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {primaryEmail && (
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                          <Mail size={20} className="sm:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">آدرس ایمیل</p>
                          <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white break-all">
                            {primaryEmail.email_address}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                            {primaryEmail.email_type}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(contact.street || contact.city || contact.state || contact.zipCode || contact.country) && (
                  <div className="group relative sm:col-span-2">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                          <MapPin size={20} className="sm:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">آدرس</p>
                          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                            {[contact.street, contact.city, contact.state, contact.zipCode, contact.country]
                              .filter(Boolean)
                              .join('، ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {formattedBirthday && (
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                          <Calendar size={20} className="sm:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">تاریخ تولد</p>
                          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                            {formattedBirthday}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {contact.groupId && (
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                          <Users size={20} className="sm:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">گروه</p>
                          <Badge variant="secondary" className="text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                            {contact.groupId}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/20 dark:border-gray-700/20">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <Tag size={16} className="sm:w-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white"
                        style={{ fontFamily: designTokens.typography.fonts.primary }}>
                      تگ‌ها
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
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
                        className="text-xs sm:text-sm font-medium"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Gender badge */}
              {contact.gender && contact.gender !== 'not_specified' && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20 dark:border-gray-700/20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                      <Heart size={16} className="sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">جنسیت</p>
                      <Badge
                        variant={contact.gender === 'male' ? 'default' : 'secondary'}
                        className={cn(
                          "px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl border-0",
                          contact.gender === 'male'
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                            : "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                        )}
                      >
                        {contact.gender === 'male' ? 'آقا' : 'خانم'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default ContactPreviewCard;