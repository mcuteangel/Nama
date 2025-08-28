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
      variant="outline"
      onClick={handleClick}
      className="hover-lift"
      disabled={disabled}
    >
      {text || t('common.cancel')}
    </ModernButton>
  );
};

export default CancelButton;