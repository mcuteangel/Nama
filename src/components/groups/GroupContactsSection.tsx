import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ContactItem } from '@/components/common/ContactItem';
import { GradientButton } from '@/components/ui/glass-button';
import { ResponsiveGrid } from '@/components/ui/modern-grid';
import { designTokens } from '@/lib/design-tokens';
import { ContactPreview } from '@/types/group.types';
import { Contact, PhoneNumber } from '@/types/contact.types';

export interface GroupContactsSectionProps {
  contacts: ContactPreview[];
  onContactDeleted: (contactId: string) => void;
  onContactEdited: (contactId: string) => void;
  className?: string;
}

// Function to map ContactPreview to Contact for ContactItem component
export interface ContactMapper {
  (contact: ContactPreview): Contact;
}

const GroupContactsSection: React.FC<GroupContactsSectionProps> = ({
  contacts,
  onContactDeleted,
  onContactEdited,
  className = ''
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Define a function to map ContactPreview to Contact for ContactItem
  const mapToContact: ContactMapper = (contact: ContactPreview): Contact => {
    // Extract phone numbers if they exist in the contact data
    let phoneNumbers: PhoneNumber[] = [];

    // If phone_numbers is an array, use it directly
    if (contact.phone_numbers && Array.isArray(contact.phone_numbers)) {
      phoneNumbers = contact.phone_numbers.map(p => ({
        id: p.id,
        phone_number: p.phone_number,
        phone_type: p.phone_type,
        extension: p.extension || null
      }));
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
      gender: contact.gender || null,
      position: null,
      company: null,
      street: null,
      city: null,
      state: null,
      zip_code: null,
      country: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      phone_numbers: phoneNumbers,
      email_addresses: [],
      social_links: [],
      contact_groups: [],
      custom_fields: [],
      avatar_url: contact.avatar_url || null
    };

    return contactData;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={className}
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
                  {contacts.length === 0
                    ? t('groups.no_contacts_in_group')
                    : t('groups.contacts_in_group_count', { count: contacts.length })
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="p-6">
          {contacts.length > 0 ? (
            <ResponsiveGrid
              breakpoints={{
                sm: 2,
                md: 3,
                lg: 4,
                xl: 5
              }}
              className="w-full"
            >
              {contacts.map((contact, index) => (
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
                  className="group relative"
                >
                  <ContactItem
                    contact={mapToContact(contact)}
                    onContactDeleted={onContactDeleted}
                    onContactEdited={onContactEdited}
                    displayMode="grid"
                    className="hover:bg-transparent"
                  />
                </motion.div>
              ))}
            </ResponsiveGrid>
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
  );
};

export default GroupContactsSection;
