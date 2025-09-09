import React from 'react';
import ContactProfessionalInfo from './ContactProfessionalInfo';
import ContactAddress from './ContactAddress';
import ContactNotes from './ContactNotes';

const ContactOtherDetails: React.FC = React.memo(() => {
  return (
    <>
      <ContactProfessionalInfo />
      <ContactAddress />
      <ContactNotes />
    </>
  );
});

ContactOtherDetails.displayName = 'ContactOtherDetails';

export default ContactOtherDetails;