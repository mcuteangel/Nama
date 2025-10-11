import React from 'react';
import ContactAddress from './ContactAddress';
import ContactNotes from './ContactNotes';

const ContactOtherDetails: React.FC = React.memo(() => {
  return (
    <>
      <ContactAddress />
      <div className="h-8"></div>
      <ContactNotes />
    </>
  );
});

ContactOtherDetails.displayName = 'ContactOtherDetails';

export default ContactOtherDetails;