import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiBriefcase, FiSave } from 'react-icons/fi'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { companyService, type Company } from '../services/company-service'
import { useHasPermission, PERMISSIONS } from '../../auth/components/role-guard'

const companySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  tradingName: z.string().min(1, 'Nome fantasia é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  zipCode: z.string().min(8, 'CEP inválido'),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado inválido'),
  website: z.string().url('Website inválido').optional().or(z.literal('')),
  description: z.string().optional().nullable(),
  contactName: z.string().min(1, 'Nome do contato é obrigatório'),
  contactEmail: z.string().email('E-mail do contato inválido'),
  contactPhone: z.string().min(10, 'Telefone do contato inválido'),
})

type CompanyFormData = z.infer<typeof companySchema>

export function CompanyPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [company, setCompany] = useState<Company | null>(null)
  const canEdit = useHasPermission(PERMISSIONS.MANAGE_OWN_COMPANY)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema)
  })

  useEffect(() => {
    loadCompany()
  }, [])

  async function loadCompany() {
    try {
      setIsLoading(true)
      setError('')
      const data = await companyService.fetchCompany()
      setCompany(data)
      reset(data)
    } catch (error) {
      setError('Erro ao carregar dados da empresa')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(data: CompanyFormData) {
    if (!company) return

    try {
      setError('')
      setSuccess('')
      await companyService.updateCompany(company.id, data)
      setSuccess('Dados atualizados com sucesso!')
      loadCompany() // Recarrega os dados para ter certeza que estão atualizados
    } catch (error) {
      setError('Erro ao atualizar dados da empresa')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner className="h-8 w-8" />
          <span className="text-slate-400 font-light">Carregando dados da empresa...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative bg-slate-900/50 rounded-2xl p-6 overflow-hidden backdrop-blur-sm border border-white/[0.05]">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-purple-500/5 to-sky-500/5" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-gradient-to-br from-sky-500/10 to-purple-400/10 p-3 rounded-xl">
            <FiBriefcase className="h-6 w-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-light text-white/90 mb-2">
              Dados da Empresa
            </h1>
            <p className="text-slate-400 font-light">
              {canEdit
                ? 'Gerencie as informações da sua empresa'
                : 'Visualize as informações da empresa'}
            </p>
          </div>
        </div>
      </div>

      {/* Mensagens de Feedback */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg">
          {success}
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h2 className="text-lg font-light text-white/90">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                Razão Social
              </label>
              <input
                type="text"
                id="name"
                disabled={!canEdit}
                {...register('name')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.name && (
                <span className="text-sm text-red-400">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="tradingName" className="block text-sm font-medium text-slate-300">
                Nome Fantasia
              </label>
              <input
                type="text"
                id="tradingName"
                disabled={!canEdit}
                {...register('tradingName')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.tradingName && (
                <span className="text-sm text-red-400">{errors.tradingName.message}</span>
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
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.cnpj && (
                <span className="text-sm text-red-400">{errors.cnpj.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="website" className="block text-sm font-medium text-slate-300">
                Website
              </label>
              <input
                type="url"
                id="website"
                disabled={!canEdit}
                {...register('website')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.website && (
                <span className="text-sm text-red-400">{errors.website.message}</span>
              )}
            </div>

            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-300">
                Descrição
              </label>
              <textarea
                id="description"
                disabled={!canEdit}
                {...register('description')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60 h-24"
              />
              {errors.description && (
                <span className="text-sm text-red-400">{errors.description.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="space-y-4">
          <h2 className="text-lg font-light text-white/90">Contato</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                disabled={!canEdit}
                {...register('email')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
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
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.phone && (
                <span className="text-sm text-red-400">{errors.phone.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-300">
                WhatsApp
              </label>
              <input
                type="text"
                id="whatsapp"
                disabled={!canEdit}
                {...register('whatsapp')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.whatsapp && (
                <span className="text-sm text-red-400">{errors.whatsapp.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-4">
          <h2 className="text-lg font-light text-white/90">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label htmlFor="zipCode" className="block text-sm font-medium text-slate-300">
                CEP
              </label>
              <input
                type="text"
                id="zipCode"
                disabled={!canEdit}
                {...register('zipCode')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.zipCode && (
                <span className="text-sm text-red-400">{errors.zipCode.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="street" className="block text-sm font-medium text-slate-300">
                Rua
              </label>
              <input
                type="text"
                id="street"
                disabled={!canEdit}
                {...register('street')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.street && (
                <span className="text-sm text-red-400">{errors.street.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="number" className="block text-sm font-medium text-slate-300">
                Número
              </label>
              <input
                type="text"
                id="number"
                disabled={!canEdit}
                {...register('number')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.number && (
                <span className="text-sm text-red-400">{errors.number.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="complement" className="block text-sm font-medium text-slate-300">
                Complemento
              </label>
              <input
                type="text"
                id="complement"
                disabled={!canEdit}
                {...register('complement')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.complement && (
                <span className="text-sm text-red-400">{errors.complement.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="neighborhood" className="block text-sm font-medium text-slate-300">
                Bairro
              </label>
              <input
                type="text"
                id="neighborhood"
                disabled={!canEdit}
                {...register('neighborhood')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.neighborhood && (
                <span className="text-sm text-red-400">{errors.neighborhood.message}</span>
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
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
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
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.state && (
                <span className="text-sm text-red-400">{errors.state.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Contato Principal */}
        <div className="space-y-4">
          <h2 className="text-lg font-light text-white/90">Contato Principal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label htmlFor="contactName" className="block text-sm font-medium text-slate-300">
                Nome
              </label>
              <input
                type="text"
                id="contactName"
                disabled={!canEdit}
                {...register('contactName')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.contactName && (
                <span className="text-sm text-red-400">{errors.contactName.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-300">
                E-mail
              </label>
              <input
                type="email"
                id="contactEmail"
                disabled={!canEdit}
                {...register('contactEmail')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.contactEmail && (
                <span className="text-sm text-red-400">{errors.contactEmail.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-300">
                Telefone
              </label>
              <input
                type="text"
                id="contactPhone"
                disabled={!canEdit}
                {...register('contactPhone')}
                className="w-full rounded-lg bg-slate-900/30 border-slate-800 text-slate-100 disabled:opacity-60"
              />
              {errors.contactPhone && (
                <span className="text-sm text-red-400">{errors.contactPhone.message}</span>
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                px-4 py-2 rounded-lg
                bg-gradient-to-r from-sky-500 to-sky-400
                text-white font-light
                transition-all duration-300
                hover:shadow-lg hover:shadow-sky-500/20
                hover:from-sky-400 hover:to-sky-500
                focus:ring-2 focus:ring-sky-500/20
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2
              `}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
