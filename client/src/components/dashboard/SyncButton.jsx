import Button from '../ui/Button'

export default function SyncButton({ onRefresh }) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-xs text-warmGray hidden sm:block">Run <code className="bg-cream-dark px-1 rounded text-[11px]">node teller/sync.js</code> to pull fresh data</p>
      <Button variant="secondary" size="sm" onClick={onRefresh}>
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </span>
      </Button>
    </div>
  )
}
