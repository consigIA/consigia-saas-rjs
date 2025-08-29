import { api } from '../../../lib/api'

export interface Lead {
  id: number
  createdAt: string
  userNumber: string
  userCpf: string | null
  userName: string
  statusCpf: string | null
  valorDisponivel: number | null
  updatedAt: string
}

export const leadService = {
  async fetchLeads(): Promise<Lead[]> {
    try {
      const response = await api.get('/leads')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
      throw new Error('Erro ao carregar lista de leads')
    }
  }
}
