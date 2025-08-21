import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSession } from '@/integrations/supabase/auth';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { Label } from '@/components/ui/label'; // Import Label

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();
  const { i18n, t } = useTranslation(); // Initialize useTranslation

  useEffect(() => {
    // کاربر احراز هویت شده است و شیء کاربر معتبر است، به صفحه اصلی هدایت شود
    if (!isLoading && session?.user) {
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng); // Persist language preference
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-gray-700 dark:text-gray-300">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <div className="w-full max-w-md p-8 glass rounded-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          {t('login.title')}
        </h2>

        {/* Language Selector */}
        <div className="mb-6">
          <Label htmlFor="language-select" className="text-gray-700 dark:text-gray-200 mb-2 block">
            {t('settings.language')}
          </Label>
          <Select
            value={i18n.language}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger id="language-select" className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
              <SelectValue placeholder={t('settings.language')} />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                <SelectItem value="fa">{t('settings.persian')}</SelectItem>
                <SelectItem value="en">{t('settings.english')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Auth
          supabaseClient={supabase}
          providers={[]} // ارائه‌دهندگان شخص ثالث غیرفعال هستند مگر اینکه مشخص شوند
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                },
              },
            },
          }}
          theme="light" // استفاده از تم روشن
          view="sign_in" // فقط فرم ورود نمایش داده شود
          showLinks={false} // غیرفعال کردن لینک‌های ثبت‌نام و بازیابی رمز عبور
          localization={{
            variables: {
              sign_in: {
                email_label: t('login.email_label'),
                password_label: t('login.password_label'),
                email_input_placeholder: t('login.email_input_placeholder'),
                password_input_placeholder: t('login.password_input_placeholder'),
                button_label: t('login.button_label'),
                social_provider_text: t('login.social_provider_text'),
                link_text: t('login.link_text'),
              },
            },
          }}
        />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Login;