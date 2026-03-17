import { supabase } from "@/lib/supabaseClient"
import type { Profile } from "@/types/profile"

/**
 * Fetch a single user profile. Safe to call client-side (anon key, subject to RLS).
 */
export async function getProfile(
  userId: string
): Promise<{ data: Profile | null; error: string | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, trainer_status, created_at")
    .eq("id", userId)
    .maybeSingle()

  if (error) return { data: null, error: error.message }
  return { data: data as Profile | null, error: null }
}

/**
 * Upsert profile fields for the given user. Only updates the supplied fields.
 */
export async function upsertProfile(
  userId: string,
  updates: Partial<Pick<Profile, "full_name" | "avatar_url">>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates }, { onConflict: "id" })

  if (error) return { error: error.message }
  return { error: null }
}

/**
 * Batch-fetch id, full_name and avatar_url for a set of user IDs.
 */
export async function getProfilesByIds(
  ids: string[]
): Promise<{ data: Pick<Profile, "id" | "full_name" | "avatar_url">[]; error: string | null }> {
  if (ids.length === 0) return { data: [], error: null }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", ids)

  if (error) return { data: [], error: error.message }
  return {
    data: (data ?? []) as Pick<Profile, "id" | "full_name" | "avatar_url">[],
    error: null,
  }
}
