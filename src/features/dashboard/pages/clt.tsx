import { useState, useRef, useEffect } from 'react'
import {
  FiUsers,
  FiUpload,
  FiDownload,
  FiSearch,
  FiCheck,
  FiX,
  FiClock,
  FiFileText,
  FiGrid,
  FiList,
  FiPlay,
  FiPause,
  FiRefreshCw
} from 'react-icons/fi'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { cltService, type ImportedCPF, type CLTResponse, type CLTCadastrado } from '../services/clt-service'
import { BackgroundConsultaManager } from '../components/background-consulta-manager'
import * as XLSX from 'xlsx'

interface ConsultaResult {
  cpf: string
  nome: string
  resultado: CLTResponse
  status: 'pending' | 'success' | 'error' | 'no_offers'
  cadastrado?: boolean
}

export function CLTPage() {
  const [importedCPFs, setImportedCPFs] = useState<ImportedCPF[]>([])
  const [consultas, setConsultas] = useState<ConsultaResult[]>([])
  const [isConsulting, setIsConsulting] = useState(false)
  const [currentConsultingIndex, setCurrentConsultingIndex] = useState<number>(-1)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'success' | 'no_offers' | 'error' | 'pending'>('ALL')
  const [showImportModal, setShowImportModal] = useState(false)
  const [cltsCadastrados, setCltsCadastrados] = useState<CLTCadastrado[]>([])
  const [isLoadingCadastrados, setIsLoadingCadastrados] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })


  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Carrega os CLTs cadastrados automaticamente quando a página carrega
    carregarCLTsCadastrados()

    // Carrega CPFs importados do localStorage (se houver)
    const savedCPFs = localStorage.getItem('clt_imported_cpfs')
    if (savedCPFs) {
      try {
        const cpfs = JSON.parse(savedCPFs)
        setImportedCPFs(cpfs)
        console.log('📱 CPFs importados restaurados do localStorage:', cpfs.length)
      } catch (error) {
        console.error('Erro ao restaurar CPFs:', error)
      }
    }
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        const cpfs: ImportedCPF[] = jsonData.map(row => ({
          cpf: String(row.CPF || row.cpf || ''),
          nome: String(row.Nome || row.nome || '')
        })).filter(item => item.cpf && item.nome)

        setImportedCPFs(cpfs)
        // Salva CPFs no localStorage para persistir após atualização da página
        localStorage.setItem('clt_imported_cpfs', JSON.stringify(cpfs))
        setShowImportModal(false)
      } catch (error) {
        console.error('Erro ao processar arquivo:', error)
        alert('Erro ao processar arquivo. Verifique se o formato está correto.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleConsultarCPFs = async () => {
    if (importedCPFs.length === 0) return

    console.log('🚀 Iniciando consulta em background para:', importedCPFs.length, 'CPFs')

    try {
      // Sempre inicia em background
      const consultaId = await cltService.iniciarConsultaBackground(importedCPFs)

      // Mostra notificação de sucesso
      alert(`Consulta iniciada em background! ID: ${consultaId.slice(-8)}\n\nEsta consulta continuará rodando mesmo se você recarregar a página.`)

      // Limpa CPFs importados após iniciar a consulta
      setImportedCPFs([])
      localStorage.removeItem('clt_imported_cpfs')

    } catch (error) {
      console.error('Erro ao iniciar consulta em background:', error)
      alert('Erro ao iniciar consulta em background. Tente novamente.')
    }
  }





  const carregarCLTsCadastrados = async (page = 1, limit = 20) => {
    setIsLoadingCadastrados(true)
    try {
      const dados = await cltService.buscarCLTsCadastrados(page, limit)
      console.log('📊 Dados recebidos do service:', dados)

      // Agora sempre retorna objeto com cadClts e pagination
      if (dados && typeof dados === 'object' && 'cadClts' in dados && Array.isArray(dados.cadClts)) {
        console.log('📊 Dados com paginação:', dados.cadClts.length, 'CLTs')
        setCltsCadastrados(dados.cadClts)

        // Atualiza paginação com dados da API
        if (dados.pagination) {
          setPagination({
            page: dados.pagination.page,
            limit: dados.pagination.limit,
            total: dados.pagination.total,
            pages: dados.pagination.pages
          })
        }
      } else {
        console.error('❌ Formato inesperado dos dados:', dados)
        setCltsCadastrados([])
        setPagination(prev => ({ ...prev, page, limit, total: 0, pages: 0 }))
      }
    } catch (error) {
      console.error('Erro ao carregar CLTs cadastrados:', error)
      alert('Erro ao carregar CLTs cadastrados. Tente novamente.')
    } finally {
      setIsLoadingCadastrados(false)
    }
  }

  const handleExportResults = () => {
    const csvContent = [
      ['CPF', 'Nome', 'Status', 'Valor Liberado', 'Total de Ofertas', 'Detalhes', 'Cadastrado'],
      ...consultas.map(consulta => {
        const valorLiberado = consulta.resultado.dados.length > 0
          ? consulta.resultado.dados[0].resposta.valorLiberado
          : 'Sem valor liberado'

        let statusText = 'Pendente'
        if (consulta.status === 'success') statusText = 'Sucesso'
        else if (consulta.status === 'no_offers') statusText = 'Nenhuma oferta encontrada'
        else if (consulta.status === 'error') statusText = 'Erro'

        let cadastroText = 'Não'
        if (consulta.cadastrado) {
          cadastroText = consulta.resultado.dados.length > 0 &&
            parseFloat(consulta.resultado.dados[0].resposta.valorLiberado) > 0
            ? 'Ativo'
            : 'Sem valor'
        }

        return [
          consulta.cpf,
          consulta.nome,
          statusText,
          valorLiberado,
          consulta.resultado.total.toString(),
          consulta.resultado.dados.length > 0 ? 'Ver detalhes' : 'Sem ofertas',
          cadastroText
        ]
      })
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `consulta_clt_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredConsultas = consultas.filter(consulta => {
    const matchesStatus = statusFilter === 'ALL' || consulta.status === statusFilter
    const matchesSearch = consulta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.cpf.includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-[var(--status-success)]'
      case 'no_offers':
        return 'text-[var(--status-warning)]'
      case 'error':
        return 'text-[var(--status-error)]'
      default:
        return 'text-[var(--status-warning)]'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <FiCheck className="h-5 w-5" />
      case 'no_offers':
        return <FiX className="h-5 w-5" />
      case 'error':
        return <FiX className="h-5 w-5" />
      default:
        return <FiClock className="h-5 w-5" />
    }
  }

  const getStatusName = (status: string) => {
    switch (status) {
      case 'success':
        return 'Sucesso'
      case 'no_offers':
        return 'Nenhuma oferta encontrada'
      case 'error':
        return 'Erro'
      default:
        return 'Pendente'
    }
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
                Consulta CLT
              </h1>
              <p className="text-[var(--text-tertiary)] font-light">
                Consulte ofertas de consignado para trabalhadores CLT
              </p>
            </div>
          </div>

          {/* Contador de CLTs Cadastrados */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--background-tertiary)]/50 rounded-lg border border-[var(--border-light)]">
            <FiUsers className="h-4 w-4 text-[var(--accent-primary)]" />
            <span className="text-sm font-light text-[var(--text-secondary)]">
              {pagination.total > 0 ? pagination.total : cltsCadastrados.length} CLTs cadastrados
            </span>
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
              onClick={() => setShowImportModal(true)}
              className="px-4 h-11 rounded-xl bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                 hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                 focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-sm font-light
                 flex items-center gap-2 border border-[var(--border-light)]
                 hover:border-[var(--border-medium)]"
            >
              <FiUpload className="h-4 w-4" />
              Importar CPFs
            </button>

            {consultas.length > 0 && (
              <button
                onClick={handleExportResults}
                className="px-4 h-11 rounded-xl bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                  hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                  focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-sm font-light
                  flex items-center gap-2 border border-[var(--border-light)]
                  hover:border-[var(--border-medium)]"
              >
                <FiDownload className="h-4 w-4" />
                Exportar
              </button>
            )}

            <button
              onClick={handleConsultarCPFs}
              disabled={importedCPFs.length === 0}
              className="px-4 h-11 rounded-xl bg-[var(--gradient-primary)]
                  text-white font-light transition-all duration-300
                  hover:shadow-lg hover:shadow-[var(--accent-primary)]/20
                  focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-sm flex items-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlay className="h-4 w-4" />
              Consultar CPFs (Background)
            </button>
          </div>
        </div>
      </div>

      {/* Gerenciador de Consultas em Background */}
      <BackgroundConsultaManager />

      {/* Conteúdo Principal - Consulta e Cadastrados Lado a Lado */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Coluna da Esquerda - Consulta */}
        <div className="space-y-6">
          {/* Status da Importação */}
          {importedCPFs.length > 0 && (
            <div className="bg-[var(--background-secondary)] backdrop-blur-lg rounded-xl border border-[var(--border-light)] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FiFileText className="h-5 w-5 text-[var(--accent-primary)]" />
                    <span className="text-[var(--text-secondary)]">
                      CPFs Importados: <span className="text-[var(--text-primary)] font-medium">{importedCPFs.length}</span>
                    </span>
                  </div>
                  {consultas.length > 0 && (
                    <div className="flex items-center gap-2">
                      <FiCheck className="h-5 w-5 text-[var(--status-success)]" />
                      <span className="text-[var(--text-secondary)]">
                        Consultas Realizadas: <span className="text-[var(--text-primary)] font-medium">{consultas.length}</span>
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setImportedCPFs([])
                    setConsultas([])
                    // Limpa dados do localStorage
                    localStorage.removeItem('clt_imported_cpfs')
                    localStorage.removeItem('clt_consultas')
                  }}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Barra de Progresso */}
              {isConsulting && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-[var(--text-tertiary)] mb-2">
                    <span>Progresso da Consulta</span>
                    <span>{Math.max(0, currentConsultingIndex + 1)} / {importedCPFs.length}</span>
                  </div>
                  <div className="w-full bg-[var(--background-tertiary)] rounded-full h-2">
                    <div
                      className="bg-[var(--accent-primary)] h-2 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${importedCPFs.length > 0 ? ((currentConsultingIndex + 1) / importedCPFs.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filtros e Busca */}
          {consultas.length > 0 && (
            <div className="bg-[var(--background-secondary)] backdrop-blur-lg rounded-xl border border-[var(--border-light)] p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Busca */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nome ou CPF..."
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
                    <option value="success">Sucesso</option>
                    <option value="no_offers">Nenhuma oferta encontrada</option>
                    <option value="error">Erro</option>
                    <option value="pending">Pendente</option>
                  </select>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="mt-4 pt-4 border-t border-[var(--border-light)] flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
                <div className="flex items-center gap-2">
                  <FiUsers className="h-4 w-4" />
                  <span>Total: {filteredConsultas.length}</span>
                </div>
                {statusFilter === 'ALL' && (
                  <>
                    <div className="w-px h-4 bg-[var(--border-light)]" />
                    <div className="text-[var(--status-success)]">{consultas.filter(c => c.status === 'success').length} Sucesso</div>
                    <div className="text-[var(--status-warning)]">{consultas.filter(c => c.status === 'no_offers').length} Nenhuma oferta encontrada</div>
                    <div className="text-[var(--status-error)]">{consultas.filter(c => c.status === 'error').length} Erro</div>
                    <div className="text-[var(--status-warning)]">{consultas.filter(c => c.status === 'pending').length} Pendente</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Lista de Consultas */}
          {consultas.length > 0 && (
            viewMode === 'cards' ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredConsultas.map((consulta, index) => (
                  <div
                    key={index}
                    className={`group relative bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-2xl border p-6
                 hover:border-[var(--border-medium)] transition-all duration-500 ${currentConsultingIndex === index && consulta.status === 'pending'
                        ? 'border-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)]/20'
                        : 'border-[var(--border-light)]'
                      }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/0 via-[var(--accent-primary)]/[0.02] to-[var(--accent-secondary)]/[0.02] transition-opacity duration-500 rounded-2xl ${currentConsultingIndex === index && consulta.status === 'pending'
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                      }`} />

                    <div className="relative">
                      {/* Cabeçalho */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-light text-[var(--text-primary)] mb-1 group-hover:text-white transition-colors">
                            {consulta.nome}
                          </h3>
                          <div className="text-sm font-light text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                            {consulta.cpf}
                          </div>
                        </div>

                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-light ${getStatusColor(consulta.status)} bg-[var(--background-tertiary)]/50 border border-[var(--border-light)]`}>
                          {currentConsultingIndex === index && consulta.status === 'pending' ? (
                            <>
                              <FiRefreshCw className="h-5 w-5 animate-spin" />
                              Consultando...
                            </>
                          ) : (
                            <>
                              {getStatusIcon(consulta.status)}
                              {getStatusName(consulta.status)}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Resultado */}
                      <div className="space-y-3 mb-6">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-[var(--background-tertiary)]/30 rounded-xl p-3 border border-[var(--border-light)] group-hover:border-[var(--border-medium)] transition-all duration-300">
                            <div className="text-xs text-[var(--text-tertiary)] mb-1">Total</div>
                            <div className="text-lg text-[var(--text-primary)] font-light">
                              {consulta.resultado.total}
                            </div>
                          </div>

                          <div className="bg-[var(--background-tertiary)]/30 rounded-xl p-3 border border-[var(--border-light)] group-hover:border-[var(--border-medium)] transition-all duration-300">
                            <div className="text-xs text-[var(--text-tertiary)] mb-1">Ofertas</div>
                            <div className="text-lg text-[var(--text-primary)] font-light">
                              {consulta.resultado.dados.length}
                            </div>
                          </div>

                          <div className="bg-[var(--background-tertiary)]/30 rounded-xl p-3 border border-[var(--border-light)] group-hover:border-[var(--border-medium)] transition-all duration-300">
                            <div className="text-xs text-[var(--text-tertiary)] mb-1">Valor Liberado</div>
                            <div className="text-lg text-[var(--text-primary)] font-light">
                              {consulta.resultado.dados.length > 0
                                ? `R$ ${consulta.resultado.dados[0].resposta.valorLiberado}`
                                : 'Sem valor liberado'
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detalhes das Ofertas */}
                      {consulta.resultado.dados.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <div className="text-sm text-[var(--text-tertiary)] font-medium">Ofertas Disponíveis:</div>
                          {consulta.resultado.dados.slice(0, 2).map((oferta, ofertaIndex) => (
                            <div key={ofertaIndex} className="bg-[var(--background-tertiary)]/20 rounded-lg p-3 border border-[var(--border-light)]">
                              <div className="text-sm text-[var(--text-primary)] font-medium">{oferta.oferta.nomeTrabalhador}</div>
                              <div className="text-xs text-[var(--text-tertiary)]">Matrícula: {oferta.oferta.matricula}</div>
                              <div className="text-sm text-[var(--accent-primary)] font-medium">
                                R$ {oferta.resposta.valorLiberado}
                              </div>
                            </div>
                          ))}
                          {consulta.resultado.dados.length > 2 && (
                            <div className="text-xs text-[var(--text-tertiary)] text-center">
                              +{consulta.resultado.dados.length - 2} ofertas
                            </div>
                          )}
                        </div>
                      )}

                      {/* Status de Cadastro */}
                      {consulta.cadastrado && (
                        <div className="mt-4 p-3 bg-[var(--status-success)]/10 border border-[var(--status-success)]/20 rounded-lg">
                          <div className="flex items-center gap-2 text-[var(--status-success)]">
                            <FiCheck className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {consulta.resultado.dados.length > 0 &&
                                parseFloat(consulta.resultado.dados[0].resposta.valorLiberado) > 0
                                ? 'Cadastrado no banco (Ativo)'
                                : 'Cadastrado no banco (Sem valor)'
                              }
                            </span>
                          </div>
                        </div>
                      )}
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
                        <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Valor Liberado</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Total</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Ofertas</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Cadastro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConsultas.map((consulta, index) => (
                        <tr
                          key={index}
                          className="border-b border-[var(--border-light)] hover:bg-[var(--background-tertiary)]/50 transition-colors duration-200"
                        >
                          <td className="p-4">
                            <div className="text-[var(--text-primary)] font-light">{consulta.nome}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-[var(--text-primary)] font-light">{consulta.cpf}</div>
                          </td>
                          <td className="p-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-light ${getStatusColor(consulta.status)} bg-[var(--background-tertiary)]/50 border border-[var(--border-light)]`}>
                              {currentConsultingIndex === index && consulta.status === 'pending' ? (
                                <>
                                  <FiRefreshCw className="h-5 w-5 animate-spin" />
                                  Consultando...
                                </>
                              ) : (
                                <>
                                  {getStatusIcon(consulta.status)}
                                  {getStatusName(consulta.status)}
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-[var(--text-primary)] font-light max-w-xs truncate">
                              {consulta.resultado.dados.length > 0
                                ? `R$ ${consulta.resultado.dados[0].resposta.valorLiberado}`
                                : 'Sem valor liberado'
                              }
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-[var(--text-primary)] font-light">{consulta.resultado.total}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-[var(--text-primary)] font-light">{consulta.resultado.dados.length}</div>
                          </td>
                          <td className="p-4">
                            {consulta.cadastrado ? (
                              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${consulta.resultado.dados.length > 0 &&
                                parseFloat(consulta.resultado.dados[0].resposta.valorLiberado) > 0
                                ? 'text-[var(--status-success)] bg-[var(--status-success)]/10 border-[var(--status-success)]/20'
                                : 'text-[var(--status-warning)] bg-[var(--status-warning)]/10 border-[var(--status-warning)]/20'
                                } border`}>
                                <FiCheck className="h-3 w-3" />
                                {consulta.resultado.dados.length > 0 &&
                                  parseFloat(consulta.resultado.dados[0].resposta.valorLiberado) > 0
                                  ? 'Ativo'
                                  : 'Sem valor'
                                }
                              </div>
                            ) : (
                              <div className="text-[var(--text-tertiary)] text-xs">-</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* Estado Vazio da Consulta */}
          {consultas.length === 0 && importedCPFs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="bg-[var(--background-tertiary)]/30 p-6 rounded-full">
                <FiFileText className="h-12 w-12 text-[var(--text-tertiary)]" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-light text-[var(--text-primary)] mb-2">
                  Nenhuma consulta realizada
                </h3>
                <p className="text-[var(--text-tertiary)] font-light">
                  Importe uma planilha com CPFs para começar a consultar
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Coluna da Direita - CLTs Cadastrados */}
        <div className="space-y-6">
          {/* Header dos Cadastrados */}
          <div className="bg-[var(--background-secondary)] backdrop-blur-lg rounded-xl border border-[var(--border-light)] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--gradient-secondary)] p-3 rounded-xl">
                  <FiUsers className="h-6 w-6 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h2 className="text-xl font-light text-[var(--text-primary)] mb-1">
                    CLTs Cadastrados
                  </h2>
                  <p className="text-[var(--text-tertiary)] font-light">
                    {isLoadingCadastrados ? 'Carregando...' : `${pagination.total} CLTs cadastrados no sistema`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => carregarCLTsCadastrados(pagination.page, pagination.limit)}
                disabled={isLoadingCadastrados}
                className="px-4 h-11 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]
                    hover:bg-[var(--accent-primary)]/20 transition-colors border border-[var(--accent-primary)]/20
                    disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiRefreshCw className={`h-4 w-4 ${isLoadingCadastrados ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>

          {/* Lista de CLTs Cadastrados */}
          {isLoadingCadastrados ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : cltsCadastrados.length > 0 ? (
            <>
              <div className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-xl border border-[var(--border-light)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-light)]">
                        <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Nome</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">CPF</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Valor Liberado</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Data Cadastro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cltsCadastrados.map((clt) => (
                        <tr
                          key={clt.id}
                          className="border-b border-[var(--border-light)] hover:bg-[var(--background-tertiary)]/50 transition-colors duration-200"
                        >
                          <td className="p-4">
                            <div className="text-[var(--text-primary)] font-light">{clt.nome}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-[var(--text-primary)] font-light">{clt.cpf}</div>
                          </td>
                          <td className="p-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-light ${clt.valorLiberado && clt.valorLiberado > 0
                              ? 'text-[var(--status-success)] bg-[var(--status-success)]/10 border-[var(--status-success)]/20'
                              : 'text-[var(--status-warning)] bg-[var(--status-warning)]/10 border-[var(--status-warning)]/20'
                              } border`}>
                              {clt.valorLiberado && clt.valorLiberado > 0 ? 'Ativo' : 'Sem valor'}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-[var(--text-primary)] font-light">
                              {clt.valorLiberado && clt.valorLiberado > 0
                                ? `R$ ${Number(clt.valorLiberado).toFixed(2)}`
                                : 'Não informado'
                              }
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-[var(--text-tertiary)] text-sm">
                              {new Date(clt.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Controles de Paginação */}
              {pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                    <span>Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} CLTs</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botão Anterior */}
                    <button
                      onClick={() => carregarCLTsCadastrados(pagination.page - 1, pagination.limit)}
                      disabled={pagination.page <= 1 || isLoadingCadastrados}
                      className="px-3 py-2 rounded-lg bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                            hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                            border border-[var(--border-light)] disabled:opacity-50 disabled:cursor-not-allowed
                            transition-colors"
                    >
                      Anterior
                    </button>

                    {/* Números das Páginas */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum
                        if (pagination.pages <= 5) {
                          pageNum = i + 1
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i
                        } else {
                          pageNum = pagination.page - 2 + i
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => carregarCLTsCadastrados(pageNum, pagination.limit)}
                            disabled={pageNum === pagination.page || isLoadingCadastrados}
                            className={`px-3 py-2 rounded-lg text-sm font-light transition-colors ${pageNum === pagination.page
                              ? 'bg-[var(--accent-primary)] text-white'
                              : 'bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]'
                              } border border-[var(--border-light)] disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    {/* Botão Próximo */}
                    <button
                      onClick={() => carregarCLTsCadastrados(pagination.page + 1, pagination.limit)}
                      disabled={pagination.page >= pagination.pages || isLoadingCadastrados}
                      className="px-3 py-2 rounded-lg bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                            hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                            border border-[var(--border-light)] disabled:opacity-50 disabled:cursor-not-allowed
                            transition-colors"
                    >
                      Próximo
                    </button>
                  </div>

                  {/* Seletor de Limite */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--text-tertiary)]">Por página:</span>
                    <select
                      value={pagination.limit}
                      onChange={(e) => {
                        const newLimit = parseInt(e.target.value)
                        carregarCLTsCadastrados(1, newLimit)
                      }}
                      disabled={isLoadingCadastrados}
                      className="px-3 py-2 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                            text-[var(--text-primary)] focus:border-[var(--accent-primary)]/50 
                            focus:ring-1 focus:ring-[var(--accent-primary)]/20 disabled:opacity-50
                            transition-colors"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="bg-[var(--background-tertiary)]/30 p-6 rounded-full">
                <FiUsers className="h-12 w-12 text-[var(--text-tertiary)]" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-light text-[var(--text-primary)] mb-2">
                  Nenhum CLT cadastrado
                </h3>
                <p className="text-[var(--text-tertiary)] font-light">
                  Faça consultas na coluna esquerda para cadastrar CLTs
                </p>
              </div>
            </div>
          )}
        </div>
      </div>





      {/* Modal de Importação */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-light)] p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-light text-[var(--text-primary)]">
                Importar CPFs
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-[var(--text-tertiary)]">
                A planilha deve conter as colunas <strong>CPF</strong> e <strong>Nome</strong>
              </p>

              <div className="border-2 border-dashed border-[var(--border-light)] rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]
                    hover:bg-[var(--accent-primary)]/20 transition-colors border border-[var(--accent-primary)]/20"
                >
                  Selecionar Arquivo
                </button>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">
                  Suporta: .xlsx, .xls, .csv
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 h-11 rounded-xl bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                  hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                  border border-[var(--border-light)] hover:border-[var(--border-medium)] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CLTPage
