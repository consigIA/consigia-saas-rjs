import type { LoginData, AuthResponse } from '../types'
import { api } from '../../../lib/api'

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/sessions', data)
      return response.data
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw new Error('Credenciais inválidas')
    }
  },
}