import { ReactNode } from 'react'
import { useAuthStore } from '../stores/auth-store'
import type { Role } from '../types'

type RoleGuardProps = {
  children: ReactNode
  allowedRoles: Role[]
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user)

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback
  }

  return <>{children}</>
}

// Hook para verificar permissões
export function useHasPermission(allowedRoles: Role[]): boolean {
  const user = useAuthStore((state) => state.user)
  return !!user && allowedRoles.includes(user.role)
}

// Constantes para permissões específicas
export const PERMISSIONS = {
  // Permissões do GESTOR
  MANAGE_SAAS: ['GESTOR'] as Role[],
  CREATE_COMPANY: ['GESTOR'] as Role[],
  VIEW_ALL_DATA: ['GESTOR'] as Role[],

  // Permissões do OWNER
  MANAGE_OWN_COMPANY: ['OWNER', 'GESTOR'] as Role[],
  VIEW_COMPANY_DATA: ['OWNER', 'GESTOR'] as Role[],

  // Permissões do SUPPORT
  TECHNICAL_CONFIG: ['SUPPORT', 'GESTOR'] as Role[],

  // Permissões compartilhadas
  VIEW_BASIC_DATA: ['GESTOR', 'OWNER', 'SUPPORT'] as Role[],
} as const
