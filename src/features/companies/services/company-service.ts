import axios from 'axios'
import { api } from '../../../lib/api'

interface CompanyUser {
  id: string
  name: string
  email: string
  role: string
}

export interface Company {
  id: string
  name: string
  tradingName: string
  cnpj: string
  email: string
  phone: string
  whatsapp: string
  zipCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  website: string
  description: string | null
  logo: string | null
  contactName: string
  contactEmail: string
  contactPhone: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  users: CompanyUser[]
}

export const companyService = {
  async fetchCompany(): Promise<Company> {
    try {
      const response = await api.get('/companies')

      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        throw new Error('Dados da empresa não encontrados')
      }

      return response.data[0] // Retorna a primeira empresa da lista
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Empresa não encontrada')
        }
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Sem permissão para acessar os dados da empresa')
        }
      }
      console.error('Erro ao buscar empresa:', error)
      throw new Error('Erro ao buscar dados da empresa')
    }
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    try {
      const response = await api.put(`/companies/${id}`, data)

      if (!response.data) {
        throw new Error('Erro ao atualizar dados da empresa')
      }

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Empresa não encontrada')
        }
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Sem permissão para atualizar os dados da empresa')
        }
        if (error.response?.status === 400) {
          throw new Error('Dados inválidos. Verifique as informações e tente novamente.')
        }
      }
      console.error('Erro ao atualizar empresa:', error)
      throw new Error('Erro ao atualizar dados da empresa')
    }
  }
}