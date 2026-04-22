import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCheckingAccounts } from '../hooks/useAccounts'
import { useExpenses } from '../hooks/useExpenses'
import { useSettings } from '../hooks/useSettings'
import { getAllocationForAccount } from '../utils/distribution'
import { formatCurrency } from '../utils/formatCurrency'
import ExpenseList from '../components/checking/ExpenseList'
import CashFlowBarChart from '../components/charts/CashFlowBarChart'
import ExpensePieChart from '../components/charts/ExpensePieChart'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'

function EditAccountModal({ account, onSave, onClose, onDelete }) {
  const [form, setForm] = useState({ name: account.name, institution: account.institution || '', balance: String(account.balance) })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (window.confirm(`Delete "${account.name}"? This will also remove all its expenses.`)) {
      await onDelete(account.id)
      navigate('/dashboard')
    }
  }

  return (
    <Modal title="Edit Account" onClose={onClose}>
      <div className="space-y-4">
        <Input label="Account Name" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <Input label="Institution" value={form.institution} onChange={(e) => set('institution', e.target.value)} />
        <Input label="Current Balance" prefix="$" type="number" step="0.01" value={form.balance} onChange={(e) => set('balance', e.target.value)} />
        <div className="flex gap-2 pt-2">
          <Button variant="primary" onClick={() => { onSave(account.id, { ...form, balance: parseFloat(form.balance) || 0 }); onClose() }}>Save</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" className="ml-auto" onClick={handleDelete}>Delete Account</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function CheckingAccountPage() {
  const { accountId } = useParams()
  const { accounts, loading: aLoading, updateAccount, removeAccount } = useCheckingAccounts()
  const { expenses, loading: eLoading, addExpense, updateExpense, removeExpense } = useExpenses(accountId)
  const { settings } = useSettings()
  const [showEdit, setShowEdit] = useState(false)

  if (aLoading || eLoading) {
    return <div className="flex items-center justify-center h-full p-20"><Spinner size="lg" /></div>
  }

  const account = accounts.find((a) => a.id === accountId)
  if (!account) return <div className="p-8 text-warmGray">Account not found.</div>

  const allocatedIncome = getAllocationForAccount(settings?.monthlyIncome || 0, settings?.distribution || [], accountId)
  const activeExpenses = expenses.filter((e) => e.isActive)
  const totalExpenses = activeExpenses.reduce((s, e) => s + e.amount, 0)
  const surplus = allocatedIncome - totalExpenses

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{account.name}</h1>
          {account.institution && (
            <p className="text-warmGray text-sm mt-1">{account.institution}</p>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>Edit</Button>
      </div>

      {/* Balance + Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="section-title mb-1">Balance</p>
          <p className="text-3xl font-semibold text-[#3D3530] tabular-nums">{formatCurrency(account.balance)}</p>
        </Card>
        <Card className="text-center">
          <p className="section-title mb-1">Allocated Income</p>
          <p className="text-3xl font-semibold text-sage tabular-nums">{formatCurrency(allocatedIncome)}</p>
          <p className="text-xs text-warmGray mt-1">per month</p>
        </Card>
        <Card className="text-center">
          <p className="section-title mb-1">{surplus >= 0 ? 'Surplus' : 'Deficit'}</p>
          <p className={`text-3xl font-semibold tabular-nums ${surplus >= 0 ? 'text-amber' : 'text-danger'}`}>
            {formatCurrency(Math.abs(surplus))}
          </p>
          <p className="text-xs text-warmGray mt-1">after expenses</p>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <p className="section-title mb-4">Cash Flow</p>
          <CashFlowBarChart allocatedIncome={allocatedIncome} totalExpenses={totalExpenses} />
        </Card>
        <Card>
          <p className="section-title mb-4">Expense Breakdown</p>
          <ExpensePieChart expenses={expenses} />
        </Card>
      </div>

      {/* Expense List */}
      <Card>
        <ExpenseList
          expenses={expenses}
          onAdd={addExpense}
          onUpdate={updateExpense}
          onDelete={removeExpense}
        />
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
