import { useState } from 'react'
import {
  FiGrid,
  FiMessageSquare,
  FiUsers,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi'
import { SiWhatsapp } from 'react-icons/si'
import { LoadingSpinner } from '../../../components/loading-spinner'

// Tipos temporários
interface DashboardMetrics {
  totalConnections: number
  activeConnections: number
  totalMessages: number
  totalContacts: number
  activeAutomations: number
  totalAutomations: number
  messagesByDay: number
  messageSuccess: number
}

interface RecentActivity {
  id: string
  type: 'message' | 'automation' | 'connection'
  status: 'success' | 'error' | 'warning'
  description: string
  time: string
}

// Dados de exemplo
const mockMetrics: DashboardMetrics = {
  totalConnections: 5,
  activeConnections: 3,
  totalMessages: 12543,
  totalContacts: 847,
  activeAutomations: 8,
  totalAutomations: 12,
  messagesByDay: 234,
  messageSuccess: 98.7
}

const mockActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'message',
    status: 'success',
    description: 'Mensagem automática enviada para João Silva',
    time: '2 minutos atrás'
  },
  {
    id: '2',
    type: 'automation',
    status: 'warning',
    description: 'Fluxo de pagamento aguardando confirmação',
    time: '5 minutos atrás'
  },
  {
    id: '3',
    type: 'connection',
    status: 'error',
    description: 'Conexão BOT2 desconectada inesperadamente',
    time: '15 minutos atrás'
  }
]

export function DashboardPage() {
  const [metrics] = useState<DashboardMetrics>(mockMetrics)
  const [activities] = useState<RecentActivity[]>(mockActivities)
  const [isLoading] = useState(false)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <FiMessageSquare className="h-5 w-5" />
      case 'automation':
        return <FiActivity className="h-5 w-5" />
      default:
        return <SiWhatsapp className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <FiCheckCircle className="h-5 w-5 text-green-400" />
      case 'warning':
        return <FiAlertCircle className="h-5 w-5 text-yellow-400" />
      default:
        return <FiXCircle className="h-5 w-5 text-red-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] gap-4">
        <LoadingSpinner className="h-8 w-8" />
        <span className="text-lg font-light text-slate-400">
          Carregando dashboard...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative bg-slate-900/50 rounded-2xl p-6 overflow-hidden backdrop-blur-sm border border-white/[0.05]">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-purple-500/5 to-sky-500/5" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-gradient-to-br from-sky-500/10 to-purple-400/10 p-3 rounded-xl">
            <FiGrid className="h-6 w-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-light text-white/90 mb-2">
              Dashboard
            </h1>
            <p className="text-slate-400 font-light">
              Visão geral do seu sistema
            </p>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Conexões */}
        <div className="bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-sky-500/10 p-3 rounded-xl">
              <SiWhatsapp className="h-6 w-6 text-sky-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <FiArrowUp className="h-4 w-4" />
              <span>60%</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-light text-slate-400 mb-1">
              Conexões Ativas
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-light text-white/90">
                {metrics.activeConnections}
              </span>
              <span className="text-sm font-light text-slate-400 mb-1">
                / {metrics.totalConnections}
              </span>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/10 p-3 rounded-xl">
              <FiMessageSquare className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <FiArrowUp className="h-4 w-4" />
              <span>12%</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-light text-slate-400 mb-1">
              Mensagens por Dia
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-light text-white/90">
                {metrics.messagesByDay}
              </span>
              <span className="text-sm font-light text-slate-400 mb-1">
                msgs
              </span>
            </div>
          </div>
        </div>

        {/* Automações */}
        <div className="bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500/10 p-3 rounded-xl">
              <FiActivity className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="flex items-center gap-1 text-red-400 text-sm">
              <FiArrowDown className="h-4 w-4" />
              <span>8%</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-light text-slate-400 mb-1">
              Automações Ativas
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-light text-white/90">
                {metrics.activeAutomations}
              </span>
              <span className="text-sm font-light text-slate-400 mb-1">
                / {metrics.totalAutomations}
              </span>
            </div>
          </div>
        </div>

        {/* Contatos */}
        <div className="bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/10 p-3 rounded-xl">
              <FiUsers className="h-6 w-6 text-green-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <FiArrowUp className="h-4 w-4" />
              <span>25%</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-light text-slate-400 mb-1">
              Total de Contatos
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-light text-white/90">
                {metrics.totalContacts}
              </span>
              <span className="text-sm font-light text-slate-400 mb-1">
                contatos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatísticas */}
        <div className="bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] p-6">
          <h2 className="text-lg font-light text-white/90 mb-6">
            Estatísticas
          </h2>

          <div className="space-y-6">
            {/* Taxa de Sucesso */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-light text-slate-400">
                  Taxa de Sucesso
                </span>
                <span className="text-sm font-light text-green-400">
                  {metrics.messageSuccess}%
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                  style={{ width: `${metrics.messageSuccess}%` }}
                />
              </div>
            </div>

            {/* Total de Mensagens */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-light text-slate-400">
                  Total de Mensagens
                </span>
                <span className="text-sm font-light text-white/90">
                  {metrics.totalMessages}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                  style={{ width: '75%' }}
                />
              </div>
            </div>

            {/* Uso de Automações */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-light text-slate-400">
                  Uso de Automações
                </span>
                <span className="text-sm font-light text-white/90">
                  {(metrics.activeAutomations / metrics.totalAutomations * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                  style={{ width: `${(metrics.activeAutomations / metrics.totalAutomations * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] p-6">
          <h2 className="text-lg font-light text-white/90 mb-6">
            Atividades Recentes
          </h2>

          <div className="space-y-6">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-6 border-b border-white/[0.05] last:pb-0 last:border-0"
              >
                <div className={`
                  p-2 rounded-lg
                  ${activity.type === 'message' ? 'bg-purple-500/10' :
                    activity.type === 'automation' ? 'bg-yellow-500/10' :
                      'bg-sky-500/10'}
                `}>
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-light text-slate-300 mb-1 truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <FiClock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-light text-slate-500">
                      {activity.time}
                    </span>
                  </div>
                </div>

                {getStatusIcon(activity.status)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
