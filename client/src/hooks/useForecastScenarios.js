import { useState, useEffect, useCallback } from 'react'
import { getForecastScenarios, createForecastScenario, deleteForecastScenario } from '../api/client'

const SCENARIO_COLORS = ['#C27B5A', '#7A8C6E', '#D4A843', '#9B9189', '#B85C5C', '#6B8CAE']

export function useForecastScenarios(accountId) {
  const [scenarios, setScenarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!accountId) return
    try {
      setLoading(true)
      setScenarios(await getForecastScenarios(accountId))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [accountId])

  useEffect(() => { refetch() }, [refetch])

  const addScenario = async (data) => {
    const id = crypto.randomUUID()
    const color = SCENARIO_COLORS[scenarios.length % SCENARIO_COLORS.length]
    const created = await createForecastScenario({ ...data, id, accountId, color })
    setScenarios((prev) => [...prev, created])
    return created
  }

  const removeScenario = async (id) => {
    await deleteForecastScenario(id)
    setScenarios((prev) => prev.filter((s) => s.id !== id))
  }

  return { scenarios, loading, error, addScenario, removeScenario, refetch }
}
