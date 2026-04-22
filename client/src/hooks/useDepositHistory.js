import { useState, useEffect, useCallback } from 'react'
import { getDepositHistory, createDeposit } from '../api/client'

export function useDepositHistory() {
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setDeposits(await getDepositHistory())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const addDeposit = async (data) => {
    const created = await createDeposit({
      ...data,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    })
    setDeposits((prev) => [created, ...prev])
    return created
  }

  return { deposits, loading, error, addDeposit, refetch }
}
