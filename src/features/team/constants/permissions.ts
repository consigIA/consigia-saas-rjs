import type { Role } from '../types'

export const roleDescriptions: Record<Role, string> = {
  admin: 'Acesso total ao sistema, incluindo gerenciamento de equipe, configurações avançadas, APIs e integrações.',
  manager: 'Acesso a métricas, relatórios, gerenciamento de clientes e monitoramento de equipe.',
  operator: 'Acesso básico para atendimento a clientes e execução de automações.'
}

export const rolePermissions: Record<Role, string[]> = {
  admin: [
    'Gerenciamento de equipe',
    'Configuração de APIs e integrações',
    'Gerenciamento de permissões',
    'Visualização de todas as métricas',
    'Configurações avançadas do sistema',
    'Gerenciamento de automações',
    'Acesso total às conexões WhatsApp',
    'Gerenciamento de clientes'
  ],
  manager: [
    'Visualização de métricas e relatórios',
    'Gerenciamento de clientes',
    'Visualização de automações',
    'Acesso às conexões designadas',
    'Monitoramento de atividades',
    'Configurações básicas'
  ],
  operator: [
    'Atendimento aos clientes',
    'Visualização de conexões designadas',
    'Execução de automações',
    'Visualização de métricas básicas'
  ]
}

export const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  operator: 'Operador'
}
