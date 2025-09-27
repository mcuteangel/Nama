import { useParams } from 'react-router-dom';
import { useGroup } from '@/hooks/use-group';
import LoadingMessage from '@/components/common/LoadingMessage';
import ContactItem, { Contact } from '@/components/common/ContactItem';

// Define a function to map our contact data to the Contact type expected by ContactItem
const mapToContact = (contact: any): Contact => {
  // Extract phone numbers if they exist in the contact data
  let phoneNumbers: any[] = [];
  
  // If phone_numbers is an array, use it directly
  if (Array.isArray(contact.phone_numbers)) {
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
    gender: contact.gender || 'not_specified',
    position: contact.position || null,
    company: contact.company || null,
    street: contact.street || null,
    city: contact.city || null,
    state: contact.state || null,
    zip_code: contact.zip_code || null,
    country: contact.country || null,
    notes: contact.notes || null,
    phone_numbers: phoneNumbers.filter(Boolean).map((p: any) => ({
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
  const { group, isLoading, error } = useGroup(id);

  if (isLoading) {
    return <LoadingMessage message="در حال بارگذاری اطلاعات گروه..." />;
  }

  if (error) {
    return <div className="text-red-500">خطا در دریافت اطلاعات گروه.</div>;
  }

  if (!group) {
    return <div>گروهی پیدا نشد.</div>;
  }

  const handleContactDeleted = (_id: string) => {
    // Handle contact deleted if needed
  };

  const handleContactEdited = (_id: string) => {
    // Handle contact edited if needed
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8">
        <div 
          className="flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg"
          style={group.color ? { backgroundColor: group.color } : {}}
        >
          {group.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-foreground mb-2">{group.name}</h1>
          {group.description && group.description.trim() !== '' && (
            <p className="text-muted-foreground text-lg">{group.description}</p>
          )}
          <div className="mt-2 text-sm text-muted-foreground">
            {group.contacts.length} مخاطب در این گروه وجود دارد
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">مخاطبین گروه</h2>
        <div className="space-y-3">
          {group.contacts.length > 0 ? (
            group.contacts.map(contact => (
              <div key={contact.id} className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <ContactItem
                  contact={mapToContact(contact)}
                  onContactDeleted={handleContactDeleted}
                  onContactEdited={handleContactEdited}
                  className="hover:bg-muted/50"
                />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">هیچ مخاطبی در این گروه وجود ندارد.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
