"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  LinkButton,
  LoadingSkeleton,
  SectionHeading,
  Select,
  Toggle,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { BloodBank, Doctor, Facility, MedicineStockEntry, Pharmacy } from "@/lib/seed-data";

type Consultation = {
  id: number;
  patientName: string;
  patientPhone: string;
  doctorSlug: string;
  specialty: string;
  status: string;
  note: string | null;
  createdAt: string;
};

type SessionUser = { email: string; name: string; role: string; organisation: string | null };

export default function ProviderDashboard() {
  const { t } = useI18n();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [stock, setStock] = useState<MedicineStockEntry[]>([]);
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [requests, setRequests] = useState<Consultation[]>([]);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; message: string } | null>(null);

  const canEdit = user?.role === "provider" || user?.role === "admin" || user?.role === "doctor";

  const load = useCallback(async () => {
    const [authRes, facilitiesRes, pharmaciesRes, bloodRes, doctorsRes] = await Promise.all([
      fetch("/api/auth").then((response) => response.json()).catch(() => ({ user: null })),
      fetch("/api/facilities").then((response) => response.json()).catch(() => ({})),
      fetch("/api/pharmacies").then((response) => response.json()).catch(() => ({})),
      fetch("/api/blood").then((response) => response.json()).catch(() => ({})),
      fetch("/api/doctors").then((response) => response.json()).catch(() => ({})),
    ]);
    setUser((authRes as { user?: SessionUser }).user ?? null);
    setChecked(true);
    setFacilities((facilitiesRes as { facilities?: Facility[] }).facilities ?? []);
    setPharmacies((pharmaciesRes as { pharmacies?: Pharmacy[] }).pharmacies ?? []);
    setStock((pharmaciesRes as { stock?: MedicineStockEntry[] }).stock ?? []);
    setBanks((bloodRes as { banks?: BloodBank[] }).banks ?? []);
    setDoctors((doctorsRes as { doctors?: Doctor[] }).doctors ?? []);
    setRequests((doctorsRes as { requests?: Consultation[] }).requests ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function update(payload: Record<string, unknown>) {
    try {
      const response = await fetch("/api/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || data.error) {
        setNotice({ tone: "danger", message: data.error ?? "Could not save the update." });
        return;
      }
      setNotice({ tone: "success", message: t("dashboard.updated") });
      await load();
    } catch {
      setNotice({ tone: "danger", message: "You appear to be offline." });
    }
  }

  const [facilitySlug, setFacilitySlug] = useState("");
  const [pharmacySlug, setPharmacySlug] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [stockStatus, setStockStatus] = useState("available");
  const [bankSlug, setBankSlug] = useState("");
  const [group, setGroup] = useState("O+");
  const [units, setUnits] = useState(5);

  const selectedFacility = facilities.find((item) => item.slug === facilitySlug) ?? facilities[0];
  const selectedPharmacy = pharmacies.find((item) => item.slug === pharmacySlug) ?? pharmacies[0];
  const pharmacyMedicines = Array.from(
    new Set(stock.filter((row) => row.pharmacySlug === selectedPharmacy?.slug).map((row) => row.medicineName)),
  );

  if (!checked) return <LoadingSkeleton count={3} />;

  return (
    <div className="space-y-6">
      <SectionHeading
        as="h1"
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={canEdit ? "success" : "warning"}>
              {user ? `${user.name} · ${user.role}` : "Guest preview"}
            </Badge>
            <LinkButton href="/login" variant="secondary">
              {t("nav.login")}
            </LinkButton>
          </div>
        }
      />

      {!canEdit ? (
        <Alert tone="warning" title="Read-only preview">
          Login as a provider to publish changes. In this demo use{" "}
          <strong>provider@gramacare.in / gramacare123</strong>. Everything you see below is demo data.
        </Alert>
      ) : null}

      {notice ? <Alert tone={notice.tone === "success" ? "success" : "danger"}>{notice.message}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("dashboard.requests"), value: requests.length, icon: "📋" },
          { label: t("admin.facilities"), value: facilities.length, icon: "🏥" },
          { label: t("admin.pharmacies"), value: pharmacies.length, icon: "💊" },
          { label: t("admin.bloodBanks"), value: banks.length, icon: "🩸" },
        ].map((card) => (
          <Card key={card.label} className="flex items-center gap-3">
            <span aria-hidden className="text-2xl">
              {card.icon}
            </span>
            <div>
              <p className="text-2xl font-extrabold text-ink-900">{card.value}</p>
              <p className="text-xs text-ink-400">{card.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card as="section" className="space-y-3" aria-labelledby="requests-card">
        <h2 id="requests-card" className="text-lg font-bold text-ink-900">
          {t("dashboard.requests")}
        </h2>
        {requests.length === 0 ? (
          <p className="text-[0.95rem] text-ink-500">{t("dashboard.noRequests")}</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {requests.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">
                    {request.patientName} · {request.specialty}
                  </p>
                  <p className="text-xs text-ink-400">
                    {request.patientPhone} · {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={request.status === "accepted" ? "success" : "info"}>{request.status}</Badge>
                  <a
                    href={`tel:${request.patientPhone.replace(/\s/g, "")}`}
                    className="rounded-lg border border-brand-300 px-3 py-1.5 text-sm font-semibold text-brand-800 press"
                  >
                    {t("common.call")}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card as="section" className="space-y-3" aria-labelledby="availability-card">
          <h2 id="availability-card" className="text-base font-bold text-ink-900">
            {t("dashboard.availability")}
          </h2>
          <Field label="Centre" htmlFor="centre-select">
            <Select
              id="centre-select"
              value={selectedFacility?.slug ?? ""}
              onChange={(event) => setFacilitySlug(event.target.value)}
            >
              {facilities.map((facility) => (
                <option key={facility.slug} value={facility.slug}>
                  {facility.name}
                </option>
              ))}
            </Select>
          </Field>
          <Toggle
            checked={Boolean(selectedFacility?.openNow)}
            onChange={(next) =>
              void update({
                kind: "facility",
                slug: selectedFacility?.slug,
                openNow: next,
                emergency: selectedFacility?.emergency,
              })
            }
            label={t("findcare.openNow")}
          />
          <Toggle
            checked={Boolean(selectedFacility?.emergency)}
            onChange={(next) =>
              void update({
                kind: "facility",
                slug: selectedFacility?.slug,
                openNow: selectedFacility?.openNow,
                emergency: next,
              })
            }
            label={t("findcare.emergencyOnly")}
          />
          <p className="text-xs text-ink-400">{t("dashboard.subtitle")}</p>
        </Card>

        <Card as="section" className="space-y-3" aria-labelledby="medicine-card">
          <h2 id="medicine-card" className="text-base font-bold text-ink-900">
            {t("dashboard.medicineStock")}
          </h2>
          <Field label="Pharmacy" htmlFor="pharmacy-select">
            <Select
              id="pharmacy-select"
              value={selectedPharmacy?.slug ?? ""}
              onChange={(event) => setPharmacySlug(event.target.value)}
            >
              {pharmacies.map((pharmacy) => (
                <option key={pharmacy.slug} value={pharmacy.slug}>
                  {pharmacy.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Medicine" htmlFor="medicine-select">
            <Select
              id="medicine-select"
              value={medicineName || pharmacyMedicines[0] || ""}
              onChange={(event) => setMedicineName(event.target.value)}
            >
              {pharmacyMedicines.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="status-select">
            <Select id="status-select" value={stockStatus} onChange={(event) => setStockStatus(event.target.value)}>
              <option value="available">{t("medicines.available")}</option>
              <option value="low">{t("medicines.low")}</option>
              <option value="unavailable">{t("medicines.unavailable")}</option>
            </Select>
          </Field>
          <Button
            disabled={!canEdit}
            onClick={() =>
              void update({
                kind: "medicine",
                slug: selectedPharmacy?.slug,
                medicineName: medicineName || pharmacyMedicines[0],
                status: stockStatus,
              })
            }
          >
            {t("dashboard.update")}
          </Button>
        </Card>

        <Card as="section" className="space-y-3" aria-labelledby="blood-card">
          <h2 id="blood-card" className="text-base font-bold text-ink-900">
            {t("dashboard.bloodStock")}
          </h2>
          <Field label="Blood bank" htmlFor="bank-select">
            <Select id="bank-select" value={bankSlug || banks[0]?.slug || ""} onChange={(event) => setBankSlug(event.target.value)}>
              {banks.map((bank) => (
                <option key={bank.slug} value={bank.slug}>
                  {bank.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("blood.group")} htmlFor="group-select">
            <Select id="group-select" value={group} onChange={(event) => setGroup(event.target.value)}>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("blood.units")} htmlFor="units-input">
            <Select id="units-input" value={units} onChange={(event) => setUnits(Number(event.target.value))}>
              {Array.from({ length: 13 }).map((_, index) => (
                <option key={index} value={index}>
                  {index}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            disabled={!canEdit}
            onClick={() => void update({ kind: "blood", slug: bankSlug || banks[0]?.slug, bloodGroup: group, units })}
          >
            {t("dashboard.update")}
          </Button>
        </Card>
      </div>

      <Card as="section" className="space-y-3" aria-labelledby="doctor-card">
        <h2 id="doctor-card" className="text-base font-bold text-ink-900">
          {t("dashboard.doctorAvailability")}
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {doctors.slice(0, 8).map((doctor) => (
            <li
              key={doctor.slug}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink-900">{doctor.name}</span>
                <span className="text-xs text-ink-400">{doctor.specialty}</span>
              </span>
              <Badge tone={doctor.availableNow ? "success" : "neutral"}>
                {doctor.availableNow ? t("doctors.availableNow") : t("common.closed")}
              </Badge>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-400">
          {t("common.demo")} ·{" "}
          <Link href="/doctors" className="underline decoration-dotted">
            {t("nav.doctors")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
