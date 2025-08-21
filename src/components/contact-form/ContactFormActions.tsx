import React from 'react';
import { Button } from '@/components/ui/button';

interface ContactFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  contactId?: string;
}

const ContactFormActions: React.FC<ContactFormActionsProps> = ({ isSubmitting, onCancel, contactId }) => {
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold shadow-md transition-all duration-300 transform hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600"
        disabled={isSubmitting}
      >
        انصراف
      </Button>
      <Button type="submit" className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105" disabled={isSubmitting}>
        {contactId ? "به‌روزرسانی مخاطب" : "ذخیره مخاطب"}
      </Button>
    </div>
  );
};

export default ContactFormActions;