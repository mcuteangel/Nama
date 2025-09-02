import React from "react";
import StandardizedDialog from "./StandardizedDialog";
import { useTranslation } from "react-i18next";

interface StandardizedDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isDeleting?: boolean;
}

const StandardizedDeleteDialog: React.FC<StandardizedDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  isDeleting = false,
}) => {
  const { t } = useTranslation();

  return (
    <StandardizedDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText={t('actions.delete')}
      confirmVariant="destructive"
      isProcessing={isDeleting}
    />
  );
};

export default StandardizedDeleteDialog;