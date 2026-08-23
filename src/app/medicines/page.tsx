"use client";

import { useEffect, useMemo, useState } from "react";
import { PharmacyCard } from "@/components/cards";
import { useLocation } from "@/components/LocationProvider";
import {
  Alert,
  Card,
  EmptyState,
  LoadingSkeleton,
  SearchBar,
  SectionHeading,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { MedicineStockEntry, Pharmacy } from "@/lib/seed-data";

const SUGGESTIONS = [
  "Paracetamol 500mg",
  "Amoxicillin 500mg",
  "Metformin 500mg",
  "Insulin (Human) 100IU",
  "ORS Sachet",
  "Iron + Folic Acid Tablet",
];

export default function MedicinesPage() {
  const { t } = useI18n();
  const { distanceFrom } = useLocation();
  const [query, setQuery] = useState("");
  const [pharmacies, setPharmacies] = useState<Pharmacy[] | null>(null);
  const [stock, setStock] = useState<MedicineStockEntry[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/pharmacies")
      .then((response) => response.json())
      .then((data: { pharmacies?: Pharmacy[]; stock?: MedicineStockEntry[] }) => {
        setPharmacies(data.pharmacies ?? []);
        setStock(data.stock ?? []);
      })
      .catch(() => setFailed(true));
  }, []);

  const needle = query.trim().toLowerCase();

  const stockFor = (pharmacySlug: string): MedicineStockEntry | undefined => {
    if (needle.length === 0) return undefined;
    return stock.find(
      (entry) =>
        entry.pharmacySlug === pharmacySlug && entry.medicineName.toLowerCase().includes(needle),
    );
  };

  const results = useMemo(() => {
    if (!pharmacies) return [];
    return pharmacies
      .map((pharmacy) => ({ pharmacy, entry: stockFor(pharmacy.slug) }))
      .sort((a, b) => {
        const rank = (entry?: MedicineStockEntry) =>
          entry?.status === "available" ? 0 : entry?.status === "low" ? 1 : entry ? 2 : 3;
        const byStock = rank(a.entry) - rank(b.entry);
        if (byStock !== 0) return byStock;
        return (
          distanceFrom(a.pharmacy.lat, a.pharmacy.lng) - distanceFrom(b.pharmacy.lat, b.pharmacy.lng)
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacies, stock, needle, distanceFrom]);

  const availableCount = results.filter((row) => row.entry?.status === "available").length;

  return (
    <div className="space-y-6">
      <SectionHeading as="h1" title={t("medicines.title")} subtitle={t("medicines.subtitle")} />

      <Alert tone="warning" title={t("common.demo")}>
        {t("demo.notice")} GramaCare does not recommend medicines or doses — ask a doctor or registered pharmacist.
      </Alert>

      <Card className="space-y-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={t("medicines.searchPlaceholder")}
          label={t("medicines.searchPlaceholder")}
        />
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">
            {t("medicines.suggest")}
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setQuery(name)}
                className={`press min-h-10 rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
                  query === name
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-300 bg-white text-ink-700 hover:bg-slate-50"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {needle.length > 0 ? (
        <p className="text-sm text-ink-500">
          <span className="font-bold text-ink-900">{availableCount}</span> {t("medicines.available")} ·{" "}
          {results.length} {t("common.results")}
        </p>
      ) : null}

      {failed ? (
        <Alert tone="warning">
          We couldn't load pharmacy information right now. Please try again when you are back online.
        </Alert>
      ) : null}

      {pharmacies === null ? (
        <LoadingSkeleton count={3} />
      ) : results.length === 0 ? (
        <EmptyState icon="💊" title={t("medicines.empty")} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map(({ pharmacy, entry }) => (
            <PharmacyCard
              key={pharmacy.slug}
              pharmacy={pharmacy}
              stock={entry}
              distanceKm={distanceFrom(pharmacy.lat, pharmacy.lng)}
            />
          ))}
        </div>
      )}

      <Alert tone="neutral">
        Stock labels mean: <strong>{t("medicines.available")}</strong> — the pharmacy reported the medicine in stock;{" "}
        <strong>{t("medicines.low")}</strong> — few units left; <strong>{t("medicines.unavailable")}</strong> — reported
        as not available. Always call before travelling.
      </Alert>
    </div>
  );
}
