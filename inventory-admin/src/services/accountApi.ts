import api from '@/utils/api';
import type { Account } from '@/types/account';
import { API_BASE_URL } from '@/config/api';

export const accountApi = {
  create: async (data: Partial<Account>) => {
    const response = await api.post(`${API_BASE_URL}/accounts`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Account>) => {
    const response = await api.put(`${API_BASE_URL}/accounts/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE_URL}/accounts/${id}`);
    return response.data;
  }
};