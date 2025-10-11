import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GradientButton } from "@/components/ui/glass-button";
import { useToast } from "@/components/ui/use-toast";
import { Users, Plus, Phone, BookOpen } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      navigate('/contacts');
    } else {
      localStorage.setItem('hasSeenWelcome', 'true');
      // خوش‌آمدگویی ساده
      setTimeout(() => {
        toast.success(t('home.welcome_title'), {
          title: t('home.welcome_title'),
          description: t('home.welcome_subtitle')
        });
      }, 500);
    }
  }, [navigate, toast, t]);

  const handleContactsClick = () => {
    toast.info(t('home.transferring_to_contacts'));
    navigate('/contacts');
  };

  const handleAddContactClick = () => {
    toast.info(t('home.transferring_to_add_contact'));
    navigate('/add-contact');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title={t('home.app_title')}
          description={t('home.app_subtitle')}
          showBackButton={false}
          className="mb-8"
        />

        <div className="max-w-4xl mx-auto">
          {/* بخش اصلی محتوا */}
          <div className="text-center mb-12 space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Phone className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* دکمه‌های اصلی */}
          <div className="w-full max-w-sm mx-auto space-y-4 mb-12">
            <GradientButton
              gradientType="ocean"
              size="lg"
              onClick={handleContactsClick}
              className="w-full font-persian text-lg py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Users className="w-6 h-6 ml-3" />
              {t('home.view_contacts')}
            </GradientButton>

            <GradientButton
              gradientType="sunset"
              size="lg"
              onClick={handleAddContactClick}
              className="w-full font-persian text-lg py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-6 h-6 ml-3" />
              {t('home.add_new_contact')}
            </GradientButton>
          </div>

          {/* کارت اطلاعات اضافی */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-blue-500 ml-2" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 font-persian">
                  {t('home.features_title')}
                </h3>
              </div>

              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-3"></div>
                  <span className="font-persian">{t('home.feature_simple_management')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full ml-3"></div>
                  <span className="font-persian">{t('home.feature_jalali_calendar')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-3"></div>
                  <span className="font-persian">{t('home.feature_secure_storage')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;