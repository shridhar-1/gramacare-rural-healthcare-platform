"use client";

import { Alert } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export function AdminLanguageNote() {
  const { t } = useI18n();
  return <Alert tone="neutral">{t("admin.subtitle")}</Alert>;
}
