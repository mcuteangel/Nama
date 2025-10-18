import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { ModernCard } from '@/components/ui/modern-card';

interface LoadingMessageProps {
  message?: string;
  showSpinner?: boolean;
  variant?: 'default' | 'glass' | 'minimal';
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({
  message,
  showSpinner = true,
  variant = 'glass'
}) => {
  const { t } = useTranslation();

  const loadingVariants = {
    default: {
      card: "flex items-center justify-center h-full w-full p-8",
      container: "text-center space-y-4",
      text: "text-gray-700 dark:text-gray-300"
    },
    glass: {
      card: "flex items-center justify-center h-full w-full p-8 backdrop-blur-xl bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20",
      container: "text-center space-y-6",
      text: "text-gray-800 dark:text-gray-200"
    },
    minimal: {
      card: "flex items-center justify-center h-full w-full p-4",
      container: "text-center space-y-2",
      text: "text-gray-600 dark:text-gray-400"
    }
  };

  const currentVariant = loadingVariants[variant];

  return (
    <ModernCard variant={variant === 'glass' ? 'glass' : 'minimal'} className={currentVariant.card}>
      <div className={currentVariant.container}>
        {showSpinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 size={32} className="text-white" />
              </motion.div>
            </div>

            {/* Animated rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-purple-400/20"
              animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                initial={{
                  x: Math.cos((i * 60) * Math.PI / 180) * 30,
                  y: Math.sin((i * 60) * Math.PI / 180) * 30,
                  opacity: 0
                }}
                animate={{
                  x: Math.cos((i * 60 + 360) * Math.PI / 180) * 40,
                  y: Math.sin((i * 60 + 360) * Math.PI / 180) * 40,
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2"
        >
          <motion.p
            className={`${currentVariant.text} text-lg font-medium`}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message || t('common.loading')}
          </motion.p>

          {variant === 'glass' && (
            <motion.div
              className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>{t('common.loading.please_wait')}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Progress dots */}
        {variant !== 'minimal' && (
          <motion.div
            className="flex items-center justify-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </ModernCard>
  );
};

export default LoadingMessage;