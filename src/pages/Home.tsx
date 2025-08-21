import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MadeWithDyad } from "@/components/made-with-dyad";
import JalaliCalendar from "@/components/JalaliCalendar"; // Import JalaliCalendar
import { format } from "date-fns-jalali"; // Import format from date-fns-jalali

const Home = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // State for selected date

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      navigate('/contacts');
    } else {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md glass rounded-xl p-6 text-center mb-6">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            به Nama Contacts خوش آمدید!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            مدیریت مخاطبین شما هرگز آسان‌تر از این نبوده است.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 dark:text-gray-200">
            با استفاده از این برنامه می‌توانید به راحتی مخاطبین خود را اضافه، ویرایش، حذف و سازماندهی کنید.
          </p>
          <Button asChild className="w-full px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105">
            <Link to="/contacts">مشاهده مخاطبین</Link>
          </Button>
          <Button asChild variant="outline" className="w-full px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold shadow-md transition-all duration-300 transform hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600">
            <Link to="/add-contact">افزودن مخاطب جدید</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Add Jalali Calendar here */}
      <Card className="w-full max-w-md glass rounded-xl p-6 text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            تقویم جلالی
          </CardTitle>
          <CardDescription className="text-md text-gray-600 dark:text-gray-300">
            تاریخ انتخاب شده: {selectedDate ? format(selectedDate, 'yyyy/MM/dd') : 'هیچ تاریخی انتخاب نشده است.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <JalaliCalendar selected={selectedDate} onSelect={setSelectedDate} />
        </CardContent>
      </Card>

      <MadeWithDyad />
    </div>
  );
};

export default Home;