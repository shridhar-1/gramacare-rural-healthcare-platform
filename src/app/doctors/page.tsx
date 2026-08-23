"use client";

import { useEffect, useMemo, useState } from "react";
import { DoctorCard } from "@/components/cards";
import {
  Alert,
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  Input,
  LoadingSkeleton,
  Modal,
  SectionHeading,
  Textarea,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { Doctor, Facility } from "@/lib/seed-data";

type ConsultationRequest = {
  id: number;
  patientName: string;
  doctorSlug: string;
  specialty: string;
  status: string;
  createdAt: string;
};

export default function DoctorsPage() {
  const { t } = useI18n();
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [form, setForm] = useState({ patientName: "", patientPhone: "", note: "" });
  const [status, setStatus] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/doctors")
      .then((response) => response.json())
      .then((data: { doctors?: Doctor[]; requests?: ConsultationRequest[] }) => {
        setDoctors(data.doctors ?? []);
        setRequests(data.requests ?? []);
      })
      .catch(() => setDoctors([]));
  }, []);

  const specialties = useMemo(
    () => Array.from(new Set((doctors ?? []).map((doctor) => doctor.specialty))).sort(),
    [doctors],
  );

  const visible = useMemo(
    () => (doctors ?? []).filter((doctor) => !specialty || doctor.specialty === specialty),
    [doctors, specialty],
  );

  const [facilities, setFacilities] = useState<Facility[]>([]);
  useEffect(() => {
    fetch("/api/facilities")
      .then((response) => response.json())
      .then((data: { facilities?: Facility[] }) => setFacilities(data.facilities ?? []))
      .catch(() => setFacilities([]));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setSending(true);
    setStatus(null);
    try {
      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, doctorSlug: selected.slug }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || data.error) {
        setStatus({ tone: "danger", message: data.error ?? "Please check the details and try again." });
      } else {
        setStatus({ tone: "success", message: data.message ?? t("doctors.submitted") });
        setForm({ patientName: "", patientPhone: "", note: "" });
        setSelected(null);
      }
    } catch {
      setStatus({ tone: "danger", message: "You appear to be offline. Please try again later." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeading as="h1" title={t("doctors.title")} subtitle={t("doctors.subtitle")} />

      <Alert tone="warning" title={t("common.demo")}>
        This is a prototype consultation flow. No live video consultation or medical advice is provided here. For
        anything urgent, use the Emergency section.
      </Alert>

      {specialties.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <Chip active={specialty === null} onClick={() => setSpecialty(null)}>
            {t("doctors.allSpecialties")}
          </Chip>
          {specialties.map((item) => (
            <Chip key={item} active={specialty === item} onClick={() => setSpecialty(item)}>
              {item}
            </Chip>
          ))}
        </div>
      ) : null}

      {status ? (
        <Alert tone={status.tone === "success" ? "success" : "danger"}>{status.message}</Alert>
      ) : null}

      {doctors === null ? (
        <LoadingSkeleton count={3} />
      ) : visible.length === 0 ? (
        <EmptyState icon="🩺" title={t("doctors.empty")} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((doctor) => (
            <DoctorCard
              key={doctor.slug}
              doctor={doctor}
              onRequest={setSelected}
              centreName={facilities.find((facility) => facility.slug === doctor.centerSlug)?.name}
            />
          ))}
        </div>
      )}

      {requests.length > 0 ? (
        <Card as="section" className="space-y-3" aria-labelledby="requests-heading">
          <h2 id="requests-heading" className="text-lg font-bold text-ink-900">
            {t("dashboard.requests")} · {t("common.demo")}
          </h2>
          <ul className="divide-y divide-slate-200">
            {requests.slice(0, 6).map((request) => (
              <li key={request.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-[0.95rem] text-ink-700">
                  {request.patientName} · {request.specialty}
                </span>
                <span className="flex items-center gap-2 text-xs text-ink-400">
                  <Chip active onClick={() => undefined}>
                    {request.status}
                  </Chip>
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={`${t("doctors.request")} — ${selected?.name ?? ""}`}
      >
        <form className="space-y-4" onSubmit={submit}>
          <p className="text-[0.95rem] text-ink-500">{t("doctors.subtitle")}</p>
          <Field label={t("doctors.yourName")} htmlFor="cons-name">
            <Input
              id="cons-name"
              required
              value={form.patientName}
              onChange={(event) => setForm((prev) => ({ ...prev, patientName: event.target.value }))}
            />
          </Field>
          <Field label={t("doctors.yourPhone")} htmlFor="cons-phone">
            <Input
              id="cons-phone"
              required
              inputMode="tel"
              value={form.patientPhone}
              onChange={(event) => setForm((prev) => ({ ...prev, patientPhone: event.target.value }))}
              placeholder="+91 98450 00000"
            />
          </Field>
          <Field label={t("doctors.note")} htmlFor="cons-note">
            <Textarea
              id="cons-note"
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="Fever for three days, report attached…"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={sending}>
              {sending ? t("common.loading") : t("doctors.request")}
            </Button>
            <Button type="button" variant="quiet" onClick={() => setSelected(null)}>
              {t("common.close")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
