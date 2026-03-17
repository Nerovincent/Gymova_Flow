import { supabase } from "@/lib/supabaseClient"
import type { Booking, BookingStatus, BookingWithTrainer } from "@/types/booking"

/**
 * Fetch all bookings for a client, with trainer details joined.
 * Ordered newest-first so the caller can sort by status without an extra pass.
 */
export async function getClientBookings(
  clientId: string
): Promise<{ data: BookingWithTrainer[]; error: string | null }> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `id, client_id, trainer_id, booking_date, start_time, end_time, status, goal_note, created_at,
       trainers (id, name, specialty, location)`
    )
    .eq("client_id", clientId)
    .order("booking_date", { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as unknown as BookingWithTrainer[], error: null }
}

/**
 * Fetch all bookings for a trainer (by their numeric trainers.id),
 * ordered ascending by date so upcoming sessions appear first.
 */
export async function getTrainerBookings(
  trainerId: number
): Promise<{ data: Booking[]; error: string | null }> {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, client_id, trainer_id, booking_date, start_time, end_time, status, goal_note, created_at")
    .eq("trainer_id", trainerId)
    .order("booking_date", { ascending: true })

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as Booking[], error: null }
}

/**
 * Insert a new booking and return the created row.
 */
export async function createBooking(payload: {
  client_id: string
  trainer_id: number
  booking_date: string
  start_time: string
  end_time: string
  status: BookingStatus
  goal_note: string | null
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from("bookings").insert(payload)
  if (error) return { error: error.message }
  return { error: null }
}

/**
 * Update the status of a single booking.
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)

  if (error) return { error: error.message }
  return { error: null }
}
