"use client";

import { useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { formatDistance } from "@/lib/geo";

export type MapPoint = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  label?: string;
  distanceKm?: number;
  accent?: "brand" | "red";
  emergency?: boolean;
};

function pinEmoji(point: MapPoint): string {
  return point.emergency ? "🚨" : point.accent === "red" ? "🩸" : point.label ?? "🏥";
}

function iconFor(point: MapPoint, active: boolean): L.DivIcon {
  const emoji = pinEmoji(point);
  return L.divIcon({
    className: "",
    html: `<span style="display:grid;place-items:center;width:${active ? 40 : 34}px;height:${
      active ? 40 : 34
    }px;border-radius:9999px;background:${
      point.emergency || point.accent === "red" ? "#dc2626" : "#14806e"
    };color:#fff;font-size:${active ? 20 : 17}px;box-shadow:0 2px 8px rgba(16,35,31,.35);border:2px solid #fff">${emoji}</span>`,
    iconSize: [active ? 40 : 34, active ? 40 : 34],
    iconAnchor: [active ? 20 : 17, active ? 20 : 17],
    popupAnchor: [0, -20],
  });
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useMemo(() => {
    map.setView([lat, lng], map.getZoom(), { animate: false });
    return null;
  }, [lat, lng, map]);
  return null;
}

export default function MapView({
  center,
  points,
  activeSlug,
  onSelect,
  height = "clamp(300px, 48vh, 460px)",
}: {
  center: { lat: number; lng: number; label?: string };
  points: MapPoint[];
  activeSlug?: string | null;
  onSelect?: (slug: string) => void;
  height?: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200"
      style={{ height }}
      role="application"
      aria-label="Map of nearby healthcare facilities"
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter lat={center.lat} lng={center.lng} />
        <Marker position={[center.lat, center.lng]} icon={iconFor({ slug: "me", name: "me", lat: center.lat, lng: center.lng, label: "📍" } as MapPoint, false)}>
          <Popup>
            <strong>{center.label ?? "Your location"}</strong>
          </Popup>
        </Marker>
        {points.map((point) => (
          <Marker
            key={point.slug}
            position={[point.lat, point.lng]}
            icon={iconFor(point, point.slug === activeSlug)}
            eventHandlers={{ click: () => onSelect?.(point.slug) }}
          >
            <Popup>
              <div style={{ minWidth: 170 }}>
                <strong style={{ display: "block", marginBottom: 2 }}>{point.name}</strong>
                {typeof point.distanceKm === "number" ? (
                  <span style={{ display: "block", fontSize: 12, color: "#4d635d" }}>
                    {formatDistance(point.distanceKm)} away
                  </span>
                ) : null}
                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(point.slug)}
                    style={{ marginTop: 6, color: "#14806e", fontWeight: 600, textDecoration: "underline" }}
                  >
                    Show details
                  </button>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
