import { create } from 'zustand'
import type { TeamMember } from '../types'
import { teamService } from '../services/team-service'

interface TeamStore {
  members: TeamMember[]
  isLoading: boolean
  error: string | null
  selectedMember: TeamMember | null
  fetchMembers: () => Promise<void>
  selectMember: (member: TeamMember | null) => void
  createMember: (data: Parameters<typeof teamService.createMember>[0]) => Promise<void>
  updateMember: (id: string, data: Parameters<typeof teamService.updateMember>[1]) => Promise<void>
  deleteMember: (id: string) => Promise<void>
}

export const useTeamStore = create<TeamStore>((set) => ({
  members: [],
  isLoading: false,
  error: null,
  selectedMember: null,

  fetchMembers: async () => {
    try {
      set({ isLoading: true, error: null })
      const members = await teamService.listMembers()
      set({ members, isLoading: false })
    } catch (error) {
      set({ error: 'Erro ao carregar membros da equipe', isLoading: false })
    }
  },

  selectMember: (member) => {
    set({ selectedMember: member })
  },

  createMember: async (data) => {
    try {
      set({ isLoading: true, error: null })
      const newMember = await teamService.createMember(data)
      set(state => ({
        members: [...state.members, newMember],
        isLoading: false
      }))
    } catch (error) {
      set({ error: 'Erro ao criar membro', isLoading: false })
    }
  },

  updateMember: async (id, data) => {
    try {
      set({ isLoading: true, error: null })
      const updatedMember = await teamService.updateMember(id, data)
      set(state => ({
        members: state.members.map(member =>
          member.id === id ? updatedMember : member
        ),
        isLoading: false,
        selectedMember: updatedMember
      }))
    } catch (error) {
      set({ error: 'Erro ao atualizar membro', isLoading: false })
    }
  },

  deleteMember: async (id) => {
    try {
      set({ isLoading: true, error: null })
      await teamService.deleteMember(id)
      set(state => ({
        members: state.members.filter(member => member.id !== id),
        isLoading: false,
        selectedMember: null
      }))
    } catch (error) {
      set({ error: 'Erro ao excluir membro', isLoading: false })
    }
  }
}))
