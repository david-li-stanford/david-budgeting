import { useState, useEffect } from 'react'
import { calculateDistribution } from '../../utils/distribution'
import { formatCurrency } from '../../utils/formatCurrency'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function IncomeDistributionForm({ settings, checkingAccounts, investmentAccounts, onSave }) {
  const allAccounts = [
    ...checkingAccounts.map((a) => ({ ...a, accountType: 'checking' })),
    ...investmentAccounts.map((a) => ({ ...a })),
  ]

  const [income, setIncome] = useState(String(settings?.monthlyIncome || ''))
  const [rows, setRows] = useState([])
  const [saving, setSaving] = useState(false)

  // Init rows from settings distribution
  useEffect(() => {
    if (!settings) return
    const dist = settings.distribution || []
    const initialized = allAccounts.map((a) => {
      const existing = dist.find((d) => d.accountId === a.id)
      return {
        accountId: a.id,
        accountType: a.accountType || 'investment',
        name: a.name,
        mode: existing?.mode || 'percent',
        value: existing ? String(existing.value) : '0',
      }
    })
    setRows(initialized)
  }, [settings, checkingAccounts, investmentAccounts])

  const setRow = (accountId, field, val) => {
    setRows((prev) => prev.map((r) => (r.accountId === accountId ? { ...r, [field]: val } : r)))
  }

  const parsedIncome = parseFloat(income) || 0
  const distribution = rows.map((r) => ({ ...r, value: parseFloat(r.value) || 0 }))
  const { allocations, unallocated, errors } = calculateDistribution(parsedIncome, distribution)

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      monthlyIncome: parsedIncome,
      distribution: distribution,
    })
    setSaving(false)
  }

  return (
    <Card>
      <h3 className="font-semibold text-[#3D3530] mb-4">Income & Distribution</h3>

      {/* Monthly Income */}
      <div className="mb-5">
        <Input
          label="Monthly Income"
          prefix="$"
          type="number"
          step="0.01"
          min="0"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Per-account distribution */}
      {rows.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-[1fr_100px_90px_80px] gap-2 text-xs font-semibold text-warmGray uppercase tracking-wider px-1 mb-1">
            <span>Account</span>
            <span>Mode</span>
            <span>Amount</span>
            <span className="text-right">Allocated</span>
          </div>
          {rows.map((row) => (
            <div key={row.accountId} className="grid grid-cols-[1fr_100px_90px_80px] gap-2 items-center bg-cream rounded-btn px-3 py-2">
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
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-warmGray">
                  {row.mode === 'percent' ? '%' : '$'}
                </span>
              </div>
              <span className="text-right text-sm font-medium text-sage">
                {formatCurrency(allocations[row.accountId] ?? 0)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Summary row */}
      <div className="flex items-center justify-between py-2 px-3 bg-cream-dark rounded-btn mb-4 text-sm">
        <span className="text-warmGray">Unallocated</span>
        <span className={`font-semibold ${unallocated > 0 ? 'text-amber' : 'text-[#3D3530]'}`}>
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

      <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || errors.length > 0}>
        {saving ? 'Saving…' : 'Save Distribution'}
      </Button>
    </Card>
  )
}
