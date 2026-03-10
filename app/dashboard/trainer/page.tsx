"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { getIsApprovedTrainer } from "@/lib/trainerAuth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardTrainerRedirectPage() {
  const router = useRouter()
  const { session } = useAuth()

  useEffect(() => {
    if (!session?.user?.id) return
    getIsApprovedTrainer(session.user.id).then((isTrainer) => {
      if (isTrainer) router.replace("/trainer")
    })
  }, [session?.user?.id, router])

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Redirecting to trainer dashboard...</p>
      <Link href="/trainer">
        <Button variant="outline">Go to trainer dashboard</Button>
      </Link>
    </div>
  )
}
