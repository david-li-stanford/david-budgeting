import { useState, useEffect, useCallback, Fragment } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { usePlaidAccounts } from '../hooks/usePlaidAccounts'
import { useCheckingAccounts, useInvestmentAccounts } from '../hooks/useAccounts'
import { useCreditAccounts } from '../hooks/useCreditAccounts'
import { createPlaidLinkToken, exchangePlaidToken } from '../api/client'
import { formatCurrency } from '../utils/formatCurrency'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'

function PlaidMappingModal({ pendingExchange, checkingAccounts, investmentAccounts, creditAccounts, onSave, onClose }) {
  const [mappings, setMappings] = useState(() =>
    Object.fromEntries(
      pendingExchange.accounts.map((a) => [
        a.id,
        {
          appAccountId: '',
          createNew: a.type === 'credit',
          newName: a.name,
          skip: false,
        },
      ])
    )
  )
  const [saving, setSaving] = useState(false)

  const set = (accountId, patch) =>
    setMappings((prev) => ({ ...prev, [accountId]: { ...prev[accountId], ...patch } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(pendingExchange, mappings)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Map Accounts" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-warmGray">Choose how to link each discovered account.</p>
        {pendingExchange.accounts.map((a) => {
          const m = mappings[a.id]
          return (
            <div key={a.id} className="rounded-card border border-taupe/40 p-4 space-y-3">
              <div>
                <p className="font-medium text-[#3D3530] text-sm">{a.name}</p>
                <p className="text-xs text-warmGray">
                  {a.subtype && `${a.subtype} · `}
                  {a.mask && `···· ${a.mask}`}
                </p>
              </div>

              {a.type === 'depository' && (
                <div>
                  <label className="label">Link to checking account</label>
                  <select
                    className="input-field"
                    value={m.appAccountId}
                    onChange={(e) => set(a.id, { appAccountId: e.target.value, skip: !e.target.value })}
                  >
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
                  <select
                    className="input-field"
                    value={m.appAccountId}
                    onChange={(e) => set(a.id, { appAccountId: e.target.value, skip: !e.target.value })}
                  >
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
                    onChange={(e) => set(a.id, { newName: e.target.value, skip: !e.target.value })}
                    placeholder="e.g. Freedom Unlimited"
                  />
                  <p className="text-xs text-warmGray">A new credit account will be created with this name.</p>
                </div>
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
  const { accounts, loading, refetch, removeItem } = usePlaidAccounts()
  const { accounts: checkingAccounts } = useCheckingAccounts()
  const { accounts: investmentAccounts } = useInvestmentAccounts()
  const { accounts: creditAccounts, addAccount: addCreditAccount } = useCreditAccounts()

  const [linkToken, setLinkToken] = useState(null)
  const [pendingExchange, setPendingExchange] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [tokenError, setTokenError] = useState(null)

  // Fetch link token on mount
  useEffect(() => {
    createPlaidLinkToken()
      .then(setLinkToken)
      .catch((e) => setTokenError(e.message))
  }, [])

  const onSuccess = useCallback((publicToken, metadata) => {
    setPendingExchange({
      publicToken,
      institution: metadata.institution,
      accounts: metadata.accounts,
    })
  }, [])

  const onExit = useCallback(() => {}, [])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit,
  })

  const handleSaveMappings = async (exchange, mappings) => {
    const accountsToSave = []

    for (const account of exchange.accounts) {
      const m = mappings[account.id]
      if (!m || m.skip) continue

      let appAccountId = m.appAccountId
      let appAccountType

      if (account.type === 'depository') {
        appAccountType = 'checking'
        if (!appAccountId) continue
      } else if (account.type === 'investment') {
        appAccountType = 'investment'
        if (!appAccountId) continue
      } else if (account.type === 'credit') {
        appAccountType = 'credit'
        if (!m.newName) continue
        const created = await addCreditAccount({
          id: crypto.randomUUID(),
          name: m.newName,
          balance: 0,
          lastFour: account.mask,
          institution: exchange.institution.name,
        })
        appAccountId = created.id
      } else {
        continue
      }

      accountsToSave.push({
        plaid_account_id: account.id,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        mask: account.mask,
        app_account_id: appAccountId,
        app_account_type: appAccountType,
      })
    }

    await exchangePlaidToken(exchange.publicToken, exchange.institution, accountsToSave)
    await refetch()
  }

  const handleDisconnect = async (plaidItemDbId) => {
    if (!window.confirm('Disconnect this institution? Balance and transaction syncing will stop.')) return
    setRemoving(plaidItemDbId)
    await removeItem(plaidItemDbId)
    setRemoving(null)
  }

  // Group accounts by plaid_items.id
  const grouped = accounts.reduce((acc, a) => {
    const itemId = a.plaid_items?.id
    if (!itemId) return acc
    if (!acc[itemId]) acc[itemId] = { item: a.plaid_items, accounts: [] }
    acc[itemId].accounts.push(a)
    return acc
  }, {})

  const getAppAccountName = (appAccountId) => {
    const all = [...checkingAccounts, ...investmentAccounts, ...creditAccounts]
    return all.find((a) => a.id === appAccountId)?.name ?? '—'
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Connected Accounts</h1>
          <p className="text-warmGray text-sm mt-1">Manage your Plaid bank connections</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => open()}
          disabled={!ready || !linkToken}
        >
          + Connect Bank
        </Button>
      </div>

      {tokenError && (
        <p className="text-xs text-danger bg-danger/10 rounded-btn px-3 py-1.5">{tokenError}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-warmGray text-sm">No connected accounts yet.</p>
          <p className="text-warmGray text-xs mt-1">Click "Connect Bank" to link your bank.</p>
        </Card>
      ) : (
        <Card>
          <div className="rounded-card border border-taupe/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-dark border-b border-taupe/40">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Bank Account</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider">Linked To</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-taupe/20">
                {Object.values(grouped).map(({ item, accounts: itemAccounts }) => (
                  <Fragment key={item.id}>
                    <tr className="bg-cream-dark/60">
                      <td colSpan={2} className="px-4 py-2">
                        <span className="font-semibold text-[#3D3530] text-sm">{item.institution_name}</span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleDisconnect(item.id)}
                          disabled={removing === item.id}
                          className="text-xs text-warmGray hover:text-danger transition-colors"
                        >
                          {removing === item.id ? 'Disconnecting…' : 'Disconnect'}
                        </button>
                      </td>
                    </tr>
                    {itemAccounts.map((a) => (
                      <tr key={a.id} className="hover:bg-cream transition-colors">
                        <td className="px-4 py-3 pl-8">
                          <p className="font-medium text-[#3D3530]">{a.name}</p>
                          <p className="text-xs text-warmGray">
                            {a.subtype && `${a.subtype}`}
                            {a.mask && ` · ···· ${a.mask}`}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-[#3D3530]">{getAppAccountName(a.app_account_id)}</td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {pendingExchange && (
        <PlaidMappingModal
          pendingExchange={pendingExchange}
          checkingAccounts={checkingAccounts}
          investmentAccounts={investmentAccounts}
          creditAccounts={creditAccounts}
          onSave={handleSaveMappings}
          onClose={() => setPendingExchange(null)}
        />
      )}
    </div>
  )
}
