"use client";

import { useEffect, useMemo, useState } from "react";
import { HealthcareCard } from "@/components/cards";
import { useLocation } from "@/components/LocationProvider";
import { Alert, Badge, Button, Card, LinkButton } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { Facility } from "@/lib/seed-data";

export default function EmergencyPage() {
  const { t } = useI18n();
  const { requestLocation, status, label, distanceFrom } = useLocation();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [logged, setLogged] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const nearest = useMemo(
    () =>
      facilities
        .map((facility) => ({ facility, distance: distanceFrom(facility.lat, facility.lng) }))
        .sort((a, b) => a.distance - b.distance),
    [facilities, distanceFrom],
  );

  useEffect(() => {
    fetch("/api/emergency")
      .then((response) => response.json())
      .then((data: { emergency?: Facility[] }) => {
        setFacilities(data.emergency ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function getHelp() {
    requestLocation();
    if (logged) return;
    try {
      await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "help-near-me" }),
      });
    } catch {
      /* offline: the on-screen guidance still works */
    }
    setLogged(true);
  }

  async function shareLocation() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = {
      title: "GramaCare — I need help",
      text: "I need nearby emergency healthcare. GramaCare is showing me the nearest emergency centres.",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(`${data.title} — ${url}`);
      }
    } catch {
      /* user cancelled sharing */
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-red-300 bg-red-600 p-5 text-white sm:p-7">
        <h1 className="text-[2rem] leading-none font-black tracking-tight sm:text-[2.6rem]">
          🚨 {t("emergency.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-[1.02rem] text-red-50">{t("emergency.subtitle")}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void getHelp()}
            className="min-h-16 rounded-xl bg-white px-5 text-lg font-extrabold text-red-700 press hover:bg-red-50"
          >
            {status === "locating" ? t("common.loading") : t("emergency.cta")}
          </button>
          <button
            type="button"
            onClick={() => void shareLocation()}
            className="min-h-16 rounded-xl border-2 border-white/70 px-5 text-lg font-bold text-white press hover:bg-white/15"
          >
            {t("emergency.share")}
          </button>
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-red-50/90">
          <Badge tone="neutral" className="bg-white/15 text-white">
            {t("common.demo")}
          </Badge>
          {t("emergency.callNote")}
        </p>
      </div>

      {status === "denied" ? (
        <Alert tone="warning" title={t("nav.emergency")}>
          {t("emergency.locationDenied")}
        </Alert>
      ) : (
        <Alert tone="neutral">
          {t("common.distance")}: {label} · {t("home.nearbySubtitle")}
        </Alert>
      )}

      <section aria-labelledby="nearest-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="nearest-heading" className="text-xl font-bold text-ink-900">
            {t("emergency.nearest")}
          </h2>
          <span className="text-sm text-ink-400">
            {loaded ? `${nearest.length} ${t("common.results")}` : t("common.loading")}
          </span>
        </div>

        {nearest.length === 0 ? (
          <Card className="text-ink-500">{t("common.loading")}</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {nearest.slice(0, 4).map(({ facility, distance }) => (
              <HealthcareCard key={facility.slug} facility={facility} distanceKm={distance} />
            ))}
          </div>
        )}
      </section>

      <Card as="section" className="space-y-3" aria-labelledby="transport-heading">
        <h2 id="transport-heading" className="text-lg font-bold text-ink-900">
          {t("emergency.transport")}
        </h2>
        <p className="text-[0.98rem] text-ink-700">{t("emergency.transportBody")}</p>
        <ul className="space-y-2">
          {[t("emergency.tip1"), t("emergency.tip2"), t("emergency.tip3")].map((tip) => (
            <li key={tip} className="flex gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-[0.95rem] text-ink-700">
              <span aria-hidden>✚</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-400">{t("emergency.firstAid")} · {t("demo.notice")}</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <LinkButton href="/find-care" variant="secondary" className="w-full">
          {t("nav.findCare")}
        </LinkButton>
        <LinkButton href="/blood" variant="secondary" className="w-full">
          {t("nav.blood")}
        </LinkButton>
        <LinkButton href="/doctors" variant="secondary" className="w-full">
          {t("nav.doctors")}
        </LinkButton>
      </div>

      <Card className="space-y-2">
        <h2 className="text-base font-bold text-ink-900">Regional emergency numbers</h2>
        <p className="text-[0.95rem] text-ink-500">
          GramaCare does not hard-code an emergency number, because they differ between states and countries. Confirm the
          number used in your district with a local health worker, save it in your phone today, and write it where family
          members can find it.
        </p>
        <Button variant="secondary" onClick={() => void shareLocation()}>
          {t("emergency.share")}
        </Button>
      </Card>
    </div>
  );
}
