import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSession } from '@/integrations/supabase/auth';
import { useTranslation } from 'react-i18next';
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard } from '@/components/ui/modern-card';
import IranFlag from '@/assets/icons/flags/IranFlag';
import UKFlag from '@/assets/icons/flags/UKFlag';
import LoadingMessage from '@/components/common/LoadingMessage'; // Import LoadingMessage

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();
  const { i18n, t } = useTranslation();

  useEffect(() => {
    if (!isLoading && session?.user) {
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  if (isLoading) {
    return <LoadingMessage message={t('common.loading')} />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <ModernCard variant="glass" className="w-full max-w-md p-8 rounded-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          {t('login.title')}
        </h2>

        <div className="flex justify-center gap-4 mb-6">
          <GlassButton
            variant="outline"
            size="lg"
            onClick={() => handleLanguageChange('fa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              i18n.language === 'fa'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <IranFlag className="w-6 h-6" />
            <span className="font-semibold">{t('settings.persian')}</span>
          </GlassButton>
          <GlassButton
            variant="outline"
            size="lg"
            onClick={() => handleLanguageChange('en')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              i18n.language === 'en'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <UKFlag className="w-6 h-6" />
            <span className="font-semibold">{t('settings.english')}</span>
          </GlassButton>
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
      </ModernCard>
    </div>
  );
};

export default Login;