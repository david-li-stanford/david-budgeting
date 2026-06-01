import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePlaidTransactions } from '../../hooks/usePlaidTransactions'
import { formatCurrency } from '../../utils/formatCurrency'
import Spinner from '../ui/Spinner'

const CATEGORY_LABELS = {
  accommodation: 'Accommodation', advertising: 'Advertising', bar: 'Bar',
  charity: 'Charity', clothing: 'Clothing', dining: 'Dining',
  education: 'Education', electronics: 'Electronics', entertainment: 'Entertainment',
  fuel: 'Fuel', groceries: 'Groceries', health: 'Health', home: 'Home',
  income: 'Income', insurance: 'Insurance', investment: 'Investment',
  loan: 'Loan', office: 'Office', phone: 'Phone', service: 'Service',
  shopping: 'Shopping', software: 'Software', sport: 'Sport',
  tax: 'Tax', transport: 'Transport', travel: 'Travel', utilities: 'Utilities',
}

export default function LinkedCreditCard({ account }) {
  const { transactions, loading } = usePlaidTransactions(account.id)
  const [expanded, setExpanded] = useState(false)

  const charges = transactions.filter((t) => t.amount > 0)
  const visible = expanded ? transactions : transactions.slice(0, 5)

  return (
    <div className="rounded-card border border-taupe/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-cream-dark border-b border-taupe/40">
        <div>
          <p className="font-medium text-[#3D3530] text-sm">{account.name}</p>
          <p className="text-xs text-warmGray">
            {account.institution && `${account.institution} · `}
            {account.lastFour && `···· ${account.lastFour}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-warmGray">Balance Owed</p>
            <p className="text-sm font-semibold text-danger tabular-nums">{formatCurrency(account.balance)}</p>
          </div>
          <Link to={`/credit/${account.id}`} className="text-xs text-terracotta hover:underline shrink-0">
            View all →
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-warmGray text-center py-6">No transactions yet. Sync from the dashboard.</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-taupe/20">
                <th className="text-left px-4 py-2 text-xs font-semibold text-warmGray uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-warmGray uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-warmGray uppercase tracking-wider">Category</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-warmGray uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taupe/20">
              {visible.map((tx) => (
                <tr key={tx.id} className="hover:bg-cream transition-colors">
                  <td className="px-4 py-2.5 text-xs text-warmGray whitespace-nowrap">
                    {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-2.5 text-[#3D3530] font-medium max-w-[200px] truncate">{tx.name}</td>
                  <td className="px-4 py-2.5 text-xs text-warmGray">{CATEGORY_LABELS[tx.category] ?? tx.category ?? '—'}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold tabular-nums whitespace-nowrap ${tx.amount > 0 ? 'text-danger' : 'text-sage'}`}>
                    {tx.amount > 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-cream-dark border-t border-taupe/40">
                <td colSpan={3} className="px-4 py-2 text-xs font-semibold text-warmGray uppercase tracking-wider">
                  Total charges ({charges.length})
                </td>
                <td className="px-4 py-2 text-right font-semibold text-danger tabular-nums">
                  -{formatCurrency(charges.reduce((s, t) => s + Math.abs(t.amount), 0))}
                </td>
              </tr>
            </tfoot>
          </table>

          {transactions.length > 5 && (
            <div className="px-4 py-2 border-t border-taupe/20 text-center">
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-xs text-terracotta hover:underline"
              >
                {expanded ? 'Show less' : `Show all ${transactions.length} transactions`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
