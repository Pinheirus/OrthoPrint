import { create } from 'zustand';

interface NotificationState {
  isVisible: boolean;
  title: string;
  message: string;
  showNotification: (title: string, message: string, duration?: number) => void;
  hideNotification: () => void;
}

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export const useNotificationStore = create<NotificationState>((set) => ({
  isVisible: false,
  title: '',
  message: '',
  showNotification: (title, message, duration = 4000) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    set({ isVisible: true, title, message });

    timeoutId = setTimeout(() => {
      set({ isVisible: false });
      timeoutId = null;
    }, duration);
  },
  hideNotification: () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    set({ isVisible: false });
  },
}));
