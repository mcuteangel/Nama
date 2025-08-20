import ContactForm from "@/components/ContactForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AddContact = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <ContactForm />
      <MadeWithDyad />
    </div>
  );
};

export default AddContact;