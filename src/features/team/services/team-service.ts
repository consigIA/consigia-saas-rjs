import { v4 as uuidv4 } from 'uuid'
import type { TeamMember, CreateTeamMemberData, UpdateTeamMemberData } from '../types'

// Mock data
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@consigia.com.br',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    lastAccess: new Date('2024-02-15'),
    department: 'Tecnologia'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@consigia.com.br',
    role: 'manager',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    lastAccess: new Date('2024-02-14'),
    department: 'Operações'
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@consigia.com.br',
    role: 'operator',
    status: 'active',
    createdAt: new Date('2024-02-01'),
    lastAccess: new Date('2024-02-13'),
    department: 'Atendimento'
  }
]

export const teamService = {
  async listMembers(): Promise<TeamMember[]> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1000))
    return mockTeamMembers
  },

  async getMember(id: string): Promise<TeamMember | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockTeamMembers.find(member => member.id === id) || null
  },

  async createMember(data: CreateTeamMemberData): Promise<TeamMember> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newMember: TeamMember = {
      id: uuidv4(),
      ...data,
      status: 'pending',
      createdAt: new Date()
    }

    mockTeamMembers.push(newMember)
    return newMember
  },

  async updateMember(id: string, data: UpdateTeamMemberData): Promise<TeamMember> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const memberIndex = mockTeamMembers.findIndex(member => member.id === id)
    if (memberIndex === -1) {
      throw new Error('Membro não encontrado')
    }

    const updatedMember = {
      ...mockTeamMembers[memberIndex],
      ...data
    }

    mockTeamMembers[memberIndex] = updatedMember
    return updatedMember
  },

  async deleteMember(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const memberIndex = mockTeamMembers.findIndex(member => member.id === id)
    if (memberIndex === -1) {
      throw new Error('Membro não encontrado')
    }

    mockTeamMembers.splice(memberIndex, 1)
  }
}
