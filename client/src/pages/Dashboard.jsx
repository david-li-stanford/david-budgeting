import { useCheckingAccounts, useInvestmentAccounts } from '../hooks/useAccounts'
import { useSettings } from '../hooks/useSettings'
import { useDepositHistory } from '../hooks/useDepositHistory'
import { calculateDistribution } from '../utils/distribution'
import { formatCurrency } from '../utils/formatCurrency'
import NetWorthDonut from '../components/charts/NetWorthDonut'
import MiniAccountCard from '../components/dashboard/MiniAccountCard'
import RecurringIncomeCard from '../components/dashboard/RecurringIncomeCard'
import OneTimeDepositSection from '../components/dashboard/OneTimeDepositSection'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'

export default function Dashboard() {
  const { accounts: checking, loading: l1, updateAccount: updateChecking } = useCheckingAccounts()
  const { accounts: investment, loading: l2, updateAccount: updateInvestment } = useInvestmentAccounts()
  const { settings, loading: l3, updateSettings } = useSettings()
  const { deposits, loading: l4, addDeposit, removeDeposit } = useDepositHistory()

  if (l1 || l2 || l3 || l4) {
    return (
      <div className="flex items-center justify-center h-full p-20">
        <Spinner size="lg" />
      </div>
    )
  }

  const allAccounts = [
    ...checking.map((a) => ({ ...a, _type: 'checking' })),
    ...investment.map((a) => ({ ...a, _type: 'investment' })),
  ]

  const totalNetWorth = allAccounts.reduce((s, a) => s + (a.balance || 0), 0)

  const { allocations } = calculateDistribution(
    settings?.monthlyIncome || 0,
    settings?.distribution || []
  )

  // Apply a deposit: calculate per-account allocations and update balances
  const applyDeposit = async (amount, distribution, type, note = '') => {
    const { allocations: allocs } = calculateDistribution(amount, distribution)

    await Promise.all(
      Object.entries(allocs).map(([accountId, allocated]) => {
        if (allocated <= 0) return Promise.resolve()
        const chk = checking.find((a) => a.id === accountId)
        if (chk) return updateChecking(accountId, { balance: chk.balance + allocated })
        const inv = investment.find((a) => a.id === accountId)
        if (inv) return updateInvestment(accountId, { balance: inv.balance + allocated })
        return Promise.resolve()
      })
    )

    await addDeposit({ amount, type, note, distribution })
  }

  const handleRecurringDeposit = (amount, distribution) =>
    applyDeposit(amount, distribution, 'recurring')

  const handleOneTimeDeposit = (amount, distribution, note) =>
    applyDeposit(amount, distribution, 'one-time', note)

  const handleUndoDeposit = async (deposit) => {
    const { allocations: allocs } = calculateDistribution(deposit.amount, deposit.distribution || [])
    await Promise.all(
      Object.entries(allocs).map(([accountId, allocated]) => {
        if (allocated <= 0) return Promise.resolve()
        const chk = checking.find((a) => a.id === accountId)
        if (chk) return updateChecking(accountId, { balance: chk.balance - allocated })
        const inv = investment.find((a) => a.id === accountId)
        if (inv) return updateInvestment(accountId, { balance: inv.balance - allocated })
        return Promise.resolve()
      })
    )
    await removeDeposit(deposit.id)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-warmGray text-sm mt-1">Your complete financial overview</p>
      </div>

      {/* Net Worth + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center text-center">
          <p className="section-title mb-2">Total Net Worth</p>
          <p className="text-4xl font-semibold text-[#3D3530] tabular-nums mb-1">
            {formatCurrency(totalNetWorth)}
          </p>
          <p className="text-xs text-warmGray">
            across {allAccounts.length} account{allAccounts.length !== 1 ? 's' : ''}
          </p>
        </Card>
        <Card className="lg:col-span-2">
          <p className="section-title mb-4">Portfolio Breakdown</p>
          <NetWorthDonut accounts={allAccounts} />
        </Card>
      </div>

      {/* Income */}
      <div className="space-y-5">
        <h2 className="section-title">Income</h2>
        <RecurringIncomeCard
          settings={settings}
          allAccounts={allAccounts}
          onSave={updateSettings}
          onApplyDeposit={handleRecurringDeposit}
        />
        <OneTimeDepositSection
          deposits={deposits}
          allAccounts={allAccounts}
          defaultDistribution={settings?.distribution || []}
          onDeposit={handleOneTimeDeposit}
          onUndo={handleUndoDeposit}
        />
      </div>

      {/* Account Cards */}
      {checking.length > 0 && (
        <div>
          <h2 className="section-title mb-3">Checking Accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {checking.map((a) => (
              <MiniAccountCard
                key={a.id}
                account={a}
                type="checking"
                allocatedIncome={allocations[a.id] || 0}
              />
            ))}
          </div>
        </div>
      )}

      {investment.length > 0 && (
        <div>
          <h2 className="section-title mb-3">Investment Accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {investment.map((a) => (
              <MiniAccountCard
                key={a.id}
                account={a}
                type="investment"
                allocatedIncome={allocations[a.id] || 0}
              />
            ))}
          </div>
        </div>
      )}

      {allAccounts.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-warmGray text-sm">No accounts yet. Use the sidebar to add your first account.</p>
        </Card>
      )}
    </div>
  )
}
