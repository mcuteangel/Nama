import ContactForm from "@/components/ContactForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AddContact = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <Card className="w-full max-w-3xl glass rounded-xl p-4"> {/* Changed max-w-md to max-w-3xl and p-6 to p-4 */}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            افزودن مخاطب جدید
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            اطلاعات مخاطب جدید را وارد کنید.
          </CardDescription>
        </CardHeader>
        <ContactForm />
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default AddContact;