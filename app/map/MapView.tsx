"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvent } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { getSpecialtyEmoji } from "@/lib/map-utils"
import type { TrainerMapEntry } from "@/types/location"

export type TrainerWithDistance = TrainerMapEntry & {
  distanceMi: number | null
  distanceLabel: string
}

// [lat, lng] pairs for the route polyline
export type RouteLine = [number, number][]

// Fix broken default icons in webpack/Next.js builds
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

function trainerIcon(emoji: string, price: number, isSelected: boolean) {
  const bg = isSelected ? "#a3e635" : "#ffffff"
  const color = isSelected ? "#1a2e05" : "#65a30d"
  const border = "#a3e635"
  const shadow = isSelected
    ? "0 4px 16px rgba(163,230,53,0.5)"
    : "0 2px 8px rgba(0,0,0,0.25)"

  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          display:flex;align-items:center;gap:5px;
          background:${bg};border:2.5px solid ${border};
          border-radius:24px;padding:5px 10px;
          box-shadow:${shadow};
          font-family:system-ui,sans-serif;font-size:13px;font-weight:700;
          color:${color};white-space:nowrap;
          transform:${isSelected ? "scale(1.1)" : "scale(1)"};
          transition:transform 0.15s;
        ">
          <span style="font-size:17px;line-height:1">${emoji}</span>
          <span>$${price}</span>
        </div>
        <div style="
          width:0;height:0;
          border-left:7px solid transparent;
          border-right:7px solid transparent;
          border-top:8px solid ${border};
          margin-top:-1px;
        "></div>
      </div>`,
    className: "",
    iconAnchor: [32, 46],
    popupAnchor: [0, -46],
  })
}

function userLocationIcon() {
  return L.divIcon({
    html: `
      <div style="position:relative;width:22px;height:22px;">
        <div style="
          width:22px;height:22px;border-radius:50%;
          background:#3b82f6;border:3px solid white;
          box-shadow:0 2px 10px rgba(59,130,246,0.7);
          position:absolute;top:0;left:0;z-index:2;
        "></div>
        <div style="
          width:48px;height:48px;border-radius:50%;
          background:rgba(59,130,246,0.18);
          position:absolute;top:-13px;left:-13px;z-index:1;
          animation:userpulse 2s ease-out infinite;
        "></div>
      </div>`,
    className: "",
    iconAnchor: [11, 11],
  })
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.4 })
  }, [center, map])
  return null
}

function MapClickHandler({ onLocationSet }: { onLocationSet: (lat: number, lng: number) => void }) {
  useMapEvent("click", (e) => {
    onLocationSet(e.latlng.lat, e.latlng.lng)
  })
  return null
}

function FitRoute({ line }: { line: RouteLine }) {
  const map = useMap()
  useEffect(() => {
    if (line.length < 2) return
    map.fitBounds(line as L.LatLngBoundsExpression, { padding: [60, 60], maxZoom: 15, animate: true })
  }, [line, map])
  return null
}

export default function MapView({
  trainers,
  clientLocation,
  selectedTrainer,
  onSelectTrainer,
  routeLine,
  routeMode,
  onLocationSet,
}: {
  trainers: TrainerWithDistance[]
  clientLocation: { lat: number; lng: number } | null
  selectedTrainer: number | null
  onSelectTrainer: (id: number) => void
  routeLine: RouteLine | null
  routeMode: "driving" | "walking"
  onLocationSet: (lat: number, lng: number) => void
}) {
  // Default: Wolfville, Nova Scotia — used only for MapContainer initial render
  const wolfville: [number, number] = [45.0907, -64.3647]

  // Stable reference — prevents MapController re-firing on unrelated parent re-renders
  const userCenter = useMemo<[number, number] | null>(
    () => (clientLocation ? [clientLocation.lat, clientLocation.lng] : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientLocation?.lat, clientLocation?.lng]
  )

  return (
    <>
      <style>{`
        @keyframes userpulse {
          0%   { transform:scale(1);   opacity:0.8; }
          70%  { transform:scale(2);   opacity:0; }
          100% { transform:scale(2);   opacity:0; }
        }
        .leaflet-container { width:100%; height:100%; background:#1a1a2e; }
        .leaflet-tile { filter: brightness(0.88) saturate(0.85); }
      `}</style>

      <MapContainer
        center={wolfville}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSet={onLocationSet} />

        {userCenter && (
          <>
            <MapController center={userCenter} />
            <Marker position={userCenter} icon={userLocationIcon()} />
          </>
        )}

        {/* Route polyline — key forces full re-creation when route changes */}
        {routeLine && routeLine.length > 1 && (
          <>
            <FitRoute line={routeLine} />
            <Polyline
              key={`casing-${routeLine.length}-${routeMode}`}
              positions={routeLine}
              pathOptions={{
                color: routeMode === "driving" ? "#1d4ed8" : "#166534",
                weight: 10,
                opacity: 0.2,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              key={`route-${routeLine.length}-${routeMode}`}
              positions={routeLine}
              pathOptions={{
                color: routeMode === "driving" ? "#3b82f6" : "#22c55e",
                weight: 5,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
                dashArray: routeMode === "walking" ? "10 12" : undefined,
              }}
            />
          </>
        )}

        {trainers.map((trainer) => (
          <Marker
            key={`${trainer.trainer_id}-${trainer.gym_location_id}`}
            position={[trainer.latitude, trainer.longitude]}
            icon={trainerIcon(
              getSpecialtyEmoji(trainer.specialties),
              trainer.price_per_session,
              selectedTrainer === trainer.trainer_id
            )}
            eventHandlers={{ click: () => onSelectTrainer(trainer.trainer_id) }}
          />
        ))}
      </MapContainer>
    </>
  )
}
