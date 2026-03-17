import { notFound } from "next/navigation"
import { getTrainerById } from "@/lib/supabase/trainers"
import { TrainerProfileView } from "./TrainerProfileView"

export default async function TrainerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!id) notFound()

  const { data: trainer, error } = await getTrainerById(id)

  if (error) {
    console.error("Trainer profile fetch error:", error)
    notFound()
  }

  if (!trainer) notFound()

  return <TrainerProfileView trainer={trainer} />
}
