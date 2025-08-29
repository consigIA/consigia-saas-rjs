import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../features/auth/stores/auth-store'
import { AccessDenied } from './access-denied'

interface RouteGuardProps {
  allowedPlans?: string[]
  requiredRole?: string
  fallbackPath?: string
}

export function RouteGuard({ 
  allowedPlans = [], 
  requiredRole, 
  fallbackPath = '/dashboard/clt' 
}: RouteGuardProps) {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Verifica se o usuário tem o plano CLT ativo
  const hasCLTPlan = user.company?.services?.some(
    service => service.serviceType === 'CONSULTA_CLT' && service.isActive
  )

  // Se tem plano CLT, só pode acessar rotas permitidas
  if (hasCLTPlan) {
    // Se a rota atual não está na lista de planos permitidos, mostra acesso negado
    if (allowedPlans.length > 0 && !allowedPlans.includes('CONSULTA_CLT')) {
      return <AccessDenied 
        message="Esta funcionalidade não está disponível no seu plano atual. Usuários com Plano CLT podem acessar apenas a funcionalidade de Consulta CLT."
        backPath={fallbackPath}
      />
    }
  }

  // Verifica se o usuário tem a role necessária
  if (requiredRole && user.role !== requiredRole) {
    return <AccessDenied 
      message="Você não tem permissão para acessar esta funcionalidade. Entre em contato com o administrador."
      backPath={fallbackPath}
    />
  }

  return <Outlet />
}
