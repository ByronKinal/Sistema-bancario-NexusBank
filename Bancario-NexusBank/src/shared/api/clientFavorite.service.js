import axios from 'axios';
import { axiosClient } from './api.js';
import { useAuthStore } from '../../features/auth/store/authStore.js';

const fallbackBaseURL = import.meta.env.VITE_BANKING_API_URL || import.meta.env.VITE_AUTH_URL || 'http://localhost:3007/api/v1';

const axiosClientFallback = axios.create({
  baseURL: fallbackBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const runRequestWithFallback = async (request, fallbackRequest) => {
  try {
    return await request();
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    return fallbackRequest();
  }
};

const normalizeFavorite = (favorite = {}) => ({
  id: favorite.id || favorite._id || '',
  accountNumber: favorite.accountNumber || '',
  accountType: String(favorite.accountType || '').toLowerCase() || 'ahorro',
  alias: favorite.alias || '',
  isActive: favorite.isActive ?? true,
  createdAt: favorite.createdAt || null,
  updatedAt: favorite.updatedAt || null,
});

const unwrap = (response) => response?.data?.data || response?.data || {};

export const clientFavoriteService = {
  getFavorites: async (params = {}) => {
    const response = await runRequestWithFallback(
      () => axiosClient.get('/favorites', { params }),
      () => axiosClientFallback.get('/favorites', { params, headers: getAuthHeaders() })
    );

    const data = unwrap(response);
    const favorites = Array.isArray(data?.favorites) ? data.favorites : Array.isArray(data) ? data : [];

    return favorites.map((item) => normalizeFavorite(item));
  },

  createFavorite: async (payload) => {
    const response = await runRequestWithFallback(
      () => axiosClient.post('/favorites', payload),
      () => axiosClientFallback.post('/favorites', payload, { headers: getAuthHeaders() })
    );

    return normalizeFavorite(unwrap(response));
  },

  updateFavorite: async (favoriteId, payload) => {
    const response = await runRequestWithFallback(
      () => axiosClient.put(`/favorites/${favoriteId}`, payload),
      () => axiosClientFallback.put(`/favorites/${favoriteId}`, payload, { headers: getAuthHeaders() })
    );

    return normalizeFavorite(unwrap(response));
  },

  deleteFavorite: async (favoriteId) => {
    const response = await runRequestWithFallback(
      () => axiosClient.delete(`/favorites/${favoriteId}`),
      () => axiosClientFallback.delete(`/favorites/${favoriteId}`, { headers: getAuthHeaders() })
    );

    return unwrap(response);
  },
};
