import { getProfile } from "@/lib/supabase/profiles"
import type { TrainerStatus } from "@/types/profile"

export type { TrainerStatus }

export async function getIsApprovedTrainer(userId: string): Promise<boolean> {
  const { data: profile, error } = await getProfile(userId)
  if (error || !profile) return false
  return profile.role === "trainer" && profile.trainer_status === "approved"
}

export async function getTrainerStatus(userId: string): Promise<TrainerStatus | null> {
  const { data: profile, error } = await getProfile(userId)
  if (error || !profile) return null
  if (profile.role !== "trainer") return null
  return profile.trainer_status ?? null
}
