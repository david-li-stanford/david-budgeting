import { useState } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'

const CATEGORY_LABELS = {
  FOOD_AND_DRINK: 'Food & Drink',
  TRAVEL: 'Travel',
  TRANSPORTATION: 'Transportation',
  GENERAL_MERCHANDISE: 'Shopping',
  ENTERTAINMENT: 'Entertainment',
  PERSONAL_CARE: 'Personal Care',
  GENERAL_SERVICES: 'Services',
  GOVERNMENT_AND_NON_PROFIT: 'Government',
  HOME_IMPROVEMENT: 'Home',
  MEDICAL: 'Medical',
  RENT_AND_UTILITIES: 'Utilities',
  LOAN_PAYMENTS: 'Loans',
  TRANSFER_IN: 'Transfer In',
  TRANSFER_OUT: 'Transfer Out',
  INCOME: 'Income',
}

const PAGE_SIZE = 10

export default function TransactionList({ transactions }) {
  const [expanded, setExpanded] = useState(false)

  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
  const visible = expanded ? sorted : sorted.slice(0, PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#3D3530]">Transaction History</h3>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-10 text-warmGray text-sm">
          <p>No transactions yet. Sync your accounts from the dashboard.</p>
        </div>
      ) : (
        <>
          <div className="rounded-card border border-taupe/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-dark border-b border-taupe/40">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Description</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Category</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-taupe/20">
                {visible.map((tx) => (
                  <tr key={tx.id} className="hover:bg-cream transition-colors">
                    <td className="px-4 py-3 text-xs text-warmGray whitespace-nowrap">
                      {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#3D3530] max-w-[220px] truncate">{tx.name}</td>
                    <td className="px-4 py-3 text-xs text-warmGray">
                      {CATEGORY_LABELS[tx.category] ?? tx.category ?? '—'}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap ${tx.amount > 0 ? 'text-danger' : 'text-sage'}`}>
                      {tx.amount > 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sorted.length > PAGE_SIZE && (
            <div className="mt-2 text-center">
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-xs text-terracotta hover:underline"
              >
                {expanded ? 'Show less' : `Show all ${sorted.length} transactions`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
