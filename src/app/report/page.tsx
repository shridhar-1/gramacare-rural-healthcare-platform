"use client";

import { useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CheckIcon,
  Field,
  LoadingSkeleton,
  ReportIcon,
  SectionHeading,
  Textarea,
  WarnIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { ReportResult, TestStatus } from "@/lib/explain";

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

const STATUS_TONE: Record<TestStatus, "success" | "warning" | "danger" | "neutral"> = {
  within: "success",
  below: "warning",
  above: "warning",
  flagged: "danger",
  unknown: "neutral",
};

const STATUS_BORDER: Record<TestStatus, string> = {
  within: "border-l-emerald-500",
  below: "border-l-amber-500",
  above: "border-l-amber-500",
  flagged: "border-l-red-600",
  unknown: "border-l-slate-300",
};

type Stage = "idle" | "reading" | "explaining" | "done" | "error";

/** Extract text from a PDF in the browser, rebuilding rows from glyph positions. */
async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  const chunks: string[] = [];
  for (let pageNumber = 1; pageNumber <= Math.min(doc.numPages, 6); pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    type Item = { str: string; transform?: number[] };
    const rows = new Map<number, string[]>();
    for (const raw of content.items as Item[]) {
      if (!raw.str || !raw.transform) continue;
      const y = Math.round(raw.transform[5] / 3) * 3;
      const bucket = rows.get(y) ?? [];
      bucket.push(raw.str.trim());
      rows.set(y, bucket);
    }
    chunks.push(
      Array.from(rows.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([, parts]) => parts.join("   "))
        .join("\n"),
    );
  }
  return chunks.join("\n");
}

