import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/sidebar/sidebar'

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-[var(--background-primary)]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}