import { useState, useEffect } from 'react'
import { calculateDistribution } from '../../utils/distribution'
import { formatCurrency } from '../../utils/formatCurrency'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Card from '../ui/Card'
import clsx from 'clsx'

const SCHEDULES = [
  { value: 'first-of-month', label: '1st of every month', description: 'Once a month on the 1st' },
  { value: 'first-and-15th', label: '1st and 15th', description: 'Twice a month' },
]

function nextDepositDate(schedule) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()

  if (schedule === 'first-of-month') {
    const next = day < 1 ? new Date(year, month, 1) : new Date(year, month + 1, 1)
    return next
  }
  if (schedule === 'first-and-15th') {
    if (day < 1) return new Date(year, month, 1)
    if (day < 15) return new Date(year, month, 15)
    return new Date(year, month + 1, 1)
  }
  return null
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function RecurringIncomeCard({ settings, allAccounts, onSave, onApplyDeposit }) {
  const [income, setIncome] = useState(String(settings?.monthlyIncome || ''))
  const [schedule, setSchedule] = useState(settings?.recurringSchedule || 'first-of-month')
  const [rows, setRows] = useState([])
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!settings) return
    setIncome(String(settings.monthlyIncome || ''))
    setSchedule(settings.recurringSchedule || 'first-of-month')
    const dist = settings.distribution || []
    setRows(allAccounts.map((a) => {
      const existing = dist.find((d) => d.accountId === a.id)
      return {
        accountId: a.id,
        accountType: a._type,
        name: a.name,
        mode: existing?.mode || 'percent',
        value: existing ? String(existing.value) : '0',
      }
    }))
    setDirty(false)
  }, [settings, allAccounts.length])

  const setRow = (accountId, field, val) => {
    setRows((prev) => prev.map((r) => r.accountId === accountId ? { ...r, [field]: val } : r))
    setDirty(true)
  }

  const parsedIncome = parseFloat(income) || 0
  const distribution = rows.map((r) => ({ ...r, value: parseFloat(r.value) || 0 }))
  const { allocations, unallocated, errors } = calculateDistribution(parsedIncome, distribution)

  const handleSave = async () => {
    setSaving(true)
    await onSave({ monthlyIncome: parsedIncome, recurringSchedule: schedule, distribution })
    setDirty(false)
    setSaving(false)
  }

  const handleApply = async () => {
    setApplying(true)
    await onApplyDeposit(parsedIncome, distribution, 'recurring')
    setApplying(false)
  }

  const next = nextDepositDate(schedule)

  return (
    <Card>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold text-[#3D3530]">Recurring Income</h3>
          {next && (
            <p className="text-xs text-warmGray mt-0.5">Next deposit: {formatDate(next)}</p>
          )}
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleApply}
          disabled={applying || parsedIncome === 0}
        >
          {applying ? 'Applying…' : 'Apply Deposit'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <Input
          label="Deposit Amount"
          prefix="$"
          type="number"
          step="0.01"
          min="0"
          value={income}
          onChange={(e) => { setIncome(e.target.value); setDirty(true) }}
        />
        <div>
          <label className="label">Schedule</label>
          <div className="flex gap-2">
            {SCHEDULES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => { setSchedule(s.value); setDirty(true) }}
                className={clsx(
                  'flex-1 px-3 py-2 rounded-btn border text-sm font-medium text-left transition-colors duration-150',
                  schedule === s.value
                    ? 'border-terracotta bg-terracotta/10 text-terracotta'
                    : 'border-taupe bg-cream text-warmGray hover:border-taupe-dark'
                )}
              >
                <span className="block text-xs font-semibold">{s.label}</span>
                <span className="block text-xs opacity-70 mt-0.5">{s.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Distribution table */}
      {rows.length > 0 && (
        <div className="space-y-1 mb-4">
          <div className="grid grid-cols-[1fr_90px_90px_80px] gap-2 px-1 mb-1">
            <span className="text-xs font-semibold text-warmGray uppercase tracking-wider">Account</span>
            <span className="text-xs font-semibold text-warmGray uppercase tracking-wider">Mode</span>
            <span className="text-xs font-semibold text-warmGray uppercase tracking-wider">Value</span>
            <span className="text-xs font-semibold text-warmGray uppercase tracking-wider text-right">Gets</span>
          </div>
          {rows.map((row) => (
            <div key={row.accountId} className="grid grid-cols-[1fr_90px_90px_80px] gap-2 items-center bg-cream rounded-btn px-3 py-2">
              <span className="text-sm font-medium text-[#3D3530] truncate">{row.name}</span>
              <select
                className="input-field text-xs py-1"
                value={row.mode}
                onChange={(e) => setRow(row.accountId, 'mode', e.target.value)}
              >
                <option value="percent">%</option>
                <option value="fixed">$</option>
              </select>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step={row.mode === 'percent' ? '1' : '0.01'}
                  className="input-field text-xs py-1 pr-6"
                  value={row.value}
                  onChange={(e) => setRow(row.accountId, 'value', e.target.value)}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-warmGray pointer-events-none">
                  {row.mode === 'percent' ? '%' : '$'}
                </span>
              </div>
              <span className="text-right text-sm font-medium text-sage tabular-nums">
                {formatCurrency(allocations[row.accountId] ?? 0)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between py-2 px-3 bg-cream-dark rounded-btn mb-4 text-sm">
        <span className="text-warmGray">Unallocated</span>
        <span className={`font-semibold tabular-nums ${unallocated > 0 ? 'text-amber' : 'text-[#3D3530]'}`}>
          {formatCurrency(unallocated)}
        </span>
      </div>

      {errors.length > 0 && (
        <div className="mb-3 space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-danger bg-danger/10 rounded-btn px-3 py-1.5">{e}</p>
          ))}
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={handleSave}
        disabled={saving || !dirty || errors.length > 0}
      >
        {saving ? 'Saving…' : dirty ? 'Save Changes' : 'Saved'}
      </Button>
    </Card>
  )
}
