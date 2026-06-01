import { useState, useEffect, useCallback } from 'react'
import { getPlaidTransactions } from '../api/client'

export function usePlaidTransactions(appAccountId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!appAccountId) return
    try {
      setLoading(true)
      setTransactions(await getPlaidTransactions(appAccountId))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [appAccountId])

  useEffect(() => { refetch() }, [refetch])

  return { transactions, loading, error, refetch }
}
