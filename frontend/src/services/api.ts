import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  getContext: async (branch?: string): Promise<any> => {
    const params = branch ? { branch } : {}
    const response = await apiClient.get('/context', { params })
    return response.data
  },

  saveMemory: async (data: any): Promise<any> => {
    const response = await apiClient.post('/memory', data)
    return response.data
  },

  getMemory: async (branch?: string, hours: number = 24): Promise<any> => {
    const params: any = { hours }
    if (branch) {
      params.branch = branch
    }
    const response = await apiClient.get('/memory', { params })
    return response.data
  },
}

