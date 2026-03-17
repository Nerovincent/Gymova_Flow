import { supabase } from "@/lib/supabaseClient"
import type { Message } from "@/types/message"

export type MessageWithProfiles = Message & {
  sender: { id: string; full_name: string | null; avatar_url: string | null } | null
  receiver: { id: string; full_name: string | null; avatar_url: string | null } | null
}

/**
 * Fetch all messages where the user is either sender or receiver,
 * with sender/receiver profiles joined. Used to build conversation list.
 * Ordered newest-first so the first occurrence per partner is the latest message.
 */
export async function getConversationMessages(
  userId: string
): Promise<{ data: MessageWithProfiles[]; error: string | null }> {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `id, sender_id, receiver_id, content, is_read, created_at,
       sender:profiles!sender_id(id, full_name, avatar_url),
       receiver:profiles!receiver_id(id, full_name, avatar_url)`
    )
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as unknown as MessageWithProfiles[], error: null }
}

/**
 * Fetch the full message thread between two users, ordered chronologically.
 */
export async function getThreadMessages(
  userId: string,
  partnerId: string
): Promise<{ data: Message[]; error: string | null }> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true })

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as Message[], error: null }
}

/**
 * Insert a new message and return the created row.
 */
export async function sendMessage(payload: {
  sender_id: string
  receiver_id: string
  content: string
}): Promise<{ data: Message | null; error: string | null }> {
  const { data, error } = await supabase
    .from("messages")
    .insert(payload)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Message, error: null }
}

/**
 * Mark all unread messages from `senderId` to `receiverId` as read.
 */
export async function markMessagesAsRead(
  receiverId: string,
  senderId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", receiverId)
    .eq("sender_id", senderId)
    .eq("is_read", false)

  if (error) return { error: error.message }
  return { error: null }
}
