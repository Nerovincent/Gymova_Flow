"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  MessageCircle,
  Star,
  User,
  UserCircle,
} from "lucide-react"

import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTrainerByUserId } from "@/lib/supabase/trainers"
import { getTrainerBookings } from "@/lib/supabase/bookings"
import { supabase } from "@/lib/supabaseClient"
import { getIsApprovedTrainer } from "@/lib/trainerAuth"
import type { Booking } from "@/types/booking"

export default function TrainerDashboardPage() {
  const { user, session, loading } = useAuth()
  const router = useRouter()

  const [trainerChecked, setTrainerChecked] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [trainerPrice, setTrainerPrice] = useState<number>(0)

  useEffect(() => {
    if (loading) return

    if (!session?.user) {
      router.replace("/login")
      return
    }

    getIsApprovedTrainer(session.user.id).then((isTrainer) => {
      setTrainerChecked(true)
      if (!isTrainer) {
        router.replace("/dashboard")
      }
    })
  }, [loading, router, session])

  useEffect(() => {
    if (!user) return

    getTrainerByUserId(user.id).then(async ({ data: trainerRow }) => {
      if (!trainerRow) {
        setLoadingBookings(false)
        return
      }

      const { data } = await getTrainerBookings(trainerRow.id)
      setBookings(data)
      setLoadingBookings(false)
    })
  }, [user])

  useEffect(() => {
    if (!user) return

    supabase
      .from("trainers")
      .select("price")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data && typeof (data as { price?: number }).price === "number") {
          setTrainerPrice((data as { price: number }).price)
        }
      })
  }, [user])

  if (loading || !trainerChecked || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground">Loading trainer dashboard...</span>
      </div>
    )
  }

  const displayName =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
    user?.email?.split("@")[0] ||
    "Trainer"

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const sessionsThisWeek = bookings.filter(
    (booking) =>
      (booking.status === "confirmed" || booking.status === "completed") &&
      new Date(booking.booking_date + "T00:00:00") >= weekStart
  ).length

  const uniqueClients = new Set(bookings.map((booking) => booking.client_id)).size

  const monthlyEarnings =
    bookings.filter(
      (booking) =>
        booking.status === "completed" &&
        new Date(booking.booking_date + "T00:00:00") >= monthStart
    ).length * trainerPrice

  const stats = [
    {
      label: "Sessions This Week",
      value: loadingBookings ? "-" : String(sessionsThisWeek),
      icon: Calendar,
      change:
        loadingBookings
          ? ""
          : sessionsThisWeek > 0
            ? `${sessionsThisWeek} sessions`
            : "No sessions yet",
    },
    {
      label: "Total Clients",
      value: loadingBookings ? "-" : String(uniqueClients),
      icon: User,
      change: "Active",
    },
    {
      label: "Earnings (Month)",
      value: loadingBookings ? "-" : trainerPrice > 0 ? `$${monthlyEarnings.toLocaleString()}` : "-",
      icon: DollarSign,
      change:
        loadingBookings
          ? ""
          : monthlyEarnings > 0
            ? "This month"
            : trainerPrice === 0
              ? "Set your price"
              : "No completed sessions",
    },
  ]

  const upcomingSessions = bookings
    .filter(
      (booking) =>
        (booking.status === "confirmed" || booking.status === "pending") &&
        new Date(booking.booking_date + "T00:00:00") >= new Date(now.toDateString())
    )
    .sort((a, b) => a.booking_date.localeCompare(b.booking_date))
    .slice(0, 3)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00")
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (d.toDateString() === today.toDateString()) return "Today"
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow"

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {displayName}. Here is your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-card-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-primary mt-1">{stat.change}</p>
                </div>

                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-card-foreground">Upcoming Sessions</CardTitle>
              <Link href="/trainer/sessions">
                <Button variant="ghost" size="sm" className="text-primary">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="space-y-4">
              {loadingBookings ? (
                <p className="text-sm text-muted-foreground py-4">Loading sessions...</p>
              ) : upcomingSessions.length === 0 ? (
                <p className="text-muted-foreground py-4">
                  No upcoming sessions. Set your availability so clients can book you.
                </p>
              ) : (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground">Client</p>
                      <p className="text-sm text-muted-foreground">{session.goal_note ?? "Session booked"}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-card-foreground">{formatDate(session.booking_date)}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {session.start_time.slice(0, 5)}
                      </div>
                    </div>

                    <span
                      className={`hidden sm:inline px-2 py-1 text-xs font-medium rounded-full ${
                        session.status === "confirmed"
                          ? "bg-primary/20 text-primary"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/trainer/availability" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-secondary"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Set my availability
                </Button>
              </Link>

              <Link href="/trainers" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-secondary"
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  View my public profile
                </Button>
              </Link>

              <Link href="/messages" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-secondary"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>

              <Link href="/trainer/sessions" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-secondary"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  My sessions
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Star className="w-5 h-5 text-primary" />
                Your impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep your availability up to date so clients can find and book you. You can log when
                you are available from the availability page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
