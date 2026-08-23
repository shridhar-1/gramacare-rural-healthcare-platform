"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

/* ------------------------------------------------------------------ Button */

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost" | "quiet";
type ButtonSize = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 border border-brand-700/20 shadow-sm",
  secondary: "bg-white text-brand-800 border border-brand-300 hover:bg-brand-50",
  outline: "bg-white text-ink-700 border border-slate-300 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700 border border-red-700/20 shadow-sm",
  ghost: "bg-transparent text-brand-700 hover:bg-brand-50 border border-transparent",
  quiet: "bg-slate-100 text-ink-700 hover:bg-slate-200 border border-transparent",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm gap-1.5",
  md: "min-h-11 px-4 text-[0.95rem] gap-2",
  lg: "min-h-13 px-5 text-base gap-2",
  xl: "min-h-14 px-6 text-lg gap-2.5",
};

const BASE =
  "inline-flex items-center justify-center rounded-xl font-semibold press select-none disabled:opacity-55 disabled:cursor-not-allowed";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
  children,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
  children: ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link
      href={href}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------- Card */

export function Card({
  as: Tag = "div",
  className = "",
  interactive = false,
  children,
}: {
  as?: "div" | "li" | "article" | "section";
  className?: string;
  interactive?: boolean;
  children: ReactNode;
}) {
  return (
    <Tag
      className={`card-surface p-4 sm:p-5 ${
        interactive ? "press hover:border-brand-300 hover:shadow-md" : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
  id,
  as = "h2",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  id?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const Tag = as;
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Tag id={id} className="text-xl font-bold text-ink-900 sm:text-2xl">
          {title}
        </Tag>
        {subtitle ? <p className="mt-1 max-w-2xl text-[0.95rem] text-ink-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------- Badge */

type Tone = "brand" | "success" | "warning" | "danger" | "neutral" | "info";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-800 border-brand-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warning: "bg-amber-50 text-amber-900 border-amber-300",
  danger: "bg-red-50 text-red-800 border-red-200",
  neutral: "bg-slate-100 text-ink-700 border-slate-200",
  info: "bg-sky-50 text-sky-800 border-sky-200",
};

export function Badge({
  tone = "neutral",
  icon,
  className = "",
  children,
}: {
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

export function DemoBadge({ label = "Demo data" }: { label?: string }) {
  return (
    <Badge tone="info" className="whitespace-nowrap">
      {label}
    </Badge>
  );
}

/* ------------------------------------------------------------------- Alert */

export function Alert({
  tone = "info",
  title,
  icon,
  className = "",
  children,
}: {
  tone?: "info" | "success" | "warning" | "danger" | "neutral";
  title?: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const map = {
    info: "border-sky-300 bg-sky-50 text-sky-900",
    success: "border-emerald-300 bg-emerald-50 text-emerald-900",
    warning: "border-amber-300 bg-amber-50 text-amber-900",
    danger: "border-red-300 bg-red-50 text-red-900",
    neutral: "border-slate-300 bg-slate-50 text-ink-700",
  } as const;
  return (
    <div
      role={tone === "danger" ? "alert" : "note"}
      className={`flex gap-3 rounded-xl border p-3.5 text-[0.95rem] leading-relaxed ${map[tone]} ${className}`}
    >
      {icon ? <span aria-hidden className="mt-0.5 shrink-0 text-lg leading-none">{icon}</span> : null}
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-0.5" : ""}>{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Form controls */

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink-700">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
    </div>
  );
}

const CONTROL =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[1rem] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${CONTROL} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${CONTROL} min-h-28 ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${CONTROL} pr-9 ${className}`} {...props}>
      {children}
    </select>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  label,
  onSubmit,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  onSubmit?: () => void;
  className?: string;
}) {
  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <label htmlFor="gramacare-search" className="sr-only">
        {label}
      </label>
      <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-400">
        <SearchIcon />
      </span>
      <input
        id="gramacare-search"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${CONTROL} pl-11`}
      />
    </form>
  );
}

/* ------------------------------------------------------------ Chips / toggles */

export function Chip({
  active,
  onClick,
  children,
  tone = "brand",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  tone?: "brand" | "danger";
}) {
  const activeTone =
    tone === "danger" ? "border-red-600 bg-red-600 text-white" : "border-brand-600 bg-brand-600 text-white";
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`press min-h-10 rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
        active ? activeTone : "border-slate-300 bg-white text-ink-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 press hover:border-brand-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 shrink-0 accent-brand-600"
      />
      <span className="text-sm font-medium text-ink-700">{label}</span>
    </label>
  );
}

/* ------------------------------------------------------- Loading and empty */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="card-surface space-y-3 p-5">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function EmptyState({
  icon = "🔍",
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-surface flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span aria-hidden className="text-3xl">
        {icon}
      </span>
      <p className="text-base font-semibold text-ink-900">{title}</p>
      {body ? <p className="max-w-md text-[0.95rem] text-ink-500">{body}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading results">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- Modal */

export function Modal({
  open,
  onClose,
  title,
  children,
  closeLabel = "Close",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeLabel?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/45 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="press -mt-1 rounded-lg p-2 text-ink-500 hover:bg-slate-100"
            aria-label={closeLabel}
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Icons */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M4 5c0-.6.4-1 1-1h2.4c.5 0 .9.3 1 .8l.8 3c.1.4 0 .8-.4 1l-1.5 1.2a11 11 0 0 0 5.7 5.7l1.2-1.5c.2-.3.6-.5 1-.4l3 .8c.5.1.8.5.8 1V19c0 .6-.4 1-1 1h-1A13 13 0 0 1 4 6Z" />
    </svg>
  );
}

export function RouteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M6 3v12" />
      <circle cx="6" cy="18" r="2.4" />
      <path d="M18 21V9" />
      <circle cx="18" cy="6" r="2.4" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function HospitalIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M9.5 21v-5h5v5" />
      <path d="M12 7.5v4M10 9.5h4" />
    </svg>
  );
}

export function PillIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <rect x="3" y="9" width="18" height="6.5" rx="3.25" transform="rotate(-40 12 12)" />
      <path d="M9 15 15 9" />
    </svg>
  );
}

export function DropIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M12 3s6 6.4 6 10.5A6 6 0 0 1 6 13.5C6 9.4 12 3 12 3Z" />
    </svg>
  );
}

export function ReportIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

export function DoctorIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M5 21v-1.5A5.5 5.5 0 0 1 10.5 14h3A5.5 5.5 0 0 1 19 19.5V21" />
      <path d="M12 16v3M10.5 17.5h3" />
    </svg>
  );
}

export function SirenIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M6 18v-4a6 6 0 0 1 12 0v4" />
      <path d="M4 18h16v2.5H4z" />
      <path d="M12 4V2M4.5 7 3 5.8M19.5 7 21 5.8" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="m5 13 4.5 4.5L19 7" />
    </svg>
  );
}

export function WarnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M12 4.5 21 20H3z" />
      <path d="M12 10v5M12 17.6v.2" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.4 2.4 14.6 0 17M12 3.5c-2.4 2.4-2.4 14.6 0 17" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M12 3l7 3v6c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M20 12c0 4-3.6 7-8 7-1 0-2-.2-2.9-.5L5 20l1.2-3.2A6.7 6.7 0 0 1 4 12c0-4 3.6-7 8-7s8 3 8 7Z" />
    </svg>
  );
}
