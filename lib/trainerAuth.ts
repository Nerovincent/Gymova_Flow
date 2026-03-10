import { supabase } from "@/lib/supabaseClient"

export type TrainerStatus = "pending" | "approved" | "rejected" | null

/**
 * Fetches the current user's profile and returns whether they are an approved trainer.
 * Use after confirming the user is logged in (session exists).
 */
export async function getIsApprovedTrainer(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, trainer_status")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) return false
  const role = (data as { role?: string }).role
  const trainerStatus = (data as { trainer_status?: string }).trainer_status
  return role === "trainer" && trainerStatus === "approved"
}

/**
 * Returns the trainer status for the current user (pending, approved, rejected, or null if not a trainer).
 */
export async function getTrainerStatus(userId: string): Promise<TrainerStatus> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, trainer_status")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) return null
  const role = (data as { role?: string }).role
  if (role !== "trainer") return null
  return ((data as { trainer_status?: string }).trainer_status as TrainerStatus) ?? null
}
