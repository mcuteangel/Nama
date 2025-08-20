import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Phone, Mail } from "lucide-react";

// This is a placeholder component. In a real application, it would receive contact data as props.
const ContactItem = ({ contact }) => {
  return (
    <Card className="flex items-center justify-between p-4 bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border border-white/50 dark:border-gray-600/50">
          <AvatarImage src={contact?.avatarUrl} alt={contact?.firstName} />
          <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-700">
            {contact?.firstName ? contact.firstName[0] : "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">
            {contact?.firstName} {contact?.lastName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
            <Phone size={14} /> {contact?.phoneNumber || "بدون شماره"}
          </p>
          {contact?.email && (
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Mail size={14} /> {contact.email}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200">
          <Edit size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200">
          <Trash2 size={20} />
        </Button>
      </div>
    </Card>
  );
};

const ContactList = () => {
  // This is dummy data. In a real app, you would fetch this from Supabase.
  const dummyContacts = [
    { firstName: "علی", lastName: "محمدی", phoneNumber: "09123456789", email: "ali@example.com" },
    { firstName: "فاطمه", lastName: "احمدی", phoneNumber: "09351234567" },
    { firstName: "رضا", lastName: "کریمی", phoneNumber: "09198765432", email: "reza@example.com" },
  ];

  return (
    <div className="space-y-4">
      {dummyContacts.map((contact, index) => (
        <ContactItem key={index} contact={contact} />
      ))}
      {dummyContacts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">هیچ مخاطبی یافت نشد.</p>
      )}
    </div>
  );
};

export default ContactList;