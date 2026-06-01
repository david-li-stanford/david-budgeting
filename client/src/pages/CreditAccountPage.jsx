import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCreditAccounts } from '../hooks/useCreditAccounts'
import { useCheckingAccounts } from '../hooks/useAccounts'
import { usePlaidTransactions } from '../hooks/usePlaidTransactions'
import { formatCurrency } from '../utils/formatCurrency'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'

const CATEGORY_LABELS = {
  accommodation: 'Accommodation',
  advertising: 'Advertising',
  bar: 'Bar',
  charity: 'Charity',
  clothing: 'Clothing',
  dining: 'Dining',
  education: 'Education',
  electronics: 'Electronics',
  entertainment: 'Entertainment',
  fuel: 'Fuel',
  groceries: 'Groceries',
  health: 'Health',
  home: 'Home',
  income: 'Income',
  insurance: 'Insurance',
  investment: 'Investment',
  loan: 'Loan',
  office: 'Office',
  phone: 'Phone',
  service: 'Service',
  shopping: 'Shopping',
  software: 'Software',
  sport: 'Sport',
  tax: 'Tax',
  transport: 'Transport',
  travel: 'Travel',
  utilities: 'Utilities',
}

function EditAccountModal({ account, onSave, onClose, onDelete }) {
  const [form, setForm] = useState({
    name: account.name,
    institution: account.institution || '',
    checking_account_id: account.checking_account_id || '',
  })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const navigate = useNavigate()
  const { accounts: checkingAccounts } = useCheckingAccounts()

  const handleDelete = async () => {
    if (window.confirm(`Delete "${account.name}"?`)) {
      await onDelete(account.id)
      navigate('/dashboard')
    }
  }

  return (
    <Modal title="Edit Account" onClose={onClose}>
      <div className="space-y-4">
        <Input label="Account Name" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <Input label="Institution" value={form.institution} onChange={(e) => set('institution', e.target.value)} />
        <div>
          <label className="label">Linked checking account</label>
          <select
            className="input-field"
            value={form.checking_account_id}
            onChange={(e) => set('checking_account_id', e.target.value)}
          >
            <option value="">Not linked</option>
            {checkingAccounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <p className="text-xs text-warmGray mt-1">Charges will appear as expenses on the linked account.</p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="primary" onClick={() => { onSave(account.id, form); onClose() }}>Save</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" className="ml-auto" onClick={handleDelete}>Delete Account</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function CreditAccountPage() {
  const { accountId } = useParams()
  const { accounts, loading: aLoading, updateAccount, removeAccount } = useCreditAccounts()
  const { transactions, loading: tLoading } = usePlaidTransactions(accountId)
  const [showEdit, setShowEdit] = useState(false)

  if (aLoading || tLoading) {
    return <div className="flex items-center justify-center h-full p-20"><Spinner size="lg" /></div>
  }

  const account = accounts.find((a) => a.id === accountId)
  if (!account) return <div className="p-8 text-warmGray">Account not found.</div>

  const posted = transactions.filter((t) => t.status === 'posted')
  const pending = transactions.filter((t) => t.status === 'pending')

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{account.name}</h1>
          <p className="text-warmGray text-sm mt-0.5">
            {account.institution && `${account.institution} · `}
            {account.lastFour && `···· ${account.lastFour}`}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>Edit</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="text-center">
          <p className="section-title mb-1">Balance Owed</p>
          <p className="text-3xl font-semibold text-danger tabular-nums">{formatCurrency(account.balance)}</p>
          <p className="text-xs text-warmGray mt-1">current balance</p>
        </Card>
        <Card className="text-center">
          <p className="section-title mb-1">Transactions</p>
          <p className="text-3xl font-semibold text-[#3D3530] tabular-nums">{posted.length}</p>
          <p className="text-xs text-warmGray mt-1">{pending.length} pending</p>
        </Card>
      </div>

      <Card>
        <p className="section-title mb-4">Transaction History</p>
        {transactions.length === 0 ? (
          <p className="text-sm text-warmGray py-4 text-center">No transactions yet. Sync your accounts from the dashboard.</p>
        ) : (
          <div className="rounded-card border border-taupe/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-dark border-b border-taupe/40">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Description</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-taupe/20">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-cream transition-colors">
                    <td className="px-4 py-3 text-xs text-warmGray whitespace-nowrap">
                      {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-[#3D3530] font-medium max-w-[200px] truncate">{tx.name}</td>
                    <td className="px-4 py-3 text-warmGray text-xs">{CATEGORY_LABELS[tx.category] ?? tx.category ?? '—'}</td>
                    <td className="px-4 py-3">
                      {tx.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber/15 text-amber">Pending</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap ${tx.amount > 0 ? 'text-danger' : 'text-sage'}`}>
                      {tx.amount > 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showEdit && (
        <EditAccountModal
          account={account}
          onSave={updateAccount}
          onDelete={removeAccount}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}
