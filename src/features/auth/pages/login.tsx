import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { loginSchema } from '../schemas/auth-schema'
import { AuthLayout } from '../components/auth-layout'
import { useAuthStore } from '../stores/auth-store'
import { authService } from '../services/auth-service'
import type { LoginData } from '../types'

export function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    try {
      setIsSubmitting(true)
      setError('')

      const response = await authService.login(data)
      setAuth(response.token, response.user)
      navigate('/dashboard')
    } catch (error) {
      setError('E-mail ou senha incorretos')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Acesse sua conta">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-[var(--status-error)]/10 border border-[var(--status-error)]/20 rounded-2xl backdrop-blur-sm">
            <p className="text-[var(--status-error)] text-sm font-medium text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z" fill="currentColor" />
              </svg>
              {error}
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-light text-[var(--text-secondary)]">
            E-mail
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-[var(--text-tertiary)] transition-colors duration-500" />
            </div>
            <input
              type="email"
              id="email"
              autoComplete="off"
              placeholder="Seu e-mail"
              {...register('email')}
              className={`
                block w-full pl-10 rounded-2xl
                bg-[var(--background-tertiary)]/50 border border-[var(--border-light)]
                text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
                transition-all duration-300 ease-out
                focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)]
                hover:bg-[var(--background-tertiary)] hover:border-[var(--border-medium)]
                h-12 text-sm font-light
                ${errors.email ? 'border-red-500/50' : 'border-slate-800'}
              `}
            />
          </div>
          {errors.email && (
            <span className="text-sm text-red-400/90 font-light">{errors.email.message}</span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-light text-[var(--text-secondary)]">
              Senha
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-light text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors duration-500"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="h-5 w-5 text-[var(--text-tertiary)] transition-colors duration-500" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              placeholder="Sua senha"
              {...register('password')}
              className={`
                block w-full pl-10 pr-12 rounded-2xl
                bg-[var(--background-tertiary)]/50 border border-[var(--border-light)]
                text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
                transition-all duration-300 ease-out
                focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)]
                hover:bg-[var(--background-tertiary)] hover:border-[var(--border-medium)]
                h-12 text-sm font-light
                ${errors.password ? 'border-red-500/50' : 'border-slate-800'}
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors duration-300"
            >
              {showPassword ? (
                <FiEyeOff className="h-5 w-5" />
              ) : (
                <FiEye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-sm text-red-400/90 font-light">{errors.password.message}</span>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            className="rounded-lg border-[var(--border-light)] bg-[var(--background-tertiary)]/50 text-[var(--accent-primary)] 
            focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] focus:ring-offset-0
            hover:bg-[var(--background-tertiary)] hover:border-[var(--border-medium)]
            transition-all duration-300"
          />
          <label htmlFor="remember" className="ml-2 text-sm font-light text-[var(--text-secondary)]">
            Lembrar-me
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            relative w-full rounded-2xl
            bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
            text-white font-medium
            transition-all duration-300 ease-out
            hover:shadow-lg hover:shadow-[var(--accent-primary)]/20
            focus:ring-2 focus:ring-[var(--accent-primary)]/30
            disabled:opacity-50 disabled:cursor-not-allowed
            h-12 text-sm tracking-wide
            before:absolute before:inset-0 before:rounded-2xl
            before:bg-gradient-to-r before:from-[var(--accent-secondary)] before:to-[var(--accent-primary)]
            before:opacity-0 before:transition-opacity before:duration-300
            hover:before:opacity-100
            [&>span]:relative [&>span]:z-10
          `}
        >
          <span>{isSubmitting ? 'Entrando...' : 'Entrar'}</span>
        </button>


      </form>
    </AuthLayout>
  )
}