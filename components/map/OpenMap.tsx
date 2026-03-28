"use client"

import { useEffect, useMemo, useRef } from "react"
import maplibregl, { type LngLatBoundsLike, type Map as MapLibreMap, type Marker } from "maplibre-gl"
import { Navigation, Loader2 } from "lucide-react"
import { getLineBounds, getSpecialtyEmoji, type LatLng, type RouteLine } from "@/lib/map-utils"
import type { TrainerMapEntry } from "@/types/location"

export type TrainerWithDistance = TrainerMapEntry & {
  distanceMi: number | null
  distanceLabel: string
}

const FALLBACK_CENTER: LatLng = { lat: 44.6488, lng: -63.5752 }
const OSM_STYLE = {
  version: 8,
  sources: {
    "openstreetmap-raster": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "openstreetmap-raster",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
} as const

function createTrainerMarker(trainer: TrainerWithDistance, selected: boolean) {
  const element = document.createElement("button")
  element.type = "button"
  element.className = `gymova-map-marker${selected ? " is-selected" : ""}`
  element.innerHTML = `
    <span class="gymova-map-marker__emoji">${getSpecialtyEmoji(trainer.specialties)}</span>
    <span class="gymova-map-marker__price">$${trainer.price_per_session}</span>
  `
  return element
}

function createUserMarker() {
  const element = document.createElement("div")
  element.className = "gymova-user-marker"
  return element
}

function toGeoJson(line: RouteLine) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: line.map(([lat, lng]) => [lng, lat]),
    },
  }
}

export default function OpenMap({
  trainers,
  clientLocation,
  selectedTrainer,
  onSelectTrainer,
  routeLine,
  routeMode,
  onLocationSet,
  onRequestLocation,
  locationStatus,
}: {
  trainers: TrainerWithDistance[]
  clientLocation: LatLng | null
  selectedTrainer: number | null
  onSelectTrainer: (id: number) => void
  routeLine: RouteLine | null
  routeMode: "driving" | "walking"
  onLocationSet: (lat: number, lng: number) => void
  onRequestLocation: () => void
  locationStatus: "idle" | "loading" | "granted" | "denied"
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const trainerMarkersRef = useRef<Marker[]>([])
  const userMarkerRef = useRef<Marker | null>(null)
  const hasAppliedInitialBoundsRef = useRef(false)
  const routeBounds = useMemo(() => (routeLine ? getLineBounds(routeLine) : null), [routeLine])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [clientLocation?.lng ?? FALLBACK_CENTER.lng, clientLocation?.lat ?? FALLBACK_CENTER.lat],
      zoom: clientLocation ? 12 : 9,
      attributionControl: false,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }))
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right")

    map.on("click", (event) => {
      onLocationSet(event.lngLat.lat, event.lngLat.lng)
    })

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [] },
        },
      })

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": routeMode === "driving" ? "#3b82f6" : "#22c55e",
          "line-width": 5,
          "line-opacity": 0.95,
          "line-dasharray": routeMode === "walking" ? [1, 1.8] : [1, 0],
        },
      })
    })

    mapRef.current = map

    return () => {
      trainerMarkersRef.current.forEach((marker) => marker.remove())
      trainerMarkersRef.current = []
      userMarkerRef.current?.remove()
      map.remove()
      mapRef.current = null
    }
  }, [clientLocation, onLocationSet, routeMode])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    const source = map.getSource("route") as maplibregl.GeoJSONSource | undefined
    if (!source) return

    source.setData(routeLine ? toGeoJson(routeLine) : toGeoJson([]))

    if (map.getLayer("route-line")) {
      map.setPaintProperty("route-line", "line-color", routeMode === "driving" ? "#3b82f6" : "#22c55e")
      map.setPaintProperty("route-line", "line-dasharray", routeMode === "walking" ? [1, 1.8] : [1, 0])
    }

    if (routeBounds) {
      hasAppliedInitialBoundsRef.current = true
      map.fitBounds(routeBounds as LngLatBoundsLike, { padding: 60, duration: 800 })
    }
  }, [routeBounds, routeLine, routeMode])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !clientLocation) return

    if (!userMarkerRef.current) {
      userMarkerRef.current = new maplibregl.Marker({ element: createUserMarker() })
        .setLngLat([clientLocation.lng, clientLocation.lat])
        .addTo(map)
    } else {
      userMarkerRef.current.setLngLat([clientLocation.lng, clientLocation.lat])
    }

    if (!routeLine && !hasAppliedInitialBoundsRef.current) {
      map.flyTo({ center: [clientLocation.lng, clientLocation.lat], zoom: 13, duration: 600 })
    }
  }, [clientLocation, routeLine])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    trainerMarkersRef.current.forEach((marker) => marker.remove())
    trainerMarkersRef.current = []

    trainers.forEach((trainer) => {
      const marker = new maplibregl.Marker({
        element: createTrainerMarker(trainer, trainer.trainer_id === selectedTrainer),
        anchor: "bottom",
      })
        .setLngLat([trainer.longitude, trainer.latitude])
        .addTo(map)

      marker.getElement().addEventListener("click", () => onSelectTrainer(trainer.trainer_id))
      trainerMarkersRef.current.push(marker)
    })

    if (!routeLine && !clientLocation && trainers.length > 0 && !hasAppliedInitialBoundsRef.current) {
      const bounds = new maplibregl.LngLatBounds()
      trainers.forEach((trainer) => bounds.extend([trainer.longitude, trainer.latitude]))
      map.fitBounds(bounds, { padding: 80, duration: 0, maxZoom: 12 })
      hasAppliedInitialBoundsRef.current = true
    }
  }, [clientLocation, onSelectTrainer, routeLine, selectedTrainer, trainers])

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={onRequestLocation}
          className="px-3 py-1.5 text-xs font-medium bg-card/90 backdrop-blur-sm border border-border rounded-md shadow-md hover:bg-card inline-flex items-center gap-2"
        >
          {locationStatus === "loading" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Navigation className="w-3 h-3" />
          )}
          Find My Location
        </button>
      </div>

      {locationStatus === "denied" && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-md">
          <p className="text-xs text-muted-foreground">Location access was denied. Search an address or click the map.</p>
        </div>
      )}
    </div>
  )
}
