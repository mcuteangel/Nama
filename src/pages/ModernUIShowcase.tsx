import { useState } from 'react';
import { 
  ModernCard, 
  ModernCardHeader, 
  ModernCardTitle, 
  ModernCardDescription, 
  ModernCardContent,
  ModernCardFooter 
} from '@/components/ui/modern-card';
import { 
  GradientButton, 
  GlassButton, 
  FloatingActionButton } from "@/components/ui/glass-button";
import { ModernLoader, LoadingOverlay, Skeleton } from '@/components/ui/modern-loader';
import { ModernGrid, MasonryGrid, ResponsiveGrid } from '@/components/ui/modern-grid';
import { ModernProgress, CircularProgress, ProgressSteps } from '@/components/ui/modern-progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  ModernNavigation, 
  ModernBreadcrumb, 
  ModernTabs 
} from '@/components/ui/modern-navigation';
import { 
  Home, 
  Settings, 
  User, 
  Bell, 
  Plus, 
  Heart,
  Star} from 'lucide-react';

/**
 * ModernUIShowcase - صفحه نمایش کامپوننت‌های مدرن
 * این صفحه تمام کامپوننت‌های مدرن ایجاد شده را نمایش می‌دهد
 */
export default function ModernUIShowcase() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(45);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const navigationItems = [
    { href: '/', label: 'خانه', icon: <Home size={18} /> },
    { href: '/contacts', label: 'مخاطبین', icon: <User size={18} />, badge: '12' },
    { href: '/settings', label: 'تنظیمات', icon: <Settings size={18} /> },
    { href: '/notifications', label: 'اعلان‌ها', icon: <Bell size={18} />, badge: '3' }
  ];

  const breadcrumbItems = [
    { label: 'خانه', href: '/' },
    { label: 'کامپوننت‌ها', href: '/components' },
    { label: 'نمایش مدرن' }
  ];

  const tabItems = [
    { 
      id: 'cards', 
      label: 'کارت‌ها', 
      content: <CardsDemo /> 
    },
    { 
      id: 'buttons', 
      label: 'دکمه‌ها', 
      content: <ButtonsDemo onToast={(type: 'success' | 'error' | 'warning' | 'info', message: string) => toast[type](message)} /> 
    },
    { 
      id: 'loaders', 
      label: 'لودرها', 
      content: <LoadersDemo isLoading={isLoading} setIsLoading={setIsLoading} /> 
    }
  ];

  const progressSteps = ['شروع', 'تنظیمات', 'بررسی', 'تکمیل'];

  const handleProgressChange = () => {
    const newProgress = Math.min(progress + 15, 100);
    setProgress(newProgress);
    if (newProgress === 100) {
      toast.success('فرآیند با موفقیت تکمیل شد!');
    }
  };

  const handleStepNext = () => {
    if (currentStep < progressSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <ModernNavigation
        items={navigationItems}
        variant="glass"
        position="top"
        logo={
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-lg text-gradient">Nama</span>
          </div>
        }
        actions={
          <div className="flex items-center space-x-2">
            <GlassButton size="icon">
              <Bell size={18} />
            </GlassButton>
            <GradientButton size="sm">
              ورود
            </GradientButton>
          </div>
        }
      />

      {/* Main Content */}
      <main className="pt-20 px-6 pb-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 fade-in-up">
            <h1 className="heading-1 text-gradient">
              کامپوننت‌های مدرن UI
            </h1>
            <p className="body-large text-muted-foreground max-w-2xl mx-auto">
              مجموعه‌ای از کامپوننت‌های مدرن و جذاب برای ایجاد رابط کاربری حرفه‌ای
            </p>
            
            {/* Breadcrumb */}
            <ModernBreadcrumb items={breadcrumbItems} className="justify-center" />
          </div>

          {/* Progress Section */}
          <ModernCard variant="glass" className="fade-in-up">
            <ModernCardHeader>
              <ModernCardTitle gradient>پیشرفت پروژه</ModernCardTitle>
              <ModernCardDescription>
                وضعیت فعلی پیشرفت و مراحل تکمیل شده
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <ModernProgress 
                      value={progress} 
                      variant="gradient"
                      showValue
                      animated
                    />
                  </div>
                  <CircularProgress 
                    value={progress} 
                    variant="gradient"
                    showValue
                    size={48}
                  />
                </div>
                
                <ProgressSteps 
                  steps={progressSteps}
                  currentStep={currentStep}
                  variant="gradient"
                />
              </div>
            </ModernCardContent>
            <ModernCardFooter>
              <GlassButton onClick={handleProgressChange} disabled={progress === 100}>
                افزایش پیشرفت
              </GlassButton>
              <GlassButton onClick={handleStepNext} variant="outline" disabled={currentStep === progressSteps.length - 1}>
                مرحله بعد
              </GlassButton>
            </ModernCardFooter>
          </ModernCard>

          {/* Tabs Section */}
          <ModernTabs 
            tabs={tabItems}
            variant="pills"
            className="fade-in-up"
          />

          {/* Grid Examples */}
          <div className="space-y-8 fade-in-up">
            <h2 className="heading-2 text-center">نمونه‌های Grid</h2>
            
            {/* Modern Grid */}
            <ModernGrid variant="staggered" size="md" gap="lg">
              {Array.from({ length: 6 }).map((_, i) => (
                <ModernCard key={i} variant="neomorphism" hover="scale">
                  <ModernCardContent>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-ocean rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">کارت {i + 1}</h3>
                        <p className="text-sm text-muted-foreground">
                          توضیحات کوتاه برای این کارت
                        </p>
                      </div>
                    </div>
                  </ModernCardContent>
                </ModernCard>
              ))}
            </ModernGrid>

            {/* Masonry Grid */}
            <div>
              <h3 className="heading-3 mb-4">Masonry Grid</h3>
              <MasonryGrid columns={3} gap="md">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ModernCard key={i} variant="glass" hover="lift">
                    <ModernCardContent>
                      <div 
                        className="bg-gradient-sunset rounded-lg mb-4"
                        style={{ height: Math.random() * 100 + 150 }}
                      />
                      <h3 className="font-semibold mb-2">عنوان {i + 1}</h3>
                      <p className="text-sm text-muted-foreground">
                        این یک متن نمونه است که طول متغیری دارد. 
                        برخی کارت‌ها متن بیشتری دارند.
                        {i % 3 === 0 && ' متن اضافی برای تست ارتفاع متغیر کارت‌ها در Masonry layout.'}
                      </p>
                    </ModernCardContent>
                  </ModernCard>
                ))}
              </MasonryGrid>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton 
        icon={<Plus size={24} />}
        onClick={() => toast.info('دکمه شناور کلیک شد!')}
      />
    </div>
  );
}

