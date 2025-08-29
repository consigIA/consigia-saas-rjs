import { useState, useMemo } from 'react'
import {
  FiActivity,
  FiPlay,
  FiPause,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiClock,
  FiMessageSquare,
  FiCheck,
  FiX,
  FiGrid,
  FiList,
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiFilter
} from 'react-icons/fi'
import { LoadingSpinner } from '../../../components/loading-spinner'

// Tipos temporários (depois serão movidos para um arquivo de tipos)
interface Automation {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'error'
  type: 'message' | 'notification' | 'integration'
  lastRun: string
  totalExecutions: number
  successRate: number
}

// Dados de exemplo (depois virão da API)
const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Resposta Automática',
    description: 'Responde mensagens fora do horário comercial',
    status: 'active',
    type: 'message',
    lastRun: '2024-01-15T10:30:00',
    totalExecutions: 1234,
    successRate: 98.5
  },
  {
    id: '2',
    name: 'Notificação de Pagamento',
    description: 'Envia confirmação quando um pagamento é recebido',
    status: 'active',
    type: 'notification',
    lastRun: '2024-01-15T09:45:00',
    totalExecutions: 567,
    successRate: 99.1
  },
  {
    id: '3',
    name: 'Integração com CRM',
    description: 'Sincroniza contatos com o sistema CRM',
    status: 'inactive',
    type: 'integration',
    lastRun: '2024-01-14T15:20:00',
    totalExecutions: 89,
    successRate: 95.7
  }
]

