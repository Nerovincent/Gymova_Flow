"use client"

import { useAuth } from "./AuthProvider"

/**
 * Hook to access the user's profile including role and trainer status.
 * Returns profile data and loading state.
 * 
 * Usage:
 * const { profile, profileLoading, refetchProfile } = useProfile()
 */
export function useProfile() {
  const { profile, profileLoading, refetchProfile } = useAuth()
  return { profile, profileLoading, refetchProfile }
}
