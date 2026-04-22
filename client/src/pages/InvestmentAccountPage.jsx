import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useInvestmentAccounts } from '../hooks/useAccounts'
import { useForecastScenarios } from '../hooks/useForecastScenarios'
import { useSettings } from '../hooks/useSettings'
import { getAllocationForAccount } from '../utils/distribution'
import { formatCurrency } from '../utils/formatCurrency'
import ForecastSection from '../components/investment/ForecastSection'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'

function EditAccountModal({ account, onSave, onClose, onDelete }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: account.name,
    institution: account.institution || '',
    balance: String(account.balance),
    accountType: account.accountType,
    annualReturnRate: String(account.annualReturnRate),
    monthlyContribution: String(account.monthlyContribution),
  })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleDelete = async () => {
    if (window.confirm(`Delete "${account.name}"?`)) {
      await onDelete(account.id)
      navigate('/dashboard')
    }
  }

  return (
    <Modal title="Edit Investment Account" onClose={onClose}>
      <div className="space-y-4">
        <Input label="Name" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <Input label="Institution" value={form.institution} onChange={(e) => set('institution', e.target.value)} />
        <Input label="Balance" prefix="$" type="number" step="0.01" value={form.balance} onChange={(e) => set('balance', e.target.value)} />
        <div>
          <label className="label">Account Type</label>
          <select className="input-field" value={form.accountType} onChange={(e) => set('accountType', e.target.value)}>
            <option value="savings">Savings</option>
            <option value="brokerage">Brokerage</option>
            <option value="retirement">Retirement</option>
            <option value="cd">CD</option>
          </select>
        </div>
        <Input label="Annual Return Rate" suffix="%" type="number" step="0.1" value={form.annualReturnRate} onChange={(e) => set('annualReturnRate', e.target.value)} />
        <Input label="Monthly Contribution" prefix="$" type="number" step="0.01" value={form.monthlyContribution} onChange={(e) => set('monthlyContribution', e.target.value)} />
        <div className="flex gap-2 pt-2">
          <Button variant="primary" onClick={() => {
            onSave(account.id, {
              ...form,
              balance: parseFloat(form.balance) || 0,
              annualReturnRate: parseFloat(form.annualReturnRate) || 0,
              monthlyContribution: parseFloat(form.monthlyContribution) || 0,
            })
            onClose()
          }}>Save</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" className="ml-auto" onClick={handleDelete}>Delete</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function InvestmentAccountPage() {
  const { accountId } = useParams()
  const { accounts, loading: aLoading, updateAccount, removeAccount } = useInvestmentAccounts()
  const { scenarios, loading: sLoading, addScenario, removeScenario } = useForecastScenarios(accountId)
  const { settings } = useSettings()
  const [showEdit, setShowEdit] = useState(false)

  if (aLoading || sLoading) {
    return <div className="flex items-center justify-center h-full p-20"><Spinner size="lg" /></div>
  }

  const account = accounts.find((a) => a.id === accountId)
  if (!account) return <div className="p-8 text-warmGray">Account not found.</div>

  const allocatedIncome = getAllocationForAccount(settings?.monthlyIncome || 0, settings?.distribution || [], accountId)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="page-title">{account.name}</h1>
            <Badge type={account.accountType} />
          </div>
          {account.institution && (
            <p className="text-warmGray text-sm">{account.institution}</p>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>Edit</Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="section-title mb-1">Balance</p>
          <p className="text-2xl font-semibold text-[#3D3530] tabular-nums">{formatCurrency(account.balance)}</p>
        </Card>
        <Card className="text-center">
          <p className="section-title mb-1">Monthly Contribution</p>
          <p className="text-2xl font-semibold text-sage tabular-nums">{formatCurrency(account.monthlyContribution)}</p>
        </Card>
        <Card className="text-center">
          <p className="section-title mb-1">Annual Return</p>
          <p className="text-2xl font-semibold text-amber tabular-nums">{account.annualReturnRate}%</p>
        </Card>
        <Card className="text-center">
          <p className="section-title mb-1">Allocated Income</p>
          <p className="text-2xl font-semibold text-terracotta tabular-nums">{formatCurrency(allocatedIncome)}/mo</p>
        </Card>
      </div>

      {/* Forecast */}
      <ForecastSection
        account={account}
        scenarios={scenarios}
        onAddScenario={addScenario}
        onRemoveScenario={removeScenario}
      />

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
