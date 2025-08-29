import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  FiUsers,
  FiUserPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiGrid,
  FiList,
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiFilter
} from 'react-icons/fi'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { userService, type User } from '../services/user-service'
import { useHasPermission, PERMISSIONS } from '../../auth/components/role-guard'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const userSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial'),
  role: z.enum(['OWNER', 'SUPPORT'], {
    errorMap: () => ({ message: 'Selecione um perfil válido' })
  })
})

type UserFormData = z.infer<typeof userSchema>

export function TeamPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [sortField, setSortField] = useState<'name' | 'role' | 'createdAt'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'OWNER' | 'SUPPORT'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const canManageUsers = useHasPermission(PERMISSIONS.MANAGE_OWN_COMPANY)

  // Função para ordenar usuários
  const sortUsers = (a: User, b: User) => {
    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    }
    if (sortField === 'role') {
      return sortDirection === 'asc'
        ? a.role.localeCompare(b.role)
        : b.role.localeCompare(a.role)
    }
    // createdAt
    return sortDirection === 'asc'
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  }

  // Filtra e ordena usuários
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesRole && matchesSearch
    })
    .sort(sortUsers)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema)
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (editingUser) {
      reset(editingUser)
    } else {
      reset({ name: '', email: '', role: 'SUPPORT' })
    }
  }, [editingUser, reset])

  async function loadUsers() {
    try {
      setIsLoading(true)
      setError('')
      const data = await userService.fetchUsers()
      setUsers(data)
    } catch (error) {
      setError('Erro ao carregar usuários')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(data: UserFormData) {
    try {
      setError('')
      setSuccess('')

      if (editingUser) {
        await userService.updateUser(editingUser.id, data)
        setSuccess('Usuário atualizado com sucesso!')
      } else {
        await userService.createUser(data)
        setSuccess('Usuário criado com sucesso!')
      }

      setIsModalOpen(false)
      setEditingUser(null)
      loadUsers()
    } catch (error) {
      setError('Erro ao salvar usuário')
      console.error(error)
    }
  }

  async function handleDeleteUser(user: User) {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return

    try {
      setError('')
      await userService.deleteUser(user.id)
      setSuccess('Usuário removido com sucesso!')
      loadUsers()
    } catch (error) {
      setError('Erro ao remover usuário')
      console.error(error)
    }
  }

  function handleEditUser(user: User) {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  function handleAddUser() {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'Proprietário'
      case 'GESTOR':
        return 'Gestor'
      case 'SUPPORT':
        return 'Suporte'
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'text-purple-400 bg-purple-400/10'
      case 'GESTOR':
        return 'text-sky-400 bg-sky-400/10'
      case 'SUPPORT':
        return 'text-emerald-400 bg-emerald-400/10'
      default:
        return 'text-slate-400 bg-slate-400/10'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner className="h-8 w-8" />
          <span className="text-slate-400 font-light">Carregando equipe...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative bg-[var(--background-secondary)] rounded-2xl p-6 overflow-hidden backdrop-blur-sm border border-[var(--border-light)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)] opacity-5" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--gradient-secondary)] p-3 rounded-xl">
              <FiUsers className="h-6 w-6 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-white/90 mb-2">
                Equipe
              </h1>
              <p className="text-slate-400 font-light">
                Gerencie os membros da sua equipe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle de Visualização */}
            <div className="bg-slate-900/50 rounded-lg border border-white/[0.05] flex">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 h-11 rounded-lg flex items-center gap-2 transition-colors duration-300 ${viewMode === 'cards'
                  ? 'text-sky-400 bg-sky-400/10'
                  : 'text-slate-400 hover:text-slate-300'
                  }`}
              >
                <FiGrid className="h-5 w-5" />
                <span className="text-sm font-light">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 h-11 rounded-lg flex items-center gap-2 transition-colors duration-300 ${viewMode === 'list'
                  ? 'text-sky-400 bg-sky-400/10'
                  : 'text-slate-400 hover:text-slate-300'
                  }`}
              >
                <FiList className="h-5 w-5" />
                <span className="text-sm font-light">Lista</span>
              </button>
            </div>

            {canManageUsers && (
              <button
                onClick={handleAddUser}
                className="px-4 h-11 rounded-xl bg-[var(--gradient-primary)]
                  text-white font-light transition-all duration-300
                  hover:shadow-lg hover:shadow-[var(--accent-primary)]/20
                  focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-sm flex items-center gap-2"
              >
                <FiUserPlus className="h-5 w-5" />
                Adicionar Membro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mensagens */}
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

      {/* Filtros e Busca */}
      <div className="bg-[var(--background-secondary)] backdrop-blur-lg rounded-xl border border-[var(--border-light)] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                  text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] 
                  focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
              />
              <FiSearch className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Filtro por Perfil */}
          <div className="flex-shrink-0">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="h-11 px-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                text-[var(--text-primary)] focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
            >
              <option value="ALL">Todos os Perfis</option>
              <option value="OWNER">Proprietários</option>

              <option value="SUPPORT">Suporte</option>
            </select>
          </div>

          {/* Ordenação */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as typeof sortField)}
              className="h-11 px-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border-light)]
                text-[var(--text-primary)] focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
            >
              <option value="name">Nome</option>
              <option value="role">Perfil</option>
              <option value="createdAt">Data de Criação</option>
            </select>

            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="h-11 w-11 rounded-lg bg-slate-900/30 border border-white/[0.05]
                text-slate-400 hover:text-slate-300 flex items-center justify-center"
            >
              {sortDirection === 'asc' ? (
                <FiChevronUp className="h-5 w-5" />
              ) : (
                <FiChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <FiUsers className="h-4 w-4" />
            <span>Total: {filteredAndSortedUsers.length}</span>
          </div>
          {roleFilter === 'ALL' && (
            <>
              <div className="w-px h-4 bg-white/[0.05]" />
              <div className="text-purple-400">{users.filter(u => u.role === 'OWNER').length} Proprietários</div>

              <div className="text-emerald-400">{users.filter(u => u.role === 'SUPPORT').length} Suporte</div>
            </>
          )}
        </div>
      </div>

      {/* Lista de Usuários */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-xl border border-[var(--border-light)] p-5
                hover:border-[var(--border-medium)] transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-light text-white/90 mb-1">
                    {user.name}
                  </h3>
                  <p className="text-sm font-light text-slate-400">
                    {user.email}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {getRoleName(user.role)}
                </span>
              </div>

              <div className="text-sm text-slate-400 mb-4">
                Criado em {format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>

              {canManageUsers && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="flex-1 h-9 rounded-lg text-sm font-light
                      bg-[var(--background-tertiary)]/50 text-[var(--text-secondary)] 
                      hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]
                      group-hover:border-[var(--border-medium)]
                      transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    Editar
                  </button>

                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="w-9 h-9 rounded-lg text-sm font-light
                    bg-[var(--status-error)]/10 text-[var(--status-error)] hover:bg-[var(--status-error)]/20
                      transition-colors duration-300 flex items-center justify-center"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--background-secondary)]/95 backdrop-blur-lg rounded-xl border border-[var(--border-light)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left p-4 text-sm font-medium text-slate-300">Nome</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">E-mail</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Perfil</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Data de Criação</th>
                {canManageUsers && (
                  <th className="text-right p-4 text-sm font-medium text-slate-300">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[var(--border-light)] hover:bg-[var(--background-tertiary)]/50 transition-colors duration-200"
                >
                  <td className="p-4">
                    <div className="text-white/90 font-light">{user.name}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-400 font-light">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-400 font-light">
                      {format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </td>
                  {canManageUsers && (
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="h-8 px-3 rounded-lg text-sm font-light
                            bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-slate-200
                            transition-colors duration-300 flex items-center gap-2"
                        >
                          <FiEdit2 className="h-4 w-4" />
                          Editar
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="w-8 h-8 rounded-lg text-sm font-light
                            bg-red-500/10 text-red-400 hover:bg-red-500/20
                            transition-colors duration-300 flex items-center justify-center"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Edição/Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--background-secondary)] rounded-2xl p-6 w-full max-w-md border border-[var(--border-light)] relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            >
              <FiX className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-light text-white/90 mb-6">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className="w-full rounded-lg bg-[var(--background-tertiary)] border-[var(--border-light)] text-[var(--text-primary)]"
                />
                {errors.name && (
                  <span className="text-sm text-red-400">{errors.name.message}</span>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className="w-full rounded-lg bg-[var(--background-tertiary)] border-[var(--border-light)] text-[var(--text-primary)]"
                />
                {errors.email && (
                  <span className="text-sm text-red-400">{errors.email.message}</span>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  {...register('password')}
                  className="w-full rounded-lg bg-[var(--background-tertiary)] border-[var(--border-light)] text-[var(--text-primary)]"
                />
                {errors.password && (
                  <span className="text-sm text-red-400">{errors.password.message}</span>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  A senha deve conter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas,
                  números e caracteres especiais.
                </p>
              </div>

              <div className="space-y-1">
                <label htmlFor="role" className="block text-sm font-medium text-slate-300">
                  Perfil
                </label>
                <select
                  id="role"
                  {...register('role')}
                  className="w-full rounded-lg bg-[var(--background-tertiary)] border-[var(--border-light)] text-[var(--text-primary)]"
                >
                  <option value="SUPPORT">Suporte</option>
                  <option value="OWNER">Proprietário</option>
                </select>
                {errors.role && (
                  <span className="text-sm text-red-400">{errors.role.message}</span>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 h-10 rounded-lg bg-slate-800 text-slate-300 text-sm font-light
                    hover:bg-slate-700 transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 h-10 rounded-lg bg-sky-500 text-white text-sm font-light
                    hover:bg-sky-400 transition-colors duration-300 disabled:opacity-50
                    disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner className="h-4 w-4" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
