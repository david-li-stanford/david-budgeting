import { useState, useEffect, useCallback } from 'react'
import { getTransfers, createTransfer, deleteTransfer } from '../api/client'

export function useTransfers() {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setTransfers(await getTransfers())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const addTransfer = async (data) => {
    const created = await createTransfer({
      ...data,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    })
    setTransfers((prev) => [created, ...prev])
    return created
  }

  const removeTransfer = async (id) => {
    await deleteTransfer(id)
    setTransfers((prev) => prev.filter((t) => t.id !== id))
  }

  return { transfers, loading, error, addTransfer, removeTransfer, refetch }
}
