// frontend/src/utils/toastWithSound.ts
import { toast as sonnerToast } from 'sonner';
import { playNotificationSound } from './sound';

// Named export for consistency
export const toast = {
  success: (message: string, options?: any) => {
    playNotificationSound();
    sonnerToast.success(message, options);
  },
  error: (message: string, options?: any) => {
    sonnerToast.error(message, options);
  },
  info: (message: string, options?: any) => {
    playNotificationSound();
    sonnerToast.info(message, options);
  },
  warning: (message: string, options?: any) => {
    sonnerToast.warning(message, options);
  },
  loading: (message: string, options?: any) => sonnerToast.loading(message, options),
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
  custom: sonnerToast.custom,
};

// Also export as default for backward compatibility
export default toast;