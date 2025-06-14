import axios from 'axios'
import type { Asset } from '@/types/asset'
import type { Account } from '@/types/account'
import { API_BASE_URL } from '@/config/api'

// Export the api instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Create account API methods
export const accountApi = {
  getAll: async (params: { page: number; limit: number; roleFilter: string; sortOrder: 'ASC' | 'DESC' }) => {
    const response = await api.get(`${API_BASE_URL}/accounts`, { params })
    return response.data
  },
  
  create: async (data: Partial<Account>) => {
    const response = await api.post(`${API_BASE_URL}/accounts`, data)
    return response.data
  },

  update: async (id: string, data: Partial<Account>) => {
    const response = await api.put(`${API_BASE_URL}/accounts/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE_URL}/accounts/${id}`)
    return response.data
  }
}

export const assetApi = {
  getAll: async (params: { page: number; limit: number; search: string }) => {
    const response = await api.get(`${API_BASE_URL}/inventory`, { params })
    return response.data
  },
  create: async (data: Partial<Asset>) => {
    try {
      console.log('API sending data:', data)
      const response = await api.post(`${API_BASE_URL}/inventory`, data)
      console.log('API response:', response.data)
      return response.data
    } catch (error) {
      console.error('API Error:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message)
      }
      throw error
    }
  },
  update: async (id: string, data: Partial<Asset>) => {
    const response = await api.put(`${API_BASE_URL}/inventory/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE_URL}/inventory/${id}`)
    return response.data

  }
}