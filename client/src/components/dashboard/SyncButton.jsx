import { useState } from 'react'
import { syncTeller } from '../../api/client'
import Button from '../ui/Button'

export default function SyncButton({ onSynced }) {
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    setResults(null)
    try {
      const res = await syncTeller()
      setResults(res.synced)
      setLastSynced(new Date())
      if (onSynced) onSynced()
    } catch (e) {
      setError(e.message)
    } finally {
      setSyncing(false)
    }
  }

  const timeAgo = lastSynced
    ? lastSynced.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        {timeAgo && !syncing && (
          <span className="text-xs text-warmGray">Synced at {timeAgo}</span>
        )}
        <Button variant="secondary" size="sm" onClick={handleSync} disabled={syncing}>
          {syncing ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Syncing…
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync Accounts
            </span>
          )}
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {results && results.length > 0 && (
        <div className="text-xs text-warmGray space-y-0.5 text-right">
          {results.map((r) => (
            <p key={r.account}>
              {r.error
                ? <span className="text-danger">{r.account}: {r.error}</span>
                : <span>{r.account} → {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(r.balance)}</span>
              }
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
