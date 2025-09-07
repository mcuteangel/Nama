import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Award, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';

interface ProfileCompletionIndicatorProps {
  compact?: boolean;
  showDetails?: boolean;
}

const ProfileCompletionIndicator: React.FC<ProfileCompletionIndicatorProps> = ({
  compact = false,
  showDetails = true
}) => {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const completionData = useMemo(() => {
    const fields = [
      {
        key: 'first_name',
        label: t('form_labels.first_name'),
        completed: !!profile?.first_name?.trim(),
        required: true,
      },
      {
        key: 'last_name',
        label: t('form_labels.last_name'),
        completed: !!profile?.last_name?.trim(),
        required: true,
      },
      {
        key: 'phone',
        label: t('form_labels.phone'),
        completed: !!profile?.phone?.trim(),
        required: false,
      },
      {
        key: 'bio',
        label: t('form_labels.bio'),
        completed: !!profile?.bio?.trim(),
        required: false,
      },
      {
        key: 'avatar',
        label: t('profile.avatar'),
        completed: !!profile?.avatar_url,
        required: false,
      },
    ];

    const requiredFields = fields.filter(f => f.required);
    const optionalFields = fields.filter(f => !f.required);

    const requiredCompleted = requiredFields.filter(f => f.completed).length;
    const optionalCompleted = optionalFields.filter(f => f.completed).length;

    const requiredProgress = (requiredCompleted / requiredFields.length) * 100;
    const optionalProgress = (optionalCompleted / optionalFields.length) * 100;

    // Overall completion (required fields have more weight)
    const overallProgress = (requiredProgress * 0.7) + (optionalProgress * 0.3);

    return {
      fields,
      requiredCompleted,
      requiredTotal: requiredFields.length,
      optionalCompleted,
      optionalTotal: optionalFields.length,
      requiredProgress,
      optionalProgress,
      overallProgress,
    };
  }, [profile, t]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-500';
    if (progress >= 60) return 'text-blue-500';
    if (progress >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressBgColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMotivationalMessage = (progress: number) => {
    if (progress >= 100) return t('profile.completion.complete');
    if (progress >= 80) return t('profile.completion.almost');
    if (progress >= 60) return t('profile.completion.good');
    if (progress >= 40) return t('profile.completion.keep_going');
    return t('profile.completion.get_started');
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50"
      >
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={getProgressColor(completionData.overallProgress)}
              strokeDasharray={`${completionData.overallProgress}, 100`}
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${completionData.overallProgress}, 100` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold ${getProgressColor(completionData.overallProgress)}`}>
              {Math.round(completionData.overallProgress)}%
            </span>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {t('profile.completion.title')}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {getMotivationalMessage(completionData.overallProgress)}
          </p>
        </div>
        {completionData.overallProgress >= 100 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 1 }}
          >
            <Award size={20} className="text-yellow-500" />
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {t('profile.completion.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getMotivationalMessage(completionData.overallProgress)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getProgressColor(completionData.overallProgress)}`}>
            {Math.round(completionData.overallProgress)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {t('profile.completion.overall')}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full ${getProgressBgColor(completionData.overallProgress)} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${completionData.overallProgress}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {showDetails && (
        <div className="space-y-4">
          {/* Required Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('profile.completion.required')} ({completionData.requiredCompleted}/{completionData.requiredTotal})
              </span>
              <span className={`text-sm font-medium ${getProgressColor(completionData.requiredProgress)}`}>
                {Math.round(completionData.requiredProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-full ${getProgressBgColor(completionData.requiredProgress)} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${completionData.requiredProgress}%` }}
                transition={{ duration: 1, delay: 0.7 }}
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('profile.completion.optional')} ({completionData.optionalCompleted}/{completionData.optionalTotal})
              </span>
              <span className={`text-sm font-medium ${getProgressColor(completionData.optionalProgress)}`}>
                {Math.round(completionData.optionalProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-full ${getProgressBgColor(completionData.optionalProgress)} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${completionData.optionalProgress}%` }}
                transition={{ duration: 1, delay: 0.9 }}
              />
            </div>
          </div>

          {/* Field Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            {completionData.fields.map((field, index) => (
              <motion.div
                key={field.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  field.completed
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                {field.completed ? (
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                ) : (
                  <Circle size={16} className="text-gray-400 flex-shrink-0" />
                )}
                <span className={`text-sm ${field.completed ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileCompletionIndicator;