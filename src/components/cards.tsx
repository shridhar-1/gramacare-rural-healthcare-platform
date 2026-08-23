"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { formatDistance, osrmRoadHint, relativeTime } from "@/lib/geo";
import type { BloodBank, Doctor, Facility, Pharmacy } from "@/lib/seed-data";
import type { MedicineStockEntry } from "@/lib/seed-data";
import { Badge, Button, Card, ClockIcon, DemoBadge, PhoneIcon, RouteIcon } from "@/components/ui";

const TYPE_LABEL: Record<Lang, Record<Facility["kind"], string>> = {
  en: { hospital: "Hospital", phc: "Primary Health Centre", clinic: "Clinic", diagnostic: "Diagnostic centre" },
  kn: { hospital: "ಆಸ್ಪತ್ರೆ", phc: "ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ", clinic: "ಕ್ಲಿನಿಕ್", diagnostic: "ಪ್ರಯೋಗಾಲಯ" },
  hi: { hospital: "अस्पताल", phc: "प्राथमिक स्वास्थ्य केंद्र", clinic: "क्लिनिक", diagnostic: "जाँच केंद्र" },
};

const OWNERSHIP_LABEL: Record<Lang, Record<Facility["ownership"], string>> = {
  en: { government: "Government", private: "Private", trust: "Trust / NGO" },
  kn: { government: "ಸರ್ಕಾರಿ", private: "ಖಾಸಗಿ", trust: "ಟ್ರಸ್ಟ್" },
  hi: { government: "सरकारी", private: "निजी", trust: "ट्रस्ट" },
};

function ActionRow({
  phone,
  lat,
  lng,
  callLabel,
  directionsLabel,
}: {
  phone: string;
  lat: number;
  lng: number;
  callLabel: string;
  directionsLabel: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <a
        href={`tel:${phone.replace(/\s/g, "")}`}
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-brand-300 bg-white px-4 text-[0.95rem] font-semibold text-brand-800 press hover:bg-brand-50 sm:flex-none"
      >
        <PhoneIcon />
        {callLabel}
      </a>
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-brand-700/20 bg-brand-600 px-4 text-[0.95rem] font-semibold text-white press hover:bg-brand-700 sm:flex-none"
      >
        <RouteIcon />
        {directionsLabel}
      </a>
    </div>
  );
}

