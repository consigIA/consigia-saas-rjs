import { useState, useRef, useEffect } from 'react'
import {
  FiUsers,
  FiUpload,
  FiDownload,
  FiX,
  FiRefreshCw,
  FiSearch
} from 'react-icons/fi'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { cltService, type ImportedCPF, type CLTCadastrado } from '../services/clt-service'
import { BackgroundConsultaManager } from '../components/background-consulta-manager'
import * as XLSX from 'xlsx'

export function CLTPage() {
  const [importedCPFs, setImportedCPFs] = useState<ImportedCPF[]>([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [cltsCadastrados, setCltsCadastrados] = useState<CLTCadastrado[]>([])
  const [isLoadingCadastrados, setIsLoadingCadastrados] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    nome: '',
    status: 'TODOS',
    valorMinimo: '',
    valorMaximo: '',
    dataInicio: '',
    dataFim: ''
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [filtrosAtivos, setFiltrosAtivos] = useState(false)

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
    try {
      setIsLoadingCadastrados(true)

      // Se há filtros ativos, aplica-os na busca e busca TODOS os clientes
      let filtrosParams = ''
      let limitToUse = limit

      if (filtrosAtivos) {
        const params = new URLSearchParams()

        if (filtros.nome) {
          params.append('nome', filtros.nome)
        }

        if (filtros.status !== 'TODOS') {
          // Converte o status para o formato que o backend espera
          if (filtros.status === 'ATIVO') {
            params.append('hasValor', 'true')
          } else if (filtros.status === 'SEM_VALOR') {
            params.append('hasValor', 'false')
          }
        }

        if (filtros.valorMinimo) {
          params.append('valorMinimo', filtros.valorMinimo)
        }

        if (filtros.valorMaximo) {
          params.append('valorMaximo', filtros.valorMaximo)
        }

        if (filtros.dataInicio) {
          params.append('dataInicio', filtros.dataInicio)
        }

        if (filtros.dataFim) {
          params.append('dataFim', filtros.dataFim)
        }

        filtrosParams = params.toString()
        // Quando há filtros ativos, busca todos os clientes (sem limite de página)
        limitToUse = 999999

        console.log('🔍 Filtros ativos - Parâmetros enviados:', filtrosParams)
      }

      const data = await cltService.buscarCLTsCadastrados(page, limitToUse, filtrosParams)

      // Se há filtros ativos, aplica-os no frontend
      if (filtrosAtivos) {
        let dadosFiltrados = data.cadClts

        if (filtros.nome) {
          dadosFiltrados = dadosFiltrados.filter(clt =>
            clt.nome.toLowerCase().includes(filtros.nome.toLowerCase())
          )
        }

        if (filtros.status !== 'TODOS') {
          if (filtros.status === 'ATIVO') {
            dadosFiltrados = dadosFiltrados.filter(clt =>
              clt.valorLiberado && clt.valorLiberado > 0
            )
          } else if (filtros.status === 'SEM_VALOR') {
            dadosFiltrados = dadosFiltrados.filter(clt =>
              !clt.valorLiberado || clt.valorLiberado <= 0
            )
          }
        }

        if (filtros.valorMinimo) {
          const valorMin = parseFloat(filtros.valorMinimo)
          dadosFiltrados = dadosFiltrados.filter(clt =>
            clt.valorLiberado && clt.valorLiberado >= valorMin
          )
        }

        if (filtros.valorMaximo) {
          const valorMax = parseFloat(filtros.valorMaximo)
          dadosFiltrados = dadosFiltrados.filter(clt =>
            clt.valorLiberado && clt.valorLiberado <= valorMax
          )
        }

        if (filtros.dataInicio) {
          const dataInicio = new Date(filtros.dataInicio)
          dadosFiltrados = dadosFiltrados.filter(clt =>
            new Date(clt.createdAt) >= dataInicio
          )
        }

        if (filtros.dataFim) {
          const dataFim = new Date(filtros.dataFim)
          dadosFiltrados = dadosFiltrados.filter(clt =>
            new Date(clt.createdAt) <= dataFim
          )
        }

        setCltsCadastrados(dadosFiltrados)
        setPagination({
          ...data.pagination,
          total: dadosFiltrados.length,
          pages: Math.ceil(dadosFiltrados.length / pagination.limit)
        })
      } else {
        setCltsCadastrados(data.cadClts)
        setPagination(data.pagination)
      }

      console.log('📊 Dados recebidos do service:', data)
    } catch (error) {
      console.error('Erro ao carregar CLTs cadastrados:', error)
      alert('Erro ao carregar CLTs cadastrados. Tente novamente.')
    } finally {
      setIsLoadingCadastrados(false)
    }
  }



  // Função para limpar filtros
  const limparFiltros = () => {
    setFiltros({
      nome: '',
      status: 'TODOS',
      valorMinimo: '',
      valorMaximo: '',
      dataInicio: '',
      dataFim: ''
    })
    setFiltrosAtivos(false)
    // Recarrega os dados sem filtros (volta para a primeira página)
    carregarCLTsCadastrados(1, pagination.limit)
  }

  // Função para aplicar filtros e buscar na API
  const aplicarFiltrosAPI = async () => {
    try {
      setIsLoadingCadastrados(true)

      // Constrói os parâmetros de filtro para a API (sem page e limit)
      const params = new URLSearchParams()

      if (filtros.nome) {
        params.append('nome', filtros.nome)
      }

      if (filtros.status !== 'TODOS') {
        // Converte o status para o formato que o backend espera
        if (filtros.status === 'ATIVO') {
          params.append('hasValor', 'true')
        } else if (filtros.status === 'SEM_VALOR') {
          params.append('hasValor', 'false')
        }
      }

      if (filtros.valorMinimo) {
        params.append('valorMinimo', filtros.valorMinimo)
      }

      if (filtros.valorMaximo) {
        params.append('valorMaximo', filtros.valorMaximo)
      }

      if (filtros.dataInicio) {
        params.append('dataInicio', filtros.dataInicio)
      }

      if (filtros.dataFim) {
        params.append('dataFim', filtros.dataFim)
      }

      console.log('🔍 Parâmetros de filtro enviados:', params.toString())

      // Busca TODOS os clientes (sem limite de página) e aplica filtros no frontend
      const data = await cltService.buscarCLTsCadastrados(1, 999999, '')

      // Aplica filtros no frontend se o backend não suportar
      let dadosFiltrados = data.cadClts

      if (filtros.nome) {
        dadosFiltrados = dadosFiltrados.filter(clt =>
          clt.nome.toLowerCase().includes(filtros.nome.toLowerCase())
        )
      }

      if (filtros.status !== 'TODOS') {
        if (filtros.status === 'ATIVO') {
          dadosFiltrados = dadosFiltrados.filter(clt =>
            clt.valorLiberado && clt.valorLiberado > 0
          )
        } else if (filtros.status === 'SEM_VALOR') {
          dadosFiltrados = dadosFiltrados.filter(clt =>
            !clt.valorLiberado || clt.valorLiberado <= 0
          )
        }
      }

      if (filtros.valorMinimo) {
        const valorMin = parseFloat(filtros.valorMinimo)
        dadosFiltrados = dadosFiltrados.filter(clt =>
          clt.valorLiberado && clt.valorLiberado >= valorMin
        )
      }

      if (filtros.valorMaximo) {
        const valorMax = parseFloat(filtros.valorMaximo)
        dadosFiltrados = dadosFiltrados.filter(clt =>
          clt.valorLiberado && clt.valorLiberado <= valorMax
        )
      }

      if (filtros.dataInicio) {
        const dataInicio = new Date(filtros.dataInicio)
        dadosFiltrados = dadosFiltrados.filter(clt =>
          new Date(clt.createdAt) >= dataInicio
        )
      }

      if (filtros.dataFim) {
        const dataFim = new Date(filtros.dataFim)
        dadosFiltrados = dadosFiltrados.filter(clt =>
          new Date(clt.createdAt) <= dataFim
        )
      }

      // Atualiza o estado com os dados filtrados
      setCltsCadastrados(dadosFiltrados)
      setPagination({
        ...data.pagination,
        total: dadosFiltrados.length,
        pages: Math.ceil(dadosFiltrados.length / pagination.limit)
      })

      // Marca que os filtros estão ativos
      setFiltrosAtivos(true)

      console.log('📊 Dados filtrados aplicados no frontend:', {
        totalRecebido: data.cadClts.length,
        totalFiltrado: dadosFiltrados.length,
        filtrosAplicados: filtros
      })
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error)
      alert('Erro ao aplicar filtros. Tente novamente.')
    } finally {
      setIsLoadingCadastrados(false)
    }
  }

  // Dados filtrados (para exibição local, mas agora os dados já vêm filtrados da API)
  const dadosFiltrados = cltsCadastrados

  const handleExportExcel = () => {
    if (dadosFiltrados.length === 0) {
      alert('Não há dados para exportar')
      return
    }

    try {
      // Prepara os dados para exportação
      const dataToExport = dadosFiltrados.map(clt => ({
        Nome: clt.nome,
        CPF: clt.cpf,
        Status: clt.status,
        'Valor Liberado': clt.valorLiberado ? `R$ ${Number(clt.valorLiberado).toFixed(2)}` : 'Não informado',
        'Data Cadastro': new Date(clt.createdAt).toLocaleDateString('pt-BR')
      }))

      // Cria o workbook
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(dataToExport)

      // Adiciona a planilha ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'CLTs Cadastrados')

      // Gera o arquivo
      const fileName = `clts_cadastrados_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)

      alert(`Arquivo exportado com sucesso: ${fileName}`)
    } catch (error) {
      console.error('Erro ao exportar arquivo:', error)
      alert('Erro ao exportar arquivo. Tente novamente.')
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

          <div className="flex items-center gap-3">
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

            <button
              onClick={handleConsultarCPFs}
              disabled={importedCPFs.length === 0}
              className="px-4 h-11 rounded-xl bg-[var(--gradient-primary)]
                  text-white font-light transition-all duration-300
                  hover:shadow-lg hover:shadow-[var(--accent-primary)]/20
                  focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-sm flex items-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Consultar CPFs
            </button>
          </div>
        </div>
      </div>

      {/* Gerenciador de Consultas em Background */}
      <BackgroundConsultaManager />

      {/* Conteúdo Principal - CLTs Cadastrados Centralizados */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Status da Importação */}
        {importedCPFs.length > 0 && (
          <div className="bg-[var(--background-secondary)] backdrop-blur-lg rounded-xl border border-[var(--border-light)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FiUsers className="h-5 w-5 text-[var(--accent-primary)]" />
                  <span className="text-[var(--text-secondary)]">
                    CPFs Importados: <span className="text-[var(--text-primary)] font-medium">{importedCPFs.length}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setImportedCPFs([])
                  localStorage.removeItem('clt_imported_cpfs')
                }}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* CLTs Cadastrados - Centralizados */}
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
                    {isLoadingCadastrados ? 'Carregando...' :
                      filtrosAtivos
                        ? `${dadosFiltrados.length} resultados encontrados (todos os clientes filtrados)`
                        : `${dadosFiltrados.length} de ${pagination.total} CLTs cadastrados no sistema`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className={`px-4 h-11 rounded-xl transition-colors border flex items-center gap-2 ${mostrarFiltros
                    ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border-[var(--accent-primary)]/30'
                    : filtrosAtivos
                      ? 'bg-[var(--status-success)]/20 text-[var(--status-success)] border-[var(--status-success)]/30'
                      : 'bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)] border-[var(--border-light)] hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  <FiSearch className="h-4 w-4" />
                  Filtros{filtrosAtivos && ' (Ativos)'}
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={dadosFiltrados.length === 0}
                  className="px-4 h-11 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]
                      hover:bg-[var(--accent-primary)]/20 transition-colors border border-[var(--accent-primary)]/20
                      disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FiDownload className="h-4 w-4" />
                  Exportar Excel
                </button>
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
          </div>

          {/* Painel de Filtros */}
          {mostrarFiltros && (
            <div className="bg-[var(--background-secondary)] backdrop-blur-lg rounded-xl border border-[var(--border-light)] p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Filtro por Nome */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={filtros.nome}
                    onChange={(e) => setFiltros(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                      text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] 
                      focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
                  />
                </div>

                {/* Filtro por Status */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Status
                  </label>
                  <select
                    value={filtros.status}
                    onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                      text-[var(--text-primary)] focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
                  >
                    <option value="TODOS">Todos os Status</option>
                    <option value="ATIVO">Ativo (com valor)</option>
                    <option value="SEM_VALOR">Sem valor</option>
                  </select>
                </div>

                {/* Filtro por Valor Mínimo */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Valor Mínimo (R$)
                  </label>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={filtros.valorMinimo}
                    onChange={(e) => setFiltros(prev => ({ ...prev, valorMinimo: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                      text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] 
                      focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
                  />
                </div>

                {/* Filtro por Valor Máximo */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Valor Máximo (R$)
                  </label>
                  <input
                    type="number"
                    placeholder="999999,99"
                    value={filtros.valorMaximo}
                    onChange={(e) => setFiltros(prev => ({ ...prev, valorMaximo: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                      text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] 
                      focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
                  />
                </div>

                {/* Filtro por Data de Início */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                      text-[var(--text-primary)] focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
                  />
                </div>

                {/* Filtro por Data de Fim */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                      text-[var(--text-primary)] focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
                  />
                </div>
              </div>

              {/* Botões de Ação dos Filtros */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-light)]">
                <div className="text-sm text-[var(--text-tertiary)]">
                  {dadosFiltrados.length} resultados encontrados
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={limparFiltros}
                    className="px-4 h-11 rounded-xl bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)]
                      hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                      border border-[var(--border-light)] hover:border-[var(--border-medium)] transition-colors"
                  >
                    Limpar Filtros
                  </button>
                  <button
                    onClick={aplicarFiltrosAPI}
                    className="px-4 h-11 rounded-xl bg-[var(--accent-primary)] text-white
                      hover:bg-[var(--accent-primary)]/90 transition-colors border border-[var(--accent-primary)]"
                  >
                    Aplicar Filtros
                  </button>
                  <button
                    onClick={() => setMostrarFiltros(false)}
                    className="px-4 h-11 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]
                      hover:bg-[var(--accent-primary)]/20 transition-colors border border-[var(--accent-primary)]/20"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de CLTs Cadastrados */}
          {isLoadingCadastrados ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : dadosFiltrados.length > 0 ? (
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
                      {dadosFiltrados.map((clt) => (
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
                <div className="bg-[var(--background-secondary)] backdrop-blur-lg rounded-xl border border-[var(--border-light)] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[var(--text-tertiary)]">
                      Página {pagination.page} de {pagination.pages} ({pagination.total} total)
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => carregarCLTsCadastrados(pagination.page - 1, pagination.limit)}
                        disabled={pagination.page <= 1}
                        className="px-3 py-2 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                            text-[var(--text-primary)] focus:border-[var(--accent-primary)]/50 
                            focus:ring-1 focus:ring-[var(--accent-primary)]/20 disabled:opacity-50
                            transition-colors"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => carregarCLTsCadastrados(pagination.page + 1, pagination.limit)}
                        disabled={pagination.page >= pagination.pages}
                        className="px-3 py-2 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                            text-[var(--text-primary)] focus:border-[var(--accent-primary)]/50 
                            focus:ring-1 focus:ring-[var(--accent-primary)]/20 disabled:opacity-50
                            transition-colors"
                      >
                        Próxima
                      </button>
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
                  {cltsCadastrados.length === 0 ? 'Nenhum CLT cadastrado' : 'Nenhum resultado encontrado'}
                </h3>
                <p className="text-[var(--text-tertiary)] font-light">
                  {cltsCadastrados.length === 0
                    ? 'Importe CPFs e faça consultas para cadastrar CLTs'
                    : 'Tente ajustar os filtros para encontrar mais resultados'
                  }
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
