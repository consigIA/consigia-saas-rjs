import { useState, useEffect } from 'react'
import { FiPlay, FiPause, FiX, FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi'
import { cltService, type BackgroundConsulta } from '../services/clt-service'



export function BackgroundConsultaManager() {
  const [consultas, setConsultas] = useState<BackgroundConsulta[]>([])
  const [activeConsulta, setActiveConsulta] = useState<BackgroundConsulta | null>(null)

  useEffect(() => {
    // Carrega consultas existentes do localStorage
    carregarConsultasExistentes()



    // Verifica se há consultas em andamento e as retoma se necessário
    const consultasEmAndamento = consultas.filter(c => c.status === 'running')
    if (consultasEmAndamento.length > 0) {
      console.log('🔄 Encontradas consultas em andamento, verificando se precisam ser retomadas...')

      consultasEmAndamento.forEach(consulta => {
        // Verifica se a consulta está "perdida" (sem atualização recente)
        const agora = new Date()
        const ultimaAtualizacao = new Date(consulta.lastUpdate)
        const diffMinutos = (agora.getTime() - ultimaAtualizacao.getTime()) / (1000 * 60)

        if (diffMinutos > 2) { // Se não houve atualização nos últimos 2 minutos
          console.log(`🔄 Retomando consulta ${consulta.id.slice(-8)} que estava perdida`)

          // Retoma a consulta
          retomarConsultaPerdida(consulta)
        }
      })
    }

    // Configura um intervalo para verificar consultas perdidas a cada 30 segundos
    const intervalId = setInterval(() => {
      verificarConsultasPerdidas()
    }, 30000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const carregarConsultasExistentes = () => {
    const consultasExistentes = cltService.obterConsultasBackground()
    setConsultas(consultasExistentes)

    // Define a consulta ativa (a mais recente em execução)
    const consultaAtiva = consultasExistentes.find(c => c.status === 'running')
    if (consultaAtiva) {
      setActiveConsulta(consultaAtiva)
    }

    // Configura um intervalo para atualizar as consultas a cada 5 segundos
    const updateInterval = setInterval(() => {
      const consultasAtualizadas = cltService.obterConsultasBackground()
      setConsultas(consultasAtualizadas)

      // Atualiza a consulta ativa
      const consultaAtivaAtualizada = consultasAtualizadas.find(c => c.status === 'running')
      if (consultaAtivaAtualizada) {
        setActiveConsulta(consultaAtivaAtualizada)
      } else {
        setActiveConsulta(null)
      }
    }, 5000)

    // Limpa o intervalo quando o componente for desmontado
    return () => clearInterval(updateInterval)
  }



  const pausarConsulta = (consultaId: string) => {
    cltService.pausarConsultaBackground(consultaId)
    carregarConsultasExistentes()
  }

  const resumirConsulta = (consultaId: string) => {
    cltService.resumirConsultaBackground(consultaId)
    carregarConsultasExistentes()
  }

  const cancelarConsulta = (consultaId: string) => {
    if (confirm('Tem certeza que deseja cancelar esta consulta?')) {
      cltService.cancelarConsultaBackground(consultaId)
      carregarConsultasExistentes()
    }
  }

  const removerConsulta = (consultaId: string) => {
    if (confirm('Tem certeza que deseja remover esta consulta?')) {
      const consultasAtualizadas = consultas.filter(c => c.id !== consultaId)
      localStorage.setItem('clt_background_consultas', JSON.stringify(consultasAtualizadas))
      setConsultas(consultasAtualizadas)

      if (activeConsulta?.id === consultaId) {
        setActiveConsulta(null)
      }
    }
  }

  // Retoma uma consulta que estava perdida
  const retomarConsultaPerdida = (consulta: BackgroundConsulta) => {
    try {
      console.log(`🔄 Retomando consulta perdida: ${consulta.id}`)

      // Obtém os CPFs que ainda não foram processados
      const cpfsPendentes = consulta.results
        .filter((result) => result.status === 'pending')
        .map((result) => ({
          cpf: result.cpf,
          nome: result.nome
        }))

      if (cpfsPendentes.length > 0) {
        console.log(`🔄 ${cpfsPendentes.length} CPFs pendentes encontrados, retomando processamento...`)

        // Retoma a consulta usando o serviço
        cltService.retomarConsultaPerdida(consulta.id, cpfsPendentes)
      } else {
        console.log('✅ Consulta já foi concluída, marcando como completa')
        consulta.status = 'completed'
        cltService.salvarConsultaBackground(consulta)
      }
    } catch (error) {
      console.error('Erro ao retomar consulta perdida:', error)
    }
  }

  // Verifica consultas perdidas periodicamente
  const verificarConsultasPerdidas = () => {
    const consultasAtivas = consultas.filter(c => c.status === 'running')

    consultasAtivas.forEach(consulta => {
      const agora = new Date()
      const ultimaAtualizacao = new Date(consulta.lastUpdate)
      const diffMinutos = (agora.getTime() - ultimaAtualizacao.getTime()) / (1000 * 60)

      if (diffMinutos > 2) {
        console.log(`🔄 Consulta ${consulta.id.slice(-8)} perdida detectada, retomando...`)
        retomarConsultaPerdida(consulta)
      }
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <FiPlay className="h-4 w-4 text-green-500" />
      case 'paused':
        return <FiPause className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <FiCheck className="h-4 w-4 text-green-600" />
      case 'error':
        return <FiAlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FiClock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return 'Executando'
      case 'paused':
        return 'Pausada'
      case 'completed':
        return 'Concluída'
      case 'error':
        return 'Erro'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'completed':
        return 'bg-green-600/10 text-green-600 border-green-600/20'
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diff = end.getTime() - start.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatEstimatedTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  if (consultas.length === 0) {
    return null
  }

  return (
    <div className="bg-[var(--background-secondary)] backdrop-blur-lg rounded-xl border border-[var(--border-light)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-light text-[var(--text-primary)]">
          Consultas em Background
        </h3>
        <div className="text-sm text-[var(--text-tertiary)]">
          {consultas.filter(c => c.status === 'running').length} ativas
        </div>
      </div>

      <div className="space-y-3">
        {consultas.map((consulta) => (
          <div
            key={consulta.id}
            className="bg-[var(--background-tertiary)]/50 rounded-lg border border-[var(--border-light)] p-4"
          >
            {/* Header da Consulta */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(consulta.status)}
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    Consulta #{consulta.id.slice(-8)}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {new Date(consulta.startTime).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(consulta.status)}`}>
                  {getStatusText(consulta.status)}
                </span>

                {consulta.status === 'running' && (
                  <button
                    onClick={() => pausarConsulta(consulta.id)}
                    className="p-1 text-yellow-500 hover:text-yellow-400 transition-colors"
                    title="Pausar"
                  >
                    <FiPause className="h-4 w-4" />
                  </button>
                )}

                {consulta.status === 'paused' && (
                  <button
                    onClick={() => resumirConsulta(consulta.id)}
                    className="p-1 text-green-500 hover:text-green-400 transition-colors"
                    title="Resumir"
                  >
                    <FiPlay className="h-4 w-4" />
                  </button>
                )}

                {(consulta.status === 'running' || consulta.status === 'paused') && (
                  <button
                    onClick={() => cancelarConsulta(consulta.id)}
                    className="p-1 text-red-500 hover:text-red-400 transition-colors"
                    title="Cancelar"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => removerConsulta(consulta.id)}
                  className="p-1 text-gray-500 hover:text-gray-400 transition-colors"
                  title="Remover"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Progresso */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] mb-1">
                <span>Progresso</span>
                <span>{consulta.processedCPFs} / {consulta.totalCPFs} CPFs</span>
              </div>
              <div className="w-full bg-[var(--background-tertiary)] rounded-full h-2">
                <div
                  className="bg-[var(--accent-primary)] h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${consulta.totalCPFs > 0 ? (consulta.processedCPFs / consulta.totalCPFs) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Estatísticas */}
            <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
              <div className="flex items-center gap-4">
                <span>Duração: {formatDuration(consulta.startTime, consulta.lastUpdate)}</span>
                {consulta.status === 'running' && consulta.estimatedTimeRemaining && (
                  <span className="text-[var(--accent-primary)]">
                    Tempo restante: ~{formatEstimatedTime(consulta.estimatedTimeRemaining)}
                  </span>
                )}
                <span>Última atualização: {new Date(consulta.lastUpdate).toLocaleTimeString('pt-BR')}</span>
              </div>

              {consulta.error && (
                <div className="text-red-500">
                  Erro: {consulta.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Notificação de Consulta Ativa */}
      {activeConsulta && (
        <div className="mt-4 p-3 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-lg">
          <div className="flex items-center gap-2 text-[var(--accent-primary)]">
            <FiPlay className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">
              Consulta ativa em background: {activeConsulta.processedCPFs} de {activeConsulta.totalCPFs} CPFs processados
            </span>
          </div>
          <div className="text-xs text-[var(--accent-primary)]/70 mt-1">
            Esta consulta continuará rodando mesmo se você recarregar a página ou navegar para outras abas
          </div>
        </div>
      )}
    </div>
  )
}
