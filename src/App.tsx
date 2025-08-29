import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './features/auth/pages/login'
import { RegisterPage } from './features/auth/pages/register'
import { ConnectionsPage } from './features/dashboard/pages/connections'
import { AutomationsPage } from './features/dashboard/pages/automations'
import { DashboardPage } from './features/dashboard/pages/dashboard'
import { UsersPage } from './features/dashboard/pages/users'
import { CLTPage } from './features/dashboard/pages/clt'
import { SettingsPage } from './features/dashboard/pages/settings'
import { AnalyticsPage } from './features/dashboard/pages/analytics'
import { TeamPage } from './features/team/pages/team-page'
import { CompanyPage } from './features/companies/pages/company-page'
import { ProtectedRoute } from './components/protected-route'
import { RouteGuard } from './components/route-guard'
import { MobileBlocker } from './components/mobile-blocker'
import { DashboardLayout } from './layouts/dashboard-layout'

function App() {
  return (
    <>
      <MobileBlocker />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Rota CLT - Acessível para todos os usuários */}
            <Route path="/dashboard/clt" element={<CLTPage />} />

            {/* Rotas restritas - Apenas para usuários sem plano CLT */}
            <Route element={<RouteGuard allowedPlans={['FULL', 'BASIC']} fallbackPath="/dashboard/clt" />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/connections" element={<ConnectionsPage />} />
              <Route path="/dashboard/automations" element={<AutomationsPage />} />
              <Route path="/dashboard/users" element={<UsersPage />} />
              <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/dashboard/settings/company" element={<CompanyPage />} />
              <Route path="/dashboard/team" element={<TeamPage />} />
            </Route>
          </Route>
        </Route>

        {/* Redireciona para o login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App