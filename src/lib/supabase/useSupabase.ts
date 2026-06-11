import { useMemo } from 'react'
import { createClient } from './client'

export function useSupabase() {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }
    return createClient()
  }, [])
}
