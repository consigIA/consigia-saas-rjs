import { useState, useEffect, useCallback } from 'react'
import {
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiPlus,
  FiMessageSquare,
  FiUsers,
  FiClock,
  FiLogOut,
  FiTrash2,
  FiSmartphone,
  FiGrid,
  FiList,
  FiSearch,
  FiChevronUp,
  FiChevronDown,

} from 'react-icons/fi'
import { SiWhatsapp } from 'react-icons/si'
import { LoadingSpinner, LoadingDots } from '../../../components/loading-spinner'
import { CreateInstanceModal } from '../components/create-instance-modal'
import { QRCodeModal } from '../components/qr-code-modal'
import { evolutionApiService, type WhatsAppInstance } from '../services/evolution-api'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ConnectionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<string>('')
  const [instances, setInstances] = useState<WhatsAppInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'open' | 'closed'>('ALL')
  const [sortField, setSortField] = useState<'name' | 'status' | 'createdAt'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const fetchInstances = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await evolutionApiService.fetchInstances()
      // Garante que sempre será um array
      setInstances(Array.isArray(data) ? data : [])
    } catch (error) {
      setError('Erro ao carregar instâncias')
      console.error(error)
      // Em caso de erro, limpa as instâncias
      setInstances([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const initializeApi = async () => {
      try {
        await evolutionApiService.setup()
        fetchInstances()
      } catch (error) {
        setError('Erro ao carregar configurações da API')
        console.error(error)
      }
    }

    initializeApi()
  }, [fetchInstances])

  const handleCreateSuccess = useCallback(() => {
    fetchInstances()
  }, [fetchInstances])

  const handleQRCodeSuccess = useCallback(() => {
    setTimeout(fetchInstances, 500)
  }, [fetchInstances])

  const handleConnectInstance = useCallback((instanceName: string) => {
    setSelectedInstance(instanceName)
    setIsQRCodeModalOpen(true)
  }, [])

  const handleCloseQRCode = useCallback(() => {
    setIsQRCodeModalOpen(false)
    setSelectedInstance('')
  }, [])

  const handleLogout = useCallback(async (instanceName: string) => {
    try {
      setIsActionLoading(instanceName)
      await evolutionApiService.logoutInstance(instanceName)
      await fetchInstances()
    } catch (error) {
      console.error('Erro ao desconectar:', error)
    } finally {
      setIsActionLoading(null)
    }
  }, [fetchInstances])

  const handleDelete = useCallback(async (instanceName: string) => {
    if (!confirm('Tem certeza que deseja excluir esta instância?')) return

    try {
      setIsActionLoading(instanceName)
      await evolutionApiService.deleteInstance(instanceName)
      await fetchInstances()
    } catch (error) {
      console.error('Erro ao deletar:', error)
    } finally {
      setIsActionLoading(null)
    }
  }, [fetchInstances])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-green-400'
      case 'connecting':
        return 'text-yellow-400'
      default:
        return 'text-red-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <FiCheck className="h-5 w-5" />
      case 'connecting':
        return (
          <div className="flex items-center gap-2">
            <LoadingSpinner />
          </div>
        )
      default:
        return <FiX className="h-5 w-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Conectado'
      case 'connecting':
        return 'Aguardando conexão'
      default:
        return 'Desconectado'
    }
  }

  // Função para ordenar instâncias
  const sortInstances = (a: WhatsAppInstance, b: WhatsAppInstance) => {
    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    }
    if (sortField === 'status') {
      return sortDirection === 'asc'
        ? a.connectionStatus.localeCompare(b.connectionStatus)
        : b.connectionStatus.localeCompare(a.connectionStatus)
    }
    // createdAt
    return sortDirection === 'asc'
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  }

  // Filtra e ordena instâncias
  const filteredAndSortedInstances = instances
    .filter(instance => {
      const matchesStatus = statusFilter === 'ALL' ||
        (statusFilter === 'open' ? instance.connectionStatus === 'open' : instance.connectionStatus !== 'open')
      const matchesSearch = instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (instance.profileName || '').toLowerCase().includes(searchTerm.toLowerCase())
      return matchesStatus && matchesSearch
    })
    .sort(sortInstances)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] gap-4">
        <LoadingSpinner className="h-8 w-8" />
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-lg font-light">Carregando conexões</span>
          <LoadingDots />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <FiAlertTriangle className="h-6 w-6 text-red-400" />
          <span className="text-lg font-light text-red-400">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header com gradiente sutil e ícone do WhatsApp */}
        <div className="relative bg-[var(--background-secondary)] rounded-2xl p-6 overflow-hidden backdrop-blur-sm border border-[var(--border-light)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)] opacity-5" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--gradient-secondary)] p-3 rounded-xl">
                <SiWhatsapp className="h-6 w-6 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h1 className="text-2xl font-light text-[var(--text-primary)] mb-2">
                  Conexões WhatsApp
                </h1>
                <p className="text-[var(--text-tertiary)] font-light">
                  Gerencie suas conexões com o WhatsApp
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
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 h-11 rounded-xl bg-[var(--gradient-primary)]
                  text-white font-light transition-all duration-300
                  hover:shadow-lg hover:shadow-[var(--accent-primary)]/20
                  focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-sm flex items-center gap-2"
              >
                <FiPlus className="h-5 w-5" />
                Nova Conexão
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
                  placeholder="Buscar por nome..."
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
                <option value="open">Conectados</option>
                <option value="closed">Desconectados</option>
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
                <option value="createdAt">Data de Criação</option>
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
              <FiSmartphone className="h-4 w-4" />
              <span>Total: {instances.length}</span>
            </div>
            {statusFilter === 'ALL' && (
              <>
                <div className="w-px h-4 bg-[var(--border-light)]" />
                <div className="text-green-400">{instances.filter(i => i.connectionStatus === 'open').length} Conectados</div>
                <div className="text-red-400">{instances.filter(i => i.connectionStatus !== 'open').length} Desconectados</div>
              </>
            )}
          </div>
        </div>

        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedInstances.map((instance) => (
              <div
                key={instance.id}
                className="group relative bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-2xl border border-[var(--border-light)] p-6
                hover:border-[var(--border-medium)] transition-all duration-500"
              >
                {/* Gradiente de hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/0 via-[var(--accent-primary)]/[0.02] to-[var(--accent-secondary)]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-light text-[var(--text-primary)] mb-1 group-hover:text-white transition-colors">
                        {instance.name}
                      </h3>
                      <p className="text-sm font-light text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                        {instance.profileName || 'Sem nome definido'}
                      </p>
                    </div>
                    <div
                      className={`
                      ${getStatusColor(instance.connectionStatus)} 
                      flex items-center gap-2 px-3 py-1.5 rounded-full
                      bg-[var(--background-tertiary)]/50 text-sm font-light
                      border border-[var(--border-light)] group-hover:border-[var(--border-medium)]
                      transition-all duration-300
                    `}
                    >
                      {getStatusIcon(instance.connectionStatus)}
                      {getStatusText(instance.connectionStatus)}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                      <FiClock className="h-4 w-4" />
                      <span className="font-light">
                        Criado {formatDistanceToNow(new Date(instance.createdAt), { locale: ptBR, addSuffix: true })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[var(--background-tertiary)]/30 rounded-xl p-4 border border-[var(--border-light)] group-hover:border-[var(--border-medium)] transition-all duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <FiMessageSquare className="h-4 w-4 text-[var(--text-tertiary)]" />
                          <span className="text-sm text-[var(--text-tertiary)] font-light">Mensagens</span>
                        </div>
                        <span className="text-xl text-[var(--text-primary)] font-light">
                          {instance._count.Message}
                        </span>
                      </div>

                      <div className="bg-[var(--background-tertiary)]/30 rounded-xl p-4 border border-[var(--border-light)] group-hover:border-[var(--border-medium)] transition-all duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <FiUsers className="h-4 w-4 text-[var(--text-tertiary)]" />
                          <span className="text-sm text-[var(--text-tertiary)] font-light">Contatos</span>
                        </div>
                        <span className="text-xl text-[var(--text-primary)] font-light">
                          {instance._count.Contact}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    {instance.connectionStatus === 'open' ? (
                      <button
                        onClick={() => handleLogout(instance.name)}
                        disabled={isActionLoading === instance.name}
                        className={`
                        flex-1 h-11 rounded-xl text-sm font-light
                        transition-all duration-300
                        bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                        hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2
                        border border-[var(--border-light)] hover:border-[var(--border-medium)]
                      `}
                      >
                        {isActionLoading === instance.name ? (
                          <>
                            <LoadingSpinner className="h-4 w-4" />
                            <span>Desconectando...</span>
                          </>
                        ) : (
                          <>
                            <FiLogOut className="h-4 w-4" />
                            <span>Desconectar</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnectInstance(instance.name)}
                        disabled={isActionLoading === instance.name}
                        className={`
                        flex-1 h-11 rounded-xl text-sm font-light
                        transition-all duration-300
                        bg-[var(--accent-primary)]/10
                        hover:bg-[var(--accent-primary)]/20
                        text-[var(--accent-primary)] hover:text-[var(--accent-secondary)]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2
                        border border-[var(--accent-primary)]/10 hover:border-[var(--accent-primary)]/20
                      `}
                      >
                        {isActionLoading === instance.name ? (
                          <>
                            <LoadingSpinner className="h-4 w-4" />
                            <span>Conectando...</span>
                          </>
                        ) : (
                          <>
                            <FiSmartphone className="h-4 w-4" />
                            <span>Conectar WhatsApp</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(instance.name)}
                      disabled={isActionLoading === instance.name}
                      className={`
                      w-11 h-11 rounded-xl text-sm font-light
                      transition-all duration-300
                      bg-[var(--status-error)]/10
                      hover:bg-[var(--status-error)]/20
                      text-[var(--status-error)]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center
                      border border-[var(--status-error)]/10 hover:border-[var(--status-error)]/20
                    `}
                    >
                      {isActionLoading === instance.name ? (
                        <LoadingSpinner className="h-4 w-4" />
                      ) : (
                        <FiTrash2 className="h-4 w-4" />
                      )}
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
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Mensagens</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Contatos</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Data de Criação</th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedInstances.map((instance) => (
                  <tr
                    key={instance.id}
                    className="border-b border-[var(--border-light)] hover:bg-[var(--background-tertiary)]/50 transition-colors duration-200"
                  >
                    <td className="p-4">
                      <div className="text-[var(--text-primary)] font-light">{instance.name}</div>
                      <div className="text-[var(--text-tertiary)] text-sm font-light">{instance.profileName || 'Sem nome definido'}</div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-light ${getStatusColor(instance.connectionStatus)} bg-[var(--background-tertiary)]/50 border border-[var(--border-light)]`}>
                        {getStatusIcon(instance.connectionStatus)}
                        {getStatusText(instance.connectionStatus)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-[var(--text-primary)] font-light">{instance._count.Message}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[var(--text-primary)] font-light">{instance._count.Contact}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[var(--text-tertiary)] font-light">
                        {formatDistanceToNow(new Date(instance.createdAt), { locale: ptBR, addSuffix: true })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {instance.connectionStatus === 'open' ? (
                          <button
                            onClick={() => handleLogout(instance.name)}
                            disabled={isActionLoading === instance.name}
                            className="h-8 px-3 rounded-lg text-sm font-light
                              bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                              hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                              disabled:opacity-50 disabled:cursor-not-allowed
                              flex items-center gap-2 border border-[var(--border-light)]
                              hover:border-[var(--border-medium)]"
                          >
                            {isActionLoading === instance.name ? (
                              <>
                                <LoadingSpinner className="h-4 w-4" />
                                <span>Desconectando...</span>
                              </>
                            ) : (
                              <>
                                <FiLogOut className="h-4 w-4" />
                                <span>Desconectar</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConnectInstance(instance.name)}
                            disabled={isActionLoading === instance.name}
                            className="h-8 px-3 rounded-lg text-sm font-light
                              bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]
                              hover:bg-[var(--accent-primary)]/20 hover:text-[var(--accent-secondary)]
                              disabled:opacity-50 disabled:cursor-not-allowed
                              flex items-center gap-2 border border-[var(--accent-primary)]/10
                              hover:border-[var(--accent-primary)]/20"
                          >
                            {isActionLoading === instance.name ? (
                              <>
                                <LoadingSpinner className="h-4 w-4" />
                                <span>Conectando...</span>
                              </>
                            ) : (
                              <>
                                <FiSmartphone className="h-4 w-4" />
                                <span>Conectar</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(instance.name)}
                          disabled={isActionLoading === instance.name}
                          className="w-8 h-8 rounded-lg text-sm font-light
                            bg-[var(--status-error)]/10 text-[var(--status-error)]
                            hover:bg-[var(--status-error)]/20
                            disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center border border-[var(--status-error)]/10
                            hover:border-[var(--status-error)]/20"
                        >
                          {isActionLoading === instance.name ? (
                            <LoadingSpinner className="h-4 w-4" />
                          ) : (
                            <FiTrash2 className="h-4 w-4" />
                          )}
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

      <CreateInstanceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <QRCodeModal
        isOpen={isQRCodeModalOpen}
        onClose={handleCloseQRCode}
        instanceName={selectedInstance}
        onSuccess={handleQRCodeSuccess}
      />
    </>
  )
}