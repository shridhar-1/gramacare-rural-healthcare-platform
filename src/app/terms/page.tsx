"use client";

import { Alert, Card, LinkButton, SectionHeading } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <SectionHeading as="h1" title={t("footer.terms")} subtitle="What GramaCare is — and what it is not." />

      <Card as="section" className="space-y-3">
        <h2 className="text-lg font-bold text-ink-900">GramaCare is an information and access platform</h2>
        <ul className="space-y-2 text-[0.98rem] text-ink-700">
          <li>• It helps you discover healthcare centres, pharmacies, blood banks and doctors near you.</li>
          <li>• It explains medical report information in simpler language.</li>
          <li>• It provides general health education.</li>
        </ul>
      </Card>

      <Card as="section" className="space-y-3 border-amber-200 bg-amber-50/70">
        <h2 className="text-lg font-bold text-amber-900">GramaCare does not</h2>
        <ul className="space-y-2 text-[0.98rem] text-amber-900">
          <li>• Diagnose any condition, or tell you what disease you have.</li>
          <li>• Prescribe medicines, doses or treatment.</li>
          <li>• Replace a doctor, nurse, pharmacist or emergency service.</li>
          <li>• Guarantee the availability shown for medicines, blood or beds — verify by phone before travelling.</li>
        </ul>
      </Card>

      <Card as="section" className="space-y-3">
        <h2 className="text-lg font-bold text-ink-900">Demo data</h2>
        <p className="text-[0.98rem] text-ink-700">
          In this hackathon prototype, facility names, phone numbers, stock levels and blood inventory are clearly
          labelled demo data. They are not connected to a live health system.
        </p>
      </Card>

      <Alert tone="warning">{t("report.disclaimer")}</Alert>

      <div className="flex flex-wrap gap-3">
        <LinkButton href="/report" variant="secondary">
          {t("nav.report")}
        </LinkButton>
        <LinkButton href="/emergency" variant="danger">
          🚨 {t("nav.emergency")}
        </LinkButton>
      </div>
    </div>
  );
}
