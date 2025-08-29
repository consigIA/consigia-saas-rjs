import { useState, useEffect } from 'react'
import {
  FiBarChart2,
  FiDownload,

  FiCalendar,
  FiMessageSquare,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiArrowUp,
  FiArrowDown,
  FiGrid,
  FiList
} from 'react-icons/fi'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { format, subDays } from 'date-fns'

import { saveAs } from 'file-saver'
import { LoadingSpinner } from '../../../components/loading-spinner'

// Dados de exemplo (depois virão da API)
const generateMockData = () => {
  const data = []
  for (let i = 30; i >= 0; i--) {
    const date = subDays(new Date(), i)
    data.push({
      date: format(date, 'dd/MM'),
      mensagens: Math.floor(Math.random() * 500) + 100,
      contatos: Math.floor(Math.random() * 50) + 10,
      sucesso: Math.floor(Math.random() * 95) + 5,
    })
  }
  return data
}

const pieData = [
  { name: 'Autorizados', value: 540, color: '#22c55e' },
  { name: 'Pendentes', value: 320, color: '#eab308' },
  { name: 'Rejeitados', value: 140, color: '#ef4444' }
]

const barData = [
  { name: 'Seg', value: 432 },
  { name: 'Ter', value: 521 },
  { name: 'Qua', value: 489 },
  { name: 'Qui', value: 567 },
  { name: 'Sex', value: 612 },
  { name: 'Sáb', value: 245 },
  { name: 'Dom', value: 178 }
]

