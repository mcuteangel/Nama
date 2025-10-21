import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  // Check if current language is RTL (Persian)
  const isRTL = i18n.language === 'fa';

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );

    // Animate entrance
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };

  const numberVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 10
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative z-10"
          >
            <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/10 dark:bg-gray-800/20 backdrop-blur-xl rounded-3xl">
              <CardContent className="p-8 text-center">
                {/* Animated 404 number */}
                <motion.div variants={itemVariants} className="mb-6">
                  <motion.h1
                    variants={numberVariants}
                    className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
                  >
                    404
                  </motion.h1>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full origin-center"
                  ></motion.div>
                </motion.div>

                {/* Error message */}
                <motion.div variants={itemVariants} className="mb-8">
                  <motion.h2
                    className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2"
                    variants={itemVariants}
                  >
                    {t("not_found.title")}
                  </motion.h2>
                  <motion.p
                    className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
                    variants={itemVariants}
                  >
                    {t("not_found.description")}
                  </motion.p>
                </motion.div>

                {/* Action buttons */}
                <motion.div variants={itemVariants} className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoHome}
                      className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-gray-800 dark:text-white font-medium py-3 text-base shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Home className="ml-2 h-5 w-5 inline" />
                      {t("not_found.go_home")}
                    </motion.button>

                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleGoBack}
                        variant="outline"
                        className="w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                      >
                        {isRTL ? (
                          <ArrowRight className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowLeft className="ml-2 h-4 w-4" />
                        )}
                        {t("not_found.go_back")}
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                      >
                        <RefreshCw className="ml-2 h-4 w-4" />
                        {t("not_found.try_again")}
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Additional info */}
                <motion.div
                  variants={itemVariants}
                  className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                  <motion.p
                    className="text-xs text-gray-500 dark:text-gray-400"
                    variants={itemVariants}
                  >
                    {t("not_found.support_message")}
                  </motion.p>
                  <motion.code
                    className="mt-2 inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-400"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                  >
                    {t("not_found.current_path", { path: location.pathname })}
                  </motion.code>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotFound;
