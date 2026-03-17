import { supabase } from "@/lib/supabaseClient"

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

export const DEFAULT_AVAILABILITY: Record<string, string[]> = Object.fromEntries(
  DAYS.map((d) => [d, []])
)

/**
 * Coerce an unknown value (e.g. a Supabase jsonb column) into a well-typed
 * availability record. Every day is guaranteed to be present; missing days
 * default to an empty array.
 */
export function ensureAvailability(obj: unknown): Record<string, string[]> {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const out: Record<string, string[]> = { ...DEFAULT_AVAILABILITY }
    for (const day of DAYS) {
      const val = (obj as Record<string, unknown>)[day]
      out[day] = Array.isArray(val)
        ? val.filter((t): t is string => typeof t === "string")
        : []
    }
    return out
  }
  return { ...DEFAULT_AVAILABILITY }
}

/**
 * Fetch a trainer's weekly availability schedule.
 */
export async function getTrainerAvailability(
  userId: string
): Promise<{ data: Record<string, string[]>; error: string | null }> {
  const { data, error } = await supabase
    .from("trainer_availability")
    .select("availability")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) return { data: { ...DEFAULT_AVAILABILITY }, error: error.message }

  return {
    data: ensureAvailability(
      (data as { availability?: unknown } | null)?.availability
    ),
    error: null,
  }
}

/**
 * Save (upsert) a trainer's weekly availability schedule.
 */
export async function upsertTrainerAvailability(
  userId: string,
  availability: Record<string, string[]>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("trainer_availability")
    .upsert({ user_id: userId, availability }, { onConflict: "user_id" })

  if (error) return { error: error.message }
  return { error: null }
}
