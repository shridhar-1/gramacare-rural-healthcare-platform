"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "@/components/MapView";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div
      className="skeleton rounded-2xl border border-slate-200"
      style={{ height: "clamp(300px, 48vh, 460px)" }}
      aria-busy="true"
      aria-label="Loading map"
    />
  ),
});

export type { MapPoint };

export function Map(props: {
  center: { lat: number; lng: number; label?: string };
  points: MapPoint[];
  activeSlug?: string | null;
  onSelect?: (slug: string) => void;
  height?: string;
}) {
  return <MapView {...props} />;
}
