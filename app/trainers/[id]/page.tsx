import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { TrainerProfileView, type TrainerProfileData } from "./TrainerProfileView"

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

function ensureAvailability(obj: unknown): Record<string, string[]> {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const out: Record<string, string[]> = {}
    for (const day of DAYS) {
      const val = (obj as Record<string, unknown>)[day]
      out[day] = Array.isArray(val) ? val.filter((t): t is string => typeof t === "string") : []
    }
    return out
  }
  return Object.fromEntries(DAYS.map((d) => [d, []])) as Record<string, string[]>
}

function ensureReviewsList(arr: unknown): { id: number; name: string; rating: number; date: string; comment: string }[] {
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

function mapRowToProfile(row: Record<string, unknown>, id: string): TrainerProfileData {
  const specializations = Array.isArray(row.specializations)
    ? (row.specializations as string[])
    : typeof row.specializations === "string"
      ? (row.specializations ? [row.specializations] : [])
      : []
  const certifications = Array.isArray(row.certifications)
    ? (row.certifications as string[])
    : typeof row.certifications === "string"
      ? (row.certifications ? [row.certifications] : [])
      : []

  return {
    id: row.id !== undefined && row.id !== null ? row.id : id,
    name: typeof row.name === "string" ? row.name : "Trainer",
    specialty: typeof row.specialty === "string" ? row.specialty : "",
    rating: typeof row.rating === "number" ? row.rating : 0,
    reviews: typeof row.reviews === "number" ? row.reviews : 0,
    price: typeof row.price === "number" ? row.price : 0,
    location: typeof row.location === "string" ? row.location : "",
    distance: typeof row.distance === "string" ? row.distance : "",
    bio: typeof row.bio === "string" ? row.bio : "",
    specializations,
    certifications,
    experience: typeof row.experience === "string" ? row.experience : "",
    clientsHelped: typeof row.clients_helped === "number" ? row.clients_helped : 0,
    availability: ensureAvailability(row.availability),
    reviewsList: ensureReviewsList(row.reviews_list),
  }
}

export default async function TrainerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!id) notFound()

  // Request only columns that exist on the list page; mapper defaults the rest. After adding profile columns (see docs/SCHEMA-trainers-profile.md), add: bio, certifications, experience, clients_helped, availability, reviews_list to the select.
  const { data, error } = await supabase
    .from("trainers")
    .select("id, name, specialty, rating, reviews, price, location, distance, specializations")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Trainer profile fetch error", error)
    notFound()
  }

  if (data == null) notFound()

  const trainer = mapRowToProfile(data as Record<string, unknown>, id)
  return <TrainerProfileView trainer={trainer} />
}
