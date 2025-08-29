import { Link, useLocation } from 'react-router-dom'
import { FiGrid, FiSettings, FiUsers, FiActivity, FiPower, FiChevronLeft, FiBarChart2, FiUserPlus } from 'react-icons/fi'
import { SiWhatsapp } from 'react-icons/si'
import { useAuthStore } from '../../features/auth/stores/auth-store'
import { useState } from 'react'

export function Sidebar() {
  const location = useLocation()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const user = useAuthStore((state) => state.user)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Verifica se o usuário tem plano CLT
  const hasCLTPlan = user?.company?.services?.some(
    service => service.serviceType === 'CONSULTA_CLT' && service.isActive
  )

  // Define os itens do menu baseado no plano
  const getMenuItems = () => {
    if (hasCLTPlan) {
      // Se tem plano CLT, mostra apenas Dashboard e Consulta CLT
      return [
        /*         { icon: FiGrid, label: 'Dashboard', path: '/dashboard' }, */
        { icon: FiUsers, label: 'Consulta CLT', path: '/dashboard/clt' },
      ]
    }

    // Menu completo para outros planos
    return [
      { icon: FiGrid, label: 'Dashboard', path: '/dashboard' },
      { icon: SiWhatsapp, label: 'Conexões', path: '/dashboard/connections' },
      { icon: FiActivity, label: 'Automações', path: '/dashboard/automations' },
      { icon: FiUsers, label: 'Clientes', path: '/dashboard/users' },
      { icon: FiUsers, label: 'Consulta CLT', path: '/dashboard/clt' },
      { icon: FiBarChart2, label: 'Análises', path: '/dashboard/analytics' },
      { icon: FiUserPlus, label: 'Equipe', path: '/dashboard/team' },
      { icon: FiSettings, label: 'Configurações', path: '/dashboard/settings' },
    ]
  }

  const menuItems = getMenuItems()

  const isActive = (path: string) => location.pathname === path

  return (
    <div
      className={`
        h-screen bg-slate-900 border-r border-white/[0.05] flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo e Botão Toggle */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h1
            className={`
              text-2xl font-light text-white/90 tracking-wide
              transition-all duration-300 ease-in-out
              ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
            `}
          >
            ConsigIA
          </h1>
          {!isCollapsed && hasCLTPlan && (
            <span className="text-xs text-sky-400 font-medium mt-1">
              Plano CLT
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            p-2 rounded-lg bg-slate-800/50 text-slate-400
            hover:bg-slate-800 hover:text-slate-200
            transition-all duration-300 ease-in-out
            ${isCollapsed ? 'rotate-180' : ''}
          `}
        >
          <FiChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  text-sm font-light transition-all duration-300
                  ${isActive(item.path)
                    ? 'bg-sky-500/10 text-sky-400'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`
                    transition-all duration-300
                    ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/[0.05]">
        <button
          onClick={() => clearAuth()}
          className={`
            flex items-center gap-3 px-4 py-3 w-full rounded-xl
            text-sm font-light text-red-400 hover:bg-red-500/10
            transition-all duration-300
          `}
        >
          <FiPower className="h-5 w-5 flex-shrink-0" />
          <span
            className={`
              transition-all duration-300
              ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
            `}
          >
            Sair
          </span>
        </button>
      </div>
    </div>
  )
}