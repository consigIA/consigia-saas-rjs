import axios from 'axios'
import { useAuthStore } from '../features/auth/stores/auth-store'

const API_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Adiciona o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Trata erros globalmente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Se não houver resposta do servidor
    if (!error.response) {
      throw new Error('Erro de conexão com o servidor')
    }

    // Se for erro de autenticação (401) ou autorização (403)
    if (error.response.status === 401 || error.response.status === 403) {
      const originalRequest = error.config

      // Se já tentou renovar o token, faz logout
      if (originalRequest._retry) {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      // Marca que já tentou renovar o token
      originalRequest._retry = true

      try {
        // Aqui você pode implementar a lógica de refresh token se tiver
        // Por enquanto, apenas rejeita o erro
        return Promise.reject(error)
      } catch (refreshError) {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    // Para outros erros, apenas rejeita
    return Promise.reject(error)
  }
)