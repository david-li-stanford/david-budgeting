import { useNavigate } from 'react-router-dom'
import Badge from '../ui/Badge'
import { formatCurrency } from '../../utils/formatCurrency'

export default function MiniAccountCard({ account, type, allocatedIncome }) {
  const navigate = useNavigate()
  const route = type === 'checking' ? `/checking/${account.id}` : `/investment/${account.id}`

  return (
    <div
      onClick={() => navigate(route)}
      className="bg-white border border-taupe/40 rounded-card p-4 cursor-pointer hover:shadow-card-hover transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-[#3D3530] text-sm truncate">{account.name}</p>
          {account.institution && (
            <p className="text-xs text-warmGray mt-0.5">{account.institution}</p>
          )}
        </div>
        <Badge type={type === 'checking' ? 'checking' : account.accountType} className="shrink-0 ml-2" />
      </div>
      <p className="text-2xl font-semibold text-[#3D3530] tabular-nums">
        {formatCurrency(account.balance)}
      </p>
      {allocatedIncome > 0 && (
        <p className="text-xs text-sage mt-1.5 font-medium">
          +{formatCurrency(allocatedIncome)}/mo allocated
        </p>
      )}
      {type === 'investment' && (
        <p className="text-xs text-warmGray mt-1">
          {account.annualReturnRate}% annual return
        </p>
      )}
    </div>
  )
}
