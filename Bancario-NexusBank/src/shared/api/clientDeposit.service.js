import { axiosClient } from './api.js';

export const clientDepositService = {
  getAccounts: async () => {
    try {
      const response = await axiosClient.get('/accounts');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching client accounts:', error);
      throw error;
    }
  },

  createDepositRequest: async (payload) => {
    try {
      const response = await axiosClient.post('/accounts/deposit-requests', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating deposit request:', error);
      throw error;
    }
  }
};
