import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import CheckingAccountPage from './pages/CheckingAccountPage'
import InvestmentAccountPage from './pages/InvestmentAccountPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checking/:accountId" element={<CheckingAccountPage />} />
          <Route path="/investment/:accountId" element={<InvestmentAccountPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
