import { useState } from 'react'
import ExpenseForm from './ExpenseForm'
import Button from '../ui/Button'
import { formatCurrency } from '../../utils/formatCurrency'
import clsx from 'clsx'

const CATEGORY_LABELS = {
  housing: 'Housing', food: 'Food', utilities: 'Utilities',
  insurance: 'Insurance', subscriptions: 'Subscriptions',
  transport: 'Transport', health: 'Health',
  entertainment: 'Entertainment', other: 'Other',
}

const CATEGORY_COLORS = {
  housing: 'bg-terracotta/15 text-terracotta',
  food: 'bg-sage/15 text-sage',
  utilities: 'bg-amber/15 text-amber',
  insurance: 'bg-blue-50 text-blue-500',
  subscriptions: 'bg-purple-50 text-purple-500',
  transport: 'bg-orange-50 text-orange-500',
  health: 'bg-green-50 text-green-600',
  entertainment: 'bg-pink-50 text-pink-500',
  other: 'bg-taupe text-warmGray',
}

export default function ExpenseList({ expenses, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const sorted = [...expenses].sort((a, b) => {
    if (a.dueDay === null && b.dueDay === null) return 0
    if (a.dueDay === null) return 1
    if (b.dueDay === null) return -1
    return a.dueDay - b.dueDay
  })

  const activeTotal = expenses.filter((e) => e.isActive).reduce((s, e) => s + e.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#3D3530]">Monthly Expenses</h3>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          + Add Expense
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-10 text-warmGray text-sm">
          <p>No expenses yet. Add your first one.</p>
        </div>
      ) : (
        <div className="rounded-card border border-taupe/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-dark border-b border-taupe/40">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Category</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Amount</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Due</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Active</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taupe/20">
              {sorted.map((expense) => (
                <tr
                  key={expense.id}
                  className={clsx(
                    'hover:bg-cream transition-colors',
                    !expense.isActive && 'opacity-50'
                  )}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#3D3530]">{expense.name}</span>
                    {expense.notes && (
                      <p className="text-xs text-warmGray mt-0.5">{expense.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other)}>
                      {CATEGORY_LABELS[expense.category] || expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-[#3D3530]">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-4 py-3 text-center text-warmGray text-xs">
                    {expense.dueDay ? `Day ${expense.dueDay}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onUpdate(expense.id, { isActive: !expense.isActive })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${expense.isActive ? 'bg-sage' : 'bg-taupe'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${expense.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(expense)}
                        className="btn-ghost text-xs px-2 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="btn-danger text-xs px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-cream-dark border-t border-taupe/40">
                <td colSpan={2} className="px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">
                  Total (active)
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-[#3D3530] tabular-nums">
                  {formatCurrency(activeTotal)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {showForm && (
        <ExpenseForm onSave={onAdd} onClose={() => setShowForm(false)} />
      )}
      {editing && (
        <ExpenseForm
          expense={editing}
          onSave={(data) => { onUpdate(editing.id, data); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
