import { FiLock, FiArrowLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../features/auth/stores/auth-store'

interface AccessDeniedProps {
  message?: string
  backPath?: string
}

export function AccessDenied({ 
  message = "Você não tem permissão para acessar esta página",
  backPath = "/dashboard/clt"
}: AccessDeniedProps) {
  const user = useAuthStore((state) => state.user)
  
  const hasCLTPlan = user?.company?.services?.some(
    service => service.serviceType === 'CONSULTA_CLT' && service.isActive
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-primary)] p-4">
      <div className="max-w-md w-full text-center">
        {/* Ícone de Acesso Negado */}
        <div className="mx-auto w-20 h-20 bg-[var(--status-error)]/10 rounded-full flex items-center justify-center mb-6">
          <FiLock className="w-10 h-10 text-[var(--status-error)]" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-light text-[var(--text-primary)] mb-4">
          Acesso Negado
        </h1>

        {/* Mensagem */}
        <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
          {message}
        </p>

        {/* Informações do Plano */}
        {hasCLTPlan && (
          <div className="bg-[var(--background-secondary)] rounded-xl p-4 mb-6 border border-[var(--border-light)]">
            <div className="text-sm text-[var(--text-tertiary)] mb-2">
              Seu plano atual:
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              Plano CLT
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-2">
              Este plano permite acesso apenas à funcionalidade de Consulta CLT
            </div>
          </div>
        )}

        {/* Botão de Voltar */}
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl hover:bg-[var(--accent-primary)]/90 transition-colors font-medium"
        >
          <FiArrowLeft className="w-4 h-4" />
          Voltar para {hasCLTPlan ? 'Consulta CLT' : 'Dashboard'}
        </Link>

        {/* Link para Suporte */}
        <div className="mt-6">
          <p className="text-sm text-[var(--text-tertiary)]">
            Precisa de acesso a mais funcionalidades?{' '}
            <Link 
              to="/dashboard/settings" 
              className="text-[var(--accent-primary)] hover:underline"
            >
              Entre em contato com o suporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
