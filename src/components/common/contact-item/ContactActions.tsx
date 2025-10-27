import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2 } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { designTokens } from '@/lib/design-tokens';
import LoadingSpinner from '../LoadingSpinner';
import StandardizedDeleteDialog from '../StandardizedDeleteDialog';

interface ContactActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onDialogOpenChange: (open: boolean) => void;
  isDeleting: boolean;
  isDeleteDialogOpen: boolean;
  isDialogClosing: boolean;
  deleteTitle: string;
  deleteDescription: string;
}

export const ContactActions: React.FC<ContactActionsProps> = ({
  onEdit,
  onDelete,
  onDialogOpenChange,
  isDeleting,
  isDeleteDialogOpen,
  isDialogClosing,
  deleteTitle,
  deleteDescription
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex gap-4 flex-shrink-0" style={{ pointerEvents: 'auto' }}>
      <GlassButton
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 rounded-2xl"
        style={{
          background: 'rgba(59, 130, 246, 0.15)',
          border: `2px solid ${designTokens.colors.primary[300]}`,
          width: '44px',
          height: '44px',
          backdropFilter: 'blur(10px)'
        }}
        onClick={onEdit}
        aria-label={t('accessibility.edit_contact')}
      >
        <Edit size={24} style={{ color: designTokens.colors.primary[700] }} />
      </GlassButton>

      <GlassButton
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 rounded-2xl"
        style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: `2px solid ${designTokens.colors.error[300]}`,
          width: '44px',
          height: '44px',
          backdropFilter: 'blur(10px)'
        }}
        onClick={() => onDialogOpenChange(true)}
        disabled={isDeleting || isDialogClosing}
        aria-label={t('accessibility.delete_contact')}
      >
        {isDeleting ? (
          <LoadingSpinner size={24} />
        ) : (
          <Trash2 size={24} style={{ color: designTokens.colors.error[700] }} />
        )}
      </GlassButton>

      <StandardizedDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDialogOpenChange}
        onConfirm={onDelete}
        title={deleteTitle}
        description={deleteDescription}
        isDeleting={isDeleting}
      />
    </div>
  );
};
