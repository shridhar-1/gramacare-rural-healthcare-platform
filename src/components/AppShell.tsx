"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { I18nProvider, LANGUAGES, useI18n } from "@/lib/i18n";
import { LocationProvider, useLocation } from "@/components/LocationProvider";
import { Assistant } from "@/components/Assistant";
import { Badge, ChatIcon, CloseIcon, GlobeIcon, LinkButton, MenuIcon, PinIcon } from "@/components/ui";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 press" aria-label="GramaCare home">
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-lg font-black text-white"
      >
        ಗ
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold tracking-tight text-brand-800">GramaCare</span>
        <span className="hidden text-[0.68rem] font-medium text-ink-400 sm:block">
          Understand · Find · Reach
        </span>
      </span>
    </Link>
  );
}

function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="flex items-center gap-1.5">
      <GlobeIcon />
      <label htmlFor={compact ? "lang-mobile" : "lang-desktop"} className="sr-only">
        {t("common.language")}
      </label>
      <select
        id={compact ? "lang-mobile" : "lang-desktop"}
        value={lang}
        onChange={(event) => setLang(event.target.value as typeof lang)}
        className="min-h-10 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-ink-700"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.native}
          </option>
        ))}
      </select>
    </div>
  );
}

const NAV_LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/find-care", key: "nav.findCare" },
  { href: "/medicines", key: "nav.medicines" },
  { href: "/blood", key: "nav.blood" },
  { href: "/report", key: "nav.report" },
  { href: "/education", key: "nav.education" },
  { href: "/doctors", key: "nav.doctors" },
];

function StatusStrip() {
  const { t } = useI18n();
  const { status, label, requestLocation } = useLocation();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <div className="border-b border-slate-200 bg-white/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2 text-xs sm:text-[0.8rem]">
        <Badge tone="info">{t("common.demo")}</Badge>
        <button
          type="button"
          onClick={requestLocation}
          className="inline-flex min-h-8 items-center gap-1.5 font-semibold text-ink-700 underline decoration-dotted underline-offset-4 press"
        >
          <PinIcon />
          <span className="max-w-[52vw] truncate">
            {status === "locating" ? t("common.loading") : label}
          </span>
        </button>
        {offline ? (
          <span role="status" className="font-semibold text-amber-700">
            ⚠ {t("offline.banner")}
          </span>
        ) : (
          <span className="text-ink-400">{t("demo.notice")}</span>
        )}
      </div>
    </div>
  );
}

function Navbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.slice(0, 6).map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-2.5 py-2 text-[0.9rem] font-semibold press ${
                  active ? "bg-brand-50 text-brand-800" : "text-ink-700 hover:bg-slate-100"
                }`}
              >
                {t(link.key)}
              </Link>
            );
          })}
          <Link
            href="/emergency"
            className="ml-1 rounded-lg bg-red-600 px-3 py-2 text-[0.9rem] font-bold text-white press hover:bg-red-700"
          >
            🚨 {t("nav.emergency")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>
          <LinkButton href="/login" variant="secondary" size="sm" className="hidden lg:inline-flex">
            {t("nav.login")}
          </LinkButton>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-label={t("nav.menu")}
            className="press grid size-11 place-items-center rounded-xl border border-slate-300 text-ink-700 lg:hidden"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav aria-label="Mobile" className="mx-auto grid max-w-6xl gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-3 text-base font-semibold text-ink-700 press hover:bg-brand-50"
              >
                {t(link.key)}
              </Link>
            ))}
            <Link
              href="/emergency"
              className="rounded-xl bg-red-600 px-3 py-3 text-base font-bold text-white press"
            >
              🚨 {t("nav.emergency")}
            </Link>
            <Link href="/login" className="rounded-xl px-3 py-3 text-base font-semibold text-ink-700 press hover:bg-brand-50">
              {t("nav.login")}
            </Link>
            <div className="mt-1 border-t border-slate-200 pt-3">
              <LanguageSelector compact />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function BottomNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const items = [
    { href: "/", key: "nav.home", icon: "🏠" },
    { href: "/find-care", key: "nav.findCare", icon: "🏥" },
    { href: "/report", key: "nav.report", icon: "📄" },
    { href: "/medicines", key: "nav.medicines", icon: "💊" },
    { href: "/emergency", key: "nav.emergency", icon: "🚨", danger: true },
  ];
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/97 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[0.65rem] font-semibold press ${
                  item.danger
                    ? "text-red-700"
                    : active
                      ? "text-brand-700"
                      : "text-ink-500"
                }`}
              >
                <span aria-hidden className="text-lg leading-none">
                  {item.icon}
                </span>
                <span className="w-full truncate text-center leading-tight">{t(item.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-ink-500">{t("footer.tagline")}</p>
          <p className="mt-3 text-xs text-ink-400">{t("brand.tagline")}</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-ink-900">{t("nav.findCare")}</p>
          <ul className="space-y-1.5 text-sm text-ink-500">
            <li>
              <Link href="/find-care" className="press hover:text-brand-700">
                {t("nav.findCare")}
              </Link>
            </li>
            <li>
              <Link href="/medicines" className="press hover:text-brand-700">
                {t("nav.medicines")}
              </Link>
            </li>
            <li>
              <Link href="/blood" className="press hover:text-brand-700">
                {t("nav.blood")}
              </Link>
            </li>
            <li>
              <Link href="/doctors" className="press hover:text-brand-700">
                {t("nav.doctors")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-ink-900">{t("nav.education")}</p>
          <ul className="space-y-1.5 text-sm text-ink-500">
            <li>
              <Link href="/education" className="press hover:text-brand-700">
                {t("nav.education")}
              </Link>
            </li>
            <li>
              <Link href="/report" className="press hover:text-brand-700">
                {t("nav.report")}
              </Link>
            </li>
            <li>
              <Link href="/emergency" className="press hover:text-brand-700">
                {t("nav.emergency")}
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="press hover:text-brand-700">
                {t("nav.dashboard")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-ink-900">{t("footer.about")}</p>
          <ul className="space-y-1.5 text-sm text-ink-500">
            <li>
              <Link href="/privacy" className="press hover:text-brand-700">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="press hover:text-brand-700">
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              <Link href="/admin" className="press hover:text-brand-700">
                {t("nav.admin")}
              </Link>
            </li>
            <li>
              <a href="mailto:hello@gramacare.in" className="press hover:text-brand-700">
                {t("footer.contact")}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 px-4 py-5">
        <p className="mx-auto max-w-4xl text-center text-xs leading-relaxed text-ink-400">
          {t("footer.disclaimer")}
        </p>
      </div>
      <div className="h-16 lg:hidden" aria-hidden />
    </footer>
  );
}

function AssistantLauncher() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press fixed right-4 bottom-20 z-40 inline-flex min-h-13 items-center gap-2 rounded-full border border-brand-700/20 bg-brand-600 px-4 text-sm font-bold text-white shadow-lg lg:bottom-6"
      >
        <ChatIcon />
        <span className="hidden sm:inline">{t("assistant.open")}</span>
        <span className="sm:hidden">AI</span>
      </button>
      {open ? <Assistant onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <LocationProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Navbar />
        <StatusStrip />
        <main id="main" className="mx-auto min-h-[60vh] max-w-6xl px-4 py-6 sm:py-8">
          {children}
        </main>
        <Footer />
        <BottomNav />
        <AssistantLauncher />
      </LocationProvider>
    </I18nProvider>
  );
}
