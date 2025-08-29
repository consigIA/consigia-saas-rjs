import { useEffect, useState } from 'react'

export function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      setIsMobile(mobile)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  if (!isMobile) return null

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6 z-50">
      <div className="max-w-md w-full bg-slate-900/30 backdrop-blur-lg p-8 rounded-2xl
        border border-white/[0.05] shadow-xl text-center animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-light text-white/90 mb-4">
            Acesso Indisponível
          </h1>
          <p className="text-slate-400 font-light leading-relaxed">
            O ConsigIA é otimizado para desktops e notebooks. Para uma melhor experiência,
            acesse nossa plataforma através de um computador.
          </p>
        </div>

        <div className="p-4 bg-slate-800/30 rounded-xl">
          <p className="text-sm text-slate-400 font-light">
            Caso precise de ajuda, entre em contato com nosso suporte:
            <br />
            <a
              href="mailto:suporte@consigia.com.br"
              className="text-sky-400/90 hover:text-sky-300 transition-colors duration-500 mt-2 inline-block"
            >
              suporte@consigia.com.br
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
