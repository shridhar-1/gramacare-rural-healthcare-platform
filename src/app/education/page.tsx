"use client";

import { useMemo, useState } from "react";
import { EducationPreview } from "@/components/EducationPreview";
import { Alert, Chip, SearchBar, SectionHeading } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { DEMO_ARTICLES } from "@/lib/seed-data";

export default function EducationPage() {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(DEMO_ARTICLES.map((article) => article.category))),
    [],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return DEMO_ARTICLES.filter((article) => {
      const matchesCategory = !category || article.category === category;
      const matchesQuery =
        needle.length === 0 ||
        `${article.title} ${article.titleKn ?? ""} ${article.titleHi ?? ""} ${article.summary} ${article.keyPoints.join(" ")}`
          .toLowerCase()
          .includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="space-y-6">
      <SectionHeading as="h1" title={t("education.title")} subtitle={t("education.subtitle")} />

      <Alert tone="neutral">{t("education.subtitle")}</Alert>

      <div className="space-y-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={`${t("common.search")}…`}
          label={t("common.search")}
        />
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <Chip active={category === null} onClick={() => setCategory(null)}>
            {t("education.all")}
          </Chip>
          {categories.map((item) => (
            <Chip
              key={item}
              active={category === item}
              onClick={() => setCategory(category === item ? null : item)}
            >
              {item}
            </Chip>
          ))}
        </div>
      </div>

      <p className="text-sm text-ink-400">
        {filtered.length} {t("common.results")} · {lang.toUpperCase()}
      </p>

      {filtered.length > 0 ? (
        <EducationPreview articles={filtered} />
      ) : (
        <div className="card-surface px-6 py-10 text-center">
          <p className="font-semibold text-ink-900">{t("common.noResults")}</p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-brand-700 underline"
            onClick={() => {
              setQuery("");
              setCategory(null);
            }}
          >
            {t("common.reset")}
          </button>
        </div>
      )}
    </div>
  );
}
