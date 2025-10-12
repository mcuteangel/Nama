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
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "./LoadingSpinner";

interface StandardizedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  confirmClassName?: string;
  cancelClassName?: string;
}

const StandardizedDialog: React.FC<StandardizedDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  isProcessing = false,
  confirmVariant = "default",
  confirmClassName,
  cancelClassName,
}) => {
  const { t } = useTranslation();

  const confirmButtonVariant = confirmVariant === "destructive" 
    ? "default" 
    : confirmVariant;

  const confirmButtonClass = confirmVariant === "destructive"
    ? "bg-red-600 hover:bg-red-700"
    : confirmClassName;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="glass rounded-2xl p-6 shadow-2xl border border-white/30 dark:border-gray-600/30 backdrop-blur-lg"
      >
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Add a small delay to ensure dialog is fully closed before allowing new interactions
              setTimeout(() => {
                onOpenChange(false);
              }, 10);
            }}
            className={cn(
              "px-6 py-2 font-medium glass-advanced border border-white/20 hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-md",
              cancelClassName
            )}
            asChild
          >
            <GlassButton variant="outline">
              {cancelText || t('actions.cancel')}
            </GlassButton>
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isProcessing}
            className={cn(
              "px-5 py-2.5 rounded-xl font-semibold hover-lift transition-all duration-300 shadow-md hover:shadow-lg",
              confirmButtonClass
            )}
            asChild
          >
            <GlassButton variant={confirmButtonVariant}>
              {isProcessing && <LoadingSpinner size={18} className="me-2" />}
              {confirmText || t('actions.confirm')}
            </GlassButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StandardizedDialog;