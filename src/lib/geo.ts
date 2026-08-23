export type LatLng = { lat: number; lng: number };

const R = 6371; // km

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(km: number): string {
  if (!Number.isFinite(km)) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function osrmRoadHint(km: number): string {
  // Village roads are rarely straight lines; show a realistic travel estimate.
  const roadKm = km * 1.25;
  const minutes = Math.max(3, Math.round((roadKm / 28) * 60));
  return `${minutes} min by road (approx.)`;
}

export function directionsUrl(lat: number, lng: number, from?: LatLng | null): string {
  const dest = `${lat},${lng}`;
  if (from) {
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${from.lat}%2C${from.lng}%3B${lat}%2C${lng}`;
  }
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
}

export function osmEmbedUrl(lat: number, lng: number, bboxDeg = 0.02): string {
  const bbox = [lng - bboxDeg, lat - bboxDeg / 2, lng + bboxDeg, lat + bboxDeg / 2].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function relativeTime(value: string | Date | null | undefined): string {
  if (!value) return "unknown";
  const then = typeof value === "string" ? new Date(value).getTime() : value.getTime();
  if (Number.isNaN(then)) return "unknown";
  const minutes = Math.max(1, Math.round((Date.now() - then) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}
