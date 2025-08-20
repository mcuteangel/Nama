import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string): string | number => { // Allow string | number as return type
  return toast.loading(message);
};

export const dismissToast = (toastId: string | number) => { // Allow string | number for dismissal
  toast.dismiss(toastId);
};