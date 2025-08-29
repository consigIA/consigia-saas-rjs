import { RoleGuard, PERMISSIONS, useHasPermission } from '../../auth/components/role-guard'

export function CompanyActions() {
  const canManageSaas = useHasPermission(PERMISSIONS.MANAGE_SAAS)
  const canManageCompany = useHasPermission(PERMISSIONS.MANAGE_OWN_COMPANY)
  const canConfigTechnical = useHasPermission(PERMISSIONS.TECHNICAL_CONFIG)

  return (
    <div className="space-y-4">
      {/* Ações disponíveis apenas para GESTOR */}
      <RoleGuard allowedRoles={PERMISSIONS.MANAGE_SAAS}>
        <div className="p-4 bg-slate-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Gestão do SaaS</h2>
          <div className="space-y-2">
            <button className="btn btn-primary">Criar Nova Empresa</button>
            <button className="btn btn-secondary">Ver Todas as Empresas</button>
            <button className="btn btn-secondary">Relatórios Globais</button>
          </div>
        </div>
      </RoleGuard>

      {/* Ações disponíveis para OWNER */}
      <RoleGuard allowedRoles={PERMISSIONS.MANAGE_OWN_COMPANY}>
        <div className="p-4 bg-slate-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Gestão da Empresa</h2>
          <div className="space-y-2">
            <button className="btn btn-primary">Configurações da Empresa</button>
            <button className="btn btn-secondary">Gerenciar Usuários</button>
            <button className="btn btn-secondary">Relatórios da Empresa</button>
          </div>
        </div>
      </RoleGuard>

      {/* Ações disponíveis para SUPPORT */}
      <RoleGuard allowedRoles={PERMISSIONS.TECHNICAL_CONFIG}>
        <div className="p-4 bg-slate-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Configurações Técnicas</h2>
          <div className="space-y-2">
            <button className="btn btn-primary">Configurar Integrações</button>
            <button className="btn btn-secondary">Logs do Sistema</button>
            <button className="btn btn-secondary">Configurações Técnicas</button>
          </div>
        </div>
      </RoleGuard>

      {/* Exemplo de verificação condicional de permissões */}
      {canManageSaas && (
        <button className="btn btn-danger">Ação Administrativa Crítica</button>
      )}

      {canManageCompany && (
        <button className="btn btn-warning">Ação Empresarial Importante</button>
      )}

      {canConfigTechnical && (
        <button className="btn btn-info">Configuração Técnica Avançada</button>
      )}
    </div>
  )
}
