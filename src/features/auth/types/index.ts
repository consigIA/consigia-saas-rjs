// Definição dos tipos
export type Role = 'GESTOR' | 'OWNER' | 'SUPPORT'

export type User = {
  id: string
  name: string
  email: string
  role: Role
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