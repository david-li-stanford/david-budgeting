import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'

const CATEGORIES = [
  { value: 'housing', label: 'Housing' },
  { value: 'food', label: 'Food' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'transport', label: 'Transport' },
  { value: 'health', label: 'Health' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
]

export default function ExpenseForm({ expense, onSave, onClose }) {
  const [form, setForm] = useState({
    name: expense?.name || '',
    amount: expense?.amount ? String(expense.amount) : '',
    category: expense?.category || 'other',
    dueDay: expense?.dueDay ? String(expense.dueDay) : '',
    notes: expense?.notes || '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      amount: parseFloat(form.amount) || 0,
      dueDay: form.dueDay ? parseInt(form.dueDay) : null,
    })
    onClose()
  }

  return (
    <Modal title={expense ? 'Edit Expense' : 'Add Expense'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          required
          placeholder="e.g. Rent"
        />
        <Input
          label="Amount"
          prefix="$"
          type="number"
          step="0.01"
          min="0"
          value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
          required
        />
        <div>
          <label className="label">Category</label>
          <select
            className="input-field"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <Input
          label="Due Day (optional)"
          type="number"
          min="1"
          max="31"
          value={form.dueDay}
          onChange={(e) => set('dueDay', e.target.value)}
          placeholder="1–31"
        />
        <Input
          label="Notes (optional)"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Any notes..."
        />
        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="primary">
            {expense ? 'Save Changes' : 'Add Expense'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
