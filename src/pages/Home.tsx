import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ModernCard, 
  ModernCardContent, 
  ModernCardDescription, 
  ModernCardHeader, 
  ModernCardTitle} from "@/components/ui/modern-card";
import { GradientButton, ModernButton } from "@/components/ui/modern-button";
import { useToast } from "@/components/ui/use-toast";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { JalaliCalendar } from "@/components/JalaliCalendar";
import { format } from "date-fns-jalali";
import { Calendar, Users, Plus, Sparkles, Heart } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      navigate('/contacts');
    } else {
      localStorage.setItem('hasSeenWelcome', 'true');
      // خوش‌آمدگویی با toast
      setTimeout(() => {
        toast.success('به Nama Contacts خوش آمدید!', {
          title: 'خوش آمدید',
          description: 'مدیریت مخاطبین شما آسان‌تر از همیشه'
        });
      }, 1000);
    }
  }, [navigate, toast]);

  const handleContactsClick = () => {
    toast.info('انتقال به صفحه مخاطبین...');
    navigate('/contacts');
  };

  const handleAddContactClick = () => {
    toast.info('انتقال به افزودن مخاطب جدید...');
    navigate('/add-contact');
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* کارت خوش‌آمدگویی اصلی */}
      <ModernCard 
        variant="glass" 
        hover="lift" 
        className="w-full max-w-md mb-8 fade-in-up"
      >
        <ModernCardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center floating">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <ModernCardTitle gradient className="text-center heading-2">
            به Nama Contacts خوش آمدید!
          </ModernCardTitle>
          <ModernCardDescription className="text-center body-large">
            مدیریت مخاطبین شما هرگز آسان‌تر از این نبوده است.
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          <p className="text-center body-regular text-muted-foreground">
            با استفاده از این برنامه می‌توانید به راحتی مخاطبین خود را اضافه، ویرایش، حذف و سازماندهی کنید.
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            <GradientButton 
              gradientType="ocean"
              size="lg"
              onClick={handleContactsClick}
              className="w-full font-persian"
            >
              <Users className="w-5 h-5 mr-2" />
              مشاهده مخاطبین
            </GradientButton>
            
            <ModernButton 
              variant="glass" 
              size="lg"
              onClick={handleAddContactClick}
              className="w-full font-persian"
            >
              <Plus className="w-5 h-5 mr-2" />
              افزودن مخاطب جدید
            </ModernButton>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* کارت تقویم جلالی */}
      <ModernCard 
        variant="neomorphism" 
        hover="glow"
        className="w-full max-w-md mb-8 fade-in-up"
        style={{ animationDelay: '0.2s' }}
      >
        <ModernCardHeader>
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6 text-primary mr-2" />
            <ModernCardTitle className="heading-3">
              تقویم جلالی
            </ModernCardTitle>
          </div>
          <ModernCardDescription className="text-center">
            تاریخ انتخاب شده: {selectedDate ? format(selectedDate, 'yyyy/MM/dd') : 'هیچ تاریخی انتخاب نشده است.'}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="flex justify-center">
          <JalaliCalendar selected={selectedDate} onSelect={setSelectedDate} />
        </ModernCardContent>
      </ModernCard>

      {/* کارت‌های آمار سریع */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-8">
        <ModernCard 
          variant="gradient-sunset" 
          hover="scale"
          className="fade-in-left stagger-item"
        >
          <ModernCardContent className="text-center text-white">
            <Heart className="w-8 h-8 mx-auto mb-2" />
            <h3 className="heading-4 mb-1">مخاطبین</h3>
            <p className="body-small opacity-90">مدیریت آسان</p>
          </ModernCardContent>
        </ModernCard>

        <ModernCard 
          variant="gradient-success" 
          hover="scale"
          className="fade-in-up stagger-item"
        >
          <ModernCardContent className="text-center text-white">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <h3 className="heading-4 mb-1">گروه‌بندی</h3>
            <p className="body-small opacity-90">سازماندهی هوشمند</p>
          </ModernCardContent>
        </ModernCard>

        <ModernCard 
          variant="gradient-info" 
          hover="scale"
          className="fade-in-right stagger-item"
        >
          <ModernCardContent className="text-center text-white">
            <Sparkles className="w-8 h-8 mx-auto mb-2" />
            <h3 className="heading-4 mb-1">هوش مصنوعی</h3>
            <p className="body-small opacity-90">پیشنهادات هوشمند</p>
          </ModernCardContent>
        </ModernCard>
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Home;