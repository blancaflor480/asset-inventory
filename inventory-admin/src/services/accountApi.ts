import api from '@/utils/api';
import type { Account } from '@/types/account';

export const accountApi = {
  create: async (data: Partial<Account>) => {
    const response = await api.post('/accounts', data); // Remove leading /api
    return response.data;
  },

  update: async (id: string, data: Partial<Account>) => {
    const response = await api.put(`/accounts/${id}`, data); // Remove leading /api
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/accounts/${id}`); // Remove leading /api
    return response.data;
  }
};