export function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)

  const [period, setPeriod] = useState('30d')
  const [data] = useState(generateMockData())
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')

  const handleExport = () => {
    const csvContent = [
      ['Data', 'Mensagens', 'Contatos', 'Taxa de Sucesso'],
      ...data.map(row => [
        row.date,
        row.mensagens,
        row.contatos,
        `${row.sucesso}%`
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, `relatorio_${format(new Date(), 'dd-MM-yyyy')}.csv`)
  }

  // Simula carregamento dos dados
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] gap-4">
        <LoadingSpinner className="h-8 w-8" />
        <span className="text-lg font-light text-[var(--text-tertiary)]">
          Carregando análises...
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
              <FiBarChart2 className="h-6 w-6 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-[var(--text-primary)] mb-2">
                Análise e Relatórios
              </h1>
              <p className="text-[var(--text-tertiary)] font-light">
                Acompanhe as métricas do seu negócio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle de Visualização */}
            <div className="bg-[var(--background-tertiary)]/50 rounded-lg border border-[var(--border-light)] flex">
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 h-11 rounded-lg flex items-center gap-2 transition-colors duration-300 ${viewMode === 'chart'
                  ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
              >
                <FiGrid className="h-5 w-5" />
                <span className="text-sm font-light">Gráficos</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 h-11 rounded-lg flex items-center gap-2 transition-colors duration-300 ${viewMode === 'table'
                  ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
              >
                <FiList className="h-5 w-5" />
                <span className="text-sm font-light">Tabela</span>
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 h-11 rounded-lg bg-[var(--background-tertiary)]/50 border border-[var(--border-light)]">
              <FiCalendar className="h-4 w-4 text-[var(--text-tertiary)]" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-transparent text-[var(--text-secondary)] text-sm font-light focus:outline-none"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="15d">Últimos 15 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              className="px-4 h-11 rounded-xl bg-[var(--gradient-primary)]
                text-white font-light transition-all duration-300
                hover:shadow-lg hover:shadow-[var(--accent-primary)]/20
                focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-sm flex items-center gap-2"
            >
              <FiDownload className="h-5 w-5" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Mensagens */}
        <div className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-2xl border border-[var(--border-light)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-[var(--accent-primary)]/10 p-3 rounded-xl">
              <FiMessageSquare className="h-6 w-6 text-[var(--accent-primary)]" />
            </div>
            <div className="flex items-center gap-1 text-[var(--status-success)] text-sm">
              <FiArrowUp className="h-4 w-4" />
              <span>12%</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-light text-[var(--text-tertiary)] mb-1">
              Total de Mensagens
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-light text-[var(--text-primary)]">
                12.543
              </span>
              <span className="text-sm font-light text-[var(--text-tertiary)] mb-1">
                msgs
              </span>
            </div>
          </div>
        </div>

        {/* Contatos */}
        <div className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-2xl border border-[var(--border-light)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-[var(--accent-primary)]/10 p-3 rounded-xl">
              <FiUsers className="h-6 w-6 text-[var(--accent-primary)]" />
            </div>
            <div className="flex items-center gap-1 text-[var(--status-success)] text-sm">
              <FiArrowUp className="h-4 w-4" />
              <span>8%</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-light text-[var(--text-tertiary)] mb-1">
              Novos Contatos
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-light text-[var(--text-primary)]">
                847
              </span>
              <span className="text-sm font-light text-[var(--text-tertiary)] mb-1">
                contatos
              </span>
            </div>
          </div>
        </div>

        {/* Taxa de Sucesso */}
        <div className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-2xl border border-[var(--border-light)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-[var(--status-success)]/10 p-3 rounded-xl">
              <FiCheckCircle className="h-6 w-6 text-[var(--status-success)]" />
            </div>
            <div className="flex items-center gap-1 text-[var(--status-success)] text-sm">
              <FiArrowUp className="h-4 w-4" />
              <span>2.5%</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-light text-[var(--text-tertiary)] mb-1">
              Taxa de Sucesso
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-light text-[var(--text-primary)]">
                98.7
              </span>
              <span className="text-sm font-light text-[var(--text-tertiary)] mb-1">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Taxa de Erro */}
        <div className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-2xl border border-[var(--border-light)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-[var(--status-error)]/10 p-3 rounded-xl">
              <FiXCircle className="h-6 w-6 text-[var(--status-error)]" />
            </div>
            <div className="flex items-center gap-1 text-[var(--status-error)] text-sm">
              <FiArrowDown className="h-4 w-4" />
              <span>1.2%</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-light text-[var(--text-tertiary)] mb-1">
              Taxa de Erro
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-light text-[var(--text-primary)]">
                1.3
              </span>
              <span className="text-sm font-light text-[var(--text-tertiary)] mb-1">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Área */}
        {viewMode === 'chart' ? (
          <>
            {/* Gráfico de Área */}
            <div className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-2xl border border-[var(--border-light)] p-6">
              <h2 className="text-lg font-light text-[var(--text-primary)] mb-6">
                Mensagens por Dia
              </h2>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorMensagens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    <XAxis
                      dataKey="date"
                      stroke="var(--text-tertiary)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--text-tertiary)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background-secondary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 300,
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mensagens"
                      stroke="var(--accent-primary)"
                      fillOpacity={1}
                      fill="url(#colorMensagens)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Barras */}
            <div className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-2xl border border-[var(--border-light)] p-6">
              <h2 className="text-lg font-light text-[var(--text-primary)] mb-6">
                Mensagens por Dia da Semana
              </h2>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-tertiary)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--text-tertiary)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background-secondary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 300,
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="var(--accent-primary)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Pizza */}
            <div className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-2xl border border-[var(--border-light)] p-6">
              <h2 className="text-lg font-light text-[var(--text-primary)] mb-6">
                Status dos Clientes
              </h2>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background-secondary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 300,
                        color: 'var(--text-primary)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex items-center justify-center gap-6">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-light text-[var(--text-secondary)]">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gráfico de Área - Taxa de Sucesso */}
            <div className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-2xl border border-[var(--border-light)] p-6">
              <h2 className="text-lg font-light text-[var(--text-primary)] mb-6">
                Taxa de Sucesso
              </h2>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSucesso" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--status-success)" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="var(--status-success)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    <XAxis
                      dataKey="date"
                      stroke="var(--text-tertiary)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--text-tertiary)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background-secondary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 300,
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sucesso"
                      stroke="var(--status-success)"
                      fillOpacity={1}
                      fill="url(#colorSucesso)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-xl border border-[var(--border-light)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-light)]">
                    <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Data</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Mensagens</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Contatos</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Taxa de Sucesso</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-[var(--border-light)] hover:bg-[var(--background-tertiary)]/50 transition-colors duration-200"
                    >
                      <td className="p-4">
                        <div className="text-[var(--text-primary)] font-light">{row.date}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-[var(--text-primary)] font-light">{row.mensagens}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-[var(--text-primary)] font-light">{row.contatos}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-[var(--text-primary)] font-light">{row.sucesso}%</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
