import { axiosAuth } from './api.js';
import { useAuthStore } from '../../features/auth/store/authStore.js';

export const notificationService = {
  getMyNotifications: async () => {
    try {
      const token = useAuthStore.getState().token;
      const res = await axiosAuth.get('/notifications', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      return res.data;
    } catch (err) {
      console.error('notificationService.getMyNotifications error', err?.response?.data || err?.message || err);
      // Return a fallback shape so callers can handle gracefully
      return { success: false, data: [] };
    }
  },

  markAsRead: async (id) => {
    try {
      const token = useAuthStore.getState().token;
      const res = await axiosAuth.put(`/notifications/${id}/read`, null, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      return res.data;
    } catch (err) {
      console.error('notificationService.markAsRead error', err?.response?.data || err?.message || err);
      return { success: false };
    }
  }
};
