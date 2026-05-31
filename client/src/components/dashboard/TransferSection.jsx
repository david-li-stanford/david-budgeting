import { useState } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'

function TransferModal({ allAccounts, onSubmit, onClose }) {
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fromAccount = allAccounts.find((a) => a.id === fromId)
  const toAccount = allAccounts.find((a) => a.id === toId)
  const parsedAmount = parseFloat(amount) || 0

  const validate = () => {
    if (!fromId) return 'Select a source account.'
    if (!toId) return 'Select a destination account.'
    if (fromId === toId) return 'Source and destination must be different accounts.'
    if (parsedAmount <= 0) return 'Enter an amount greater than $0.'
    if (fromAccount && parsedAmount > fromAccount.balance) return `Insufficient balance (${formatCurrency(fromAccount.balance)} available).`
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setSubmitting(true)
    await onSubmit({
      fromAccountId: fromId,
      fromAccountType: fromAccount._type,
      toAccountId: toId,
      toAccountType: toAccount._type,
      amount: parsedAmount,
      note,
    })
    onClose()
  }

  return (
    <Modal title="Transfer Between Accounts" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">From</label>
          <select className="input-field" value={fromId} onChange={(e) => { setFromId(e.target.value); setError(null) }}>
            <option value="">Select account…</option>
            {allAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {formatCurrency(a.balance)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">To</label>
          <select className="input-field" value={toId} onChange={(e) => { setToId(e.target.value); setError(null) }}>
            <option value="">Select account…</option>
            {allAccounts.filter((a) => a.id !== fromId).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {formatCurrency(a.balance)}
              </option>
            ))}
          </select>
        </div>

        {/* Arrow preview */}
        {fromAccount && toAccount && (
          <div className="flex items-center justify-between bg-cream rounded-btn px-4 py-3 text-sm">
            <div className="text-center">
              <p className="font-medium text-[#3D3530]">{fromAccount.name}</p>
              <p className="text-xs text-warmGray mt-0.5">{formatCurrency(fromAccount.balance)}</p>
            </div>
            <svg className="w-5 h-5 text-terracotta shrink-0 mx-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="text-center">
              <p className="font-medium text-[#3D3530]">{toAccount.name}</p>
              <p className="text-xs text-warmGray mt-0.5">{formatCurrency(toAccount.balance)}</p>
            </div>
          </div>
        )}

        <Input
          label="Amount"
          prefix="$"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError(null) }}
          required
          placeholder="0.00"
        />

        <Input
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Moving to savings…"
        />

        {error && (
          <p className="text-xs text-danger bg-danger/10 rounded-btn px-3 py-1.5">{error}</p>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Transferring…' : parsedAmount > 0 ? `Transfer ${formatCurrency(parsedAmount)}` : 'Transfer'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function TransferSection({ transfers, allAccounts, onTransfer, onUndo }) {
  const [showModal, setShowModal] = useState(false)
  const [confirmUndo, setConfirmUndo] = useState(null)
  const [undoing, setUndoing] = useState(null)

  const getAccount = (id) => allAccounts.find((a) => a.id === id)

  const handleUndo = async (transfer) => {
    setUndoing(transfer.id)
    await onUndo(transfer)
    setConfirmUndo(null)
    setUndoing(null)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#3D3530]">Transfers</h3>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          + New Transfer
        </Button>
      </div>

      {transfers.length === 0 ? (
        <p className="text-sm text-warmGray py-4 text-center">No transfers yet.</p>
      ) : (
        <div className="rounded-card border border-taupe/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-dark border-b border-taupe/40">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">From</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">To</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Note</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taupe/20">
              {transfers.map((t) => {
                const from = getAccount(t.fromAccountId)
                const to = getAccount(t.toAccountId)
                return (
                  <tr key={t.id} className="hover:bg-cream transition-colors">
                    <td className="px-4 py-3 text-xs text-warmGray whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge type={t.fromAccountType === 'checking' ? 'checking' : from?.accountType ?? t.fromAccountType} className="text-[10px] py-0 px-1.5" />
                        <span className="text-[#3D3530] font-medium">{from?.name ?? t.fromAccountId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge type={t.toAccountType === 'checking' ? 'checking' : to?.accountType ?? t.toAccountType} className="text-[10px] py-0 px-1.5" />
                        <span className="text-[#3D3530] font-medium">{to?.name ?? t.toAccountId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#3D3530]">{t.note || <span className="text-warmGray/40">—</span>}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#3D3530] tabular-nums whitespace-nowrap">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setConfirmUndo(t)}
                        className="btn-ghost text-xs px-2 py-1 text-warmGray hover:text-danger"
                      >
                        Undo
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <TransferModal
          allAccounts={allAccounts}
          onSubmit={onTransfer}
          onClose={() => setShowModal(false)}
        />
      )}

      {confirmUndo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3530]/30 backdrop-blur-sm">
          <div className="bg-white rounded-card shadow-modal p-6 max-w-sm w-full">
            <h3 className="font-semibold text-[#3D3530] mb-2">Undo transfer?</h3>
            <p className="text-sm text-warmGray mb-1">
              <span className="font-medium text-[#3D3530]">{formatCurrency(confirmUndo.amount)}</span>
              {' '}from{' '}
              <span className="font-medium text-[#3D3530]">{getAccount(confirmUndo.fromAccountId)?.name ?? confirmUndo.fromAccountId}</span>
              {' '}to{' '}
              <span className="font-medium text-[#3D3530]">{getAccount(confirmUndo.toAccountId)?.name ?? confirmUndo.toAccountId}</span>
            </p>
            <p className="text-sm text-warmGray mb-5">This will reverse the balance changes on both accounts.</p>
            <div className="flex gap-2">
              <Button variant="danger" disabled={undoing === confirmUndo.id} onClick={() => handleUndo(confirmUndo)}>
                {undoing === confirmUndo.id ? 'Undoing…' : 'Undo Transfer'}
              </Button>
              <Button variant="secondary" onClick={() => setConfirmUndo(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
