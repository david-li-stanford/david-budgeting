import { useState, useEffect, useCallback } from 'react'
import { getSettings, patchSettings } from '../api/client'

export function useSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getSettings()
      setSettings(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const updateSettings = async (data) => {
    const updated = await patchSettings(data)
    setSettings(updated)
    return updated
  }

  return { settings, loading, error, updateSettings, refetch: fetch }
}
