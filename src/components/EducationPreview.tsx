"use client";

import Link from "next/link";
import { localTitle, useI18n } from "@/lib/i18n";
import type { HealthArticle } from "@/lib/seed-data";
import { Badge, Card } from "@/components/ui";

export function EducationPreview({ articles }: { articles: HealthArticle[] }) {
  const { lang } = useI18n();
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <Card as="li" key={article.slug} interactive className="flex flex-col gap-2">
          <Link href={`/education/${article.slug}`} className="flex flex-1 flex-col gap-2">
            <span aria-hidden className="text-2xl">
              {article.emoji}
            </span>
            <h3 className="text-base leading-snug font-bold text-ink-900">
              {localTitle(article, lang)}
            </h3>
            <p className="line-clamp-3 text-[0.92rem] text-ink-500">{article.summary}</p>
            <span className="mt-auto pt-2 text-sm font-semibold text-brand-700">
              {article.readMinutes} min · {article.category}
            </span>
          </Link>
        </Card>
      ))}
    </ul>
  );
}
