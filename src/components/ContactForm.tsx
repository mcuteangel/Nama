import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ContactForm = () => {
  return (
    <Card className="w-full max-w-md backdrop-blur-lg bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 shadow-lg rounded-xl p-6">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          افزودن/ویرایش مخاطب
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          اطلاعات مخاطب را وارد کنید.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-200">نام</Label>
          <Input id="firstName" placeholder="نام" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-200">نام خانوادگی</Label>
          <Input id="lastName" placeholder="نام خانوادگی" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" />
        </div>
        <div>
          <Label htmlFor="phoneNumber" className="text-gray-700 dark:text-gray-200">شماره تلفن اصلی</Label>
          <Input id="phoneNumber" placeholder="مثال: 09123456789" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" />
        </div>
        <div>
          <Label htmlFor="gender" className="text-gray-700 dark:text-gray-200">جنسیت</Label>
          <Select>
            <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
              <SelectValue placeholder="انتخاب جنسیت" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
              <SelectItem value="male">مرد</SelectItem>
              <SelectItem value="female">زن</SelectItem>
              <SelectItem value="not_specified">نامشخص</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="role" className="text-gray-700 dark:text-gray-200">سمت/شغل</Label>
          <Input id="role" placeholder="مثال: مهندس نرم‌افزار" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" />
        </div>
        <div>
          <Label htmlFor="address" className="text-gray-700 dark:text-gray-200">آدرس</Label>
          <Textarea id="address" placeholder="آدرس کامل" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" />
        </div>
        <div>
          <Label htmlFor="notes" className="text-gray-700 dark:text-gray-200">یادداشت‌ها</Label>
          <Textarea id="notes" placeholder="یادداشت‌های اضافی" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" />
        </div>
        <Button className="w-full px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105">
          ذخیره مخاطب
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContactForm;