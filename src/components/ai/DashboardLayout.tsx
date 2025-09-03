import React from 'react';
import { Brain, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DashboardLayoutProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  headerStats?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showFooter?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  description,
  icon,
  headerStats,
  children,
  className = '',
  showFooter = true
}) => {
  useTranslation();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-900/90 dark:via-purple-900/30 dark:to-pink-900/30 p-4 backdrop-blur-sm ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="text-center py-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-2xl"></div>
          <div className="relative">
            <div className="flex justify-center mb-4">
              <div className="relative">
                {icon || <Brain size={64} className="text-blue-600" />}
                <Sparkles size={24} className="absolute -top-2 -right-2 text-yellow-500 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {headerStats && (
          <div className="px-4">
            {headerStats}
          </div>
        )}

        {/* Main Content */}
        <div className="px-4">
          {children}
        </div>

        {/* Footer - Only show if showFooter is true */}
        {showFooter && (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-white/20">
              <Brain size={16} className="text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                قدرت گرفته از هوش مصنوعی پیشرفته
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;