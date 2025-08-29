import axios from 'axios'
import { api as baseApi } from '../../../lib/api'
import { useAuthStore } from '../../auth/stores/auth-store'
import type { EvolutionApiConfig } from '../types/evolution-api'

// Cliente Axios para a Evolution API
let api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

// Função para atualizar a configuração do cliente
const updateEvolutionApiConfig = (config: EvolutionApiConfig) => {
  api = axios.create({
    baseURL: config.baseUrl,
    headers: {
      'apikey': config.apiKey,
      'Content-Type': 'application/json',
    },
  })
}

// Função para buscar e configurar as credenciais
const fetchAndSetupEvolutionApi = async () => {
  try {
    const response = await baseApi.get<EvolutionApiConfig>('/evolution-api')
    updateEvolutionApiConfig(response.data)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar configurações da Evolution API:', error)
    throw new Error('Não foi possível carregar as configurações da Evolution API')
  }
}

// Adiciona o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface WhatsAppInstance {
  id: string
  name: string
  connectionStatus: 'open' | 'connecting' | 'closed'
  ownerJid: string | null
  profileName: string | null
  profilePicUrl: string | null
  integration: string
  token: string
  disconnectionAt: string | null
  createdAt: string
  updatedAt: string
  Setting: {
    id: string
    rejectCall: boolean
    msgCall: string
    groupsIgnore: boolean
    alwaysOnline: boolean
    readMessages: boolean
    readStatus: boolean
    syncFullHistory: boolean
    instanceId: string
  }
  _count: {
    Message: number
    Contact: number
    Chat: number
  }
}

export interface CreateInstancePayload {
  instanceName: string
  qrcode?: boolean
  integration: 'WHATSAPP-BAILEYS'
  rejectCall?: boolean
  groupsIgnore?: boolean
  alwaysOnline?: boolean
  webhook?: {
    url: string
    byEvents?: boolean
    base64?: boolean
    headers?: Record<string, string>
    events?: string[]
  }
}

export interface QRCodeResponse {
  pairingCode: string | null
  code: string
  base64: string
  count: number
}

export const evolutionApiService = {
  setup: fetchAndSetupEvolutionApi,
  async fetchInstances(): Promise<WhatsAppInstance[]> {
    try {
      const response = await api.get('/instance/fetchInstances')
      // Verifica se a resposta é um array
      if (Array.isArray(response.data)) {
        return response.data
      }
      // Se não for array, verifica se está dentro de alguma propriedade da resposta
      if (response.data && Array.isArray(response.data.instances)) {
        return response.data.instances
      }
      // Se não encontrar array, retorna array vazio
      console.warn('Resposta da API não contém um array de instâncias:', response.data)
      return []
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error)
      throw error
    }
  },

  async createInstance(data: CreateInstancePayload) {
    try {
      const response = await api.post('/instance/create', data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar instância:', error)
      throw error
    }
  },

  async connectInstance(instanceName: string): Promise<QRCodeResponse> {
    try {
      const response = await api.get(`/instance/connect/${instanceName}`)
      return response.data
    } catch (error) {
      console.error('Erro ao conectar instância:', error)
      throw error
    }
  },

  async logoutInstance(instanceName: string): Promise<void> {
    try {
      await api.delete(`/instance/logout/${instanceName}`)
    } catch (error) {
      console.error('Erro ao desconectar instância:', error)
      throw error
    }
  },

  async deleteInstance(instanceName: string): Promise<void> {
    try {
      await api.delete(`/instance/delete/${instanceName}`)
    } catch (error) {
      console.error('Erro ao deletar instância:', error)
      throw error
    }
  },

  // Exemplo de payload para criar uma instância
  getDefaultInstancePayload(instanceName: string): CreateInstancePayload {
    return {
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
      rejectCall: true,
      groupsIgnore: true,
      webhook: {
        url: `${import.meta.env.VITE_API_URL}/webhook/whatsapp`,
        byEvents: false,
        base64: true,
        headers: {
          'Content-Type': 'application/json'
        },
        events: ['MESSAGES_UPSERT']
      }
    }
  }
}