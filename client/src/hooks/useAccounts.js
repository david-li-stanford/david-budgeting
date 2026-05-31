import { useState, useEffect, useCallback } from 'react'
import {
  getCheckingAccounts, createCheckingAccount, patchCheckingAccount, deleteCheckingAccount,
  getInvestmentAccounts, createInvestmentAccount, patchInvestmentAccount, deleteInvestmentAccount,
} from '../api/client'

export function makeAccountHook(getAll, create, patch, remove) {
  return function useAccountHook() {
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const refetch = useCallback(async () => {
      try {
        setLoading(true)
        setAccounts(await getAll())
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }, [])

    useEffect(() => { refetch() }, [refetch])

    const addAccount = async (data) => {
      const id = crypto.randomUUID()
      const created = await create({ ...data, id, createdAt: new Date().toISOString().split('T')[0] })
      setAccounts((prev) => [...prev, created])
      return created
    }

    const updateAccount = async (id, data) => {
      const updated = await patch(id, data)
      setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)))
      return updated
    }

    const removeAccount = async (id) => {
      await remove(id)
      setAccounts((prev) => prev.filter((a) => a.id !== id))
    }

    return { accounts, loading, error, addAccount, updateAccount, removeAccount, refetch }
  }
}

export const useCheckingAccounts = makeAccountHook(
  getCheckingAccounts, createCheckingAccount, patchCheckingAccount, deleteCheckingAccount
)

export const useInvestmentAccounts = makeAccountHook(
  getInvestmentAccounts, createInvestmentAccount, patchInvestmentAccount, deleteInvestmentAccount
)
