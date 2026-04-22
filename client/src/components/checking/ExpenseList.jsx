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
  const [confirmDelete, setConfirmDelete] = useState(null)

  const sorted = [...expenses].sort((a, b) => {
    const aDate = new Date(a.createdAt || 0)
    const bDate = new Date(b.createdAt || 0)
    return bDate - aDate // newest first
  })

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#3D3530]">Expense History</h3>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          + Add Expense
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-10 text-warmGray text-sm">
          <p>No expenses logged yet.</p>
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
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Date Added</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taupe/20">
              {sorted.map((expense) => (
                <tr key={expense.id} className="hover:bg-cream transition-colors">
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
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-danger">
                    -{formatCurrency(expense.amount)}
                  </td>
                  <td className="px-4 py-3 text-center text-warmGray text-xs">
                    {expense.dueDay ? `Day ${expense.dueDay}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-warmGray">
                    {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditing(expense)} className="btn-ghost text-xs px-2 py-1">
                        Edit
                      </button>
                      <button onClick={() => setConfirmDelete(expense)} className="btn-danger text-xs px-2 py-1">
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
                  Total logged
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-danger tabular-nums">
                  -{formatCurrency(total)}
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

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3530]/30 backdrop-blur-sm">
          <div className="bg-white rounded-card shadow-modal p-6 max-w-sm w-full">
            <h3 className="font-semibold text-[#3D3530] mb-2">Delete expense?</h3>
            <p className="text-sm text-warmGray mb-1">
              <span className="font-medium text-[#3D3530]">{confirmDelete.name}</span> — {formatCurrency(confirmDelete.amount)}
            </p>
            <p className="text-sm text-warmGray mb-5">
              This will restore <span className="font-medium text-sage">{formatCurrency(confirmDelete.amount)}</span> to your account balance.
            </p>
            <div className="flex gap-2">
              <Button variant="danger" onClick={() => { onDelete(confirmDelete); setConfirmDelete(null) }}>
                Delete & Restore Balance
              </Button>
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
