import { useState, useEffect, useCallback } from 'react'
import { getExpenses, createExpense, patchExpense, deleteExpense } from '../api/client'

export function useExpenses(accountId) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!accountId) return
    try {
      setLoading(true)
      setExpenses(await getExpenses(accountId))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [accountId])

  useEffect(() => { refetch() }, [refetch])

  const addExpense = async (data) => {
    const id = crypto.randomUUID()
    const created = await createExpense({
      ...data,
      id,
      accountId,
      createdAt: new Date().toISOString(),
    })
    setExpenses((prev) => [...prev, created])
    return created
  }

  const updateExpense = async (id, data) => {
    const updated = await patchExpense(id, data)
    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
    return updated
  }

  const removeExpense = async (id) => {
    await deleteExpense(id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  return { expenses, loading, error, addExpense, updateExpense, removeExpense, refetch }
}
