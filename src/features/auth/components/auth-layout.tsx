import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efeitos de Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent-primary)_0%,_transparent_50%)] blur-3xl opacity-20" />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px]">
          <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,_var(--accent-secondary)_0deg,_var(--accent-primary)_180deg,_transparent_360deg)] blur-3xl opacity-20" />
        </div>
      </div>

      <div className="w-full max-w-[420px] opacity-0 animate-fade-in relative">
        <div className="absolute inset-0 bg-[var(--background-secondary)] rounded-3xl blur-2xl opacity-50" />
        <div className="w-full bg-[var(--background-secondary)]/95 backdrop-blur-xl rounded-3xl border border-[var(--border-light)] shadow-2xl overflow-hidden relative">
          <div className="p-8 relative">
            {/* Logo e Título com Gradiente */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center p-1 rounded-2xl mb-0">
                <img
                  src="/logo.png"
                  alt="ConsigIA Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <h1 className="text-4xl font-semibold text-white tracking-tight mb-2">
                ConsigIA
              </h1>
              <h2 className="text-lg text-[var(--text-secondary)] font-light">
                {title}
              </h2>
            </div>
            {children}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-[var(--text-tertiary)] font-light">
          © {new Date().getFullYear()} ConsigIA. Todos os direitos reservados.
        </div>
      </div>
    </div>
  )
}