import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSession } from '@/integrations/supabase/auth';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && session) {
      // کاربر احراز هویت شده است، به صفحه اصلی هدایت شود
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
        <p className="text-gray-700 dark:text-gray-300">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">ورود به حساب کاربری</h2>
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
          view="sign_in" // فقط فرم ورود نمایش داده شود (ثبت‌نام غیرفعال)
          localization={{
            variables: {
              sign_in: {
                email_label: 'ایمیل',
                password_label: 'رمز عبور',
                email_input_placeholder: 'ایمیل خود را وارد کنید',
                password_input_placeholder: 'رمز عبور خود را وارد کنید',
                button_label: 'ورود',
                social_provider_text: 'ورود با {{provider}}',
                link_text: 'قبلاً حساب کاربری دارید؟ وارد شوید',
              },
              sign_up: {
                email_label: 'ایمیل',
                password_label: 'رمز عبور',
                email_input_placeholder: 'ایمیل خود را وارد کنید',
                password_input_placeholder: 'رمز عبور خود را وارد کنید',
                button_label: 'ثبت نام',
                social_provider_text: 'ثبت نام با {{provider}}',
                link_text: 'حساب کاربری ندارید؟ ثبت نام کنید',
              },
              forgotten_password: {
                email_label: 'ایمیل',
                email_input_placeholder: 'ایمیل خود را وارد کنید',
                button_label: 'ارسال دستورالعمل بازیابی رمز عبور',
                link_text: 'رمز عبور خود را فراموش کرده‌اید؟',
              },
              update_password: {
                password_label: 'رمز عبور جدید',
                password_input_placeholder: 'رمز عبور جدید خود را وارد کنید',
                button_label: 'به‌روزرسانی رمز عبور',
              },
              magic_link: {
                email_input_placeholder: 'ایمیل خود را وارد کنید',
                button_label: 'ارسال لینک جادویی',
                link_text: 'ارسال لینک جادویی',
              },
              verify_otp: {
                email_input_placeholder: 'کد یکبار مصرف را وارد کنید',
                button_label: 'تایید کد یکبار مصرف',
                // link_text: 'کد یکبار مصرف را وارد کنید', // این خط حذف شد
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