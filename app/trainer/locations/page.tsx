"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  getGymLocations,
  getTrainerLocationsWithGyms,
  upsertTrainerLocation,
  deleteTrainerLocation,
} from "@/lib/supabase/locations"
import { getTrainerByUserId } from "@/lib/supabase/trainers"
import type { GymLocation, TrainerLocationWithGym } from "@/types/location"
import { Loader2, MapPin, Plus, Trash2, Star } from "lucide-react"

export default function TrainerLocationsPage() {
  const { session } = useAuth()

  const [trainerId, setTrainerId] = useState<number | null>(null)
  const [gymLocations, setGymLocations] = useState<GymLocation[]>([])
  const [myLocations, setMyLocations] = useState<TrainerLocationWithGym[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return

    const userId = session.user.id

    Promise.all([
      getTrainerByUserId(userId),
      getGymLocations(),
    ]).then(([trainerRes, gymsRes]) => {
      if (trainerRes.error || !trainerRes.data) {
        setMessage({ type: "error", text: "Could not load trainer profile." })
        setLoading(false)
        return
      }

      const tid = trainerRes.data.id
      setTrainerId(tid)

      if (gymsRes.error) {
        setMessage({ type: "error", text: "Could not load gym locations." })
      } else {
        setGymLocations(gymsRes.data)
      }

      getTrainerLocationsWithGyms().then(({ data, error }) => {
        if (error) {
          setMessage({ type: "error", text: "Could not load your locations." })
        } else {
          setMyLocations(data.filter((l) => String(l.trainer_id) === String(tid)))
        }
        setLoading(false)
      })
    })
  }, [session?.user?.id])

  const isLinked = (gymId: string) =>
    myLocations.some((l) => l.gym_location_id === gymId)

  const isPrimary = (gymId: string) =>
    myLocations.some((l) => l.gym_location_id === gymId && l.is_primary)

  const handleAdd = async (gym: GymLocation) => {
    if (!trainerId) return
    setSaving(gym.id)
    setMessage(null)

    const { error } = await upsertTrainerLocation(trainerId, gym.id, myLocations.length === 0)
    if (error) {
      setMessage({ type: "error", text: error })
      setSaving(null)
      return
    }

    const { data, error: fetchError } = await getTrainerLocationsWithGyms()
    if (!fetchError) {
      setMyLocations(data.filter((l) => String(l.trainer_id) === String(trainerId)))
    }
    setMessage({ type: "success", text: `${gym.name} added to your locations.` })
    setSaving(null)
  }

  const handleSetPrimary = async (gymId: string) => {
    if (!trainerId) return
    setSaving(gymId)
    setMessage(null)

    const { error } = await upsertTrainerLocation(trainerId, gymId, true)
    if (error) {
      setMessage({ type: "error", text: error })
      setSaving(null)
      return
    }

    const { data, error: fetchError } = await getTrainerLocationsWithGyms()
    if (!fetchError) {
      setMyLocations(data.filter((l) => String(l.trainer_id) === String(trainerId)))
    }
    setSaving(null)
  }

  const handleRemove = async (gymId: string, gymName: string) => {
    if (!trainerId) return
    setSaving(gymId)
    setMessage(null)

    const { error } = await deleteTrainerLocation(trainerId, gymId)
    if (error) {
      setMessage({ type: "error", text: error })
      setSaving(null)
      return
    }

    setMyLocations((prev) => prev.filter((l) => l.gym_location_id !== gymId))
    setMessage({ type: "success", text: `${gymName} removed from your locations.` })
    setSaving(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const availableGyms = gymLocations.filter((g) => !isLinked(g.id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My locations</h1>
        <p className="text-muted-foreground">
          Select the gyms where you train. Clients will see your location on the map.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === "success"
              ? "border-primary/30 bg-primary/5 text-foreground"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {myLocations.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Your gym locations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myLocations.map((loc) => (
              <div
                key={loc.gym_location_id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-background"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      loc.is_primary ? "bg-primary" : "bg-secondary"
                    }`}
                  >
                    <MapPin
                      className={`w-4 h-4 ${loc.is_primary ? "text-primary-foreground" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {loc.gym_location.name}
                      {loc.is_primary && (
                        <span className="ml-2 text-xs text-primary font-normal">(primary)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {loc.gym_location.address}, {loc.gym_location.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!loc.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={saving === loc.gym_location_id}
                      onClick={() => handleSetPrimary(loc.gym_location_id)}
                      className="border-border text-foreground hover:bg-secondary"
                    >
                      {saving === loc.gym_location_id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Star className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={saving === loc.gym_location_id}
                    onClick={() => handleRemove(loc.gym_location_id, loc.gym_location.name)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/5"
                  >
                    {saving === loc.gym_location_id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Add a gym location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableGyms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {gymLocations.length === 0
                ? "No gym locations are available yet."
                : "You have added all available gym locations."}
            </p>
          ) : (
            availableGyms.map((gym) => (
              <div
                key={gym.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-background"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{gym.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {gym.address}, {gym.city}
                      {gym.province ? `, ${gym.province}` : ""}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={saving === gym.id}
                  onClick={() => handleAdd(gym)}
                  className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving === gym.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
