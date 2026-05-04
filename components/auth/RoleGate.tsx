"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "@/components/auth/AuthProvider"
import {
  type AppDashboardRole,
  getDashboardRouteForProfile,
  normalizeUserRole,
} from "@/lib/rbac"

interface RoleGateProps {
  allowedRoles: AppDashboardRole[]
  requireApprovedTrainer?: boolean
  loadingMessage?: string
  children: React.ReactNode
}

export function RoleGate({
  allowedRoles,
  requireApprovedTrainer = true,
  loadingMessage = "Checking access...",
  children,
}: RoleGateProps) {
  const { session, loading, profile, profileLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [previousRole, setPreviousRole] = useState<AppDashboardRole | null>(null)

  useEffect(() => {
    if (loading || profileLoading) return

    if (!session?.user) {
      router.replace("/login")
      return
    }

    const role = normalizeUserRole(profile?.role)
    const isAllowedRole = role !== null && allowedRoles.includes(role)
    const trainerApproved =
      role !== "trainer" ||
      !requireApprovedTrainer ||
      profile?.trainer_status === "approved"

    // Detect role changes and redirect to appropriate dashboard
    if (previousRole && previousRole !== role && role) {
      const fallback = getDashboardRouteForProfile(profile)
      if (fallback !== pathname) {
        router.replace(fallback)
        return
      }
    }

    setPreviousRole(role)

    if (!isAllowedRole || !trainerApproved) {
      const fallback = getDashboardRouteForProfile(profile)
      if (fallback !== pathname) {
        router.replace(fallback)
      }
      return
    }

    setAuthorized(true)
  }, [loading, profileLoading, session, profile, pathname, router, allowedRoles, requireApprovedTrainer, previousRole])

  if (loading || profileLoading || !authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground">{loadingMessage}</span>
      </div>
    )
  }

  return <>{children}</>
}
