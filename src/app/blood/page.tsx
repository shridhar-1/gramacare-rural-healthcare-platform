"use client";

import { useEffect, useMemo, useState } from "react";
import { BloodBankCard } from "@/components/cards";
import { useLocation } from "@/components/LocationProvider";
import {
  Alert,
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  Input,
  LoadingSkeleton,
  SectionHeading,
  Select,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { BloodBank, BloodInventoryEntry } from "@/lib/seed-data";

const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY = [
  { value: "immediately", label: "Needed immediately" },
  { value: "within-6-hours", label: "Within 6 hours" },
  { value: "within-24-hours", label: "Within 24 hours" },
];

export default function BloodPage() {
  const { t } = useI18n();
  const { distanceFrom } = useLocation();
  const [banks, setBanks] = useState<BloodBank[] | null>(null);
  const [inventory, setInventory] = useState<BloodInventoryEntry[]>([]);
  const [group, setGroup] = useState<string | null>("O+");
  const [radius, setRadius] = useState(500);
  const [form, setForm] = useState({
    bloodGroup: "O+",
    units: 2,
    hospital: "",
    village: "",
    urgency: "within-24-hours",
    contactPhone: "",
  });
  const [status, setStatus] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/blood")
      .then((response) => response.json())
      .then((data: { banks?: BloodBank[]; inventory?: BloodInventoryEntry[] }) => {
        setBanks(data.banks ?? []);
        setInventory(data.inventory ?? []);
      })
      .catch(() => setBanks([]));
  }, []);

  const unitsFor = (slug: string): number | null => {
    if (!group) return null;
    return inventory.find((row) => row.bloodBankSlug === slug && row.bloodGroup === group)?.units ?? 0;
  };

  const results = useMemo(() => {
    if (!banks) return [];
    return banks
      .map((bank) => ({ bank, distance: distanceFrom(bank.lat, bank.lng), units: unitsFor(bank.slug) }))
      .filter((row) => row.distance <= radius)
      .sort((a, b) => (a.units ?? 0) - (b.units ?? 0) || a.distance - b.distance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banks, inventory, group, radius, distanceFrom]);

  const totalUnits = results.reduce((sum, row) => sum + (row.units ?? 0), 0);

  async function submitRequest(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const response = await fetch("/api/blood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || data.error) {
        setStatus({ tone: "danger", message: data.error ?? "Please check the details and try again." });
      } else {
        setStatus({ tone: "success", message: t("blood.submitted") });
        setForm((prev) => ({ ...prev, hospital: "", village: "", contactPhone: "" }));
      }
    } catch {
      setStatus({ tone: "danger", message: "You appear to be offline. Please call the blood bank directly." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeading as="h1" title={t("blood.title")} subtitle={t("blood.subtitle")} />

      <Alert tone="warning" title={t("common.demo")}>
        {t("blood.requestBody")}
      </Alert>

      <Card className="space-y-3">
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-700">{t("blood.group")}</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={group === null} onClick={() => setGroup(null)}>
              {t("blood.allGroups")}
            </Chip>
            {GROUPS.map((value) => (
              <Chip
                key={value}
                active={group === value}
                onClick={() => {
                  setGroup(value);
                  setForm((prev) => ({ ...prev, bloodGroup: value }));
                }}
              >
                {value}
              </Chip>
            ))}
          </div>
        </div>
        <div className="max-w-xs">
          <label htmlFor="blood-radius" className="mb-1.5 block text-sm font-semibold text-ink-700">
            {t("findcare.radius")}
          </label>
          <Select
            id="blood-radius"
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
          >
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={500}>Any distance</option>
          </Select>
        </div>
        {group ? (
          <p className="text-sm text-ink-500">
            <span className="font-bold text-ink-900">{totalUnits}</span> {t("blood.units")} · {group} ·{" "}
            {results.length} {t("common.results")}
          </p>
        ) : null}
      </Card>

      {banks === null ? (
        <LoadingSkeleton count={3} />
      ) : results.length === 0 ? (
        <EmptyState icon="🩸" title={t("blood.empty")} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map(({ bank, distance, units }) => (
            <BloodBankCard
              key={bank.slug}
              bank={bank}
              units={units}
              distanceKm={distance}
              selectedGroup={group}
            />
          ))}
        </div>
      )}

      <Card as="section" className="space-y-4" aria-labelledby="blood-request">
        <h2 id="blood-request" className="text-lg font-bold text-ink-900">
          {t("blood.requestTitle")}
        </h2>
        <p className="text-[0.95rem] text-ink-500">{t("blood.requestBody")}</p>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submitRequest}>
          <Field label={t("blood.group")} htmlFor="req-group">
            <Select
              id="req-group"
              value={form.bloodGroup}
              onChange={(event) => setForm((prev) => ({ ...prev, bloodGroup: event.target.value }))}
            >
              {GROUPS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("blood.unitsRequired")} htmlFor="req-units">
            <Input
              id="req-units"
              type="number"
              min={1}
              max={20}
              value={form.units}
              onChange={(event) => setForm((prev) => ({ ...prev, units: Number(event.target.value) }))}
            />
          </Field>
          <Field label={t("blood.hospital")} htmlFor="req-hospital">
            <Input
              id="req-hospital"
              required
              value={form.hospital}
              onChange={(event) => setForm((prev) => ({ ...prev, hospital: event.target.value }))}
              placeholder="Grama General Hospital"
            />
          </Field>
          <Field label={t("findcare.placePlaceholder")} htmlFor="req-village">
            <Input
              id="req-village"
              required
              value={form.village}
              onChange={(event) => setForm((prev) => ({ ...prev, village: event.target.value }))}
              placeholder="Rajanakunte"
            />
          </Field>
          <Field label={t("blood.urgency")} htmlFor="req-urgency">
            <Select
              id="req-urgency"
              value={form.urgency}
              onChange={(event) => setForm((prev) => ({ ...prev, urgency: event.target.value }))}
            >
              {URGENCY.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("blood.contactPhone")} htmlFor="req-phone" hint="Used by the blood bank to call you back.">
            <Input
              id="req-phone"
              inputMode="tel"
              value={form.contactPhone}
              onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
              placeholder="+91 98450 00000"
            />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" disabled={sending}>
              {sending ? t("common.loading") : t("blood.submit")}
            </Button>
          </div>
        </form>

        {status ? (
          <Alert tone={status.tone === "success" ? "success" : "danger"}>
            {status.message}
          </Alert>
        ) : null}
      </Card>
    </div>
  );
}
