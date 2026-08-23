"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Field, Input, SectionHeading } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        user?: { role: string };
        error?: string;
      };
      if (!response.ok || data.error) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }
      const role = data.user?.role ?? "patient";
      router.push(role === "admin" ? "/admin" : role === "provider" || role === "doctor" ? "/dashboard" : "/find-care");
      router.refresh();
    } catch {
      setError("You appear to be offline. You can continue as a guest.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <SectionHeading as="h1" title={t("login.title")} subtitle={t("login.subtitle")} />

      <Card as="section" className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={mode === "login" ? "primary" : "secondary"}
            onClick={() => setMode("login")}
            aria-pressed={mode === "login"}
          >
            {t("login.submit")}
          </Button>
          <Button
            variant={mode === "register" ? "primary" : "secondary"}
            onClick={() => setMode("register")}
            aria-pressed={mode === "register"}
          >
            {t("login.name")}
          </Button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void send({ mode, ...form });
          }}
        >
          {mode === "register" ? (
            <>
              <Field label={t("login.name")} htmlFor="login-name">
                <Input
                  id="login-name"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </Field>
              <Field label={t("doctors.yourPhone")} htmlFor="login-phone">
                <Input
                  id="login-phone"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </Field>
            </>
          ) : null}

          <Field label={t("login.email")} htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="provider@gramacare.in"
            />
          </Field>
          <Field
            label={t("login.password")}
            htmlFor="login-password"
            hint={mode === "login" ? t("login.demoHint") : undefined}
          >
            <Input
              id="login-password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="gramacare123"
            />
          </Field>

          <Button type="submit" size="lg" disabled={busy} fullWidth>
            {busy ? t("common.loading") : t("login.submit")}
          </Button>
        </form>

        {error ? <Alert tone="danger">{error}</Alert> : null}
      </Card>

      <Card as="section" className="space-y-3 text-center">
        <p className="text-[0.95rem] text-ink-500">{t("login.guestNote")}</p>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => {
            void send({ mode: "guest" });
            router.push("/find-care");
          }}
        >
          {t("login.guest")}
        </Button>
        <p className="text-xs text-ink-400">{t("login.userNote")}</p>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-base font-bold text-ink-900">Demo accounts</h2>
        <ul className="space-y-1 text-sm text-ink-500">
          <li>Provider — provider@gramacare.in / gramacare123</li>
          <li>Doctor — doctor@gramacare.in / gramacare123</li>
          <li>Admin — admin@gramacare.in / gramacare123</li>
        </ul>
        <p className="text-xs text-ink-400">{t("common.demo")} · {t("demo.notice")}</p>
      </Card>
    </div>
  );
}
