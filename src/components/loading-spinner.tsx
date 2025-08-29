interface LoadingSpinnerProps {
  className?: string
}

export function LoadingSpinner({ className = "h-5 w-5" }: LoadingSpinnerProps) {
  return (
    <div className={`${className} relative`}>
      {/* Círculo externo */}
      <div className="absolute inset-0 border-2 border-t-transparent border-slate-600/20 rounded-full animate-spin-slow" />

      {/* Círculo interno com gradiente */}
      <div className="absolute inset-0 border-2 border-t-sky-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow" />
    </div>
  )
}

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className = "" }: LoadingDotsProps) {
  return (
    <div className={`loading-dots ${className}`}>
      <span />
      <span />
      <span />
    </div>
  )
}
