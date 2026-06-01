import { useCheckingAccounts, useInvestmentAccounts } from '../hooks/useAccounts'
import { useCreditAccounts } from '../hooks/useCreditAccounts'
import { useDepositHistory } from '../hooks/useDepositHistory'
import { calculateDistribution } from '../utils/distribution'
import { formatCurrency } from '../utils/formatCurrency'
import NetWorthDonut from '../components/charts/NetWorthDonut'
import InvestmentForecast from '../components/dashboard/InvestmentForecast'
import MiniAccountCard from '../components/dashboard/MiniAccountCard'
import OneTimeDepositSection from '../components/dashboard/OneTimeDepositSection'
import SyncButton from '../components/dashboard/SyncButton'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'

export default function Dashboard() {
  const { accounts: checking, loading: l1, updateAccount: updateChecking, refetch: refetchChecking } = useCheckingAccounts()
  const { accounts: investment, loading: l2, updateAccount: updateInvestment, refetch: refetchInvestment } = useInvestmentAccounts()
  const { accounts: credit, loading: l6, refetch: refetchCredit } = useCreditAccounts()
  const { deposits, loading: l4, addDeposit, removeDeposit } = useDepositHistory()

  if (l1 || l2 || l4 || l6) {
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

  const totalAssets = allAccounts.reduce((s, a) => s + (a.balance || 0), 0)
  const totalLiabilities = credit.reduce((s, a) => s + (a.balance || 0), 0)
  const totalNetWorth = totalAssets - totalLiabilities

  const handleSynced = () => {
    refetchChecking()
    refetchInvestment()
    refetchCredit()
  }

  const applyDeposit = async (amount, distribution, note = '') => {
    const { allocations } = calculateDistribution(amount, distribution)
    await Promise.all(
      Object.entries(allocations).map(([accountId, allocated]) => {
        if (allocated <= 0) return Promise.resolve()
        const chk = checking.find((a) => a.id === accountId)
        if (chk) return updateChecking(accountId, { balance: chk.balance + allocated })
        const inv = investment.find((a) => a.id === accountId)
        if (inv) return updateInvestment(accountId, { balance: inv.balance + allocated })
        return Promise.resolve()
      })
    )
    await addDeposit({ amount, type: 'one-time', note, distribution })
  }

  const handleOneTimeDeposit = (amount, distribution, note) =>
    applyDeposit(amount, distribution, note)

  const handleUndoDeposit = async (deposit) => {
    const { allocations } = calculateDistribution(deposit.amount, deposit.distribution || [])
    await Promise.all(
      Object.entries(allocations).map(([accountId, allocated]) => {
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-warmGray text-sm mt-1">Your complete financial overview</p>
        </div>
        <SyncButton onSynced={handleSynced} />
      </div>

      {/* Net Worth + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center text-center">
          <p className="section-title mb-2">Total Net Worth</p>
          <p className="text-4xl font-semibold text-[#3D3530] tabular-nums mb-1">
            {formatCurrency(totalNetWorth)}
          </p>
          {totalLiabilities > 0 && (
            <p className="text-xs text-danger mt-0.5">{formatCurrency(totalLiabilities)} in liabilities</p>
          )}
          <p className="text-xs text-warmGray mt-1">
            across {allAccounts.length + credit.length} account{allAccounts.length + credit.length !== 1 ? 's' : ''}
          </p>
        </Card>
        <Card className="lg:col-span-2">
          <p className="section-title mb-4">Portfolio Breakdown</p>
          <NetWorthDonut accounts={allAccounts} />
        </Card>
      </div>

      {/* Investment Forecast */}
      {investment.length > 0 && (
        <InvestmentForecast totalInvestments={investment.reduce((s, a) => s + (a.balance || 0), 0)} />
      )}

      {/* Deposits */}
      <div className="space-y-5">
        <h2 className="section-title">Deposits</h2>
        <OneTimeDepositSection
          deposits={deposits}
          allAccounts={allAccounts}
          defaultDistribution={[]}
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
              <MiniAccountCard key={a.id} account={a} type="checking" />
            ))}
          </div>
        </div>
      )}

      {investment.length > 0 && (
        <div>
          <h2 className="section-title mb-3">Investment Accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {investment.map((a) => (
              <MiniAccountCard key={a.id} account={a} type="investment" />
            ))}
          </div>
        </div>
      )}

      {credit.length > 0 && (
        <div>
          <h2 className="section-title mb-3">Credit Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {credit.map((a) => (
              <MiniAccountCard key={a.id} account={a} type="credit" />
            ))}
          </div>
        </div>
      )}

      {allAccounts.length === 0 && credit.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-warmGray text-sm">No accounts yet. Use the sidebar to add your first account.</p>
        </Card>
      )}
    </div>
  )
}
