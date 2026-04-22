import { useState } from 'react'
import { calculateDistribution } from '../../utils/distribution'
import { formatCurrency } from '../../utils/formatCurrency'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

function DepositModal({ allAccounts, defaultDistribution, onSubmit, onClose }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [rows, setRows] = useState(
    allAccounts.map((a) => {
      const existing = defaultDistribution.find((d) => d.accountId === a.id)
      return {
        accountId: a.id,
        name: a.name,
        mode: existing?.mode || 'percent',
        value: existing ? String(existing.value) : '0',
      }
    })
  )
  const [submitting, setSubmitting] = useState(false)

  const setRow = (accountId, field, val) =>
    setRows((prev) => prev.map((r) => r.accountId === accountId ? { ...r, [field]: val } : r))

  const parsedAmount = parseFloat(amount) || 0
  const distribution = rows.map((r) => ({ ...r, value: parseFloat(r.value) || 0 }))
  const { allocations, unallocated, errors } = calculateDistribution(parsedAmount, distribution)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (parsedAmount <= 0) return
    setSubmitting(true)
    await onSubmit(parsedAmount, distribution, note)
    onClose()
  }

  return (
    <Modal title="One-Time Deposit" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            prefix="$"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="0.00"
          />
          <Input
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Bonus, tax refund…"
          />
        </div>

        {rows.length > 0 && (
          <div>
            <p className="label mb-2">Distribution</p>
            <div className="space-y-1">
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

            <div className="flex items-center justify-between py-2 px-3 bg-cream-dark rounded-btn mt-2 text-sm">
              <span className="text-warmGray">Unallocated</span>
              <span className={`font-semibold tabular-nums ${unallocated > 0 ? 'text-amber' : 'text-[#3D3530]'}`}>
                {formatCurrency(unallocated)}
              </span>
            </div>
          </div>
        )}

        {errors.map((e, i) => (
          <p key={i} className="text-xs text-danger bg-danger/10 rounded-btn px-3 py-1.5">{e}</p>
        ))}

        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary" disabled={submitting || parsedAmount <= 0 || errors.length > 0}>
            {submitting ? 'Depositing…' : `Deposit ${parsedAmount > 0 ? formatCurrency(parsedAmount) : ''}`}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function OneTimeDepositSection({ deposits, allAccounts, defaultDistribution, onDeposit }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#3D3530]">One-Time Deposits</h3>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          + New Deposit
        </Button>
      </div>

      {deposits.length === 0 ? (
        <p className="text-sm text-warmGray py-4 text-center">No one-time deposits yet.</p>
      ) : (
        <div className="rounded-card border border-taupe/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-dark border-b border-taupe/40">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Note</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taupe/20">
              {deposits.filter((d) => d.type === 'one-time').map((d) => (
                <tr key={d.id} className="hover:bg-cream transition-colors">
                  <td className="px-4 py-3 text-xs text-warmGray">
                    {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-[#3D3530]">{d.note || <span className="text-warmGray/50">—</span>}</td>
                  <td className="px-4 py-3 text-right font-semibold text-sage tabular-nums">
                    +{formatCurrency(d.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <DepositModal
          allAccounts={allAccounts}
          defaultDistribution={defaultDistribution}
          onSubmit={onDeposit}
          onClose={() => setShowModal(false)}
        />
      )}
    </Card>
  )
}
