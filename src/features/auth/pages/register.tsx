import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiMail, FiLock, FiUser, FiBriefcase } from 'react-icons/fi'
import { registerSchema } from '../schemas/auth-schema'
import { AuthLayout } from '../components/auth-layout'
import type { RegisterData } from '../types'

export function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData & { passwordConfirmation: string }>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterData) => {
    try {
      setIsSubmitting(true)
      // TODO: Implementar chamada à API
      console.log(data)

      // Toast será implementado depois
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Crie sua conta">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Nome
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              id="name"
              placeholder="Seu nome completo"
              {...register('name')}
              className={`
                block w-full pl-10 h-12 rounded-md
                bg-gray-700 border-gray-600 text-white
                placeholder:text-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.name ? 'border-red-500' : 'border-gray-600'}
              `}
            />
          </div>
          {errors.name && (
            <span className="text-sm text-red-400">{errors.name.message}</span>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            E-mail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="email"
              id="email"
              placeholder="Seu melhor e-mail"
              {...register('email')}
              className={`
                block w-full pl-10 h-12 rounded-md
                bg-gray-700 border-gray-600 text-white
                placeholder:text-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.email ? 'border-red-500' : 'border-gray-600'}
              `}
            />
          </div>
          {errors.email && (
            <span className="text-sm text-red-400">{errors.email.message}</span>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="company" className="block text-sm font-medium text-gray-300">
            Empresa
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiBriefcase className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              id="company"
              placeholder="Nome da sua empresa"
              {...register('company')}
              className={`
                block w-full pl-10 h-12 rounded-md
                bg-gray-700 border-gray-600 text-white
                placeholder:text-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.company ? 'border-red-500' : 'border-gray-600'}
              `}
            />
          </div>
          {errors.company && (
            <span className="text-sm text-red-400">{errors.company.message}</span>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="password"
              id="password"
              placeholder="Sua senha"
              {...register('password')}
              className={`
                block w-full pl-10 h-12 rounded-md
                bg-gray-700 border-gray-600 text-white
                placeholder:text-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.password ? 'border-red-500' : 'border-gray-600'}
              `}
            />
          </div>
          {errors.password && (
            <span className="text-sm text-red-400">{errors.password.message}</span>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-300">
            Confirmar Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="password"
              id="passwordConfirmation"
              placeholder="Confirme sua senha"
              {...register('passwordConfirmation')}
              className={`
                block w-full pl-10 h-12 rounded-md
                bg-gray-700 border-gray-600 text-white
                placeholder:text-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.passwordConfirmation ? 'border-red-500' : 'border-gray-600'}
              `}
            />
          </div>
          {errors.passwordConfirmation && (
            <span className="text-sm text-red-400">{errors.passwordConfirmation.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            w-full h-12 mt-2 rounded-md
            bg-blue-600 text-white font-medium
            hover:bg-blue-700 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
          `}
        >
          {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
        </button>

        <p className="text-center text-gray-400 text-sm">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
          >
            Faça login
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}