import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react"; // Remove Users icon
import ContactList from "@/components/ContactList";
import { useNavigate } from "react-router-dom";

const Contacts = () => {
  const navigate = useNavigate();

  const handleAddContactClick = () => {
    navigate("/add-contact");
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <Card className="w-full max-w-4xl glass rounded-xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            مدیریت مخاطبین
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            ثبت، جستجو و سازماندهی مخاطبین شما
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="جستجوی مخاطبین..."
                className="w-full ps-10 pe-4 py-2 rounded-lg bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
              />
              <Search className="absolute inset-inline-start-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
            </div>
            <Button
              onClick={handleAddContactClick}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
            >
              <PlusCircle size={20} />
              افزودن مخاطب جدید
            </Button>
          </div>

          <ContactList />
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default Contacts;