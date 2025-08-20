import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GroupList from "@/components/GroupList";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Groups = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-4xl glass rounded-xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            مدیریت گروه‌ها
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            ایجاد، ویرایش و حذف گروه‌های مخاطبین
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <GroupList />
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold shadow-md transition-all duration-300 transform hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600"
          >
            <ArrowLeft size={20} className="me-2" />
            بازگشت به مخاطبین
          </Button>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default Groups;