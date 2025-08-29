import React from 'react';
import { ModernButton } from '@/components/ui/modern-button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface CancelButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  text?: string;
}

const CancelButton: React.FC<CancelButtonProps> = ({ onClick, disabled, text }) => {
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
    <ModernButton
      type="button"
      variant="glass"
      onClick={handleClick}
      className="hover-lift !bg-gradient-to-br !from-gray-300/20 !via-gray-400/15 !to-gray-500/10 !border !border-gray-400/20 dark:!from-gray-500/20 dark:!via-gray-600/15 dark:!to-gray-700/10 dark:!border-gray-500/20 text-gray-700 dark:text-gray-300"
      disabled={disabled}
    >
      {text || t('common.cancel')}
    </ModernButton>
  );
};

export default CancelButton;