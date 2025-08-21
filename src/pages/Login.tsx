import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSession } from '@/integrations/supabase/auth';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button'; // Ensure Button is imported

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();
  const { i18n, t } = useTranslation();

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

        {/* Language Selector with Flag Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleLanguageChange('fa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              i18n.language === 'fa'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <span className="text-2xl">🇮🇷</span>
            <span className="font-semibold">{t('settings.persian')}</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleLanguageChange('en')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              i18n.language === 'en'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <span className="text-2xl">🇬🇧</span>
            <span className="font-semibold">{t('settings.english')}</span>
          </Button>
        </div>

        <Auth
          supabaseClient={supabase}
          providers={[]}
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
          theme="light"
          view="sign_in"
          showLinks={false}
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