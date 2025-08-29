import { useState, useEffect, useRef, useCallback } from 'react'
import { FiX, FiLoader } from 'react-icons/fi'
import { evolutionApiService } from '../services/evolution-api'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  instanceName: string
  onSuccess?: () => void
}

interface QRCodeData {
  base64: string
  code: string
}

export function QRCodeModal({ isOpen, onClose, instanceName, onSuccess }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef<number>()
  const mountedRef = useRef(false)
  const lastStatusRef = useRef<string>('')

  const checkInstanceStatus = useCallback(async () => {
    if (!instanceName || !mountedRef.current) return

    try {
      const instances = await evolutionApiService.fetchInstances()
      const currentInstance = instances.find(i => i.name === instanceName)

      if (currentInstance && mountedRef.current) {
        if (lastStatusRef.current === 'connecting' && currentInstance.connectionStatus === 'open') {
          if (onSuccess) onSuccess()
          onClose()
          return true
        }

        lastStatusRef.current = currentInstance.connectionStatus
      }

      return false
    } catch (error) {
      console.error('Erro ao verificar status:', error)
      return false
    }
  }, [instanceName, onSuccess, onClose])

  const fetchQRCode = useCallback(async () => {
    if (!instanceName || !mountedRef.current) return

    try {
      setIsLoading(true)

      const isConnected = await checkInstanceStatus()
      if (isConnected || !mountedRef.current) return

      const data = await evolutionApiService.connectInstance(instanceName)

      if (mountedRef.current) {
        if (data.base64 && data.code) {
          setQrCode({
            base64: data.base64,
            code: data.code
          })
          setError('')
        }
      }
    } catch (error) {
      if (mountedRef.current) {
        console.error('Erro ao buscar QR Code:', error)
        setError('Erro ao gerar QR Code. Tente novamente.')
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [instanceName, checkInstanceStatus])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setQrCode(null)
      setError('')
      setIsLoading(false)
      lastStatusRef.current = ''
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    fetchQRCode()
    intervalRef.current = setInterval(fetchQRCode, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isOpen, fetchQRCode])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--background-secondary)] rounded-2xl w-full max-w-md p-6 relative overflow-hidden">
        {/* Gradiente de fundo sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 via-transparent to-[var(--accent-secondary)]/5" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-300 transition-colors z-10"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-xl font-light text-white/90 mb-2">
            Conectar WhatsApp
          </h2>
          <p className="text-sm font-light text-slate-400">
            Escaneie o QR Code com seu WhatsApp para conectar
          </p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[320px] relative z-10">
          {error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg w-full">
              <p className="text-red-400 text-sm font-light text-center">
                {error}
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <FiLoader className="h-8 w-8 text-sky-400 animate-spin" />
                <div className="absolute inset-0 animate-pulse-slow blur-xl bg-sky-400/20 rounded-full" />
              </div>
              <p className="text-sm text-slate-400 font-light">
                Gerando QR Code...
              </p>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center gap-6">
              {/* Container do QR Code com efeitos */}
              <div className="relative group">
                {/* Borda com gradiente animado */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)] rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 animate-gradient" />

                {/* Container do QR Code com fundo escuro */}
                <div className="relative bg-[var(--background-tertiary)] p-4 rounded-lg shadow-xl">
                  <div className="bg-[var(--background-tertiary)] p-3 rounded-md flex items-center justify-center">
                    <div className="bg-white rounded">
                      <img
                        src={qrCode.base64}
                        alt="QR Code"
                        className="w-64 h-64 grayscale contrast-[200%]"
                        data-code={qrCode.code}
                      />
                    </div>
                  </div>
                </div>

                {/* Brilho nos cantos */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-primary)]/0 via-[var(--accent-primary)]/10 to-[var(--accent-primary)]/0 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
              </div>

              {/* Status com animação de pulso */}
              <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full">
                <div className="relative flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                  <div className="absolute w-2 h-2 rounded-full bg-white/60 animate-ping opacity-75" />
                </div>
                <span className="text-sm text-slate-300 font-light">
                  Aguardando leitura...
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <FiLoader className="h-8 w-8 text-sky-400 animate-spin" />
                <div className="absolute inset-0 animate-pulse-slow blur-xl bg-sky-400/20 rounded-full" />
              </div>
              <p className="text-sm text-slate-400 font-light">
                Iniciando conexão...
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.05] relative z-10">
          <button
            onClick={onClose}
            className={`
              w-full h-11 rounded-xl
              bg-slate-800/50 text-slate-300
              transition-all duration-200
              hover:bg-slate-800 hover:text-slate-200
              focus:ring-1 focus:ring-slate-700
              text-sm font-light
              backdrop-blur-sm
            `}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}