import { create } from 'zustand';
import { api } from '../services/api';

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get<Notification[]>('/notifications');
      const notifications = response.data || [];
      const unreadCount = notifications.filter(n => !n.isRead).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get<{ count: number }>('/notifications/unread-count');
      set({ unreadCount: response.data.count || 0 });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (id: string) => {
    try {
      // Optimistic update
      const { notifications, unreadCount } = get();
      const updatedNotifications = notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      const updatedUnreadCount = Math.max(0, unreadCount - 1);
      set({ notifications: updatedNotifications, unreadCount: updatedUnreadCount });

      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
      // Revert if error
      get().fetchNotifications();
    }
  },

  markAllAsRead: async () => {
    try {
      // Optimistic update
      const { notifications } = get();
      const updatedNotifications = notifications.map((n) => ({ ...n, isRead: true }));
      set({ notifications: updatedNotifications, unreadCount: 0 });

      await api.patch('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert if error
      get().fetchNotifications();
    }
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
