import { useState } from 'react'
import { FiX, FiLoader } from 'react-icons/fi'
import { evolutionApiService } from '../services/evolution-api'

interface CreateInstanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateInstanceModal({ isOpen, onClose, onSuccess }: CreateInstanceModalProps) {
  const [instanceName, setInstanceName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const payload = evolutionApiService.getDefaultInstancePayload(instanceName)
      await evolutionApiService.createInstance(payload)
      onSuccess()
      onClose()
    } catch (error) {
      setError('Erro ao criar instância. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-300 transition-colors"
        >
          <FiX className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-light text-white/90 mb-6">
          Nova Conexão WhatsApp
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm font-light text-center">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="instanceName" className="block text-sm font-light text-slate-300">
              Nome da Instância
            </label>
            <select
              id="instanceName"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              className={`
                block w-full px-4 rounded-xl
                bg-[var(--background-tertiary)]/50 border border-[var(--border-light)]
                text-[var(--text-primary)]
                transition-all duration-300 ease-out
                focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)]
                hover:bg-[var(--background-tertiary)] hover:border-[var(--border-medium)]
                h-12 text-sm font-light
              `}
            >
              <option value="">Selecione uma instância</option>
              <option value="bot_fgts_facta">FGTS Facta</option>
              <option value="bot_fgts_v8">FGTS V8</option>
              <option value="bot_fgts_hub">FGTS Hub</option>
              <option value="bot_fgts_parana">FGTS Paraná</option>
            </select>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className={`
                flex-1 h-11 rounded-xl
                bg-slate-800/50 text-slate-300
                transition-all duration-200
                hover:bg-slate-800 hover:text-slate-200
                focus:ring-1 focus:ring-slate-700
                text-sm font-light
              `}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !instanceName}
              className={`
                flex-1 h-11 rounded-xl
                bg-sky-500/10 text-sky-400
                transition-all duration-200
                hover:bg-sky-500/20
                focus:ring-1 focus:ring-sky-400/30
                disabled:opacity-50 disabled:cursor-not-allowed
                text-sm font-light
                flex items-center justify-center gap-2
              `}
            >
              {isLoading ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Conexão'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