export function HealthcareCard({
  facility,
  distanceKm,
  active = false,
  onSelect,
}: {
  facility: Facility;
  distanceKm: number | null;
  active?: boolean;
  onSelect?: () => void;
}) {
  const { t, lang } = useI18n();
  return (
    <Card as="article" className={active ? "border-brand-400 ring-2 ring-brand-200" : ""}>
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 text-left"
          aria-expanded={active}
        >
          <h3 className="text-[1.05rem] leading-snug font-bold text-ink-900">{facility.name}</h3>
        </button>
        {distanceKm !== null ? (
          <span className="shrink-0 rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-800">
            {formatDistance(distanceKm)}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge tone="brand">{TYPE_LABEL[lang][facility.kind]}</Badge>
        <Badge tone="neutral">{OWNERSHIP_LABEL[lang][facility.ownership]}</Badge>
        <Badge tone={facility.openNow ? "success" : "neutral"}>
          {facility.openNow ? t("common.open") : t("common.closed")}
        </Badge>
        {facility.emergency ? <Badge tone="danger">🚨 {t("nav.emergency")}</Badge> : null}
        {facility.ambulance ? <Badge tone="info">{t("findcare.ambulance")}</Badge> : null}
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.9rem] text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon /> {facility.openHours}
        </span>
        {distanceKm !== null ? <span>· {osrmRoadHint(distanceKm)}</span> : null}
      </p>

      <p className="mt-3 text-sm text-ink-700">
        <span className="font-semibold">{t("common.services")}: </span>
        {facility.services.slice(0, 5).join(" · ")}
        {facility.services.length > 5 ? ` +${facility.services.length - 5}` : ""}
      </p>
      {facility.specialists.length > 0 ? (
        <p className="mt-1 text-sm text-ink-500">
          <span className="font-semibold text-ink-700">{t("findcare.specialist")}: </span>
          {facility.specialists.join(", ")}
        </p>
      ) : null}

      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-400">
        <DemoBadge label={`${t("common.demo")} · ${relativeTime(facility.updatedAt)}`} />
        {facility.verified ? <Badge tone="success">{t("common.verified")}</Badge> : null}
      </p>

      <ActionRow
        phone={facility.phone}
        lat={facility.lat}
        lng={facility.lng}
        callLabel={t("common.call")}
        directionsLabel={t("common.directions")}
      />
    </Card>
  );
}

export function PharmacyCard({
  pharmacy,
  stock,
  distanceKm,
}: {
  pharmacy: Pharmacy;
  stock?: MedicineStockEntry;
  distanceKm: number | null;
}) {
  const { t } = useI18n();
  const tone = !stock ? "neutral" : stock.status === "available" ? "success" : stock.status === "low" ? "warning" : "neutral";
  const label = !stock
    ? t("common.noResults")
    : stock.status === "available"
      ? t("medicines.available")
      : stock.status === "low"
        ? t("medicines.low")
        : t("medicines.unavailable");

  return (
    <Card as="article">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[1.05rem] leading-snug font-bold text-ink-900">{pharmacy.name}</h3>
          <p className="mt-0.5 text-sm text-ink-500">
            {pharmacy.village} · {pharmacy.openHours}
          </p>
        </div>
        {distanceKm !== null ? (
          <span className="shrink-0 rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-800">
            {formatDistance(distanceKm)}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Badge tone={tone as "success" | "warning" | "neutral"}>{label}</Badge>
        <Badge tone={pharmacy.openNow ? "success" : "neutral"}>
          {pharmacy.openNow ? t("common.open") : t("common.closed")}
        </Badge>
        {pharmacy.delivery ? <Badge tone="info">{t("medicines.delivery")}</Badge> : null}
      </div>

      {stock ? (
        <p className="mt-3 text-sm text-ink-700">
          {stock.note ? <span className="block">{stock.note}</span> : null}
          {stock.price ? <span>₹{stock.price}</span> : null}
          <span className="mt-1 block text-xs text-ink-400">
            {t("common.updated")} {relativeTime(stock.updatedAt)} · {t("common.demo")}
          </span>
        </p>
      ) : null}

      <ActionRow
        phone={pharmacy.phone}
        lat={pharmacy.lat}
        lng={pharmacy.lng}
        callLabel={t("common.call")}
        directionsLabel={t("common.directions")}
      />
    </Card>
  );
}

export function BloodBankCard({
  bank,
  units,
  distanceKm,
  selectedGroup,
}: {
  bank: BloodBank;
  units: number | null;
  distanceKm: number | null;
  selectedGroup: string | null;
}) {
  const { t } = useI18n();
  const availability =
    units === null ? "neutral" : units === 0 ? "danger" : units <= 2 ? "warning" : "success";
  const availabilityLabel =
    units === null ? "—" : units === 0 ? t("blood.notAvailable") : units <= 2 ? t("blood.limited") : t("blood.available");

  return (
    <Card as="article">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[1.05rem] leading-snug font-bold text-ink-900">{bank.name}</h3>
          <p className="mt-0.5 text-sm text-ink-500">
            {bank.village} · {bank.openHours}
          </p>
        </div>
        {distanceKm !== null ? (
          <span className="shrink-0 rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-800">
            {formatDistance(distanceKm)}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        {selectedGroup ? (
          <>
            <span className="grid size-11 place-items-center rounded-xl bg-red-600 text-lg font-black text-white">
              {selectedGroup}
            </span>
            <span className="text-sm font-semibold text-ink-700">
              {units ?? 0} {t("blood.units")} ·{" "}
              <span
                className={
                  availability === "success"
                    ? "text-emerald-700"
                    : availability === "warning"
                      ? "text-amber-700"
                      : "text-red-700"
                }
              >
                {availabilityLabel}
              </span>
            </span>
          </>
        ) : (
          <span className="text-sm text-ink-500">{t("blood.group")}: {t("blood.allGroups")}</span>
        )}
      </div>

      <p className="mt-2 text-xs text-ink-400">
        {t("common.updated")} {relativeTime(bank.updatedAt)} · {t("common.demo")}
      </p>

      <ActionRow
        phone={bank.phone}
        lat={bank.lat}
        lng={bank.lng}
        callLabel={t("common.call")}
        directionsLabel={t("common.directions")}
      />
    </Card>
  );
}

export function DoctorCard({
  doctor,
  onRequest,
  centreName,
}: {
  doctor: Doctor;
  onRequest: (doctor: Doctor) => void;
  centreName?: string;
}) {
  const { t } = useI18n();
  return (
    <Card as="article" className="flex flex-col">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-100 text-base font-bold text-brand-800"
        >
          {doctor.name.replace(/^Dr\.?\s*/i, "").slice(0, 1)}
        </span>
        <div className="min-w-0">
          <h3 className="text-[1.05rem] leading-snug font-bold text-ink-900">{doctor.name}</h3>
          <p className="text-sm text-ink-500">
            {doctor.specialty} · {doctor.qualifications}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <dt className="text-xs text-ink-400">{t("doctors.experience")}</dt>
          <dd className="font-semibold text-ink-900">{doctor.experienceYears}+</dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <dt className="text-xs text-ink-400">{t("doctors.nextSlot")}</dt>
          <dd className="font-semibold text-ink-900">{doctor.nextSlot ?? "—"}</dd>
        </div>
      </dl>

      {centreName ? <p className="mt-2 text-sm text-ink-500">📍 {centreName}</p> : null}
      <p className="mt-1 text-sm text-ink-500">
        {t("doctors.languages")}: {doctor.languages.join(", ")}
      </p>
      <p className="mt-1 text-sm text-ink-500">
        {doctor.consultationFee === 0 ? t("doctors.free") : `₹${doctor.consultationFee}`}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone={doctor.availableNow ? "success" : "neutral"}>
          {doctor.availableNow ? t("doctors.availableNow") : t("common.closed")}
        </Badge>
        {doctor.teleconsult ? <Badge tone="info">Video / phone</Badge> : null}
        <DemoBadge />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => onRequest(doctor)}>{t("doctors.request")}</Button>
        <a
          href={`tel:${doctor.phone.replace(/\s/g, "")}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand-300 bg-white px-4 text-[0.95rem] font-semibold text-brand-800 press hover:bg-brand-50"
        >
          <PhoneIcon />
          {t("common.call")}
        </a>
      </div>
    </Card>
  );
}

export function QuickActionCard({
  href,
  title,
  description,
  icon,
  tone = "brand",
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  tone?: "brand" | "danger";
}) {
  return (
    <a
      href={href}
      className={`card-surface group flex min-h-32 flex-col gap-2 p-4 press hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
        tone === "danger" ? "border-red-200 bg-red-50/60" : ""
      }`}
    >
      <span
        aria-hidden
        className={`grid size-12 place-items-center rounded-xl ${
          tone === "danger" ? "bg-red-600 text-white" : "bg-brand-50 text-brand-700"
        }`}
      >
        {icon}
      </span>
      <span className="text-base leading-snug font-bold text-ink-900">{title}</span>
      <span className="text-sm leading-snug text-ink-500">{description}</span>
    </a>
  );
}
