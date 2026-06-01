import { useState, useEffect } from 'react'
import { useTellerEnrollments } from '../hooks/useTellerEnrollments'
import { useCheckingAccounts, useInvestmentAccounts } from '../hooks/useAccounts'
import { useCreditAccounts } from '../hooks/useCreditAccounts'
import { discoverTellerAccounts } from '../api/client'
import { formatCurrency } from '../utils/formatCurrency'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'

const TELLER_APP_ID = 'app_psvuifs6ve8hk0g1cs000'

const TYPE_LABEL = { depository: 'Checking', credit: 'Credit Card', investment: 'Investment' }
const SUBTYPE_LABEL = { checking: 'Checking', savings: 'Savings', credit_card: 'Credit Card', brokerage: 'Brokerage' }

function AddTokenModal({ onClose, onDiscover }) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token.trim()) return
    setLoading(true)
    setError(null)
    try {
      const accounts = await discoverTellerAccounts(token.trim())
      if (!Array.isArray(accounts)) throw new Error(typeof accounts?.error === 'string' ? accounts.error : JSON.stringify(accounts))
      onDiscover(token.trim(), accounts)
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Add via Access Token" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-warmGray">Paste a Teller access token to discover and link accounts.</p>
        <Input
          label="Access Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="token_..."
          required
        />
        {error && <p className="text-xs text-danger bg-danger/10 rounded-btn px-3 py-1.5">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Discovering…' : 'Discover Accounts'}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

function MappingModal({ accessToken, discoveredAccounts, checkingAccounts, investmentAccounts, creditAccounts, existingTellerIds, onSave, onClose }) {
  const [mappings, setMappings] = useState(() =>
    Object.fromEntries(
      discoveredAccounts.map((a) => [
        a.id,
        {
          skip: existingTellerIds.has(a.id),
          appAccountId: '',
          createNew: a.type === 'credit',
          newName: a.name,
        },
      ])
    )
  )
  const [saving, setSaving] = useState(false)

  const set = (tellerAccountId, patch) =>
    setMappings((prev) => ({ ...prev, [tellerAccountId]: { ...prev[tellerAccountId], ...patch } }))

  const handleSave = async () => {
    setSaving(true)
    await onSave(accessToken, discoveredAccounts, mappings)
    onClose()
  }

  return (
    <Modal title="Map Accounts" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-warmGray">Choose how to link each discovered account.</p>
        {discoveredAccounts.map((a) => {
          const m = mappings[a.id]
          const already = existingTellerIds.has(a.id)
          return (
            <div key={a.id} className="rounded-card border border-taupe/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#3D3530] text-sm">{a.name}</p>
                  <p className="text-xs text-warmGray">{a.institution.name} · {SUBTYPE_LABEL[a.subtype] ?? a.subtype} · ···· {a.last_four}</p>
                </div>
                {already && <span className="text-xs text-sage font-semibold">Already linked</span>}
              </div>

              {!already && (
                <>
                  {a.type === 'depository' && (
                    <div>
                      <label className="label">Link to checking account</label>
                      <select className="input-field" value={m.appAccountId} onChange={(e) => set(a.id, { appAccountId: e.target.value, createNew: false })}>
                        <option value="">Skip</option>
                        {checkingAccounts.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({formatCurrency(c.balance)})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {a.type === 'investment' && (
                    <div>
                      <label className="label">Link to investment account</label>
                      <select className="input-field" value={m.appAccountId} onChange={(e) => set(a.id, { appAccountId: e.target.value, createNew: false })}>
                        <option value="">Skip</option>
                        {investmentAccounts.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({formatCurrency(c.balance)})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {a.type === 'credit' && (
                    <div className="space-y-2">
                      <label className="label">Credit card name</label>
                      <Input
                        value={m.newName}
                        onChange={(e) => set(a.id, { newName: e.target.value })}
                        placeholder="e.g. Freedom Unlimited"
                      />
                      <p className="text-xs text-warmGray">A new credit account will be created.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
        <div className="flex gap-2 pt-1">
          <Button variant="primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Save'}</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function ConnectPage() {
  const { enrollments, loading, addEnrollment, removeEnrollment } = useTellerEnrollments()
  const { accounts: checkingAccounts } = useCheckingAccounts()
  const { accounts: investmentAccounts } = useInvestmentAccounts()
  const { accounts: creditAccounts, addAccount: addCreditAccount } = useCreditAccounts()

  const [showAddToken, setShowAddToken] = useState(false)
  const [pendingDiscovery, setPendingDiscovery] = useState(null) // { accessToken, accounts }
  const [removing, setRemoving] = useState(null)

  // Load Teller Connect script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.teller.io/connect/connect.js'
    script.async = true
    document.body.appendChild(script)
    return () => { if (document.body.contains(script)) document.body.removeChild(script) }
  }, [])

  const handleTellerConnect = () => {
    const connect = window.TellerConnect?.setup({
      applicationId: TELLER_APP_ID,
      products: ['balance', 'transactions', 'identity'],
      onSuccess: async (enrollment) => {
        try {
          const accounts = await discoverTellerAccounts(enrollment.accessToken)
          if (Array.isArray(accounts)) {
            setPendingDiscovery({ accessToken: enrollment.accessToken, accounts })
          }
        } catch (e) {
          alert('Failed to discover accounts: ' + e.message)
        }
      },
      onFailure: (err) => alert('Connection failed: ' + JSON.stringify(err)),
      onExit: () => {},
    })
    connect?.open()
  }

  const handleSaveMappings = async (accessToken, discoveredAccounts, mappings) => {
    for (const a of discoveredAccounts) {
      const m = mappings[a.id]
      if (!m || existingTellerIds.has(a.id)) continue

      let appAccountId = m.appAccountId
      let appAccountType = a.type === 'depository' ? 'checking' : a.type === 'credit' ? 'credit' : 'investment'

      if (a.type === 'credit' && m.newName) {
        const created = await addCreditAccount({
          id: crypto.randomUUID(),
          name: m.newName,
          balance: 0,
          lastFour: a.last_four,
          institution: a.institution.name,
        })
        appAccountId = created.id
      }

      if (!appAccountId) continue

      await addEnrollment({
        access_token: accessToken,
        enrollment_id: a.enrollment_id,
        teller_account_id: a.id,
        institution: a.institution.name,
        account_name: a.name,
        app_account_id: appAccountId,
        app_account_type: appAccountType,
      })
    }
    setPendingDiscovery(null)
  }

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this connection? Balance syncing will stop.')) return
    setRemoving(id)
    await removeEnrollment(id)
    setRemoving(null)
  }

  const existingTellerIds = new Set(enrollments.map((e) => e.teller_account_id))

  const getAppAccountName = (e) => {
    const all = [...checkingAccounts, ...investmentAccounts, ...creditAccounts]
    return all.find((a) => a.id === e.app_account_id)?.name ?? '—'
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Connected Accounts</h1>
          <p className="text-warmGray text-sm mt-1">Manage your Teller bank connections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowAddToken(true)}>+ Add via Token</Button>
          <Button variant="primary" size="sm" onClick={handleTellerConnect}>+ Connect Bank</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : enrollments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-warmGray text-sm">No connected accounts yet.</p>
          <p className="text-warmGray text-xs mt-1">Add your Chase token or connect a new bank above.</p>
        </Card>
      ) : (
        <Card>
          <div className="rounded-card border border-taupe/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-dark border-b border-taupe/40">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Bank Account</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Linked To</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Last Synced</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-taupe/20">
                {enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-cream transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#3D3530]">{e.account_name}</p>
                      <p className="text-xs text-warmGray">{e.institution}</p>
                    </td>
                    <td className="px-4 py-3 text-[#3D3530]">{getAppAccountName(e)}</td>
                    <td className="px-4 py-3 text-xs text-warmGray">
                      {e.last_synced_at
                        ? new Date(e.last_synced_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemove(e.id)}
                        disabled={removing === e.id}
                        className="text-xs text-warmGray hover:text-danger transition-colors"
                      >
                        {removing === e.id ? 'Removing…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showAddToken && (
        <AddTokenModal
          onClose={() => setShowAddToken(false)}
          onDiscover={(token, accounts) => setPendingDiscovery({ accessToken: token, accounts })}
        />
      )}

      {pendingDiscovery && (
        <MappingModal
          accessToken={pendingDiscovery.accessToken}
          discoveredAccounts={pendingDiscovery.accounts}
          checkingAccounts={checkingAccounts}
          investmentAccounts={investmentAccounts}
          creditAccounts={creditAccounts}
          existingTellerIds={existingTellerIds}
          onSave={handleSaveMappings}
          onClose={() => setPendingDiscovery(null)}
        />
      )}
    </div>
  )
}
