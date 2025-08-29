import { api } from '../../../lib/api'
import { useAuthStore } from '../../../features/auth/stores/auth-store'

export interface CLTOffer {
  id: string
  nome: string
  cpf: string
  empresa: string
  cargo: string
  salario: number
  valorDisponivel: number
  parcelas: number
  valorParcela: number
  taxaJuros: number
  valorLiberado: string
}

export interface CLTResponse {
  erro: boolean
  mensagem: string
  total: number
  dados: Array<{
    oferta: {
      idSolicitacao: string
      cpf: string
      matricula: string
      numeroInscricaoEmpregador: string
      valorLiberado: string
      nroParcelas: string
      nomeTrabalhador: string
      dataNascimento: string
      margemDisponivel: string
      elegivelEmprestimo: string
      pessoaExpostaPoliticamente: string
      dataAdmissao: string
      alertas: string | null
      ID: string
    }
    resposta: {
      contatos: string
      idSolicitacao: string
      numeroParcelas: string
      numeroProposta: string
      valorCETAnual: string
      valorCETMensal: string
      valorEmprestimo: string
      valorIOF: string
      valorLiberado: string
      valorParcela: string
      valorTaxaAnual: string
      valorTaxaMensal: string
      tabela: string
    }
  }>
}

export interface FactaResponse {
  message: string
  cpf: string
  data: CLTResponse
  timestamp: string
}

export interface ImportedCPF {
  cpf: string
  nome: string
}

export interface CLTCadastrado {
  id: number
  nome: string
  cpf: string
  status: string
  valorLiberado?: number
  createdAt: string
  updatedAt: string
}

// Interface para consulta em background
export interface BackgroundConsulta {
  id: string
  status: 'running' | 'completed' | 'paused' | 'error'
  totalCPFs: number
  processedCPFs: number
  startTime: string
  lastUpdate: string
  estimatedTimeRemaining?: number // em segundos
  results: Array<{
    cpf: string
    nome: string
    status: 'pending' | 'success' | 'error' | 'no_offers'
    resultado?: CLTResponse
    cadastrado?: boolean
    errorMessage?: string
  }>
  error?: string
}

