import { axiosClient } from './api.js';

export const getClientPromotions = async (search = '') => {
  try {
    const response = await axiosClient.get(`/catalog`, {
      params: { search }
    });
    return response.data;
  } catch (error) {
    console.error('Error in getClientPromotions:', error);
    throw error;
  }
};
