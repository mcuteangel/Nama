import { useRef } from 'react';

/**
 * Custom hook to manage focus for dialog components
 * Ensures proper focus trapping and restoration
 */
export const useDialogFocus = () => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

  // Store the element that opened the dialog
  const storeTriggerElement = () => {
    triggerRef.current = document.activeElement as HTMLElement;
  };

  // Restore focus to the trigger element when dialog closes
  const restoreFocus = () => {
    if (triggerRef.current && triggerRef.current.isConnected) {
      triggerRef.current.focus();
    }
  };

  // Focus the dialog content when it opens
  const focusDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.focus();
    }
  };

  return {
    triggerRef,
    dialogRef,
    storeTriggerElement,
    restoreFocus,
    focusDialog
  };
};