export const cltService = {
  async consultarCPF(cpf: string): Promise<CLTResponse> {
    try {
      // Obtém o token do usuário logado
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('Usuário não autenticado')
      }

      // Faz POST para o endpoint local com CPF no body e Bearer token do usuário
      const response = await api.post('/facta/consulta-ofertas', {
        cpf: cpf
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const factaResponse: FactaResponse = response.data

      // Retorna apenas os dados da consulta (CLTResponse)
      return factaResponse.data
    } catch (error) {
      console.error('Erro ao consultar CPF:', error)
      throw new Error('Erro na consulta da API')
    }
  },

  async cadastrarCLT(nome: string, cpf: string, status: string, valorLiberado: number): Promise<void> {
    try {
      // Obtém o token do usuário logado
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('Usuário não autenticado')
      }

      // Faz POST para cadastrar o CLT no banco
      await api.post('/cad-clt', {
        nome,
        cpf,
        status,
        valorLiberado
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log(`CLT ${nome} (${cpf}) cadastrado com sucesso`)
    } catch (error) {
      console.error('Erro ao cadastrar CLT:', error)
      throw new Error('Erro ao cadastrar CLT no banco')
    }
  },

  async cadastrarCLTSemValor(nome: string, cpf: string, status: string): Promise<void> {
    try {
      // Obtém o token do usuário logado
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('Usuário não autenticado')
      }

      // Faz POST para cadastrar o CLT no banco (sem campo valorLiberado)
      await api.post('/cad-clt', {
        nome,
        cpf,
        status
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log(`CLT ${nome} (${cpf}) cadastrado com sucesso (sem valor)`)
    } catch (error) {
      console.error('Erro ao cadastrar CLT sem valor:', error)
      throw new Error('Erro ao cadastrar CLT no banco')
    }
  },

  async consultarCPFsEmLote(cpfs: ImportedCPF[]): Promise<Array<{ cpf: string; nome: string; resultado: CLTResponse }>> {
    const resultados = []

    for (const item of cpfs) {
      try {
        const resultado = await this.consultarCPF(item.cpf)
        resultados.push({
          cpf: item.cpf,
          nome: item.nome,
          resultado
        })

        // Aguarda 1 segundo entre as consultas para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        resultados.push({
          cpf: item.cpf,
          nome: item.nome,
          resultado: {
            erro: true,
            mensagem: 'Erro na consulta',
            total: 0,
            dados: []
          }
        })
      }
    }

    return resultados
  },

  async buscarCLTsCadastrados(page = 1, limit = 20): Promise<{ cadClts: CLTCadastrado[], pagination: { page: number, limit: number, total: number, pages: number } }> {
    try {
      // Obtém o token do usuário logado
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('Usuário não autenticado')
      }

      // Faz GET para buscar os CLTs cadastrados no banco com paginação
      const response = await api.get(`/cad-clt?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      return response.data
    } catch (error) {
      console.error('Erro ao buscar CLTs cadastrados:', error)
      throw new Error('Erro ao buscar CLTs cadastrados')
    }
  },

  // ===== FUNÇÕES PARA CONSULTA EM BACKGROUND =====

  // Inicia uma consulta em background
  async iniciarConsultaBackground(cpfs: ImportedCPF[]): Promise<string> {
    const consultaId = `consulta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Calcula estimativa de tempo (4s por CPF em média)
    const estimatedTimeRemaining = cpfs.length * 4

    const consulta: BackgroundConsulta = {
      id: consultaId,
      status: 'running',
      totalCPFs: cpfs.length,
      processedCPFs: 0,
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      estimatedTimeRemaining,
      results: cpfs.map(cpf => ({
        cpf: cpf.cpf,
        nome: cpf.nome,
        status: 'pending'
      }))
    }

    // Salva no localStorage
    this.salvarConsultaBackground(consulta)

    // Inicia o Web Worker
    this.iniciarWebWorker(consultaId, cpfs)

    return consultaId
  },

  // Pausa uma consulta em background
  pausarConsultaBackground(consultaId: string): void {
    const consulta = this.obterConsultaBackground(consultaId)
    if (consulta && consulta.status === 'running') {
      consulta.status = 'paused'
      consulta.lastUpdate = new Date().toISOString()
      this.salvarConsultaBackground(consulta)
      console.log('⏸️ Consulta pausada:', consultaId)
    }
  },

  // Resume uma consulta pausada
  resumirConsultaBackground(consultaId: string): void {
    const consulta = this.obterConsultaBackground(consultaId)
    if (consulta && consulta.status === 'paused') {
      consulta.status = 'running'
      consulta.lastUpdate = new Date().toISOString()
      this.salvarConsultaBackground(consulta)

      // Retoma o processamento
      const cpfsPendentes = consulta.results
        .filter((result) => result.status === 'pending')
        .map((result) => ({
          cpf: result.cpf,
          nome: result.nome
        }))

      if (cpfsPendentes.length > 0) {
        this.processarCPFsEmBackground(consultaId, cpfsPendentes)
      }

      console.log('▶️ Consulta resumida:', consultaId)
    }
  },

  // Cancela uma consulta em background
  cancelarConsultaBackground(consultaId: string): void {
    const consulta = this.obterConsultaBackground(consultaId)
    if (consulta) {
      consulta.status = 'error'
      consulta.error = 'Consulta cancelada pelo usuário'
      consulta.lastUpdate = new Date().toISOString()
      this.salvarConsultaBackground(consulta)
      console.log('❌ Consulta cancelada:', consultaId)
    }
  },

  // Obtém uma consulta específica
  obterConsultaBackground(consultaId: string): BackgroundConsulta | null {
    try {
      const consultas = this.obterConsultasBackground()
      return consultas.find(c => c.id === consultaId) || null
    } catch (error) {
      console.error('Erro ao obter consulta:', error)
      return null
    }
  },

  // Obtém todas as consultas em background
  obterConsultasBackground(): BackgroundConsulta[] {
    try {
      const consultas = localStorage.getItem('clt_background_consultas')
      return consultas ? JSON.parse(consultas) : []
    } catch (error) {
      console.error('Erro ao obter consultas:', error)
      return []
    }
  },

  // Salva uma consulta no localStorage
  salvarConsultaBackground(consulta: BackgroundConsulta): void {
    try {
      const consultas = this.obterConsultasBackground()
      const index = consultas.findIndex(c => c.id === consulta.id)

      if (index >= 0) {
        consultas[index] = consulta
      } else {
        consultas.push(consulta)
      }

      localStorage.setItem('clt_background_consultas', JSON.stringify(consultas))
    } catch (error) {
      console.error('Erro ao salvar consulta:', error)
    }
  },

  // Inicia a consulta em background usando setInterval (persiste entre recarregamentos)
  iniciarWebWorker(consultaId: string, cpfs: ImportedCPF[]): void {
    try {
      console.log('🚀 Iniciando consulta em background persistente:', consultaId)

      // Salva o estado da consulta no localStorage para persistir
      const consulta = this.obterConsultaBackground(consultaId)
      if (consulta) {
        consulta.status = 'running'
        consulta.lastUpdate = new Date().toISOString()
        this.salvarConsultaBackground(consulta)
      }

      // Inicia o processamento usando setInterval (persiste entre recarregamentos)
      this.processarCPFsEmBackground(consultaId, cpfs)

    } catch (error) {
      console.error('Erro ao iniciar consulta em background:', error)
      throw new Error('Não foi possível iniciar a consulta em background')
    }
  },

  // Processa CPFs em background usando setInterval
  async processarCPFsEmBackground(consultaId: string, cpfs: ImportedCPF[]): Promise<void> {
    try {
      const token = useAuthStore.getState().token
      if (!token) {
        throw new Error('Token não encontrado')
      }

      let currentIndex = 0
      const totalCPFs = cpfs.length

      // Função para processar o próximo CPF
      const processarProximoCPF = async () => {
        // Verifica se a consulta ainda está ativa
        const consulta = this.obterConsultaBackground(consultaId)
        if (!consulta || consulta.status === 'paused' || consulta.status === 'error') {
          console.log('🛑 Consulta pausada ou cancelada, parando processamento')
          return
        }

        if (currentIndex >= totalCPFs) {
          // Consulta concluída
          this.marcarConsultaCompleta(consultaId)
          console.log('✅ Consulta concluída:', consultaId)
          return
        }

        const cpf = cpfs[currentIndex]
        console.log(`🔍 Processando CPF ${currentIndex + 1}/${totalCPFs}: ${cpf.nome} (${cpf.cpf})`)

        try {
          // Consulta o CPF
          const resultado = await this.consultarCPF(cpf.cpf)

          // Determina o status
          const status: 'pending' | 'success' | 'error' | 'no_offers' = resultado.erro ? 'no_offers' :
            (resultado.dados.length > 0) ? 'success' : 'no_offers'

          // Atualiza o progresso
          this.atualizarProgressoConsulta(consultaId, currentIndex, resultado, status)

          // Tenta cadastrar no banco
          await this.tentarCadastrarCLT({
            cpf: cpf.cpf,
            nome: cpf.nome,
            status: 'pending'
          }, resultado)

          currentIndex++

          // Agenda o próximo CPF para ser processado em 1 segundo
          setTimeout(processarProximoCPF, 1000)

        } catch (error) {
          console.error(`❌ Erro ao processar CPF ${cpf.cpf}:`, error)

          // Marca como erro
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
          this.atualizarErroConsulta(consultaId, currentIndex, errorMessage)
          currentIndex++

          // Continua com o próximo CPF
          setTimeout(processarProximoCPF, 1000)
        }
      }

      // Inicia o processamento
      processarProximoCPF()

    } catch (error) {
      console.error('Erro ao processar CPFs em background:', error)
      this.marcarConsultaCompleta(consultaId)
    }
  },

  // Processa mensagens do Web Worker
  handleWorkerMessage(data: any): void {
    const { type, consultaId, index, resultado, status, error } = data

    switch (type) {
      case 'PROGRESS':
        this.atualizarProgressoConsulta(consultaId, index, resultado, status)
        break
      case 'ERROR':
        this.atualizarErroConsulta(consultaId, index, error)
        break
      case 'COMPLETED':
        this.marcarConsultaCompleta(consultaId)
        break
      case 'CANCELLED':
        this.marcarConsultaCancelada(consultaId)
        break
    }
  },

  // Atualiza o progresso de uma consulta
  atualizarProgressoConsulta(consultaId: string, index: number, resultado: CLTResponse, status: 'pending' | 'success' | 'error' | 'no_offers'): void {
    const consulta = this.obterConsultaBackground(consultaId)
    if (consulta && consulta.results[index]) {
      consulta.results[index].resultado = resultado
      consulta.results[index].status = status
      consulta.processedCPFs = Math.max(consulta.processedCPFs, index + 1)
      consulta.lastUpdate = new Date().toISOString()

      // Recalcula estimativa de tempo restante
      const cpfsRestantes = consulta.totalCPFs - consulta.processedCPFs
      consulta.estimatedTimeRemaining = cpfsRestantes * 4 // 4s por CPF em média

      // Tenta cadastrar no banco
      this.tentarCadastrarCLT(consulta.results[index], resultado)

      this.salvarConsultaBackground(consulta)

      // Dispara evento para notificar a UI
      window.dispatchEvent(new CustomEvent('cltConsultaProgress', { detail: consulta }))
    }
  },

  // Atualiza erro de uma consulta
  atualizarErroConsulta(consultaId: string, index: number, errorMessage: string): void {
    const consulta = this.obterConsultaBackground(consultaId)
    if (consulta && consulta.results[index]) {
      consulta.results[index].status = 'error'
      consulta.results[index].errorMessage = errorMessage
      consulta.processedCPFs = Math.max(consulta.processedCPFs, index + 1)
      consulta.lastUpdate = new Date().toISOString()

      // Recalcula estimativa de tempo restante
      const cpfsRestantes = consulta.totalCPFs - consulta.processedCPFs
      consulta.estimatedTimeRemaining = cpfsRestantes * 4 // 4s por CPF em média

      this.salvarConsultaBackground(consulta)

      // Dispara evento para notificar a UI
      window.dispatchEvent(new CustomEvent('cltConsultaProgress', { detail: consulta }))
    }
  },

  // Marca consulta como completa
  marcarConsultaCompleta(consultaId: string): void {
    const consulta = this.obterConsultaBackground(consultaId)
    if (consulta) {
      consulta.status = 'completed'
      consulta.lastUpdate = new Date().toISOString()
      this.salvarConsultaBackground(consulta)

      // Dispara evento para notificar a UI
      window.dispatchEvent(new CustomEvent('cltConsultaCompleted', { detail: consulta }))
    }
  },

  // Marca consulta como cancelada
  marcarConsultaCancelada(consultaId: string): void {
    const consulta = this.obterConsultaBackground(consultaId)
    if (consulta) {
      consulta.status = 'error'
      consulta.error = 'Consulta cancelada pelo usuário'
      consulta.lastUpdate = new Date().toISOString()

      this.salvarConsultaBackground(consulta)

      // Dispara evento para notificar a UI
      window.dispatchEvent(new CustomEvent('cltConsultaCancelled', { detail: consulta }))
    }
  },

  // Tenta cadastrar CLT no banco
  async tentarCadastrarCLT(resultado: any, apiResponse: CLTResponse): Promise<void> {
    try {
      if (apiResponse.dados.length > 0) {
        const valorLiberado = parseFloat(apiResponse.dados[0].resposta.valorLiberado)

        if (valorLiberado > 0) {
          await this.cadastrarCLT(resultado.nome, resultado.cpf, 'ativo', valorLiberado)
        } else {
          await this.cadastrarCLTSemValor(resultado.nome, resultado.cpf, 'ativo')
        }

        resultado.cadastrado = true
      } else if (apiResponse.erro && apiResponse.mensagem === 'Nenhuma oferta encontrada.') {
        await this.cadastrarCLTSemValor(resultado.nome, resultado.cpf, 'ativo')
        resultado.cadastrado = true
      }
    } catch (error) {
      console.error('Erro ao cadastrar CLT em background:', error)
      // Não marca como erro, apenas loga
    }
  },

  // Retoma uma consulta perdida
  retomarConsultaPerdida(consultaId: string, cpfsPendentes: ImportedCPF[]): void {
    try {
      console.log(`🔄 Retomando consulta perdida: ${consultaId} com ${cpfsPendentes.length} CPFs pendentes`)

      // Atualiza o status da consulta
      const consulta = this.obterConsultaBackground(consultaId)
      if (consulta) {
        consulta.status = 'running'
        consulta.lastUpdate = new Date().toISOString()
        this.salvarConsultaBackground(consulta)

        // Retoma o processamento
        this.processarCPFsEmBackground(consultaId, cpfsPendentes)
      }
    } catch (error) {
      console.error('Erro ao retomar consulta perdida:', error)
    }
  }
}


