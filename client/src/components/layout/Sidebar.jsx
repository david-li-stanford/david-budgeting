import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import clsx from 'clsx'
import { useCheckingAccounts, useInvestmentAccounts } from '../../hooks/useAccounts'
import { useCreditAccounts } from '../../hooks/useCreditAccounts'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { formatCurrency } from '../../utils/formatCurrency'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-2.5 px-3 py-2 rounded-btn text-sm font-medium transition-colors duration-150',
          isActive
            ? 'bg-terracotta/10 text-terracotta'
            : 'text-warmGray hover:text-[#3D3530] hover:bg-cream-dark'
        )
      }
    >
      {children}
    </NavLink>
  )
}

function AddAccountModal({ type, onClose, onAdd }) {
  const isChecking = type === 'checking'
  const [form, setForm] = useState({
    name: '',
    institution: '',
    balance: '',
    ...(isChecking ? {} : { accountType: 'savings', annualReturnRate: '5', monthlyContribution: '0' }),
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({
      ...form,
      balance: parseFloat(form.balance) || 0,
      ...(isChecking ? {} : {
        annualReturnRate: parseFloat(form.annualReturnRate) || 0,
        monthlyContribution: parseFloat(form.monthlyContribution) || 0,
      }),
    })
    onClose()
  }

  return (
    <Modal title={`New ${isChecking ? 'Checking' : 'Investment'} Account`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Account Name" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="e.g. Primary Checking" />
        <Input label="Institution" value={form.institution} onChange={(e) => set('institution', e.target.value)} placeholder="e.g. Chase" />
        <Input label="Current Balance" prefix="$" type="number" step="0.01" min="0" value={form.balance} onChange={(e) => set('balance', e.target.value)} placeholder="0.00" />
        {!isChecking && (
          <>
            <div>
              <label className="label">Account Type</label>
              <select className="input-field" value={form.accountType} onChange={(e) => set('accountType', e.target.value)}>
                <option value="savings">Savings</option>
                <option value="brokerage">Brokerage</option>
                <option value="retirement">Retirement</option>
                <option value="cd">CD</option>
              </select>
            </div>
            <Input label="Annual Return Rate" suffix="%" type="number" step="0.1" min="0" value={form.annualReturnRate} onChange={(e) => set('annualReturnRate', e.target.value)} />
            <Input label="Monthly Contribution" prefix="$" type="number" step="0.01" min="0" value={form.monthlyContribution} onChange={(e) => set('monthlyContribution', e.target.value)} />
          </>
        )}
        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="primary">Create Account</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { accounts: checking, addAccount: addChecking } = useCheckingAccounts()
  const { accounts: investment, addAccount: addInvestment } = useInvestmentAccounts()
  const { accounts: credit } = useCreditAccounts()
  const [modal, setModal] = useState(null) // 'checking' | 'investment' | null

  const handleAdd = async (type, data) => {
    if (type === 'checking') {
      const created = await addChecking(data)
      navigate(`/checking/${created.id}`)
    } else {
      const created = await addInvestment(data)
      navigate(`/investment/${created.id}`)
    }
  }

  return (
    <>
      <aside className="w-60 shrink-0 bg-white border-r border-taupe/40 flex flex-col h-screen sticky top-0 overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-taupe/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-terracotta flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-[#3D3530] text-sm">Budget</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5">
          {/* Overview */}
          <div>
            <NavItem to="/dashboard">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </NavItem>
          </div>

          {/* Checking Accounts */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="section-title text-[10px]">Checking</span>
              <button
                onClick={() => setModal('checking')}
                className="text-warmGray hover:text-terracotta transition-colors p-0.5 rounded"
                title="Add checking account"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="space-y-0.5">
              {checking.map((a) => (
                <NavLink
                  key={a.id}
                  to={`/checking/${a.id}`}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center justify-between px-3 py-2 rounded-btn text-sm transition-colors duration-150',
                      isActive
                        ? 'bg-terracotta/10 text-terracotta font-medium'
                        : 'text-warmGray hover:text-[#3D3530] hover:bg-cream-dark'
                    )
                  }
                >
                  <span className="truncate">{a.name}</span>
                  <span className="text-xs shrink-0 ml-2 opacity-70">{formatCurrency(a.balance).replace('$', '$').split('.')[0]}</span>
                </NavLink>
              ))}
              {checking.length === 0 && (
                <p className="px-3 py-1 text-xs text-warmGray/60 italic">No accounts yet</p>
              )}
            </div>
          </div>

          {/* Credit Cards */}
          {credit.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="section-title text-[10px]">Credit Cards</span>
              </div>
              <div className="space-y-0.5">
                {credit.map((a) => (
                  <NavLink
                    key={a.id}
                    to={`/credit/${a.id}`}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center justify-between px-3 py-2 rounded-btn text-sm transition-colors duration-150',
                        isActive
                          ? 'bg-terracotta/10 text-terracotta font-medium'
                          : 'text-warmGray hover:text-[#3D3530] hover:bg-cream-dark'
                      )
                    }
                  >
                    <span className="truncate">{a.name}</span>
                    <span className="text-xs shrink-0 ml-2 text-danger opacity-80">{formatCurrency(a.balance).replace('$', '$').split('.')[0]}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* Investment Accounts */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="section-title text-[10px]">Investments</span>
              <button
                onClick={() => setModal('investment')}
                className="text-warmGray hover:text-terracotta transition-colors p-0.5 rounded"
                title="Add investment account"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="space-y-0.5">
              {investment.map((a) => (
                <NavLink
                  key={a.id}
                  to={`/investment/${a.id}`}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center justify-between px-3 py-2 rounded-btn text-sm transition-colors duration-150',
                      isActive
                        ? 'bg-terracotta/10 text-terracotta font-medium'
                        : 'text-warmGray hover:text-[#3D3530] hover:bg-cream-dark'
                    )
                  }
                >
                  <span className="truncate">{a.name}</span>
                  <Badge type={a.accountType} className="shrink-0 ml-1 text-[10px] py-0 px-1.5" />
                </NavLink>
              ))}
              {investment.length === 0 && (
                <p className="px-3 py-1 text-xs text-warmGray/60 italic">No accounts yet</p>
              )}
            </div>
          </div>

          {/* Connect */}
          <div>
            <NavItem to="/connect">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Connect Accounts
            </NavItem>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-taupe/30 flex items-center justify-between">
          <span className="text-xs text-warmGray/50">David's Budget</span>
          <button
            onClick={signOut}
            className="text-xs text-warmGray hover:text-danger transition-colors"
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      </aside>

      {modal && (
        <AddAccountModal
          type={modal}
          onClose={() => setModal(null)}
          onAdd={(data) => handleAdd(modal, data)}
        />
      )}
    </>
  )
}
