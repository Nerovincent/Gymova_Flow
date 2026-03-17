"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/AuthProvider"
import { getTrainerAvailability, upsertTrainerAvailability, DEFAULT_AVAILABILITY } from "@/lib/supabase/availability"
import { Loader2 } from "lucide-react"

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
const DEFAULT_SLOTS: Record<string, string[]> = { ...DEFAULT_AVAILABILITY }

// ---------------------------------------------------------------------------

const TIME_OPTIONS = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
]

export default function TrainerAvailabilityPage() {
  const { session } = useAuth()
  const [availability, setAvailability] = useState<Record<string, string[]>>(DEFAULT_SLOTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return

    setLoading(true)
    getTrainerAvailability(session.user.id).then(({ data, error }) => {
      if (error) {
        setMessage({ type: "error", text: "Could not load your availability." })
      } else {
        setAvailability(data)
      }
      setLoading(false)
    })
  }, [session?.user?.id])

  const toggleSlot = (day: string, time: string) => {
    setAvailability((prev) => {
      const daySlots = prev[day] ?? []
      const has = daySlots.includes(time)
      return {
        ...prev,
        [day]: has ? daySlots.filter((t) => t !== time) : [...daySlots, time].sort(),
      }
    })
  }

  const handleSave = async () => {
    if (!session?.user?.id) return
    setSaving(true)
    setMessage(null)

    const { error } = await upsertTrainerAvailability(session.user.id, availability)
    setSaving(false)

    if (error) {
      setMessage({ type: "error", text: "Could not save availability. Please try again." })
      return
    }
    setMessage({ type: "success", text: "Availability saved." })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My availability</h1>
        <p className="text-muted-foreground">
          Select the time slots when you’re available for sessions. Clients will see these when
          booking.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === "success"
              ? "border-primary/30 bg-primary/5 text-foreground"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Weekly availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {DAYS.map((day) => (
            <div key={day} className="space-y-2">
              <h3 className="font-medium text-foreground capitalize">{day}</h3>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map((time) => {
                  const selected = (availability[day] ?? []).includes(time)
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => toggleSlot(day, time)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save availability"
        )}
      </Button>
    </div>
  )
}
