import axios from 'axios'
import type { Asset } from '@/types/asset'

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // adjust this to match your backend URL
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for auth token
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

export const assetApi = {
  getAll: async (params: { page: number; limit: number; search: string }) => {
    const response = await api.get('/inventory', { params })
    return response.data
  },
  create: async (data: Partial<Asset>) => {
    try {
      console.log('API sending data:', data)
      const response = await api.post('/inventory', data)
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
    const response = await api.put(`/inventory/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/inventory/${id}`)
    return response.data
  }
}