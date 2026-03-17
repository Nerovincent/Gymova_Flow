export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  booking_id?: string
  content: string
  is_read: boolean
  created_at: string
}
