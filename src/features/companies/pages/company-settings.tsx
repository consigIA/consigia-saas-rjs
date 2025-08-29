import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHasPermission, PERMISSIONS } from '../../auth/components/role-guard'
import { companyService } from '../services/company-service'
import type { Company, UpdateCompanyData } from '../types'

const companySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado inválido'),
  zip_code: z.string().min(8, 'CEP inválido'),
})

export function CompanySettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const canEdit = useHasPermission(PERMISSIONS.MANAGE_OWN_COMPANY)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCompanyData>({
    resolver: zodResolver(companySchema),
  })

  useEffect(() => {
    loadCompanyData()
  }, [])

  async function loadCompanyData() {
    try {
      setIsLoading(true)
      setError('')
      const company = await companyService.getCompany()
      reset(company) // Preenche o formulário com os dados
    } catch (error) {
      setError('Erro ao carregar dados da empresa')
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(data: UpdateCompanyData) {
    try {
      setError('')
      setSuccess('')
      const company = await companyService.getCompany() // Busca para ter o ID atual
      await companyService.updateCompany(company.id, data)
      setSuccess('Dados atualizados com sucesso!')
    } catch (error) {
      setError('Erro ao atualizar dados da empresa')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Configurações da Empresa</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">
              Nome da Empresa
            </label>
            <input
              type="text"
              id="name"
              disabled={!canEdit}
              {...register('name')}
              className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100"
            />
            {errors.name && (
              <span className="text-sm text-red-400">{errors.name.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="cnpj" className="block text-sm font-medium text-slate-300">
              CNPJ
            </label>
            <input
              type="text"
              id="cnpj"
              disabled={!canEdit}
              {...register('cnpj')}
              className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100"
            />
            {errors.cnpj && (
              <span className="text-sm text-red-400">{errors.cnpj.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              disabled={!canEdit}
              {...register('email')}
              className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100"
            />
            {errors.email && (
              <span className="text-sm text-red-400">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
              Telefone
            </label>
            <input
              type="text"
              id="phone"
              disabled={!canEdit}
              {...register('phone')}
              className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100"
            />
            {errors.phone && (
              <span className="text-sm text-red-400">{errors.phone.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="address" className="block text-sm font-medium text-slate-300">
              Endereço
            </label>
            <input
              type="text"
              id="address"
              disabled={!canEdit}
              {...register('address')}
              className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100"
            />
            {errors.address && (
              <span className="text-sm text-red-400">{errors.address.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="city" className="block text-sm font-medium text-slate-300">
              Cidade
            </label>
            <input
              type="text"
              id="city"
              disabled={!canEdit}
              {...register('city')}
              className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100"
            />
            {errors.city && (
              <span className="text-sm text-red-400">{errors.city.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="state" className="block text-sm font-medium text-slate-300">
              Estado
            </label>
            <input
              type="text"
              id="state"
              disabled={!canEdit}
              {...register('state')}
              className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100"
            />
            {errors.state && (
              <span className="text-sm text-red-400">{errors.state.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="zip_code" className="block text-sm font-medium text-slate-300">
              CEP
            </label>
            <input
              type="text"
              id="zip_code"
              disabled={!canEdit}
              {...register('zip_code')}
              className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100"
            />
            {errors.zip_code && (
              <span className="text-sm text-red-400">{errors.zip_code.message}</span>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
