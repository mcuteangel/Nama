import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GlassButton } from "@/components/ui/glass-button";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "./LoadingSpinner";

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass rounded-2xl p-6 shadow-2xl border border-white/30 dark:border-gray-600/30 backdrop-blur-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-800 dark:text-gray-100 text-xl">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel 
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 font-medium glass-advanced border border-white/20 hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-md"
            asChild
          >
            <GlassButton variant="outline">
              {t('actions.cancel')}
            </GlassButton>
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold hover-lift transition-all duration-300 shadow-md hover:shadow-lg"
            asChild
          >
            <GlassButton variant="default" className="bg-red-600 hover:bg-red-700">
              {isDeleting && <LoadingSpinner size={18} className="me-2" />}
              {t('actions.delete')}
            </GlassButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StandardizedDeleteDialog;