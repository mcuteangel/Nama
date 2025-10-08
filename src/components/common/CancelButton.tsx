import React from 'react';
import { GlassButton } from "@/components/ui/glass-button";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface CancelButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  text?: string;
  className?: string; // Added className prop
}

const CancelButton: React.FC<CancelButtonProps> = ({ onClick, disabled, text, className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <GlassButton
      type="button"
      variant="outline"
      className={`group relative overflow-hidden rounded-2xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 ${className || ''}`}
      onClick={handleClick}
      disabled={disabled}
    >
      <div className="relative z-10">
        {text || t('common.cancel')}
      </div>
    </GlassButton>
  );
};

export default CancelButton;