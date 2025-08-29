import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSettings,
  FiSave,
  FiKey,
  FiServer,

  FiGlobe,

  FiDatabase,
  FiBell,
  FiCheckCircle,
  FiXCircle,
  FiBriefcase
} from 'react-icons/fi'
import { useHasPermission, PERMISSIONS } from '../../auth/components/role-guard'

import { LoadingSpinner } from '../../../components/loading-spinner'

interface WebhookConfig {
  url: string
  events: string[]
  enabled: boolean
}

interface APIConfig {
  evolutionApiKey: string
  n8nUrl: string
  n8nToken: string
}

interface NotificationConfig {
  email: boolean
  whatsapp: boolean
  system: boolean
  errorAlerts: boolean
  successAlerts: boolean
}

interface SystemConfig {
  companyName: string
  timezone: string
  dateFormat: string
  language: string
}

interface AvailableAPI {
  name: string
  status: 'active' | 'inactive'
  description: string
  documentation?: string
}

export function SettingsPage() {
  const [isLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const canViewCompanySettings = useHasPermission([...PERMISSIONS.MANAGE_OWN_COMPANY, ...PERMISSIONS.TECHNICAL_CONFIG])

  // Estados para cada seção
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    url: 'https://n8n.consigia.com.br/webhook/financeiro',
    events: ['MESSAGES_UPSERT', 'STATUS_INSTANCE'],
    enabled: true
  })

  const [apiConfig, setApiConfig] = useState<APIConfig>({
    evolutionApiKey: '429683C4C977415CAAFCCE10F7D57E11',
    n8nUrl: 'https://n8n.consigia.com.br',
    n8nToken: 'seu-token-aqui'
  })

  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>({
    email: true,
    whatsapp: true,
    system: true,
    errorAlerts: true,
    successAlerts: false
  })

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    companyName: 'ConsigIA',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'dd/MM/yyyy',
    language: 'pt-BR'
  })

  const [availableAPIs] = useState<AvailableAPI[]>([
    {
      name: 'FACTA',
      status: 'active',
      description: 'API para integração com serviços financeiros da FACTA',
      documentation: 'https://docs.facta.com.br'
    },
    {
      name: 'V8',
      status: 'active',
      description: 'API para integração com serviços da V8',
      documentation: 'https://docs.v8.com.br'
    }
  ])

  const handleSave = async () => {
    setIsSaving(true)
    // Simula salvamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] gap-4">
        <LoadingSpinner className="h-8 w-8" />
        <span className="text-lg font-light text-slate-400">
          Carregando configurações...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative bg-slate-900/50 rounded-2xl p-6 overflow-hidden backdrop-blur-sm border border-white/[0.05]">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-purple-500/5 to-sky-500/5" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-sky-500/10 to-purple-400/10 p-3 rounded-xl">
              <FiSettings className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-white/90 mb-2">
                Configurações
              </h1>
              <p className="text-slate-400 font-light">
                Gerencie as configurações do sistema
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`
              group px-4 h-11 rounded-xl
              bg-gradient-to-r from-sky-500 to-sky-400
              text-white font-light
              transition-all duration-300
              hover:shadow-lg hover:shadow-sky-500/20
              hover:from-sky-400 hover:to-sky-500
              focus:ring-2 focus:ring-sky-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              text-sm
              flex items-center gap-2
            `}
          >
            {isSaving ? (
              <>
                <LoadingSpinner className="h-4 w-4" />
                Salvando...
              </>
            ) : (
              <>
                <FiSave className="h-5 w-5" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>

      {/* APIs Disponíveis */}
      <div className="bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-500/10 p-2 rounded-lg">
            <FiDatabase className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-light text-white/90">
            APIs Disponíveis
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableAPIs.map((api) => (
            <div
              key={api.name}
              className="bg-slate-900/50 rounded-xl border border-white/[0.05] p-4 hover:border-indigo-500/20 transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-light text-white/90">
                    {api.name}
                  </span>
                  {api.status === 'active' ? (
                    <FiCheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <FiXCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
                {api.documentation && (
                  <a
                    href={api.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-light text-indigo-400 hover:text-indigo-300 transition-colors duration-300"
                  >
                    Documentação
                  </a>
                )}
              </div>
              <p className="text-sm font-light text-slate-400">
                {api.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Configurações da Empresa */}
      {canViewCompanySettings && (
        <Link
          to="/dashboard/settings/company"
          className="block bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] p-6 hover:border-sky-500/20 transition-colors duration-300 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-sky-500/10 p-2 rounded-lg">
                <FiBriefcase className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <h2 className="text-lg font-light text-white/90">Configurações da Empresa</h2>
                <p className="text-sm font-light text-slate-400">
                  Gerencie os dados e configurações da sua empresa
                </p>
              </div>
            </div>
            <div className="text-sky-400">
              <FiSettings className="h-5 w-5" />
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* APIs e Integrações */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-500/10 p-2 rounded-lg">
                <FiKey className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-light text-white/90">
                APIs e Integrações
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-light text-slate-400 mb-2">
                  Evolution API Key
                </label>
                <input
                  type="password"
                  value={apiConfig.evolutionApiKey}
                  onChange={(e) => setApiConfig({ ...apiConfig, evolutionApiKey: e.target.value })}
                  className={`
                    w-full h-11 px-4 rounded-xl
                    bg-slate-900/50 border border-white/[0.05]
                    text-slate-300 placeholder:text-slate-500
                    transition-all duration-300
                    hover:border-white/[0.1] focus:border-purple-500/50
                    focus:ring-1 focus:ring-purple-500/20
                    text-sm font-light
                  `}
                />
              </div>

              <div>
                <label className="block text-sm font-light text-slate-400 mb-2">
                  N8N URL
                </label>
                <input
                  type="text"
                  value={apiConfig.n8nUrl}
                  onChange={(e) => setApiConfig({ ...apiConfig, n8nUrl: e.target.value })}
                  className={`
                    w-full h-11 px-4 rounded-xl
                    bg-slate-900/50 border border-white/[0.05]
                    text-slate-300 placeholder:text-slate-500
                    transition-all duration-300
                    hover:border-white/[0.1] focus:border-purple-500/50
                    focus:ring-1 focus:ring-purple-500/20
                    text-sm font-light
                  `}
                />
              </div>

              <div>
                <label className="block text-sm font-light text-slate-400 mb-2">
                  N8N Token
                </label>
                <input
                  type="password"
                  value={apiConfig.n8nToken}
                  onChange={(e) => setApiConfig({ ...apiConfig, n8nToken: e.target.value })}
                  className={`
                    w-full h-11 px-4 rounded-xl
                    bg-slate-900/50 border border-white/[0.05]
                    text-slate-300 placeholder:text-slate-500
                    transition-all duration-300
                    hover:border-white/[0.1] focus:border-purple-500/50
                    focus:ring-1 focus:ring-purple-500/20
                    text-sm font-light
                  `}
                />
              </div>
            </div>
          </div>

          {/* Webhook */}
          <div className="bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-sky-500/10 p-2 rounded-lg">
                <FiServer className="h-5 w-5 text-sky-400" />
              </div>
              <h2 className="text-lg font-light text-white/90">
                Webhook
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-light text-slate-400 mb-2">
                  URL do Webhook
                </label>
                <input
                  type="text"
                  value={webhookConfig.url}
                  onChange={(e) => setWebhookConfig({ ...webhookConfig, url: e.target.value })}
                  className={`
                    w-full h-11 px-4 rounded-xl
                    bg-slate-900/50 border border-white/[0.05]
                    text-slate-300 placeholder:text-slate-500
                    transition-all duration-300
                    hover:border-white/[0.1] focus:border-sky-500/50
                    focus:ring-1 focus:ring-sky-500/20
                    text-sm font-light
                  `}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webhookConfig.enabled}
                    onChange={(e) => setWebhookConfig({ ...webhookConfig, enabled: e.target.checked })}
                    className="rounded border-white/[0.05] bg-slate-900/50 text-sky-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm font-light text-slate-300">
                    Webhook ativo
                  </span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-light text-slate-400">
                  Eventos
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookConfig.events.includes('MESSAGES_UPSERT')}
                      onChange={(e) => {
                        const events = e.target.checked
                          ? [...webhookConfig.events, 'MESSAGES_UPSERT']
                          : webhookConfig.events.filter(event => event !== 'MESSAGES_UPSERT')
                        setWebhookConfig({ ...webhookConfig, events })
                      }}
                      className="rounded border-white/[0.05] bg-slate-900/50 text-sky-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm font-light text-slate-300">
                      Mensagens
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookConfig.events.includes('STATUS_INSTANCE')}
                      onChange={(e) => {
                        const events = e.target.checked
                          ? [...webhookConfig.events, 'STATUS_INSTANCE']
                          : webhookConfig.events.filter(event => event !== 'STATUS_INSTANCE')
                        setWebhookConfig({ ...webhookConfig, events })
                      }}
                      className="rounded border-white/[0.05] bg-slate-900/50 text-sky-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm font-light text-slate-300">
                      Status da Instância
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notificações e Sistema */}
        <div className="space-y-6">
          {/* Notificações */}
          <div className="bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-500/10 p-2 rounded-lg">
                <FiBell className="h-5 w-5 text-yellow-400" />
              </div>
              <h2 className="text-lg font-light text-white/90">
                Notificações
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-light text-slate-400">
                  Canais
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationConfig.email}
                      onChange={(e) => setNotificationConfig({ ...notificationConfig, email: e.target.checked })}
                      className="rounded border-white/[0.05] bg-slate-900/50 text-yellow-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm font-light text-slate-300">
                      Email
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationConfig.whatsapp}
                      onChange={(e) => setNotificationConfig({ ...notificationConfig, whatsapp: e.target.checked })}
                      className="rounded border-white/[0.05] bg-slate-900/50 text-yellow-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm font-light text-slate-300">
                      WhatsApp
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationConfig.system}
                      onChange={(e) => setNotificationConfig({ ...notificationConfig, system: e.target.checked })}
                      className="rounded border-white/[0.05] bg-slate-900/50 text-yellow-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm font-light text-slate-300">
                      Sistema
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-light text-slate-400">
                  Alertas
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationConfig.errorAlerts}
                      onChange={(e) => setNotificationConfig({ ...notificationConfig, errorAlerts: e.target.checked })}
                      className="rounded border-white/[0.05] bg-slate-900/50 text-yellow-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm font-light text-slate-300">
                      Erros e Falhas
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationConfig.successAlerts}
                      onChange={(e) => setNotificationConfig({ ...notificationConfig, successAlerts: e.target.checked })}
                      className="rounded border-white/[0.05] bg-slate-900/50 text-yellow-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm font-light text-slate-300">
                      Sucessos e Confirmações
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sistema */}
          <div className="bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-500/10 p-2 rounded-lg">
                <FiGlobe className="h-5 w-5 text-green-400" />
              </div>
              <h2 className="text-lg font-light text-white/90">
                Sistema
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-light text-slate-400 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={systemConfig.companyName}
                  onChange={(e) => setSystemConfig({ ...systemConfig, companyName: e.target.value })}
                  className={`
                    w-full h-11 px-4 rounded-xl
                    bg-slate-900/50 border border-white/[0.05]
                    text-slate-300 placeholder:text-slate-500
                    transition-all duration-300
                    hover:border-white/[0.1] focus:border-green-500/50
                    focus:ring-1 focus:ring-green-500/20
                    text-sm font-light
                  `}
                />
              </div>

              <div>
                <label className="block text-sm font-light text-slate-400 mb-2">
                  Fuso Horário
                </label>
                <select
                  value={systemConfig.timezone}
                  onChange={(e) => setSystemConfig({ ...systemConfig, timezone: e.target.value })}
                  className={`
                    w-full h-11 px-4 rounded-xl
                    bg-slate-900/50 border border-white/[0.05]
                    text-slate-300
                    transition-all duration-300
                    hover:border-white/[0.1] focus:border-green-500/50
                    focus:ring-1 focus:ring-green-500/20
                    text-sm font-light
                  `}
                >
                  <option value="America/Sao_Paulo">América/São Paulo</option>
                  <option value="America/Fortaleza">América/Fortaleza</option>
                  <option value="America/Manaus">América/Manaus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-light text-slate-400 mb-2">
                  Formato de Data
                </label>
                <select
                  value={systemConfig.dateFormat}
                  onChange={(e) => setSystemConfig({ ...systemConfig, dateFormat: e.target.value })}
                  className={`
                    w-full h-11 px-4 rounded-xl
                    bg-slate-900/50 border border-white/[0.05]
                    text-slate-300
                    transition-all duration-300
                    hover:border-white/[0.1] focus:border-green-500/50
                    focus:ring-1 focus:ring-green-500/20
                    text-sm font-light
                  `}
                >
                  <option value="dd/MM/yyyy">DD/MM/AAAA</option>
                  <option value="MM/dd/yyyy">MM/DD/AAAA</option>
                  <option value="yyyy-MM-dd">AAAA-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-light text-slate-400 mb-2">
                  Idioma
                </label>
                <select
                  value={systemConfig.language}
                  onChange={(e) => setSystemConfig({ ...systemConfig, language: e.target.value })}
                  className={`
                    w-full h-11 px-4 rounded-xl
                    bg-slate-900/50 border border-white/[0.05]
                    text-slate-300
                    transition-all duration-300
                    hover:border-white/[0.1] focus:border-green-500/50
                    focus:ring-1 focus:ring-green-500/20
                    text-sm font-light
                  `}
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
