import { useState, useEffect, useCallback } from 'react'
import {
  getTellerEnrollments, createTellerEnrollment, patchTellerEnrollment, deleteTellerEnrollment,
} from '../api/client'

export function useTellerEnrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setEnrollments(await getTellerEnrollments())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const addEnrollment = async (data) => {
    const created = await createTellerEnrollment(data)
    setEnrollments((prev) => [...prev, created])
    return created
  }

  const updateEnrollment = async (id, data) => {
    const updated = await patchTellerEnrollment(id, data)
    setEnrollments((prev) => prev.map((e) => (e.id === id ? updated : e)))
    return updated
  }

  const removeEnrollment = async (id) => {
    await deleteTellerEnrollment(id)
    setEnrollments((prev) => prev.filter((e) => e.id !== id))
  }

  return { enrollments, loading, error, addEnrollment, updateEnrollment, removeEnrollment, refetch }
}
