"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEMO_AREA, DEMO_AREA_PLACES } from "@/lib/seed-data";
import { haversineKm } from "@/lib/geo";

export type LocationStatus = "idle" | "locating" | "granted" | "denied" | "unsupported";

export type LocationState = {
  lat: number;
  lng: number;
  label: string;
  source: "device" | "manual" | "demo";
  status: LocationStatus;
  accuracy: number | null;
};

type LocationContextValue = LocationState & {
  requestLocation: () => void;
  setManualPlace: (place: { name: string; lat: number; lng: number }) => void;
  distanceFrom: (lat: number, lng: number) => number;
  places: { name: string; lat: number; lng: number }[];
};

const STORAGE_KEY = "gramacare.location";
const DEFAULT_STATE: LocationState = {
  lat: DEMO_AREA.lat,
  lng: DEMO_AREA.lng,
  label: DEMO_AREA.label,
  source: "demo",
  status: "idle",
  accuracy: null,
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocationState>(DEFAULT_STATE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as LocationState;
      if (typeof parsed.lat === "number") setState(parsed);
    } catch {
      /* ignore malformed cache */
    }
  }, []);

  const persist = useCallback((next: LocationState) => {
    setState(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState((prev) => ({ ...prev, status: "unsupported" }));
      return;
    }
    setState((prev) => ({ ...prev, status: "locating" }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        persist({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Your current location",
          source: "device",
          status: "granted",
          accuracy: position.coords.accuracy,
        });
      },
      () => {
        setState((prev) => ({
          ...prev,
          status: "denied",
          label: prev.source === "demo" ? DEMO_AREA.label : prev.label,
        }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, [persist]);

  const setManualPlace = useCallback(
    (place: { name: string; lat: number; lng: number }) => {
      persist({
        lat: place.lat,
        lng: place.lng,
        label: place.name,
        source: "manual",
        status: "granted",
        accuracy: null,
      });
    },
    [persist],
  );

  const distanceFrom = useCallback(
    (lat: number, lng: number) => haversineKm({ lat: state.lat, lng: state.lng }, { lat, lng }),
    [state.lat, state.lng],
  );

  const value = useMemo<LocationContextValue>(
    () => ({ ...state, requestLocation, setManualPlace, distanceFrom, places: DEMO_AREA_PLACES }),
    [state, requestLocation, setManualPlace, distanceFrom],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used inside <LocationProvider>");
  return ctx;
}
