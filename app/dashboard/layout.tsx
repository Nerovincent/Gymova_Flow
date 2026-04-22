"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { AthleteDashboardShell } from "@/components/dashboard/AthleteDashboardShell"
import { useAuth } from "@/components/auth/AuthProvider"
import { getDashboardRouteForProfile } from "@/lib/rbac"

function getDashboardTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard/bookings")) return "My Bookings"
  if (pathname.startsWith("/dashboard/profile")) return "Profile"
  if (pathname.startsWith("/dashboard/notifications")) return "Notifications"
  if (pathname.startsWith("/dashboard/trainer")) return "Trainer Redirect"
  return "Dashboard"
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loading } = useAuth()

  // Detect role changes and redirect to appropriate dashboard
  useEffect(() => {
    if (loading) return

    const correctPath = getDashboardRouteForProfile(profile)
    if (correctPath !== "/dashboard" && correctPath !== pathname) {
      router.replace(correctPath)
    }
  }, [profile, loading, pathname, router])

  return (
    <AthleteDashboardShell title={getDashboardTitle(pathname)}>
      {children}
    </AthleteDashboardShell>
  )
}
