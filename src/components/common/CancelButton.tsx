import React from 'react';
import { GlassButton } from "@/components/ui/glass-button";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface CancelButtonProps {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  text?: string;
  className?: string; // Added className prop
}

const CancelButton: React.FC<CancelButtonProps> = ({ onClick, disabled, text, className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate(-1);
    }
  };

  return (
    <GlassButton
      type="button"
      variant="glass"
      effect="lift"
      className={`px-6 py-2 font-medium ${className || ''}`} // Apply className prop
      onClick={handleClick}
      disabled={disabled}
    >
      {text || t('common.cancel')}
    </GlassButton>
  );
};

export default CancelButton;