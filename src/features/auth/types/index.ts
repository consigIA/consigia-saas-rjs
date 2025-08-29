// Definição dos tipos
export type Role = 'GESTOR' | 'OWNER' | 'SUPPORT'

export type CompanyService = {
  id: string
  serviceType: string
  planType: string
  status: string
  isActive: boolean
  maxInstances: number | null
  maxConsultas: number
  maxUsers: number
  currentInstances: number
  currentConsultas: number
  currentUsers: number
  lastRenewal: string | null
}

export type Company = {
  id: string
  name: string
  cnpj: string
  email: string
  services: CompanyService[]
}

export type User = {
  id: string
  name: string
  email: string
  role: Role
  companyId: string
  company: Company
  createdAt: string
}

export type AuthResponse = {
  token: string
  user: User
}

export type LoginData = {
  email: string
  password: string
}

export type RegisterData = LoginData & {
  name: string
  company: string
}