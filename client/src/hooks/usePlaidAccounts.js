import { useState, useEffect, useCallback } from 'react'
import { getPlaidAccounts, deletePlaidItem } from '../api/client'

export function usePlaidAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setAccounts(await getPlaidAccounts())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const removeItem = async (plaidItemDbId) => {
    await deletePlaidItem(plaidItemDbId)
    setAccounts((prev) => prev.filter((a) => a.plaid_items?.id !== plaidItemDbId))
  }

  return { accounts, loading, refetch, removeItem }
}
