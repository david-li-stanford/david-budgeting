import { useState, useEffect, useCallback } from 'react'
import { getDepositHistory, createDeposit, deleteDeposit } from '../api/client'

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

  const removeDeposit = async (id) => {
    await deleteDeposit(id)
    setDeposits((prev) => prev.filter((d) => d.id !== id))
  }

  return { deposits, loading, error, addDeposit, removeDeposit, refetch }
}
