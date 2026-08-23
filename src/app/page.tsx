"use client";

import Link from "next/link";
import { QuickActionCard } from "@/components/cards";
import { NearbyFacilities } from "@/components/NearbyFacilities";
import { EducationPreview } from "@/components/EducationPreview";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { DEMO_ARTICLES, DEMO_FACILITIES } from "@/lib/seed-data";
import {
  Badge,
  Card,
  DoctorIcon,
  DropIcon,
  GlobeIcon,
  HospitalIcon,
  LinkButton,
  PillIcon,
  PinIcon,
  ReportIcon,
  SectionHeading,
  ShieldIcon,
  SirenIcon,
} from "@/components/ui";

function HeroLanguagePicker() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <GlobeIcon />
      <span className="text-sm font-semibold text-ink-700">{t("common.language")}:</span>
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          onClick={() => setLang(language.code)}
          aria-pressed={lang === language.code}
          className={`min-h-10 rounded-full border px-3 py-1 text-sm font-semibold press ${
            lang === language.code
              ? "border-brand-700 bg-brand-700 text-white"
              : "border-slate-300 bg-white text-ink-700 hover:bg-slate-50"
          }`}
        >
          {language.native}
        </button>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1 — Hero */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Badge tone="brand" className="mb-4">
            {t("brand.tagline")}
          </Badge>
          <h1 className="text-[2rem] leading-[1.12] font-extrabold text-ink-900 sm:text-[2.6rem] lg:text-[3rem]">
            {t("home.heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-ink-500 sm:text-lg">
            {t("home.heroSubtitle")}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/find-care" size="xl" className="w-full sm:w-auto">
              <PinIcon /> {t("home.ctaPrimary")}
            </LinkButton>
            <LinkButton href="/report" variant="secondary" size="xl" className="w-full sm:w-auto">
              <ReportIcon /> {t("home.ctaSecondary")}
            </LinkButton>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <HeroLanguagePicker />
          </div>

          <p className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-ink-500 ring-1 ring-slate-200">
            <PinIcon /> {t("home.locationHint")} · {t("demo.notice")}
          </p>
        </div>

        <div className="relative">
          {/* Low-bandwidth hero: single compressed photo, no video, no animation */}
          <img
            src="/images/hero.jpg"
            alt="A community health worker showing a smartphone to an elderly farmer couple and a young mother outside a village clinic"
            width={960}
            height={720}
            loading="eager"
            className="aspect-4/3 w-full rounded-2xl border border-slate-200 object-cover shadow-sm"
          />
          <div className="card-surface absolute -bottom-5 left-4 flex items-center gap-3 p-3 sm:left-6">
            <span aria-hidden className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <HospitalIcon />
            </span>
            <div className="text-sm">
              <p className="font-bold text-ink-900">12 centres · 6 pharmacies · 4 blood banks</p>
              <p className="text-ink-400">{t("common.demo")} · {t("demo.notice")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Quick actions */}
      <section aria-labelledby="quick-heading">
        <SectionHeading
          as="h2"
          id="quick-heading"
          title={t("home.quickTitle")}
          subtitle={t("home.quickSubtitle")}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            href="/find-care"
            title={t("home.findCare")}
            description={t("home.findCareDesc")}
            icon={<HospitalIcon />}
          />
          <QuickActionCard
            href="/medicines"
            title={t("home.findMedicine")}
            description={t("home.findMedicineDesc")}
            icon={<PillIcon />}
          />
          <QuickActionCard
            href="/blood"
            title={t("home.findBlood")}
            description={t("home.findBloodDesc")}
            icon={<DropIcon />}
          />
          <QuickActionCard
            href="/report"
            title={t("home.medicalReport")}
            description={t("home.medicalReportDesc")}
            icon={<ReportIcon />}
          />
          <QuickActionCard
            href="/emergency"
            title={t("home.emergency")}
            description={t("home.emergencyDesc")}
            icon={<SirenIcon />}
            tone="danger"
          />
          <QuickActionCard
            href="/doctors"
            title={t("home.talkDoctor")}
            description={t("home.talkDoctorDesc")}
            icon={<DoctorIcon />}
          />
        </div>
      </section>

      {/* 3 — Nearby healthcare */}
      <NearbyFacilities facilities={DEMO_FACILITIES} />

      {/* 4 — Report explainer */}
      <section className="rounded-2xl bg-brand-800 p-6 text-white sm:p-8">
        <div className="grid items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Badge tone="brand" className="bg-white/15 text-brand-50">
              AI-assisted · {t("common.demo")}
            </Badge>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{t("home.reportTitle")}</h2>
            <p className="mt-3 max-w-2xl text-[1rem] leading-relaxed text-brand-50/90">
              {t("home.reportSubtitle")}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/report" size="lg" className="bg-white text-brand-800 hover:bg-brand-50">
                {t("home.ctaSecondary")}
              </LinkButton>
              <LinkButton
                href="/education"
                variant="ghost"
                size="lg"
                className="border border-white/40 text-white hover:bg-white/10"
              >
                {t("nav.education")}
              </LinkButton>
            </div>
          </div>
          <ul className="space-y-2.5 text-sm">
            {[
              t("home.trustPoint1"),
              t("home.trustPoint2"),
              t("home.trustPoint3"),
            ].map((point) => (
              <li key={point} className="flex gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5">
                <ShieldIcon />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5 — Emergency */}
      <section className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold text-red-800">🚨 {t("home.emergencyTitle")}</h2>
            <p className="mt-2 text-[0.98rem] text-red-900/85">{t("home.emergencySubtitle")}</p>
            <p className="mt-2 text-xs text-red-900/70">{t("emergency.callNote")}</p>
          </div>
          <LinkButton href="/emergency" variant="danger" size="xl" className="shrink-0">
            {t("emergency.cta")}
          </LinkButton>
        </div>
      </section>

      {/* 6 — Health education */}
      <section aria-labelledby="education-heading">
        <SectionHeading
          as="h2"
          id="education-heading"
          title={t("home.educationTitle")}
          subtitle={t("home.educationSubtitle")}
          action={
            <LinkButton href="/education" variant="secondary">
              {t("education.all")}
            </LinkButton>
          }
        />
        <EducationPreview articles={DEMO_ARTICLES.slice(0, 6)} />
      </section>

      {/* 7 — How it works */}
      <section aria-labelledby="how-heading">
        <SectionHeading as="h2" id="how-heading" title={t("home.howTitle")} />
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            { title: t("home.how1Title"), body: t("home.how1Body"), icon: "1" },
            { title: t("home.how2Title"), body: t("home.how2Body"), icon: "2" },
            { title: t("home.how3Title"), body: t("home.how3Body"), icon: "3" },
          ].map((step, index) => (
            <Card as="li" key={step.title} className="gap-3">
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-full bg-brand-600 text-base font-bold text-white"
              >
                {step.icon}
              </span>
              <h3 className="mt-3 text-base font-bold text-ink-900">{step.title}</h3>
              <p className="mt-1 text-[0.95rem] text-ink-500">{step.body}</p>
              {index === 2 ? (
                <p className="mt-3 text-xs text-ink-400">{t("demo.notice")}</p>
              ) : null}
            </Card>
          ))}
        </ol>
      </section>

      {/* 8 — Trust & privacy */}
      <section className="card-surface p-6 sm:p-8" aria-labelledby="trust-heading">
        <div className="flex items-start gap-3">
          <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <ShieldIcon />
          </span>
          <div>
            <h2 id="trust-heading" className="text-xl font-bold text-ink-900 sm:text-2xl">
              {t("home.trustTitle")}
            </h2>
            <p className="mt-2 max-w-3xl text-[0.98rem] leading-relaxed text-ink-500">
              {t("home.trustBody")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="success">{t("home.trustPoint1")}</Badge>
              <Badge tone="info">{t("home.trustPoint2")}</Badge>
              <Badge tone="neutral">{t("home.trustPoint3")}</Badge>
            </div>
            <p className="mt-4 text-xs text-ink-400">
              {t("footer.disclaimer")}{" "}
              <Link href="/privacy" className="underline decoration-dotted">
                {t("footer.privacy")}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
