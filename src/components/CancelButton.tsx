import React from 'react';
import { Button } from '@/components/ui/button';
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
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold shadow-md transition-all duration-300 transform hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600"
      disabled={disabled}
    >
      {text || t('common.cancel')}
    </Button>
  );
};

export default CancelButton;