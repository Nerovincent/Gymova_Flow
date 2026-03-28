import { NextResponse } from "next/server"
import { findShortestPathByDijkstra, type RouteLine } from "@/lib/map-utils"

type OsrmRouteResponse = {
  code?: string
  routes?: Array<{
    distance: number
    duration: number
    geometry: {
      coordinates: [number, number][]
    }
  }>
}

const WALKING_SPEED_KMH = 5

async function fetchRouteFromOsrm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  profile: "driving" | "walking"
) {
  const url = `https://router.project-osrm.org/route/v1/${profile}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&steps=false&geometries=geojson`
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) return null

  const payload = (await response.json()) as OsrmRouteResponse
  if (payload.code !== "Ok" || !payload.routes?.length) return null

  return payload.routes[0]
}

function toRouteLine(coordinates: [number, number][]): RouteLine {
  return coordinates.map(([lng, lat]) => [lat, lng])
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fromLat = Number(searchParams.get("fromLat"))
  const fromLng = Number(searchParams.get("fromLng"))
  const toLat = Number(searchParams.get("toLat"))
  const toLng = Number(searchParams.get("toLng"))
  const requestedProfile = searchParams.get("profile") === "walking" ? "walking" : "driving"

  if ([fromLat, fromLng, toLat, toLng].some((value) => Number.isNaN(value))) {
    return NextResponse.json({ error: "Invalid route coordinates." }, { status: 400 })
  }

  try {
    let resolvedProfile: "driving" | "walking" = requestedProfile
    let route = await fetchRouteFromOsrm(fromLat, fromLng, toLat, toLng, requestedProfile)

    if (!route && requestedProfile === "walking") {
      resolvedProfile = "driving"
      route = await fetchRouteFromOsrm(fromLat, fromLng, toLat, toLng, "driving")
    }

    if (!route) {
      return NextResponse.json({ error: "Route unavailable." }, { status: 502 })
    }

    const rawLine = toRouteLine(route.geometry.coordinates)
    const shortestPath = findShortestPathByDijkstra(rawLine)
    const durationMin =
      requestedProfile === "walking"
        ? Math.max(1, Math.round((shortestPath.distanceKm / WALKING_SPEED_KMH) * 60))
        : Math.max(1, Math.round(route.duration / 60))

    return NextResponse.json({
      distanceKm: shortestPath.distanceKm || route.distance / 1000,
      durationMin,
      line: shortestPath.path,
      requestedProfile,
      resolvedProfile,
      fallbackUsed: requestedProfile !== resolvedProfile,
    })
  } catch {
    return NextResponse.json({ error: "Unable to calculate route right now." }, { status: 502 })
  }
}
