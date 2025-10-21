import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard } from '@/components/ui/modern-card';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernButton } from '@/components/ui/modern-button';
import IranFlag from '@/assets/icons/flags/IranFlag';
import UKFlag from '@/assets/icons/flags/UKFlag';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    // اعتبارسنجی اولیه ایمیل
    if (!email.trim()) {
      setError(t('forgotPassword.email_required_error'));
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(email)) {
      setError(t('forgotPassword.invalid_email_error'));
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Check if error is because user doesn't exist
        if (error.message.toLowerCase().includes('user not found') ||
            error.message.toLowerCase().includes('email not found') ||
            error.message.toLowerCase().includes('invalid email') ||
            error.message.toLowerCase().includes('unable to find')) {
          setError(t('forgotPassword.user_not_found_error'));
        } else {
          setError(error.message);
        }
      } else {
        // Supabase usually doesn't return errors for security reasons
        // So we'll show success message for any valid email format
        setMessage(t('forgotPassword.success_message'));
      }
    } catch (err) {
      setError(t('forgotPassword.generic_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <ModernCard variant="glass" className="w-full max-w-md p-10 rounded-3xl shadow-2xl hover:shadow-3xl backdrop-blur-2xl bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 transition-all duration-500 hover:scale-[1.02]">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          {t('forgotPassword.title')}
        </h2>

        <div className="flex justify-center gap-4 mb-6">
          <GlassButton
            variant="outline"
            size="lg"
            onClick={() => handleLanguageChange('fa')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm ${
              i18n.language === 'fa'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform scale-105'
                : 'bg-white/20 text-gray-800 hover:bg-white/30 dark:bg-gray-800/20 dark:text-gray-100 dark:hover:bg-gray-800/30 border border-white/30 dark:border-gray-700/30'
            }`}
          >
            <IranFlag className="w-6 h-6" />
            <span className="font-semibold">{t('settings.persian')}</span>
          </GlassButton>
          <GlassButton
            variant="outline"
            size="lg"
            onClick={() => handleLanguageChange('en')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm ${
              i18n.language === 'en'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform scale-105'
                : 'bg-white/20 text-gray-800 hover:bg-white/30 dark:bg-gray-800/20 dark:text-gray-100 dark:hover:bg-gray-800/30 border border-white/30 dark:border-gray-700/30'
            }`}
          >
            <UKFlag className="w-6 h-6" />
            <span className="font-semibold">{t('settings.english')}</span>
          </GlassButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm">
              {message}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forgotPassword.email_label')}
            </label>
            <ModernInput
              id="email"
              type="email"
              variant="glass"
              inputSize="lg"
              placeholder={t('forgotPassword.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <ModernButton
            type="submit"
            variant="glass"
            size="lg"
            loading={isSubmitting}
            fullWidth
            rounded="full"
            shadow="2xl"
            hoverEffect="lift"
            className="w-full glass-advanced border border-white/20 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 text-blue-900 dark:text-blue-100 font-bold drop-shadow-lg hover:drop-shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-blue-400/30"
          >
            {t('forgotPassword.submit_button')}
          </ModernButton>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors duration-200"
            >
              {t('forgotPassword.back_to_login')}
            </button>
          </div>
        </form>
      </ModernCard>
    </div>
  );
};

export default ForgotPassword;