// کامپوننت‌های نمایش جداگانه
function CardsDemo() {
  return (
    <ResponsiveGrid breakpoints={{ sm: 1, md: 2, lg: 3 }}>
      <ModernCard variant="glass" hover="lift">
        <ModernCardHeader>
          <ModernCardTitle>کارت شیشه‌ای</ModernCardTitle>
          <ModernCardDescription>
            کارت با افکت Glassmorphism
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <p className="body-regular">محتوای کارت شیشه‌ای با شفافیت زیبا.</p>
        </ModernCardContent>
      </ModernCard>

      <ModernCard variant="neomorphism" hover="glow">
        <ModernCardHeader>
          <ModernCardTitle>کارت نئومورفیسم</ModernCardTitle>
          <ModernCardDescription>
            کارت با افکت سه‌بعدی نرم
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <p className="body-regular">سایه‌های نرم و عمق بصری جذاب.</p>
        </ModernCardContent>
      </ModernCard>

      <ModernCard variant="gradient-sunset" hover="scale">
        <ModernCardHeader>
          <ModernCardTitle>کارت گرادیانت</ModernCardTitle>
          <ModernCardDescription className="text-white/80">
            کارت با پس‌زمینه گرادیانت رنگی
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <p className="body-regular text-white">
            رنگ‌های زیبا و جذاب برای جلب توجه.
          </p>
        </ModernCardContent>
      </ModernCard>
    </ResponsiveGrid>
  );
}

function ButtonsDemo({ onToast }: { onToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassButton onClick={() => onToast('success', 'دکمه معمولی کلیک شد!')}>
          دکمه معمولی
        </GlassButton>
        
        <GradientButton 
          gradientType="ocean"
          onClick={() => onToast('info', 'دکمه گرادیانت کلیک شد!')}
        >
          گرادیانت اقیانوس
        </GradientButton>
        
        <GradientButton 
          gradientType="sunset"
          variant="glass-gradient-sunset"
          onClick={() => onToast('warning', 'دکمه گرادیانت شیشه‌ای کلیک شد!')}
        >
          گرادیانت شیشه‌ای
        </GradientButton>
        
        <GradientButton 
          gradientType="forest"
          variant="3d-gradient-forest"
          onClick={() => onToast('error', 'دکمه گرادیانت سه بعدی کلیک شد!')}
        >
          گرادیانت سه بعدی
        </GradientButton>
      </div>

      <div className="flex justify-center space-x-4">
        <GlassButton variant="outline" size="lg">
          اندازه بزرگ
        </GlassButton>
        <GlassButton size="sm">
          اندازه کوچک
        </GlassButton>
        <GlassButton variant="ghost" size="icon">
          <Star size={18} />
        </GlassButton>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GradientButton 
          gradientType="primary"
          variant="glass-gradient-primary"
        >
          شیشه‌ای اولیه
        </GradientButton>
        
        <GradientButton 
          gradientType="ocean"
          variant="glass-gradient-ocean"
        >
          شیشه‌ای اقیانوس
        </GradientButton>
        
        <GradientButton 
          gradientType="sunset"
          variant="3d-gradient-sunset"
        >
          سه بعدی غروب
        </GradientButton>
        
        <GradientButton 
          gradientType="success"
          variant="3d-gradient-success"
        >
          سه بعدی موفقیت
        </GradientButton>
      </div>
    </div>
  );
}

function LoadersDemo({ isLoading, setIsLoading }: { 
  isLoading: boolean; 
  setIsLoading: (loading: boolean) => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <GlassButton 
          onClick={() => setIsLoading(!isLoading)}
          variant="gradient-primary"
        >
          {isLoading ? 'توقف' : 'شروع'} بارگذاری
        </GlassButton>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div className="space-y-2">
          <ModernLoader variant="spinner" size="lg" />
          <p className="text-sm">Spinner</p>
        </div>
        
        <div className="space-y-2">
          <ModernLoader variant="dots" size="lg" />
          <p className="text-sm">Dots</p>
        </div>
        
        <div className="space-y-2">
          <ModernLoader variant="pulse" size="lg" />
          <p className="text-sm">Pulse</p>
        </div>
        
        <div className="space-y-2">
          <ModernLoader variant="bars" size="lg" />
          <p className="text-sm">Bars</p>
        </div>
        
        <div className="space-y-2">
          <ModernLoader variant="ring" size="lg" />
          <p className="text-sm">Ring</p>
        </div>
      </div>

      <LoadingOverlay isLoading={isLoading}>
        <ModernCard variant="glass">
          <ModernCardContent>
            <div className="space-y-4">
              <Skeleton variant="text" lines={3} />
              <div className="flex space-x-4">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </LoadingOverlay>
    </div>
  );
}