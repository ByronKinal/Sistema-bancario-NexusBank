import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/authStore.js';

const adminBaseURL = import.meta.env.VITE_BANKING_API_URL || import.meta.env.VITE_AUTH_URL || 'http://localhost:3007/api/v1';

const axiosAdminBanking = axios.create({
  baseURL: adminBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

axiosAdminBanking.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const adminRequest = async (method, url, dataOrConfig, maybeConfig) => {
  if (method === 'get') {
    return axiosAdminBanking.get(url, dataOrConfig);
  }
  if (method === 'post') {
    return axiosAdminBanking.post(url, dataOrConfig, maybeConfig);
  }
  if (method === 'put') {
    return axiosAdminBanking.put(url, dataOrConfig, maybeConfig);
  }
  throw new Error(`Unsupported method: ${method}`);
};

export const adminDashboardService = {
  getUsers: async (limit = 100) => {
    try {
      const response = await adminRequest('get', '/users', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getTransactions: async (limit = 50) => {
    try {
      const response = await adminRequest('get', '/admin/transactions', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin transactions:', error);
      throw error;
    }
  },

  getAccounts: async () => {
    try {
      // Usamos el endpoint global de accounts, que para los administradores retorna todas las cuentas.
      const response = await adminRequest('get', '/accounts');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin accounts:', error);
      throw error;
    }
  },

  getPendingAccountRequests: async () => {
    try {
      const response = await adminRequest('get', '/admin/account-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending account requests:', error);
      throw error;
    }
  },

  approveAccountRequest: async (id) => {
    try {
      const response = await adminRequest('post', `/admin/account-requests/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving account request:', error);
      throw error;
    }
  },

  rejectAccountRequest: async (id) => {
    try {
      const response = await adminRequest('post', `/admin/account-requests/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting account request:', error);
      throw error;
    }
  },

  getDepositRequests: async () => {
    try {
      const response = await adminRequest('get', '/accounts/deposit-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching deposit requests:', error);
      throw error;
    }
  },

  approveDeposit: async (id) => {
    try {
      const response = await adminRequest('put', `/accounts/deposit-requests/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving deposit:', error);
      throw error;
    }
  },

  rejectDeposit: async (id) => {
    try {
      const response = await adminRequest('put', `/accounts/deposit-requests/${id}/revert`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      throw error;
    }
  },

  approveAccount: async (id) => {
    try {
      const response = await adminRequest('post', `/admin/accounts/${id}/enable`);
      return response.data;
    } catch (error) {
      console.error('Error approving account:', error);
      throw error;
    }
  },

  rejectAccount: async (id) => {
    try {
      const response = await adminRequest('post', `/admin/accounts/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting account:', error);
      throw error;
    }
  },

  getEmployeesStats: async () => {
    try {
      const response = await adminRequest('get', '/users/employees/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching employees stats:', error);
      throw error;
    }
  }
};
