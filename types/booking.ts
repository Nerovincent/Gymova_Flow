export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled"

export type Booking = {
  id: string
  client_id: string
  trainer_id: number
  booking_date: string
  start_time: string
  end_time: string
  status: BookingStatus
  goal_note?: string
  created_at: string
}

export type BookingWithTrainer = Booking & {
  trainers: {
    id: number
    name: string
    specialty: string
    location: string
    avatar_url?: string
  }
}

export type BookingWithClient = Booking & {
  profiles: {
    id: string
    full_name: string | null
    avatar_url?: string | null
  }
}
