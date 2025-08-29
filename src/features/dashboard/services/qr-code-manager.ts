import { evolutionApiService } from './evolution-api'

type QRCodeCallback = (qrCode: string | null, error?: string) => void

export class QRCodeManager {
  private intervalId: number | null = null
  private isActive = false
  private instanceName: string
  private callback: QRCodeCallback

  constructor(instanceName: string, callback: QRCodeCallback) {
    this.instanceName = instanceName
    this.callback = callback
  }

  async start() {
    if (this.isActive) return

    console.log('[QRCodeManager] Iniciando gerenciador')
    this.isActive = true

    // Primeira requisição
    await this.fetchQRCode()

    // Configura o intervalo
    this.intervalId = setInterval(() => {
      if (this.isActive) {
        this.fetchQRCode()
      }
    }, 30000)
  }

  stop() {
    console.log('[QRCodeManager] Parando gerenciador')
    this.isActive = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    this.callback(null)
  }

  private async fetchQRCode() {
    if (!this.isActive) return

    console.log('[QRCodeManager] Buscando QR Code')

    try {
      const data = await evolutionApiService.connectInstance(this.instanceName)

      if (this.isActive) {
        console.log('[QRCodeManager] QR Code recebido')
        this.callback(data.base64)
      }
    } catch (error) {
      console.error('[QRCodeManager] Erro:', error)
      if (this.isActive) {
        this.callback(null, 'Erro ao gerar QR Code. Tente novamente.')
      }
    }
  }
}
