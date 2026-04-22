import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import CheckingAccountPage from './pages/CheckingAccountPage'
import InvestmentAccountPage from './pages/InvestmentAccountPage'
import Login from './pages/Login'
import Spinner from './components/ui/Spinner'

function AuthGuard({ children }) {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!session) return <Login />
  return children
}

export default function App() {
  return (
    <HashRouter>
      <AuthGuard>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/checking/:accountId" element={<CheckingAccountPage />} />
            <Route path="/investment/:accountId" element={<InvestmentAccountPage />} />
          </Route>
        </Routes>
      </AuthGuard>
    </HashRouter>
  )
}
