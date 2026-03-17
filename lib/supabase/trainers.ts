import { supabase } from "@/lib/supabaseClient"
import { ensureAvailability } from "@/lib/supabase/availability"
import type { Trainer, TrainerListItem, TrainerReview } from "@/types/trainer"

const TRAINER_LIST_COLUMNS =
  "id, name, specialty, rating, reviews, price, location, distance, specializations"

const TRAINER_FULL_COLUMNS = [
  TRAINER_LIST_COLUMNS,
  "user_id, bio, experience, certifications, clients_helped, availability, reviews_list",
].join(", ")

/**
 * Fetch all trainers (list view columns only).
 */
export async function getTrainers(): Promise<{ data: TrainerListItem[]; error: string | null }> {
  const { data, error } = await supabase.from("trainers").select(TRAINER_LIST_COLUMNS)

  if (error) return { data: [], error: error.message }
  return { data: normalizeTrainerListItems(data ?? []), error: null }
}

/**
 * Fetch a single trainer by their numeric ID (full profile columns).
 */
export async function getTrainerById(
  id: string | number
): Promise<{ data: Trainer | null; error: string | null }> {
  const { data, error } = await supabase
    .from("trainers")
    .select(TRAINER_FULL_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: null }
  return { data: normalizeTrainer(data as unknown as Record<string, unknown>), error: null }
}

/**
 * Fetch the trainers row that belongs to a given auth user.
 * Returns only the numeric `id` field used for booking / session lookups.
 */
export async function getTrainerByUserId(
  userId: string
): Promise<{ data: Pick<Trainer, "id"> | null; error: string | null }> {
  const { data, error } = await supabase
    .from("trainers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) return { data: null, error: error.message }
  return { data: data as Pick<Trainer, "id"> | null, error: null }
}

// ---------------------------------------------------------------------------
// Internal normalizers — turn raw Supabase rows into typed objects
// ---------------------------------------------------------------------------

function normalizeTrainerListItems(rows: unknown[]): TrainerListItem[] {
  return rows.map((r) => {
    const row = r as Record<string, unknown>
    return {
      id: row.id as number,
      name: typeof row.name === "string" ? row.name : "Trainer",
      specialty: typeof row.specialty === "string" ? row.specialty : "",
      rating: typeof row.rating === "number" ? row.rating : 0,
      reviews: typeof row.reviews === "number" ? row.reviews : 0,
      price: typeof row.price === "number" ? row.price : 0,
      location: typeof row.location === "string" ? row.location : "",
      distance: typeof row.distance === "string" ? row.distance : "",
      specializations: Array.isArray(row.specializations)
        ? (row.specializations as string[])
        : [],
    }
  })
}

export function normalizeTrainer(row: Record<string, unknown>): Trainer {
  return {
    id: row.id as number,
    user_id: (row.user_id as string | null) ?? null,
    name: typeof row.name === "string" ? row.name : "Trainer",
    specialty: typeof row.specialty === "string" ? row.specialty : "",
    rating: typeof row.rating === "number" ? row.rating : 0,
    reviews: typeof row.reviews === "number" ? row.reviews : 0,
    price: typeof row.price === "number" ? row.price : 0,
    location: typeof row.location === "string" ? row.location : "",
    distance: typeof row.distance === "string" ? row.distance : "",
    bio: typeof row.bio === "string" ? row.bio : "",
    experience: typeof row.experience === "string" ? row.experience : "",
    clients_helped: typeof row.clients_helped === "number" ? row.clients_helped : 0,
    specializations: Array.isArray(row.specializations)
      ? (row.specializations as string[])
      : [],
    certifications: Array.isArray(row.certifications)
      ? (row.certifications as string[])
      : [],
    availability: ensureAvailability(row.availability),
    reviews_list: ensureReviewsList(row.reviews_list),
  }
}

function ensureReviewsList(arr: unknown): TrainerReview[] {
  if (!Array.isArray(arr)) return []
  return arr
    .filter((r) => r && typeof r === "object" && "comment" in r)
    .map((r, i) => {
      const o = r as Record<string, unknown>
      return {
        id: typeof o.id === "number" ? o.id : i + 1,
        name: typeof o.name === "string" ? o.name : "Anonymous",
        rating: typeof o.rating === "number" ? o.rating : 5,
        date: typeof o.date === "string" ? o.date : "",
        comment: typeof o.comment === "string" ? o.comment : "",
      }
    })
}
