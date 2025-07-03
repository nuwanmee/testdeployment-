// lib/hooks/useSyncProfiles.ts
import { useEffect } from 'react'
import { debounce } from 'lodash'
import useProfileStore from '@/store/profileStore'

// Debounced sync function (300ms wait)
const debouncedSyncToDB = debounce(async (profiles) => {
  try {
    await fetch('/api/profiles/sync', {
      method: 'POST',
      body: JSON.stringify({ profiles })
    })
  } catch (error) {
    console.error('Sync failed:', error)
    // Implement retry logic or error notification
  }
}, 300)

export function useSyncProfiles() {
  const { initializeStore } = useProfileStore()
  
  useEffect(() => {
    // 1. Initial data fetch
    const loadInitialData = async () => {
      try {
        const res = await fetch('/api/profiles')
        const data = await res.json()
        initializeStore(data)
      } catch (error) {
        console.error('Initial load failed:', error)
      }
    }

    loadInitialData()

    // 2. Subscribe to changes
    const unsub = useProfileStore.subscribe(
      (state) => state.profiles,
      (profiles) => {
        if (profiles.length > 0) {
          debouncedSyncToDB(profiles)
        }
      }
    )

    // 3. Cleanup
    return () => {
      unsub()
      debouncedSyncToDB.cancel()
    }
  }, [initializeStore])
}