export default function ReportPage() {
  const { t } = useI18n();
  const [stage, setStage] = useState<Stage>("idle");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [aiAssisted, setAiAssisted] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function explain(rawText: string, sourceName: string | null) {
    setError(null);
    setSaved(false);
    setStage("reading");
    await new Promise((resolve) => setTimeout(resolve, 350));
    setStage("explaining");
    try {
      const response = await fetch("/api/report/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });
      const data = (await response.json()) as {
        result?: ReportResult;
        aiAssisted?: boolean;
        error?: string;
      };
      if (!response.ok || !data.result) {
        setError(data.error ?? t("report.aiError"));
        setStage("error");
        return;
      }
      setResult(data.result);
      setAiAssisted(Boolean(data.aiAssisted));
      setText(rawText);
      setFileName(sourceName);
      setStage("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t("report.aiError"));
      setStage("error");
    }
  }

  async function handleFile(file: File) {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError(t("report.readError"));
      return;
    }
    if (!ACCEPTED.includes(file.type)) {
      setError(t("report.readError"));
      return;
    }
    setFileName(file.name);
    try {
      if (file.type === "application/pdf") {
        const extracted = await extractPdfText(file);
        if (extracted.replace(/\s/g, "").length < 20) {
          setError(
            "This PDF looks like a scanned image, so its text could not be read in the browser. Please paste the report text below.",
          );
          setStage("idle");
          return;
        }
        await explain(extracted, file.name);
      } else {
        setError(
          `This prototype reads text from PDFs in your browser. For a photo or scan, please type or paste the report values below — nothing is uploaded unless you press “${t("report.explain")}”.`,
        );
        setStage("idle");
      }
    } catch {
      setError(t("report.readError"));
      setStage("idle");
    }
  }

  async function loadSample() {
    try {
      const response = await fetch("/api/report/explain");
      const data = (await response.json()) as { sample?: string };
      if (data.sample) await explain(data.sample, "sample-report.txt");
    } catch {
      setError(t("report.aiError"));
      setStage("error");
    }
  }

  async function saveResult() {
    if (!result) return;
    try {
      const response = await fetch("/api/report/explain", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: fileName ?? "Report explanation", result }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      setSaved(Boolean(data.ok));
      if (!data.ok) setError(data.error ?? "Please login to save a report explanation.");
    } catch {
      setError("You appear to be offline. The explanation is still visible on this screen.");
    }
  }

  function download() {
    if (!result) return;
    const lines = [
      "GRAMACARE — MEDICAL REPORT EXPLANATION (EDUCATIONAL ONLY)",
      result.labName ?? "",
      result.patientName ? `Patient: ${result.patientName}` : "",
      result.reportDate ? `Report date: ${result.reportDate}` : "",
      "",
      "OVERALL SUMMARY",
      result.overall,
      "",
      "RESULTS",
      ...result.tests.map((test) => {
        const status =
          test.status === "within"
            ? t("report.within")
            : test.status === "below"
              ? t("report.below")
              : test.status === "above"
                ? t("report.above")
                : test.status === "flagged"
                  ? t("report.critical")
                  : t("report.noReference");
        return `- ${test.name}: ${test.valueText} | ${t("report.reference")}: ${
          test.refText ?? t("report.noReference")
        } | ${t("report.status")}: ${status}\n  ${test.explanation}`;
      }),
      "",
      t("report.questions"),
      ...result.questions.map((question) => `- ${question}`),
      "",
      t("report.disclaimer"),
    ];
    const blob = new Blob([lines.filter(Boolean).join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gramacare-report-explanation.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const busy = stage === "reading" || stage === "explaining";

  return (
    <div className="space-y-6">
      <SectionHeading as="h1" title={t("report.title")} subtitle={t("report.subtitle")} />

      <Alert tone="warning" title={t("common.emergency") ? "Important" : "Important"}>
        {t("report.disclaimer")}
      </Alert>

      {stage === "done" && result ? (
        <div className="space-y-5">
          <Card as="section" className="space-y-3" aria-labelledby="summary-heading">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="summary-heading" className="text-xl font-bold text-ink-900">
                  {t("report.summary")}
                </h2>
                <p className="mt-1 text-sm text-ink-500">{result.labName ?? fileName ?? "Uploaded report"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="brand">{aiAssisted ? "AI-assisted" : "Rule-based explainer"}</Badge>
                <Badge tone="info">{t("common.demo")}</Badge>
              </div>
            </div>

            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <dt className="text-xs text-ink-400">{t("report.patient")}</dt>
                <dd className="font-semibold text-ink-900">{result.patientName ?? "—"}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <dt className="text-xs text-ink-400">{t("report.reportDate")}</dt>
                <dd className="font-semibold text-ink-900">{result.reportDate ?? "—"}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <dt className="text-xs text-ink-400">{t("report.results")}</dt>
                <dd className="font-semibold text-ink-900">
                  {result.counts.total} · {result.counts.within} {t("report.within")} ·{" "}
                  {result.counts.outside} {t("report.above")}/{t("report.below")}
                </dd>
              </div>
            </dl>

            <div>
              <h3 className="text-base font-bold text-ink-900">{t("report.overall")}</h3>
              <p className="mt-1.5 text-[1rem] leading-relaxed text-ink-700">{result.overall}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="secondary" onClick={download}>
                ⬇ {t("report.download")}
              </Button>
              <Button variant="secondary" onClick={() => void saveResult()} disabled={saved}>
                {saved ? `✓ ${t("report.saved")}` : t("report.save")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setStage("idle");
                  setResult(null);
                  setText("");
                  setFileName(null);
                }}
              >
                {t("report.startOver")}
              </Button>
            </div>
          </Card>

          {result.quotedNotes.length > 0 ? (
            <Card as="section" className="space-y-2 border-sky-200 bg-sky-50/60">
              <h2 className="text-base font-bold text-ink-900">Written in the report (not added by GramaCare)</h2>
              {result.quotedNotes.map((note) => (
                <p key={note.label} className="text-[0.95rem] text-ink-700">
                  <span className="font-semibold">{note.label}: </span>“{note.text}”
                </p>
              ))}
              <p className="text-xs text-ink-400">
                This text was written by the reporting laboratory or clinician. GramaCare quotes it as-is and does not
                interpret it.
              </p>
            </Card>
          ) : null}

          <section aria-labelledby="results-heading" className="space-y-3">
            <h2 id="results-heading" className="text-lg font-bold text-ink-900">
              {t("report.results")}
            </h2>
            <ul className="space-y-3">
              {result.tests.map((test) => {
                const tone = STATUS_TONE[test.status];
                const label =
                  test.status === "within"
                    ? t("report.within")
                    : test.status === "below"
                      ? t("report.below")
                      : test.status === "above"
                        ? t("report.above")
                        : test.status === "flagged"
                          ? t("report.critical")
                          : t("common.noResults");
                return (
                  <Card
                    as="li"
                    key={`${test.name}-${test.sourceLine}`}
                    className={`border-l-4 ${STATUS_BORDER[test.status]}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-base font-bold text-ink-900">{test.name}</h3>
                      <Badge tone={tone} icon={tone === "success" ? <CheckIcon /> : tone === "neutral" ? null : <WarnIcon />}>
                        {label}
                      </Badge>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                        <p className="text-xs text-ink-400">{t("report.explanation") === "" ? "" : "Result"}</p>
                        <p className="text-lg font-extrabold text-ink-900">{test.valueText}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                        <p className="text-xs text-ink-400">{t("report.reference")}</p>
                        <p className="text-[0.98rem] font-semibold text-ink-900">
                          {test.refText ?? t("report.noReference")}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-700">{test.explanation}</p>
                    {test.flagFromReport ? (
                      <p className="mt-2 text-xs text-ink-400">
                        {t("report.critical")}: {test.flagFromReport}
                      </p>
                    ) : null}
                  </Card>
                );
              })}
            </ul>
          </section>

          {result.questions.length > 0 ? (
            <Card as="section" className="space-y-3" aria-labelledby="questions-heading">
              <h2 id="questions-heading" className="text-lg font-bold text-ink-900">
                {t("report.questions")}
              </h2>
              <ol className="space-y-2">
                {result.questions.map((question, index) => (
                  <li key={question} className="flex gap-2.5 text-[0.98rem] text-ink-700">
                    <span className="font-bold text-brand-700">{index + 1}.</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ol>
            </Card>
          ) : null}

          <Alert tone="warning">{t("report.disclaimer")}</Alert>

          <details className="card-surface p-4">
            <summary className="cursor-pointer text-sm font-semibold text-ink-700">
              {t("report.extracted")}
            </summary>
            <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-50 p-3 text-xs whitespace-pre-wrap text-ink-500">
              {text}
            </pre>
          </details>
        </div>
      ) : busy ? (
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <ReportIcon />
              </span>
              <div>
                <p className="font-bold text-ink-900">{t("report.processing")}</p>
                <p className="text-sm text-ink-500">
                  {stage === "reading" ? "Step 1 of 2 — reading the report" : "Step 2 of 2 — explaining each value"}
                </p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: stage === "reading" ? "45%" : "85%" }}
              />
            </div>
          </Card>
          <LoadingSkeleton count={3} />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card as="section" className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-ink-900">{t("report.uploadPdf")}</h2>
              <p className="mt-1 text-sm text-ink-500">{t("report.uploadHint")}</p>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0];
                if (file) void handleFile(file);
              }}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/50 px-4 py-8 text-center press hover:bg-brand-50"
            >
              <ReportIcon />
              <span className="text-base font-bold text-ink-900">{t("report.uploadPdf")}</span>
              <span className="text-sm text-ink-500">Tap to choose a file, or drag it here</span>
              {fileName ? (
                <span className="mt-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-700">
                  {fileName}
                </span>
              ) : null}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => void loadSample()}>
                {t("report.sample")}
              </Button>
              <Button variant="ghost" onClick={() => setText("")}>
                {t("common.reset")}
              </Button>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <Field label={t("report.orPaste")} htmlFor="report-text" hint={t("report.pastePlaceholder")}>
                <Textarea
                  id="report-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder={t("report.pastePlaceholder")}
                  className="min-h-40 font-mono text-sm"
                />
              </Field>
              <Button
                size="lg"
                className="mt-3"
                disabled={text.trim().length < 8}
                onClick={() => void explain(text, fileName)}
              >
                {t("report.explain")}
              </Button>
            </div>

            {error ? (
              <Alert tone="danger" title={t("report.readError")}>
                {error}
              </Alert>
            ) : null}
          </Card>

          <div className="space-y-4">
            <Card as="section" className="space-y-2.5">
              <h2 className="text-base font-bold text-ink-900">{t("report.privacyTitle")}</h2>
              <p className="text-[0.95rem] text-ink-500">{t("report.privacyBody")}</p>
              <ul className="space-y-1.5 text-sm text-ink-500">
                <li>• PDF text is extracted in your browser.</li>
                <li>• Only the extracted text is sent for the explanation.</li>
                <li>• Nothing is stored unless you press “{t("report.save")}”.</li>
              </ul>
            </Card>

            <Card as="section" className="space-y-2.5">
              <h2 className="text-base font-bold text-ink-900">How we decide the colour labels</h2>
              <ul className="space-y-2 text-sm text-ink-500">
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-3 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  <span>
                    <strong className="text-ink-700">{t("report.within")}</strong> — the value sits inside the range
                    printed on your report.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-3 shrink-0 rounded-full bg-amber-500" aria-hidden />
                  <span>
                    <strong className="text-ink-700">{t("report.above")} / {t("report.below")}</strong> — the value is
                    outside the range printed on your report.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-3 shrink-0 rounded-full bg-red-600" aria-hidden />
                  <span>
                    <strong className="text-ink-700">{t("report.critical")}</strong> — only used when the report itself
                    marks the value as critical.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-3 shrink-0 rounded-full bg-slate-300" aria-hidden />
                  <span>
                    <strong className="text-ink-700">{t("report.noReference")}</strong> — GramaCare never guesses a
                    reference range.
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
