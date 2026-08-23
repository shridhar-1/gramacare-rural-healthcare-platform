"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HealthcareCard } from "@/components/cards";
import { useLocation } from "@/components/LocationProvider";
import { Alert, Button, EmptyState, LinkButton, PinIcon } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { Facility } from "@/lib/seed-data";

export function NearbyFacilities({ facilities }: { facilities: Facility[] }) {
  const { t } = useI18n();
  const { distanceFrom, requestLocation, status, label } = useLocation();
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(
    () =>
      facilities
        .map((facility) => ({ facility, distance: distanceFrom(facility.lat, facility.lng) }))
        .sort((a, b) => a.distance - b.distance),
    [facilities, distanceFrom],
  );

  const visible = expanded ? sorted.slice(0, 8) : sorted.slice(0, 3);

  return (
    <section aria-labelledby="nearby-heading" className="scroll-mt-24">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="nearby-heading" className="text-xl font-bold text-ink-900 sm:text-2xl">
            {t("home.nearbyTitle")}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.95rem] text-ink-500">
            <PinIcon /> {label} · {t("home.nearbySubtitle")}
          </p>
        </div>
        <Button variant="secondary" onClick={requestLocation} disabled={status === "locating"}>
          {status === "locating" ? t("common.loading") : t("common.useMyLocation")}
        </Button>
      </div>

      {status === "denied" ? (
        <Alert tone="warning" className="mb-4">
          {t("emergency.locationDenied")}
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {visible.map(({ facility, distance }) => (
          <HealthcareCard key={facility.slug} facility={facility} distanceKm={distance} />
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState title={t("home.nearbyEmpty")} action={<LinkButton href="/find-care">{t("nav.findCare")}</LinkButton>} />
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {!expanded ? (
          <Button variant="secondary" onClick={() => setExpanded(true)}>
            {t("education.readMore")} ({Math.min(sorted.length, 8)})
          </Button>
        ) : null}
        <Link
          href="/find-care"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-[0.95rem] font-semibold text-white press hover:bg-brand-700"
        >
          {t("nav.findCare")} →
        </Link>
      </div>
    </section>
  );
}
