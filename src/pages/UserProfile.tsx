import React from 'react';
import UserProfileForm from "@/components/user-management/UserProfileForm";
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const UserProfile: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-start p-4 md:p-8 h-full w-full overflow-y-auto"
    >
      <div className="w-full max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100"
        >
          {t('pages.user_profile.title')}
        </motion.h1>
        <UserProfileForm />
      </div>
    </motion.div>
  );
};

export default UserProfile;