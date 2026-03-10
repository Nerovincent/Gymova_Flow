"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Loader2, CheckCircle, XCircle, FileText } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/components/auth/AuthProvider"
import type { BookingStatus } from "@/types/booking"

type SessionRow = {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  status: BookingStatus
  goal_note: string | null
  client_id: string
  clientName: string
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  date.setHours(0, 0, 0, 0)

  if (date.getTime() === today.getTime()) return "Today"
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatTime(startTime: string, endTime: string): string {
  const toDisplay = (t: string) => {
    const [h, m] = t.split(":").map(Number)
    const period = h >= 12 ? "PM" : "AM"
    const displayH = h % 12 === 0 ? 12 : h % 12
    return `${displayH}:${String(m).padStart(2, "0")} ${period}`
  }
  return `${toDisplay(startTime)} - ${toDisplay(endTime)}`
}

export default function TrainerSessionsPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchSessions = async () => {
      setLoading(true)
      setError(null)

      const { data: trainerData, error: trainerError } = await supabase
        .from("trainers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (trainerError) {
        setError("Could not load trainer profile.")
        setLoading(false)
        return
      }

      if (!trainerData) {
        setLoading(false)
        return
      }

      const { data: bookingsData, error: fetchError } = await supabase
        .from("bookings")
        .select("id, booking_date, start_time, end_time, status, goal_note, client_id")
        .eq("trainer_id", (trainerData as { id: number }).id)
        .order("booking_date", { ascending: true })

      if (fetchError) {
        setError("Failed to load sessions. Please try again.")
        setLoading(false)
        return
      }

      const bookings = bookingsData ?? []
      const clientIds = [...new Set(bookings.map((b) => b.client_id as string))]

      let profileMap: Record<string, string> = {}
      if (clientIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", clientIds)

        profileMap = Object.fromEntries(
          (profilesData ?? []).map((p) => [
            p.id as string,
            (p.full_name as string | null) ?? "Client",
          ])
        )
      }

      setLoading(false)

      setSessions(
        bookings.map((b) => ({
          ...(b as {
            id: string
            booking_date: string
            start_time: string
            end_time: string
            status: BookingStatus
            goal_note: string | null
            client_id: string
          }),
          clientName: profileMap[b.client_id as string] ?? "Client",
        }))
      )
    }

    fetchSessions()
  }, [user])

  const updateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdating(bookingId)

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId)

    setUpdating(null)

    if (updateError) {
      setError(`Failed to update booking status: ${updateError.message}`)
      return
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === bookingId ? { ...s, status: newStatus } : s))
    )
  }

  const upcomingSessions = sessions.filter((s) =>
    ["pending", "confirmed"].includes(s.status)
  )
  const pastSessions = sessions.filter((s) =>
    ["completed", "cancelled"].includes(s.status)
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sessions</h1>
          <p className="text-muted-foreground">Your upcoming and past sessions with clients.</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sessions</h1>
        <p className="text-muted-foreground">Your upcoming and past sessions with clients.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Upcoming</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <p className="text-muted-foreground py-4">No upcoming sessions.</p>
          ) : (
            upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/50 border border-border sm:flex-row sm:items-start"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="font-medium text-card-foreground">
                    {session.clientName}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(session.booking_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(session.start_time, session.end_time)}
                    </span>
                  </div>
                  {session.goal_note && (
                    <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{session.goal_note}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      session.status === "confirmed"
                        ? "bg-primary/20 text-primary"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                  {session.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-8"
                        disabled={updating === session.id}
                        onClick={() => updateStatus(session.id, "confirmed")}
                      >
                        {updating === session.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10 h-8"
                        disabled={updating === session.id}
                        onClick={() => updateStatus(session.id, "cancelled")}
                      >
                        {updating === session.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Decline
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  {session.status === "confirmed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10 h-8"
                      disabled={updating === session.id}
                      onClick={() => updateStatus(session.id, "cancelled")}
                    >
                      {updating === session.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Cancel
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {pastSessions.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Past</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pastSessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/50 border border-border sm:flex-row sm:items-center"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground">
                    {session.clientName}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(session.booking_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(session.start_time, session.end_time)}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground self-start sm:self-auto">
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