export function AutomationsPage() {
  const [automations] = useState<Automation[]>(mockAutomations)
  const [isLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive' | 'error'>('ALL')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'message' | 'notification' | 'integration'>('ALL')
  const [sortField, setSortField] = useState<'name' | 'status' | 'type' | 'lastRun'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Função para ordenar automações
  const sortAutomations = (a: Automation, b: Automation) => {
    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    }
    if (sortField === 'status') {
      return sortDirection === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status)
    }
    if (sortField === 'type') {
      return sortDirection === 'asc'
        ? a.type.localeCompare(b.type)
        : b.type.localeCompare(a.type)
    }
    // lastRun
    return sortDirection === 'asc'
      ? new Date(a.lastRun).getTime() - new Date(b.lastRun).getTime()
      : new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime()
  }

  // Filtra e ordena automações
  const filteredAndSortedAutomations = useMemo(() => {
    return automations
      .filter(automation => {
        const matchesStatus = statusFilter === 'ALL' || automation.status === statusFilter
        const matchesType = typeFilter === 'ALL' || automation.type === typeFilter
        const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          automation.description.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesType && matchesSearch
      })
      .sort(sortAutomations)
  }, [automations, statusFilter, typeFilter, searchTerm, sortField, sortDirection])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-[var(--status-success)]'
      case 'inactive':
        return 'text-[var(--text-tertiary)]'
      default:
        return 'text-[var(--status-error)]'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FiCheck className="h-5 w-5" />
      case 'inactive':
        return <FiPause className="h-5 w-5" />
      default:
        return <FiX className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/10'
      case 'notification':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10'
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'message':
        return 'Mensagem'
      case 'notification':
        return 'Notificação'
      default:
        return 'Integração'
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] gap-4">
        <LoadingSpinner className="h-8 w-8" />
        <span className="text-lg font-light text-slate-400">
          Carregando automações...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative bg-[var(--background-secondary)] rounded-2xl p-6 overflow-hidden backdrop-blur-sm border border-[var(--border-light)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)] opacity-5" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--gradient-secondary)] p-3 rounded-xl">
              <FiActivity className="h-6 w-6 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-[var(--text-primary)] mb-2">
                Automações
              </h1>
              <p className="text-[var(--text-tertiary)] font-light">
                Gerencie seus fluxos automatizados do WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle de Visualização */}
            <div className="bg-[var(--background-tertiary)]/50 rounded-lg border border-[var(--border-light)] flex">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 h-11 rounded-lg flex items-center gap-2 transition-colors duration-300 ${viewMode === 'cards'
                    ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
              >
                <FiGrid className="h-5 w-5" />
                <span className="text-sm font-light">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 h-11 rounded-lg flex items-center gap-2 transition-colors duration-300 ${viewMode === 'list'
                    ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
              >
                <FiList className="h-5 w-5" />
                <span className="text-sm font-light">Lista</span>
              </button>
            </div>

            <button
              className="px-4 h-11 rounded-xl bg-[var(--gradient-primary)]
                text-white font-light transition-all duration-300
                hover:shadow-lg hover:shadow-[var(--accent-primary)]/20
                focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-sm flex items-center gap-2"
            >
              <FiPlus className="h-5 w-5" />
              Nova Automação
            </button>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-[var(--background-secondary)] backdrop-blur-lg rounded-xl border border-[var(--border-light)] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                  text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] 
                  focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
              />
              <FiSearch className="absolute left-3 top-3.5 h-4 w-4 text-[var(--text-tertiary)]" />
            </div>
          </div>

          {/* Filtro por Status */}
          <div className="flex-shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-11 px-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                text-[var(--text-primary)] focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
            >
              <option value="ALL">Todos os Status</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
              <option value="error">Com Erro</option>
            </select>
          </div>

          {/* Filtro por Tipo */}
          <div className="flex-shrink-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="h-11 px-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                text-[var(--text-primary)] focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="message">Mensagens</option>
              <option value="notification">Notificações</option>
              <option value="integration">Integrações</option>
            </select>
          </div>

          {/* Ordenação */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as typeof sortField)}
              className="h-11 px-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                text-[var(--text-primary)] focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
            >
              <option value="name">Nome</option>
              <option value="status">Status</option>
              <option value="type">Tipo</option>
              <option value="lastRun">Última Execução</option>
            </select>

            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="h-11 w-11 rounded-lg bg-[var(--background-tertiary)]/50 border border-[var(--border-light)]
                text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] flex items-center justify-center"
            >
              {sortDirection === 'asc' ? (
                <FiChevronUp className="h-5 w-5" />
              ) : (
                <FiChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mt-4 pt-4 border-t border-[var(--border-light)] flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <FiActivity className="h-4 w-4" />
            <span>Total: {filteredAndSortedAutomations.length}</span>
          </div>
          {statusFilter === 'ALL' && (
            <>
              <div className="w-px h-4 bg-[var(--border-light)]" />
              <div className="text-[var(--status-success)]">{automations.filter(a => a.status === 'active').length} Ativas</div>
              <div className="text-[var(--text-tertiary)]">{automations.filter(a => a.status === 'inactive').length} Inativas</div>
              <div className="text-[var(--status-error)]">{automations.filter(a => a.status === 'error').length} Com Erro</div>
            </>
          )}
        </div>
      </div>

      {/* Lista de Automações */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedAutomations.map((automation) => (
            <div
              key={automation.id}
              className="group relative bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-2xl border border-[var(--border-light)] p-6
              hover:border-[var(--border-medium)] transition-all duration-500"
            >
              {/* Gradiente de hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/0 via-[var(--accent-primary)]/[0.02] to-[var(--accent-secondary)]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              <div className="relative">
                {/* Cabeçalho */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-light text-[var(--text-primary)] group-hover:text-white transition-colors">
                        {automation.name}
                      </h3>
                      <span
                        className={`
                        px-2 py-0.5 rounded-full text-xs
                        border
                        transition-colors duration-300
                        ${getTypeColor(automation.type)}
                      `}
                      >
                        {getTypeName(automation.type)}
                      </span>
                    </div>
                    <p className="text-sm font-light text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                      {automation.description}
                    </p>
                  </div>

                  <div
                    className={`
                    ${getStatusColor(automation.status)} 
                    flex items-center gap-2 px-3 py-1.5 rounded-full
                    bg-[var(--background-tertiary)]/50 text-sm font-light
                    border border-[var(--border-light)] group-hover:border-[var(--border-medium)]
                    transition-all duration-300
                  `}
                  >
                    {getStatusIcon(automation.status)}
                    {automation.status === 'active' ? 'Ativa' : automation.status === 'inactive' ? 'Inativa' : 'Erro'}
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-[var(--background-tertiary)]/30 rounded-xl p-4 border border-[var(--border-light)] group-hover:border-[var(--border-medium)] transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <FiMessageSquare className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <span className="text-sm text-[var(--text-tertiary)] font-light">Total</span>
                    </div>
                    <span className="text-xl text-[var(--text-primary)] font-light">
                      {automation.totalExecutions}
                    </span>
                  </div>

                  <div className="bg-[var(--background-tertiary)]/30 rounded-xl p-4 border border-[var(--border-light)] group-hover:border-[var(--border-medium)] transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <FiCheck className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <span className="text-sm text-[var(--text-tertiary)] font-light">Sucesso</span>
                    </div>
                    <span className="text-xl text-[var(--text-primary)] font-light">
                      {automation.successRate}%
                    </span>
                  </div>

                  <div className="bg-[var(--background-tertiary)]/30 rounded-xl p-4 border border-[var(--border-light)] group-hover:border-[var(--border-medium)] transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <FiClock className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <span className="text-sm text-[var(--text-tertiary)] font-light">Última</span>
                    </div>
                    <span className="text-sm text-[var(--text-primary)] font-light">
                      {new Date(automation.lastRun).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    className={`
                    flex-1 h-11 rounded-xl text-sm font-light
                    transition-all duration-300
                    bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                    hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                    flex items-center justify-center gap-2
                    border border-[var(--border-light)] hover:border-[var(--border-medium)]
                  `}
                  >
                    <FiPlay className="h-4 w-4" />
                    Executar
                  </button>

                  <button
                    className={`
                    w-11 h-11 rounded-xl text-sm font-light
                    transition-all duration-300
                    bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                    hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                    flex items-center justify-center
                    border border-[var(--border-light)] hover:border-[var(--border-medium)]
                  `}
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>

                  <button
                    className={`
                    w-11 h-11 rounded-xl text-sm font-light
                    transition-all duration-300
                    bg-[var(--status-error)]/10
                    hover:bg-[var(--status-error)]/20
                    text-[var(--status-error)]
                    flex items-center justify-center
                    border border-[var(--status-error)]/10 hover:border-[var(--status-error)]/20
                  `}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-xl border border-[var(--border-light)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-light)]">
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Nome</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Tipo</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Execuções</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Taxa de Sucesso</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Última Execução</th>
                <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAutomations.map((automation) => (
                <tr
                  key={automation.id}
                  className="border-b border-[var(--border-light)] hover:bg-[var(--background-tertiary)]/50 transition-colors duration-200"
                >
                  <td className="p-4">
                    <div className="text-[var(--text-primary)] font-light">{automation.name}</div>
                    <div className="text-[var(--text-tertiary)] text-sm font-light">{automation.description}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getTypeColor(automation.type)}`}>
                      {getTypeName(automation.type)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-light ${getStatusColor(automation.status)} bg-[var(--background-tertiary)]/50 border border-[var(--border-light)]`}>
                      {getStatusIcon(automation.status)}
                      {automation.status === 'active' ? 'Ativa' : automation.status === 'inactive' ? 'Inativa' : 'Erro'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-[var(--text-primary)] font-light">{automation.totalExecutions}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-[var(--text-primary)] font-light">{automation.successRate}%</div>
                  </td>
                  <td className="p-4">
                    <div className="text-[var(--text-tertiary)] font-light">
                      {new Date(automation.lastRun).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="h-8 px-3 rounded-lg text-sm font-light
                          bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                          hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                          flex items-center gap-2 border border-[var(--border-light)]
                          hover:border-[var(--border-medium)]"
                      >
                        <FiPlay className="h-4 w-4" />
                        <span>Executar</span>
                      </button>

                      <button
                        className="w-8 h-8 rounded-lg text-sm font-light
                          bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                          hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                          flex items-center justify-center border border-[var(--border-light)]
                          hover:border-[var(--border-medium)]"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>

                      <button
                        className="w-8 h-8 rounded-lg text-sm font-light
                          bg-[var(--status-error)]/10 text-[var(--status-error)]
                          hover:bg-[var(--status-error)]/20
                          flex items-center justify-center border border-[var(--status-error)]/10
                          hover:border-[var(--status-error)]/20"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
