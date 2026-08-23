"use client";

import { Alert, Card, SectionHeading } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <SectionHeading as="h1" title={t("footer.privacy")} subtitle="How GramaCare handles your information." />

      <Card as="section" className="space-y-3">
        <h2 className="text-lg font-bold text-ink-900">Medical reports</h2>
        <ul className="space-y-2 text-[0.98rem] text-ink-700">
          <li>• A report you upload is read in your browser so its text can be extracted.</li>
          <li>• Only the extracted text is sent to the explanation service, and it is not logged.</li>
          <li>• Nothing is stored unless you are signed in and press “Save to my account”.</li>
          <li>• You can download the explanation and delete it from your device at any time.</li>
        </ul>
      </Card>

      <Card as="section" className="space-y-3">
        <h2 className="text-lg font-bold text-ink-900">Location</h2>
        <p className="text-[0.98rem] text-ink-700">
          Your location is used only to sort healthcare, pharmacy and blood-bank results by distance. It is stored on
          your device (browser local storage) and is never sold or shared. If you deny location access, you can search
          by village, town or PIN code instead.
        </p>
      </Card>

      <Card as="section" className="space-y-3">
        <h2 className="text-lg font-bold text-ink-900">Accounts</h2>
        <p className="text-[0.98rem] text-ink-700">
          Login is optional. Passwords are hashed before storage. Signed-in accounts can save centres and report
          explanations. Guest activity is not linked to any profile.
        </p>
      </Card>

      <Alert tone="warning">{t("footer.disclaimer")}</Alert>
    </div>
  );
}
