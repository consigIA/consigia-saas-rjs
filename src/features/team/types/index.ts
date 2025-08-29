export type Role = 'admin' | 'manager' | 'operator'

export type TeamMemberStatus = 'active' | 'inactive' | 'pending'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  status: TeamMemberStatus
  avatar?: string
  createdAt: Date
  lastAccess?: Date
  phone?: string
  department?: string
}

export interface CreateTeamMemberData {
  name: string
  email: string
  role: Role
  phone?: string
  department?: string
}

export interface UpdateTeamMemberData {
  name?: string
  role?: Role
  status?: TeamMemberStatus
  phone?: string
  department?: string
}
