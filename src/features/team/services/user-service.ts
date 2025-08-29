import { api } from '../../../lib/api'

export interface User {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'GESTOR' | 'SUPPORT'
  createdAt: string
  updatedAt: string
}

export const userService = {
  async fetchUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      throw new Error('Erro ao carregar lista de usuários')
    }
  },

  async createUser(data: { name: string; email: string; password: string; role: 'OWNER' | 'SUPPORT' }): Promise<User> {
    try {
      const response = await api.post('/users', data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      throw new Error('Erro ao criar novo usuário')
    }
  },

  async updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      throw new Error('Erro ao atualizar usuário')
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`)
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      throw new Error('Erro ao remover usuário')
    }
  }
}
