"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { createBooking } from "@/lib/supabase/bookings"
import { getTrainerById } from "@/lib/supabase/trainers"
import { useAuth } from "@/components/auth/AuthProvider"
import { getTrainerById } from "@/lib/supabase/trainers"
import { supabase } from "@/lib/supabaseClient"
import type { TrainerListItem } from "@/types/trainer"

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDay = firstDay.getDay()
  
  const days = []
  
  for (let i = 0; i < startingDay; i++) {
    days.push(null)
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }
  
  return days
}

function parseTimeTo24h(timeStr: string): string {
  const [time, period] = timeStr.split(" ")
  const [hours, minutes] = time.split(":")
  let h = parseInt(hours)
  if (period === "PM" && h !== 12) h += 12
  if (period === "AM" && h === 12) h = 0
  return `${String(h).padStart(2, "0")}:${minutes}:00`
}

function addOneHour(timeStr: string): string {
  const parsed = parseTimeTo24h(timeStr)
  const [h, m, s] = parsed.split(":").map(Number)
  const newH = (h + 1) % 24
  return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const trainerId = params.id as string
  const [trainer, setTrainer] = useState<TrainerListItem | null>(null)
  const [availability, setAvailability] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getTrainerById(trainerId).then(({ data }) => {
      if (data) setTrainer(data)
      setLoading(false)
    })
    // Fetch DB-driven availability: [{ day_of_week, start_time, end_time, is_active }]
    supabase
      .from("availability")
      .select("day_of_week, start_time, end_time, is_active")
      .eq("trainer_id", trainerId)
      .then(({ data }) => {
        setAvailability(data || [])
      })
  }, [trainerId])

  // Default to current month/year
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [goalNote, setGoalNote] = useState("")
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  const days = generateCalendarDays(currentYear, currentMonth)
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const formatDateKey = (day: number) => {
    const month = String(currentMonth + 1).padStart(2, "0")
    const dayStr = String(day).padStart(2, "0")
    return `${currentYear}-${month}-${dayStr}`
  }

  // Generate available slots for the next 30 days based on DB-driven weekly schedule
  function formatTime(time: string) {
    // Assumes time is in HH:MM:SS, returns e.g. "9:00 AM"
    const [h, m] = time.split(":")
    const hour = parseInt(h)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 === 0 ? 12 : hour % 12
    return `${hour12}:${m} ${ampm}`
  }

  function getAvailableDatesFromSchedule(
    availability: any[],
    daysAhead = 30
  ): Record<string, string[]> {
    const result: Record<string, string[]> = {}
    const today = new Date()
    for (let i = 1; i <= daysAhead; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dow = d.getDay() // 0 (Sun) - 6 (Sat)
      const slots = availability.filter(a => a.day_of_week === dow && a.is_active)
      if (slots.length > 0) {
        const key = d.toISOString().split("T")[0]
        result[key] = slots.map(s => formatTime(s.start_time))
      }
    }
    return result
  }

  const availableSlots = getAvailableDatesFromSchedule(availability)

  const isDateAvailable = (day: number | null) => {
    if (!day) return false
    const dateKey = formatDateKey(day)
    return availableSlots[dateKey] && availableSlots[dateKey].length > 0
  }

  const getAvailableSlotsForDate = () => {
    if (!selectedDate) return []
    return availableSlots[selectedDate] || []
  }

  const handleDateSelect = (day: number) => {
    const dateKey = formatDateKey(day)
    setSelectedDate(dateKey)
    setSelectedTime(null)
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const formatSelectedDate = () => {
    if (!selectedDate) return ""
    const [year, month, day] = selectedDate.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  }

  const handleConfirmBooking = async () => {
    if (!user) {
      setBookingError("You must be logged in to book a session.")
      return
    }
    if (!selectedDate || !selectedTime) {
      setBookingError("Please select a date and time.")
      return
    }
    if (!trainer) {
      setBookingError("Trainer data is not available.")
      return
    }

    setIsSubmitting(true)
    setBookingError(null)

    const startTime = parseTimeTo24h(selectedTime)
    const endTime = addOneHour(selectedTime)

    const trainerId = typeof trainer.id === "string" ? parseInt(trainer.id, 10) : trainer.id

    if (!trainer) {
      setBookingError("Trainer not loaded. Please try again.")
      setIsSubmitting(false)
      return
    }
    const trainerIdNum = typeof trainer.id === 'string' ? parseInt(trainer.id, 10) : trainer.id
    const { error } = await createBooking({
      client_id: user.id,
      trainer_id: typeof trainer?.id === 'string' ? parseInt(trainer.id, 10) : trainer?.id,
      booking_date: selectedDate,
      start_time: startTime,
      end_time: endTime,
      status: "pending",
      goal_note: goalNote.trim() || null,
    })

    setIsSubmitting(false)

    if (error) {
      setBookingError(error || "Failed to create booking. Please try again.")
      return
    }

    toast({
      title: "Booking request sent to trainer",
      description: `Your session with ${trainer?.name ?? "the trainer"} on ${formatSelectedDate()} at ${selectedTime} is pending confirmation.`,
    })

    router.push("/dashboard/bookings")
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground">Loading trainer...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={trainer ? `/trainers/${trainer.id}` : "/trainers"} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Profile</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Step {step} of 2</span>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-foreground mb-8">Book a Session</h1>

          {trainerLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {trainerError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {trainerError}
            </div>
          )}

          {!trainerLoading && !trainerError && trainer && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <>
                  <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-card-foreground">Select Date</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium text-card-foreground min-w-[120px] text-center">
                          {monthNames[currentMonth]} {currentYear}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day) => (
                          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                          const dateKey = day ? formatDateKey(day) : ""
                          const isAvailable = isDateAvailable(day)
                          const isSelected = selectedDate === dateKey
                          
                          return (
                            <button
                              key={index}
                              disabled={!isAvailable}
                              onClick={() => day && isAvailable && handleDateSelect(day)}
                              className={`
                                aspect-square rounded-lg text-sm font-medium transition-colors
                                ${!day ? "invisible" : ""}
                                ${isSelected 
                                  ? "bg-primary text-primary-foreground" 
                                  : isAvailable 
                                    ? "bg-secondary hover:bg-primary/20 text-card-foreground" 
                                    : "text-muted-foreground/50 cursor-not-allowed"
                                }
                              `}
                            >
                              {day}
                            </button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {selectedDate && (
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-card-foreground">Select Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{formatSelectedDate()}</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {getAvailableSlotsForDate().map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`
                                px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                ${selectedTime === time
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary hover:bg-primary/20 text-card-foreground"
                                }
                              `}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    size="lg"
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep(2)}
                  >
                    Continue to Review
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Review Your Booking</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-secondary" />
                        <div>
                          <h3 className="font-semibold text-card-foreground">{trainer.name}</h3>
                          <p className="text-sm text-muted-foreground">{trainer.specialty}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-primary fill-primary" />
                            <span className="text-sm text-card-foreground">{trainer.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 py-4 border-y border-border">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span className="text-card-foreground">{formatSelectedDate()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-primary" />
                          <span className="text-card-foreground">{selectedTime} (60 minutes)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-primary" />
                          <span className="text-card-foreground">{trainer.location}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                          Goal note <span className="text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <textarea
                          value={goalNote}
                          onChange={(e) => setGoalNote(e.target.value)}
                          placeholder="e.g. I want to lose weight and improve my endurance..."
                          rows={3}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-card-foreground">Session Fee</span>
                        <span className="text-xl font-bold text-primary">${trainer.price}</span>
                      </div>

                      {bookingError && (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                          {bookingError}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-border text-foreground hover:bg-secondary"
                      onClick={() => setStep(1)}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-secondary" />
                      <div>
                        <p className="font-medium text-card-foreground">{trainer.name}</p>
                        <p className="text-sm text-muted-foreground">{trainer.specialty}</p>
                      </div>
                    </div>

                    <div className="space-y-2 py-4 border-y border-border text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="text-card-foreground">{selectedDate ? formatSelectedDate().split(",")[0] : "Not selected"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span className="text-card-foreground">{selectedTime || "Not selected"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="text-card-foreground">60 minutes</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-card-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">${trainer.price}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Free cancellation up to 24h before</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
