import { useState, useEffect, useMemo } from 'react'
import {
  FiUsers,
  FiSearch,
  FiPlus,
  FiCheck,
  FiX,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiGrid,
  FiList,
  FiChevronUp,
  FiChevronDown,

} from 'react-icons/fi'
import { LoadingSpinner } from '../../../components/loading-spinner'

import { type Lead, leadService } from '../services/lead-service'

export function UsersPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending' | 'authorized' | 'rejected'>('ALL')
  const [sortField, setSortField] = useState<'name' | 'status' | 'value' | 'createdAt'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFields, setExportFields] = useState({
    name: true,
    cpf: true,
    phone: true,
    status: true,
    value: true,
    createdAt: true
  })

  // Função para ordenar leads
  const sortLeads = (a: Lead, b: Lead) => {
    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? (a.userName || '').localeCompare(b.userName || '')
        : (b.userName || '').localeCompare(a.userName || '')
    }
    if (sortField === 'status') {
      return sortDirection === 'asc'
        ? (a.statusCpf || '').localeCompare(b.statusCpf || '')
        : (b.statusCpf || '').localeCompare(a.statusCpf || '')
    }
    if (sortField === 'value') {
      const aValue = a.valorDisponivel || 0
      const bValue = b.valorDisponivel || 0
      return sortDirection === 'asc'
        ? aValue - bValue
        : bValue - aValue
    }
    // createdAt
    return sortDirection === 'asc'
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  }

  // Filtra e ordena leads
  const filteredAndSortedLeads = useMemo(() => {
    return leads
      .filter(lead => {
        const matchesStatus = statusFilter === 'ALL' || lead.statusCpf === statusFilter
        const matchesSearch = (lead.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lead.userCpf || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lead.userNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesSearch
      })
      .sort(sortLeads)
  }, [leads, statusFilter, searchTerm, sortField, sortDirection])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authorized':
        return 'text-[var(--status-success)]'
      case 'pending':
        return 'text-[var(--status-warning)]'
      default:
        return 'text-[var(--status-error)]'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'authorized':
        return <FiCheck className="h-5 w-5" />
      case 'pending':
        return <FiClock className="h-5 w-5" />
      default:
        return <FiX className="h-5 w-5" />
    }
  }

  const getStatusName = (status: string) => {
    switch (status) {
      case 'authorized':
        return 'Autorizado'
      case 'pending':
        return 'Pendente'
      default:
        return 'Rejeitado'
    }
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatPhone = (phone: string) => {
    if (!phone) return ''
    const number = phone.split('@')[0]
    return number.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '+$1 ($2) $3-$4')
  }

  const handleExport = () => {
    const csvContent = [
      // Cabeçalho
      Object.entries(exportFields)
        .filter(([_, enabled]) => enabled)
        .map(([field, _]) => {
          switch (field) {
            case 'name': return 'Nome'
            case 'cpf': return 'CPF'
            case 'phone': return 'WhatsApp'
            case 'status': return 'Status'
            case 'value': return 'Valor FGTS'
            case 'createdAt': return 'Data de Cadastro'
            default: return field
          }
        }),
      // Dados
      ...filteredAndSortedLeads.map(lead =>
        Object.entries(exportFields)
          .filter(([_, enabled]) => enabled)
          .map(([field, _]) => {
            switch (field) {
              case 'name': return lead.userName || ''
              case 'cpf': return lead.userCpf || 'CPF não informado'
              case 'phone': return formatPhone(lead.userNumber)
              case 'status': return getStatusName(lead.statusCpf || 'pending')
              case 'value': return formatCurrency(lead.valorDisponivel)
              case 'createdAt': return formatDate(lead.createdAt)
              default: return ''
            }
          })
      )
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    setShowExportModal(false)
  }

  useEffect(() => {
    async function loadLeads() {
      try {
        setIsLoading(true)
        setError('')
        const data = await leadService.fetchLeads()
        setLeads(data)
      } catch (error) {
        setError('Erro ao carregar leads')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLeads()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] gap-4">
        <LoadingSpinner className="h-8 w-8" />
        <span className="text-lg font-light text-[var(--text-tertiary)]">
          Carregando clientes...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] gap-4">
        <span className="text-lg font-light text-[var(--status-error)]">
          {error}
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
              <FiUsers className="h-6 w-6 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-[var(--text-primary)] mb-2">
                Clientes
              </h1>
              <p className="text-[var(--text-tertiary)] font-light">
                Gerencie seus clientes e consultas FGTS
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
              className="px-4 h-11 rounded-xl bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-sm font-light
                flex items-center gap-2 border border-[var(--border-light)]
                hover:border-[var(--border-medium)]"
            >
              <FiUpload className="h-4 w-4" />
              Importar
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 h-11 rounded-xl bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-sm font-light
                flex items-center gap-2 border border-[var(--border-light)]
                hover:border-[var(--border-medium)]"
            >
              <FiDownload className="h-4 w-4" />
              Exportar
            </button>

            <button
              className="px-4 h-11 rounded-xl bg-[var(--gradient-primary)]
                text-white font-light transition-all duration-300
                hover:shadow-lg hover:shadow-[var(--accent-primary)]/20
                focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-sm flex items-center gap-2"
            >
              <FiPlus className="h-5 w-5" />
              Novo Cliente
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
                placeholder="Buscar por nome, CPF, email ou telefone..."
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
              <option value="authorized">Autorizados</option>
              <option value="pending">Pendentes</option>
              <option value="rejected">Rejeitados</option>
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
              <option value="value">Valor FGTS</option>
              <option value="createdAt">Data de Cadastro</option>
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
            <FiUsers className="h-4 w-4" />
            <span>Total: {filteredAndSortedLeads.length}</span>
          </div>
          {statusFilter === 'ALL' && (
            <>
              <div className="w-px h-4 bg-[var(--border-light)]" />
              <div className="text-[var(--status-success)]">{leads.filter(c => c.statusCpf === 'authorized').length} Autorizados</div>
              <div className="text-[var(--status-warning)]">{leads.filter(c => c.statusCpf === 'pending').length} Pendentes</div>
              <div className="text-[var(--status-error)]">{leads.filter(c => c.statusCpf === 'rejected').length} Rejeitados</div>
            </>
          )}
        </div>
      </div>

      {/* Lista de Clientes */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedLeads.map((lead) => (
            <div
              key={lead.id}
              className="group relative bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-2xl border border-[var(--border-light)] p-6
                hover:border-[var(--border-medium)] transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/0 via-[var(--accent-primary)]/[0.02] to-[var(--accent-secondary)]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              <div className="relative">
                {/* Cabeçalho */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-light text-[var(--text-primary)] mb-1 group-hover:text-white transition-colors">
                      {lead.userName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm font-light text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                      <span>{lead.userCpf || 'CPF não informado'}</span>
                      <span>•</span>
                      <span>{formatPhone(lead.userNumber)}</span>
                    </div>
                  </div>

                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-light ${getStatusColor(lead.statusCpf || 'pending')} bg-[var(--background-tertiary)]/50 border border-[var(--border-light)]`}>
                    {getStatusIcon(lead.statusCpf || 'pending')}
                    {getStatusName(lead.statusCpf || 'pending')}
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[var(--background-tertiary)]/30 rounded-xl p-4 border border-[var(--border-light)] group-hover:border-[var(--border-medium)] transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <FiClock className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <span className="text-sm text-[var(--text-tertiary)] font-light">Valor FGTS</span>
                    </div>
                    <span className="text-[var(--text-primary)] font-light">
                      {formatCurrency(lead.valorDisponivel)}
                    </span>
                  </div>

                  <div className="bg-[var(--background-tertiary)]/30 rounded-xl p-4 border border-[var(--border-light)] group-hover:border-[var(--border-medium)] transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <FiClock className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <span className="text-sm text-[var(--text-tertiary)] font-light">Cadastro</span>
                    </div>
                    <span className="text-[var(--text-primary)] font-light">
                      {formatDate(lead.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 h-11 rounded-xl text-sm font-light
                      bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                      hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                      flex items-center justify-center gap-2
                      border border-[var(--border-light)] hover:border-[var(--border-medium)]"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    Editar
                  </button>

                  <button
                    className="w-11 h-11 rounded-xl text-sm font-light
                      bg-[var(--status-error)]/10 text-[var(--status-error)]
                      hover:bg-[var(--status-error)]/20
                      flex items-center justify-center
                      border border-[var(--status-error)]/10 hover:border-[var(--status-error)]/20"
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-light)]">
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Nome</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">CPF</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">WhatsApp</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Valor FGTS</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Cadastro</th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-[var(--border-light)] hover:bg-[var(--background-tertiary)]/50 transition-colors duration-200"
                  >
                    <td className="p-4">
                      <div className="text-[var(--text-primary)] font-light">{lead.userName}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[var(--text-primary)] font-light">{lead.userCpf || 'CPF não informado'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[var(--text-primary)] font-light">{formatPhone(lead.userNumber)}</div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-light ${getStatusColor(lead.statusCpf || 'pending')} bg-[var(--background-tertiary)]/50 border border-[var(--border-light)]`}>
                        {getStatusIcon(lead.statusCpf || 'pending')}
                        {getStatusName(lead.statusCpf || 'pending')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-[var(--text-primary)] font-light">{formatCurrency(lead.valorDisponivel)}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[var(--text-tertiary)] font-light">{formatDate(lead.createdAt)}</div>
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
                          <FiEdit2 className="h-4 w-4" />
                          <span>Editar</span>
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
        </div>
      )}

      {/* Modal de Exportação */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-light)] p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-light text-[var(--text-primary)]">
                Configurar Exportação
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-[var(--text-tertiary)]">
                Selecione os campos que deseja incluir na exportação:
              </p>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(exportFields).map(([field, enabled]) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setExportFields(prev => ({
                        ...prev,
                        [field]: e.target.checked
                      }))}
                      className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--background-tertiary)] border-[var(--border-light)] rounded focus:ring-[var(--accent-primary)]/20"
                    />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {field === 'name' ? 'Nome' :
                        field === 'cpf' ? 'CPF' :
                          field === 'phone' ? 'WhatsApp' :
                            field === 'status' ? 'Status' :
                              field === 'value' ? 'Valor FGTS' :
                                field === 'createdAt' ? 'Data de Cadastro' : field}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 h-11 rounded-xl bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                  hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                  border border-[var(--border-light)] hover:border-[var(--border-medium)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                className="flex-1 h-11 rounded-xl bg-[var(--gradient-primary)] text-white font-light
                  hover:shadow-lg hover:shadow-[var(--accent-primary)]/20 transition-all duration-300"
              >
                Exportar CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
