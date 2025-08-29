import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  FiUsers,
  FiUserPlus,
  FiEdit2,
  FiTrash2,
  FiAlertCircle,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi'
import { useTeamStore } from '../stores/team-store'
import { TeamMemberModal } from '../components/team-member-modal'
import type { TeamMember } from '../types'
import { LoadingSpinner } from '../../../components/loading-spinner'

import { roleLabels } from '../constants/permissions'

const statusColors = {
  active: 'text-green-400',
  inactive: 'text-red-400',
  pending: 'text-yellow-400'
}

const StatusIcon = {
  active: FiCheckCircle,
  inactive: FiAlertCircle,
  pending: FiClock
}

export function TeamPage(): JSX.Element {
  const {
    members,
    isLoading,

    selectedMember,
    fetchMembers,
    selectMember,
    createMember,
    updateMember,
    deleteMember
  } = useTeamStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleOpenModal = (member?: TeamMember) => {
    if (member) {
      selectMember(member)
    } else {
      selectMember(null)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    selectMember(null)
  }

  const handleSubmit = async (data: Parameters<typeof createMember>[0]) => {
    try {
      if (selectedMember) {
        await updateMember(selectedMember.id, data)
      } else {
        await createMember(data)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Erro ao salvar membro:', error)
    }
  }

  const handleDelete = async (member: TeamMember) => {
    if (!window.confirm(`Deseja realmente excluir o membro "${member.name}"?`)) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteMember(member.id)
    } catch (error) {
      console.error('Erro ao excluir membro:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading && !members.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] gap-4">
        <LoadingSpinner className="h-8 w-8" />
        <span className="text-lg font-light text-slate-400">
          Carregando membros...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative bg-slate-900/50 rounded-2xl p-6 overflow-hidden backdrop-blur-sm border border-white/[0.05]">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-purple-500/5 to-sky-500/5" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-sky-500/10 to-purple-400/10 p-3 rounded-xl">
              <FiUsers className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-white/90 mb-2">
                Gestão de Equipe
              </h1>
              <p className="text-slate-400 font-light">
                Gerencie os membros da sua equipe e suas permissões
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="group px-4 h-11 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-white font-light transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/20 hover:from-sky-400 hover:to-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
          >
            <FiUserPlus className="h-5 w-5" />
            Adicionar Membro
          </button>
        </div>
      </div>

      {/* Lista de Membros */}
      <div className="bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-white/[0.05] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left p-4 text-sm font-light text-slate-400">Nome</th>
                <th className="text-left p-4 text-sm font-light text-slate-400">Email</th>
                <th className="text-left p-4 text-sm font-light text-slate-400">Função</th>
                <th className="text-left p-4 text-sm font-light text-slate-400">Status</th>
                <th className="text-left p-4 text-sm font-light text-slate-400">Último Acesso</th>
                <th className="text-left p-4 text-sm font-light text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => {
                const StatusIconComponent = StatusIcon[member.status]

                return (
                  <tr
                    key={member.id}
                    className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-sky-500/10 flex items-center justify-center">
                            <span className="text-sky-400 text-sm">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-light text-slate-300">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-light text-slate-400">
                        {member.email}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-light text-slate-300">
                        {roleLabels[member.role]}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <StatusIconComponent className={`h-4 w-4 ${statusColors[member.status]}`} />
                        <span className="text-sm font-light text-slate-300">
                          {member.status === 'active' && 'Ativo'}
                          {member.status === 'inactive' && 'Inativo'}
                          {member.status === 'pending' && 'Pendente'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-light text-slate-400">
                        {member.lastAccess
                          ? format(member.lastAccess, "dd 'de' MMMM 'às' HH:mm", {
                            locale: ptBR
                          })
                          : 'Nunca acessou'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(member)}
                          className="p-2 rounded-lg bg-slate-900/50 border border-white/[0.05] text-slate-300 transition-all duration-300 hover:bg-slate-900/70 hover:border-white/[0.1] focus:ring-2 focus:ring-slate-500/20"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg bg-slate-900/50 border border-white/[0.05] text-red-400 transition-all duration-300 hover:bg-slate-900/70 hover:border-red-400/20 focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? (
                            <LoadingSpinner className="h-4 w-4" />
                          ) : (
                            <FiTrash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        member={selectedMember || undefined}
        isLoading={isLoading}
      />
    </div>
  )
}
