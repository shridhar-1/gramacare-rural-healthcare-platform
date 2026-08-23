"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DEMO_ARTICLES } from "@/lib/seed-data";
import { localTitle, useI18n } from "@/lib/i18n";
import { Alert, Badge, Card, LinkButton, SectionHeading } from "@/components/ui";

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const { t, lang } = useI18n();
  const article = DEMO_ARTICLES.find((item) => item.slug === params?.slug);

  if (!article) {
    return (
      <div className="space-y-5">
        <SectionHeading as="h1" title={t("education.title")} subtitle={t("education.subtitle")} />
        <Alert tone="warning" title={t("common.noResults")}>
          {t("education.back")}
        </Alert>
        <LinkButton href="/education" variant="secondary">
          {t("education.back")}
        </LinkButton>
      </div>
    );
  }

  return (
    <article className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-400">
        <Link href="/education" className="underline decoration-dotted">
          {t("education.title")}
        </Link>{" "}
        / <span className="text-ink-500">{article.category}</span>
      </nav>

      <header className="space-y-3">
        <span aria-hidden className="text-4xl">
          {article.emoji}
        </span>
        <h1 className="text-2xl leading-tight font-extrabold text-ink-900 sm:text-3xl">
          {localTitle(article, lang)}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">{article.category}</Badge>
          <Badge tone="neutral">{article.readMinutes} min</Badge>
          {(lang === "kn" && article.titleKn) || (lang === "hi" && article.titleHi) ? (
            <Badge tone="success">{lang === "kn" ? "ಕನ್ನಡ" : "हिन्दी"}</Badge>
          ) : (
            <Badge tone="info">English</Badge>
          )}
        </div>
      </header>

      <p className="text-[1.05rem] leading-relaxed text-ink-700">{article.summary}</p>

      <Card as="section" aria-labelledby="key-points">
        <h2 id="key-points" className="text-lg font-bold text-ink-900">
          {t("education.keyPoints")}
        </h2>
        <ul className="mt-3 space-y-2.5">
          {article.keyPoints.map((point) => (
            <li key={point} className="flex gap-2.5 text-[0.98rem] text-ink-700">
              <span aria-hidden className="mt-0.5 text-brand-600">
                ✓
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card as="section" aria-labelledby="seek-help" className="border-amber-200 bg-amber-50/70">
        <h2 id="seek-help" className="text-lg font-bold text-amber-900">
          {t("education.seekHelp")}
        </h2>
        <ul className="mt-3 space-y-2.5">
          {article.whenToSeekHelp.map((point) => (
            <li key={point} className="flex gap-2.5 text-[0.98rem] text-amber-900">
              <span aria-hidden>⚠</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Alert tone="warning" title={t("education.title")}>
        {t("education.subtitle")}
      </Alert>

      <div className="flex flex-wrap gap-3">
        <LinkButton href="/find-care">{t("nav.findCare")}</LinkButton>
        <LinkButton href="/education" variant="secondary">
          {t("education.back")}
        </LinkButton>
      </div>
    </article>
  );
}
