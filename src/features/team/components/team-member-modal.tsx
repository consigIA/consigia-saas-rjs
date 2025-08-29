import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { TeamMember, Role } from '../types'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { roleDescriptions, rolePermissions, roleLabels } from '../constants/permissions'

const teamMemberSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'manager', 'operator'], {
    required_error: 'Selecione uma função'
  }),
  phone: z.string().optional(),
  department: z.string().optional()
})

type TeamMemberFormData = z.infer<typeof teamMemberSchema>

interface TeamMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TeamMemberFormData) => Promise<void>
  member?: TeamMember
  isLoading?: boolean
}

export function TeamMemberModal({
  isOpen,
  onClose,
  onSubmit,
  member,
  isLoading
}: TeamMemberModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: member
      ? {
        name: member.name,
        email: member.email,
        role: member.role,
        phone: member.phone,
        department: member.department
      }
      : undefined
  })

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-slate-900/90 rounded-2xl border border-white/[0.05] p-6 w-full max-w-md">
        <h2 className="text-xl font-light text-white/90 mb-6">
          {member ? 'Editar Membro' : 'Novo Membro'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-light text-slate-400 mb-2">
              Nome
            </label>
            <input
              type="text"
              {...register('name')}
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
            {errors.name && (
              <span className="text-xs text-red-400 mt-1">
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-light text-slate-400 mb-2">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              disabled={!!member}
              className={`
                w-full h-11 px-4 rounded-xl
                bg-slate-900/50 border border-white/[0.05]
                text-slate-300 placeholder:text-slate-500
                transition-all duration-300
                hover:border-white/[0.1] focus:border-sky-500/50
                focus:ring-1 focus:ring-sky-500/20
                text-sm font-light
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />
            {errors.email && (
              <span className="text-xs text-red-400 mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-light text-slate-400 mb-2">
              Função
            </label>
            <select
              {...register('role')}
              className={`
                w-full h-11 px-4 rounded-xl
                bg-slate-900/50 border border-white/[0.05]
                text-slate-300
                transition-all duration-300
                hover:border-white/[0.1] focus:border-sky-500/50
                focus:ring-1 focus:ring-sky-500/20
                text-sm font-light
              `}
            >
              <option value="">Selecione uma função</option>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.role && (
              <span className="text-xs text-red-400 mt-1">
                {errors.role.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-light text-slate-400 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              {...register('phone')}
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
            <label className="block text-sm font-light text-slate-400 mb-2">
              Departamento
            </label>
            <input
              type="text"
              {...register('department')}
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

          {/* Permissões da função selecionada */}
          {watch('role') && (
            <div className="mt-6 p-4 rounded-xl bg-slate-900/30 border border-white/[0.05]">
              <h3 className="text-sm font-light text-slate-300 mb-2">
                {roleLabels[watch('role') as Role]}
              </h3>
              <p className="text-sm font-light text-slate-400 mb-4">
                {roleDescriptions[watch('role') as Role]}
              </p>
              <div className="space-y-2">
                <h4 className="text-sm font-light text-slate-300">Permissões:</h4>
                <ul className="space-y-1">
                  {rolePermissions[watch('role') as Role].map((permission) => (
                    <li key={permission} className="flex items-center gap-2 text-sm font-light text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`
                px-4 h-11 rounded-xl
                bg-slate-900/50 border border-white/[0.05]
                text-slate-300
                transition-all duration-300
                hover:bg-slate-900/70 hover:border-white/[0.1]
                focus:ring-2 focus:ring-slate-500/20
                disabled:opacity-50 disabled:cursor-not-allowed
                text-sm font-light
              `}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
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
              {isLoading ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
