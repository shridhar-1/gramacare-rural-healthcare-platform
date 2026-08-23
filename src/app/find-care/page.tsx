"use client";

import { useEffect, useMemo, useState } from "react";
import { HealthcareCard } from "@/components/cards";
import { useLocation } from "@/components/LocationProvider";
import { Map } from "@/components/Map";
import type { MapPoint } from "@/components/Map";
import {
  Alert,
  Card,
  Chip,
  EmptyState,
  LinkButton,
  LoadingSkeleton,
  PinIcon,
  SearchBar,
  SectionHeading,
  Select,
  Toggle,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { formatDistance } from "@/lib/geo";
import type { Facility } from "@/lib/seed-data";

const RADII = [5, 10, 25, 50, 500];

export default function FindCarePage() {
  const { t } = useI18n();
  const { distanceFrom, requestLocation, status, label, places, setManualPlace, lat, lng } = useLocation();
  const [facilities, setFacilities] = useState<Facility[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [radius, setRadius] = useState(500);
  const [openNow, setOpenNow] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [government, setGovernment] = useState(false);
  const [privateOnly, setPrivateOnly] = useState(false);
  const [phcOnly, setPhcOnly] = useState(false);
  const [specialist, setSpecialist] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/facilities")
      .then((response) => response.json())
      .then((data: { facilities?: Facility[] }) => {
        if (!cancelled) setFacilities(data.facilities ?? []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    if (!facilities) return [];
    const needle = query.trim().toLowerCase();
    return facilities
      .map((facility) => ({ facility, distance: distanceFrom(facility.lat, facility.lng) }))
      .filter(({ facility, distance }) => {
        if (distance > radius) return false;
        if (openNow && !facility.openNow) return false;
        if (emergencyOnly && !facility.emergency) return false;
        if (government && facility.ownership !== "government") return false;
        if (privateOnly && facility.ownership !== "private") return false;
        if (phcOnly && facility.kind !== "phc") return false;
        if (specialist && facility.specialists.length === 0) return false;
        if (needle.length === 0) return true;
        return `${facility.name} ${facility.village} ${facility.district} ${facility.pincode} ${facility.services.join(" ")} ${facility.specialists.join(" ")}`
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => a.distance - b.distance);
  }, [
    facilities,
    query,
    radius,
    openNow,
    emergencyOnly,
    government,
    privateOnly,
    phcOnly,
    specialist,
    distanceFrom,
  ]);

  const points: MapPoint[] = useMemo(
    () =>
      results.map(({ facility, distance }) => ({
        slug: facility.slug,
        name: facility.name,
        lat: facility.lat,
        lng: facility.lng,
        distanceKm: distance,
        emergency: facility.emergency,
      })),
    [results],
  );

  const resetFilters = () => {
    setOpenNow(false);
    setEmergencyOnly(false);
    setGovernment(false);
    setPrivateOnly(false);
    setPhcOnly(false);
    setSpecialist(false);
    setRadius(500);
    setQuery("");
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        as="h1"
        title={t("findcare.title")}
        subtitle={t("findcare.subtitle")}
        action={
          <LinkButton href="/emergency" variant="danger">
            🚨 {t("nav.emergency")}
          </LinkButton>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Filters */}
        <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <Card as="section" className="space-y-3">
            <h2 className="text-base font-bold text-ink-900">{t("common.filters")}</h2>
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder={t("findcare.searchPlaceholder")}
              label={t("common.search")}
            />

            <div>
              <label htmlFor="place" className="mb-1.5 block text-sm font-semibold text-ink-700">
                {t("findcare.placePlaceholder")}
              </label>
              <Select
                id="place"
                onChange={(event) => {
                  const place = places.find((item) => item.name === event.target.value);
                  if (place) setManualPlace(place);
                }}
                value={places.some((place) => place.name === label) ? label : ""}
              >
                <option value="">{t("findcare.placePlaceholder")}</option>
                {places.map((place) => (
                  <option key={place.name} value={place.name}>
                    {place.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor="radius" className="mb-1.5 block text-sm font-semibold text-ink-700">
                {t("findcare.radius")}
              </label>
              <Select id="radius" value={radius} onChange={(event) => setRadius(Number(event.target.value))}>
                {RADII.map((value) => (
                  <option key={value} value={value}>
                    {value >= 500 ? "Any distance" : `${value} km`}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-2">
              <Toggle checked={openNow} onChange={setOpenNow} label={t("findcare.openNow")} />
              <Toggle checked={emergencyOnly} onChange={setEmergencyOnly} label={t("findcare.emergencyOnly")} />
              <Toggle checked={government} onChange={setGovernment} label={t("findcare.government")} />
              <Toggle checked={privateOnly} onChange={setPrivateOnly} label={t("findcare.private")} />
              <Toggle checked={phcOnly} onChange={setPhcOnly} label={t("findcare.phc")} />
              <Toggle checked={specialist} onChange={setSpecialist} label={t("findcare.specialist")} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button type="button" onClick={resetFilters} className="text-sm font-semibold text-brand-700 underline">
                {t("common.reset")}
              </button>
              <span className="text-sm text-ink-400">
                {results.length} {t("common.results")}
              </span>
            </div>
          </Card>

          <Card className="space-y-2.5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-700">
              <PinIcon /> {status === "locating" ? t("common.loading") : label}
            </p>
            <button
              type="button"
              onClick={requestLocation}
              className="text-sm font-semibold text-brand-700 underline press"
            >
              {t("common.useMyLocation")}
            </button>
            <p className="text-xs text-ink-400">{t("home.nearbySubtitle")}</p>
          </Card>
        </div>

        {/* Map + results */}
        <div className="space-y-4">
          {status === "denied" ? (
            <Alert tone="warning" title={t("findcare.title")}>
              {t("emergency.locationDenied")}
            </Alert>
          ) : null}
          {failed ? (
            <Alert tone="warning">
              We couldn't load the facility list right now. Showing the last saved list may not be possible offline.
            </Alert>
          ) : null}

          <section aria-label={t("findcare.mapTitle")}>
            <Map
              center={{ lat, lng, label }}
              points={points}
              activeSlug={activeSlug}
              onSelect={setActiveSlug}
            />
          </section>

          <div className="flex flex-wrap gap-2">
            <Chip active={emergencyOnly} onClick={() => setEmergencyOnly((prev) => !prev)} tone="danger">
              🚨 {t("findcare.emergencyOnly")}
            </Chip>
            <Chip active={openNow} onClick={() => setOpenNow((prev) => !prev)}>
              {t("findcare.openNow")}
            </Chip>
            <Chip active={government} onClick={() => setGovernment((prev) => !prev)}>
              {t("findcare.government")}
            </Chip>
          </div>

          <h2 className="text-lg font-bold text-ink-900">
            {t("findcare.listTitle")}{" "}
            <span className="text-sm font-normal text-ink-400">
              {results.length} {t("common.results")} · {t("common.demo")}
            </span>
          </h2>

          {facilities === null ? (
            <LoadingSkeleton count={3} />
          ) : results.length === 0 ? (
            <EmptyState
              icon="🏥"
              title={t("findcare.empty")}
              action={
                <button
                  type="button"
                  onClick={() => setRadius(500)}
                  className="text-sm font-semibold text-brand-700 underline"
                >
                  {t("common.reset")}
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {results.map(({ facility, distance }) => (
                <HealthcareCard
                  key={facility.slug}
                  facility={facility}
                  distanceKm={distance}
                  active={activeSlug === facility.slug}
                  onSelect={() => setActiveSlug(facility.slug)}
                />
              ))}
            </div>
          )}

          <p className="text-xs text-ink-400">
            {t("common.demo")} · {t("demo.notice")} · {formatDistance(0).replace("0 m", "distances approximate")}
          </p>
        </div>
      </div>
    </div>
  );
}
