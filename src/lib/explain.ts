/**
 * GramaCare report explainer — deterministic, offline capable.
 *
 * Rules that cannot be broken:
 *  1. Reference ranges are read ONLY from the uploaded report.
 *  2. A value is flagged "critical" ONLY if the report itself flags it.
 *  3. Output explains information; it never diagnoses or prescribes.
 */

export type TestStatus = "within" | "below" | "above" | "flagged" | "unknown";

export type ParsedTest = {
  name: string;
  valueText: string;
  value: number | null;
  unit: string | null;
  refLow: number | null;
  refHigh: number | null;
  refText: string | null;
  status: TestStatus;
  flagFromReport: string | null;
  explanation: string;
  sourceLine: string;
};

export type ReportResult = {
  patientName: string | null;
  patientAge: string | null;
  patientSex: string | null;
  reportDate: string | null;
  labName: string | null;
  overall: string;
  tests: ParsedTest[];
  quotedNotes: { label: string; text: string }[];
  questions: string[];
  counts: { total: number; within: number; outside: number; unknown: number };
  engine: "rule-based" | "ai-assisted";
};

const ABOUT: { match: RegExp; about: string }[] = [
  { match: /haemoglobin|hemoglobin|h\b/i, about: "Haemoglobin is the protein in blood that carries oxygen." },
  { match: /total leucocyte|tlc|wbc count|white blood/i, about: "White blood cells help the body fight infection." },
  { match: /platelet/i, about: "Platelets help blood to clot when there is bleeding." },
  { match: /rbc count|red blood|erythrocyte/i, about: "Red blood cells carry oxygen from the lungs to the body." },
  { match: /hematocrit|haematocrit|pcv|packed cell/i, about: "This shows how much of the blood volume is made up of red cells." },
  { match: /\bmcv\b/i, about: "MCV shows the average size of red blood cells." },
  { match: /\bmch\b/i, about: "MCH shows the average amount of haemoglobin inside a red cell." },
  { match: /\bmchc\b/i, about: "MCHC shows the concentration of haemoglobin in red cells." },
  { match: /\besr\b/i, about: "ESR is a general blood test that can rise when there is inflammation." },
  { match: /fasting blood sugar|glucose.*fasting|fbs|fbg/i, about: "This measures sugar in the blood after not eating for several hours." },
  { match: /random blood sugar|glucose.*random|rbs/i, about: "This measures sugar in the blood at the time of the test." },
  { match: /hba1c|glycated|glycosylated/i, about: "HbA1c shows the average blood sugar over roughly three months." },
  { match: /urea/i, about: "Urea is a waste product filtered out of the blood by the kidneys." },
  { match: /creatinine/i, about: "Creatinine is a waste product that the kidneys remove from blood." },
  { match: /uric acid/i, about: "Uric acid is a waste product that leaves the body through urine." },
  { match: /bilirubin/i, about: "Bilirubin is a pigment from the breakdown of red blood cells, processed by the liver." },
  { match: /sgpt|alt\b/i, about: "This is a liver enzyme that can rise when liver cells are irritated." },
  { match: /sgot|ast\b/i, about: "This enzyme is found in liver, heart and muscle cells." },
  { match: /alkaline phosphatase|alp\b/i, about: "This enzyme comes from liver and bone." },
  { match: /albumin/i, about: "Albumin is a protein made by the liver that carries other substances in blood." },
  { match: /total protein/i, about: "This measures the total amount of protein in the blood." },
  { match: /cholesterol|lipid/i, about: "This measures fats carried in the blood." },
  { match: /triglyceride/i, about: "Triglycerides are a type of fat stored in the body and carried in blood." },
  { match: /\bldl\b/i, about: "LDL is often called the 'low-density' cholesterol fraction." },
  { match: /\bhdl\b/i, about: "HDL is often called the 'high-density' cholesterol fraction." },
  { match: /\bvldl\b/i, about: "VLDL carries triglycerides through the blood." },
  { match: /thyroid|tsh\b/i, about: "TSH is a signal from the brain that controls the thyroid gland." },
  { match: /\bt3\b|\bt4\b|free t/i, about: "These are hormones made by the thyroid gland." },
  { match: /potassium|k\b|sodium|na\b|chloride/i, about: "These are salts that keep nerves, muscles and fluid balance working." },
  { match: /calcium/i, about: "Calcium keeps bones and teeth strong and helps muscles work." },
  { match: /vitamin d|25-oh|25 oh/i, about: "Vitamin D helps the body absorb calcium." },
  { match: /vitamin b12|b12|cobalamin/i, about: "Vitamin B12 keeps blood and nerve cells healthy." },
  { match: /ferritin/i, about: "Ferritin shows how much iron is stored in the body." },
  { match: /iron/i, about: "Iron is needed to make haemoglobin." },
  { match: /psa/i, about: "PSA is a protein made by the prostate gland." },
  { match: /urine|albuminuria|pus cells/i, about: "This test looks at what is present in urine." },
  { match: /blood pressure|systolic|diastolic/i, about: "These numbers show the pressure of blood in the arteries." },
];

const GENERIC_TESTS = /(test|investigation|parameter|profile|panel|analysis)/i;

function aboutTest(name: string): string {
  const found = ABOUT.find((entry) => entry.match.test(name));
  if (found) return found.about;
  return `${name} is one of the measurements printed in this report.`;
}

const RANGE_PATTERN =
  /(\d+(?:[.,]\d+)?)\s*(?:-|–|to|upto|up to|until|–)\s*(\d+(?:[.,]\d+)?)/i;
const LT_PATTERN = /[<≤]\s*(\d+(?:[.,]\d+)?)/i;
const GT_PATTERN = /[>≥]\s*(\d+(?:[.,]\d+)?)/i;

function toNumber(raw: string): number | null {
  // "7,800" is a thousands separator, "7,8" is a decimal comma.
  const cleaned = /,\d{3}$/.test(raw) ? raw.replace(/,/g, "") : raw.replace(",", ".");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

const UNIT = /^(g\/?dl|mg\/?dl|mmol\/?l|µ?mol\/?l|g%|mg%|u\/?l|iu\/?l|mu\/?l|pg|ng\/?ml|fl|pg\/?cell|%|mm3|\/cumm|\/µl|milli?s?\b|cells\/cumm|meq\/?l|iu\/?ml|nmol\/?l|gm\/?dl|mm\/hg|ms)\.?$/i;

const FLAG_PATTERNS: { match: RegExp; label: string }[] = [
  { match: /\bcritical\b|\balert\b|\bpanic\b|\*\*/i, label: "Critical" },
  { match: /\bhigh\b|\babove\b|\^\s*up|▼?\bh\b(igh)?$/i, label: "High" },
  { match: /\blow\b|\bbelow\b|\bl\b(ow)?$/i, label: "Low" },
  { match: /\babnormal\b/i, label: "Abnormal" },
];

function detectFlag(text: string): string | null {
  for (const pattern of FLAG_PATTERNS) {
    if (pattern.match.test(text)) return pattern.label;
  }
  return null;
}

const ACRONYMS = [
  "MCV", "MCH", "MCHC", "ESR", "HbA1c", "SGPT", "SGOT", "ALP", "ALT", "AST", "TSH",
  "T3", "T4", "RBC", "WBC", "TLC", "PSA", "HDL", "LDL", "VLDL", "PCV", "ORS", "ECG",
  "BP", "Hb", "DNA", "RNA", "IgE", "CRP",
];

function restoreAcronyms(value: string): string {
  let output = value;
  for (const acronym of ACRONYMS) {
    const pattern = new RegExp(`\\b${acronym.replace(/\+/g, "\\+")}\\b`, "gi");
    output = output.replace(pattern, acronym);
  }
  return output;
}

function titleCase(value: string): string {
  return restoreAcronyms(
    value
      .toLowerCase()
      .split(/\s+/)
      .map((word) =>
        word.length <= 2 && /^(of|in|the|and)$/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(" "),
  );
}

const METADATA_LINE =
  /^(patient|patient\s*name|name|age|sex|gender|dob|date|dated|collection|collected|received|reported|referred|ref|ref\.|lab|lab\s*no|registration|sample|specimen|id|barcode|address|phone|mobile|printed|page|method|instrument|technique|interpretation|comments|remarks?|impression|conclusion|advice|notes?|doctor|dr\.|mr\.|mrs\.|ms\.|height|weight|bmi|blood\s*pressure\s*recorded)/i;

/** Offsets of tokens that are a bare number, e.g. `10.2` or `7,800`. */
function numberTokens(source: string): { value: number; text: string; start: number; end: number }[] {
  const found: { value: number; text: string; start: number; end: number }[] = [];
  const pattern = /(^|\s)(-?\d+(?:[.,]\d+)?)(?=\s|$)/g;
  let match = pattern.exec(source);
  while (match) {
    found.push({
      value: toNumber(match[2]) ?? Number.NaN,
      text: match[2],
      start: match.index + match[1].length,
      end: match.index + match[1].length + match[2].length,
    });
    match = pattern.exec(source);
  }
  return found;
}

function parseLine(line: string): ParsedTest | null {
  const cleaned = line.replace(/\s+/g, " ").trim();
  if (cleaned.length < 6) return null;
  if (METADATA_LINE.test(cleaned)) return null;

  const parts = cleaned
    .split(/\s*\|\s*|\t+|\s{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  const multiColumn = parts.length > 1;
  const source = multiColumn ? parts.slice(1).join(" ") : cleaned;

  const numbers = numberTokens(source);
  if (numbers.length === 0) return null;

  const reference = source.match(RANGE_PATTERN) ?? source.match(LT_PATTERN) ?? source.match(GT_PATTERN);
  const referenceStart = reference ? (reference.index ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;

  // Prefer the first number that appears before the printed reference range;
  // otherwise take the last number (label words such as "B12" are skipped).
  const beforeReference = numbers.filter((item) => item.start < referenceStart);
  const chosen = beforeReference.length > 0 ? beforeReference[0] : numbers[numbers.length - 1];

  const labelRaw = multiColumn
    ? parts[0]
    : source.slice(0, chosen.start).replace(/[:\-–]+$/, "").trim();
  const label = titleCase(labelRaw.replace(/[:\-–]+$/, "").trim());
  if (!label || label.length < 3 || !/[a-z]{2,}/i.test(label) || GENERIC_TESTS.test(label)) return null;

  const rest = source.slice(chosen.start).trim();
  const value = chosen.value;
  const after = source.slice(chosen.end).trim();
  const unitCandidate = after.match(/^([A-Za-zµ%/°0-9.]+(?:\/[A-Za-zµ%]+)?)\.?/);
  const unit =
    unitCandidate && (UNIT.test(unitCandidate[1]) || unitCandidate[1].length <= 9)
      ? unitCandidate[1]
      : null;

  let refLow: number | null = null;
  let refHigh: number | null = null;
  let refText: string | null = null;

  const range = source.match(RANGE_PATTERN);
  if (range) {
    refLow = toNumber(range[1]);
    refHigh = toNumber(range[2]);
    refText = `${range[1]} – ${range[2]}${unit ? ` ${unit}` : ""}`;
  } else {
    const lt = source.match(LT_PATTERN);
    const gt = source.match(GT_PATTERN);
    if (lt && (lt.index ?? 0) > chosen.start) {
      refHigh = toNumber(lt[1]);
      refText = `Below ${lt[1]}${unit ? ` ${unit}` : ""}`;
    } else if (gt && (gt.index ?? 0) > chosen.start) {
      refLow = toNumber(gt[1]);
      refText = `Above ${gt[1]}${unit ? ` ${unit}` : ""}`;
    }
  }

  const flagFromReport = detectFlag(rest);

  let status: TestStatus = "unknown";
  if (flagFromReport === "Critical") status = "flagged";
  else if (value !== null && (refLow !== null || refHigh !== null)) {
    if (refLow !== null && value < refLow) status = "below";
    else if (refHigh !== null && value > refHigh) status = "above";
    else status = "within";
  } else if (flagFromReport === "High" || flagFromReport === "Abnormal") status = "above";
  else if (flagFromReport === "Low") status = "below";

  const displayValue = /,\d{3}$/.test(chosen.text)
    ? chosen.text.replace(/,/g, "")
    : chosen.text.replace(",", ".");
  const valueText = `${displayValue}${unit ? ` ${unit}` : ""}`;
  const explanation = explainTest({ label, valueText, unit, refText, status, flagFromReport });

  return {
    name: label,
    valueText,
    value,
    unit,
    refLow,
    refHigh,
    refText,
    status,
    flagFromReport,
    explanation,
    sourceLine: cleaned,
  };
}

function explainTest(input: {
  label: string;
  valueText: string;
  unit: string | null;
  refText: string | null;
  status: TestStatus;
  flagFromReport: string | null;
}): string {
  const { label, valueText, unit, refText, status, flagFromReport } = input;
  const about = aboutTest(label);
  const rangeSentence = refText
    ? `This laboratory prints a reference range of ${refText.replace(/ – /, " to ")}.`
    : "The report does not print a reference range for this measurement, so GramaCare cannot say whether it is unusual.";

  const statusSentence =
    status === "within"
      ? `Your result (${valueText}) sits inside that range.`
      : status === "below"
        ? `Your result (${valueText}) is below the range printed by this laboratory.`
        : status === "above"
          ? `Your result (${valueText}) is above the range printed by this laboratory.`
          : status === "flagged"
            ? `The report itself marks this result as critical (${valueText}).`
            : `Your result is recorded as ${valueText}${unit ? ` ${unit}` : ""}.`;

  const closing =
    status === "within"
      ? "Results inside the printed range are usually reassuring, but only your doctor can interpret them along with your symptoms."
      : "There can be several reasons for a result outside the printed range, including how the sample was taken, recent food, medicines or illness. Please discuss this with a qualified healthcare professional.";

  const flagNote = flagFromReport && flagFromReport !== "Critical" ? ` The report marks it "${flagFromReport}".` : "";

  return `${about} ${rangeSentence} ${statusSentence}${flagNote} ${closing}`;
}

function buildQuestions(tests: ParsedTest[]): string[] {
  const questions = new Set<string>();
  const outside = tests.filter((test) => test.status === "below" || test.status === "above");
  const flagged = tests.filter((test) => test.status === "flagged");

  if (flagged.length > 0) {
    questions.add(
      `The report marks ${flagged.map((test) => test.name).join(", ")} as critical — what should I do today?`,
    );
  }
  for (const test of outside.slice(0, 5)) {
    questions.add(`What does my ${test.name} result of ${test.valueText} mean?`);
  }
  if (outside.length > 0) {
    questions.add("Is this result outside the expected range for me, and by how much?");
    questions.add("Should any of these tests be repeated, and when?");
    questions.add("Could food, medicines or the sample itself have affected these numbers?");
    questions.add("Do I need any additional evaluation or a specialist opinion?");
  }
  if (tests.some((test) => test.status === "unknown")) {
    questions.add("Some measurements have no reference range printed — what is normal in my case?");
  }
  questions.add("What should I watch for at home before the next visit?");
  return Array.from(questions).slice(0, 7);
}

const NOTE_LABELS =
  /^\s*(impression|remarks?|comments?|interpretation|advice|conclusion|diagnosis|notes?)\s*[:\-]?\s*(.{3,})$/i;

function extractQuotedNotes(lines: string[]): { label: string; text: string }[] {
  const notes: { label: string; text: string }[] = [];
  for (const line of lines) {
    const match = line.match(NOTE_LABELS);
    if (match && match[2]) {
      notes.push({ label: titleCase(match[1]), text: match[2].trim() });
    }
    if (notes.length >= 4) break;
  }
  return notes;
}

export function explainReport(rawText: string): ReportResult {
  const text = rawText.replace(/\r/g, "\n").replace(/\u00a0/g, " ");
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const patientName =
    text.match(/(?:patient\s*name|patient|^|\s)name\s*[:\-]\s*([A-Za-z .]{3,60})/i)?.[1]?.trim() ?? null;
  const patientAge = text.match(/\bage\s*[:\-]?\s*(\d{1,3}\s*(?:years?|yrs?)?)/i)?.[1]?.trim() ?? null;
  const patientSex = text.match(/\b(?:sex|gender)\s*[:\-]?\s*(male|female|m|f)\b/i)?.[1] ?? null;
  const dateMatch =
    text.match(/(?:reported\s*(?:on|date)?|collection\s*(?:date)?|date)\s*[:\-]\s*([0-9]{1,2}[\/\-.][0-9A-Za-z]{1,9}[\/\-.][0-9]{2,4})/i) ??
    text.match(/([0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{2,4})/);
  const reportDate = dateMatch?.[1] ?? null;
  const labName =
    lines.find((line) => /(laboratory|diagnostic|pathology|hospital|clinic|lab\b)/i.test(line) && line.length < 80) ??
    null;

  const seen = new Set<string>();
  const tests: ParsedTest[] = [];
  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) continue;
    const key = parsed.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tests.push(parsed);
  }

  const counts = {
    total: tests.length,
    within: tests.filter((test) => test.status === "within").length,
    outside: tests.filter((test) => test.status === "below" || test.status === "above").length,
    unknown: tests.filter((test) => test.status === "unknown" || test.status === "flagged").length,
  };

  const outsideNames = tests
    .filter((test) => test.status === "below" || test.status === "above")
    .map((test) => test.name)
    .slice(0, 5);

  const flaggedCount = tests.filter((test) => test.status === "flagged").length;

  let overall: string;
  if (counts.total === 0) {
    overall =
      "No readable measurement lines were found in the text provided. Try uploading a clearer scan, or paste the report text directly.";
  } else if (counts.outside === 0 && flaggedCount === 0) {
    overall = `This report contains ${counts.total} measurements. Every measurement that printed a reference range sits inside that range. Only a qualified healthcare professional can interpret these numbers together with your symptoms and history.`;
  } else {
    overall = `This report contains ${counts.total} measurements. ${
      counts.outside
    } of them are outside the reference range printed by this laboratory: ${outsideNames.join(
      ", ",
    )}. This is information, not a diagnosis — many things can move a single number. Please show this report to a qualified healthcare professional, who will read it along with your symptoms, history and medicines.`;
  }

  return {
    patientName,
    patientAge,
    patientSex,
    reportDate,
    labName,
    overall,
    tests,
    quotedNotes: extractQuotedNotes(lines),
    questions: buildQuestions(tests),
    counts,
    engine: "rule-based",
  };
}



export const SAMPLE_REPORT_TEXT = `SANJEEVINI DIAGNOSTIC LABORATORY — Nelamangala (DEMO SAMPLE REPORT)
Patient Name : Lakshmi Devamma
Age / Sex : 46 Years / Female
Referred by : Dr. Anjali Rao
Collection Date : 12/02/2026      Reported on : 12/02/2026

COMPLETE HAEMOGRAM
Haemoglobin                         10.2 g/dL          12.0 - 15.5 g/dL      LOW
Total Leucocyte Count               7,800 /cumm        4,000 - 10,000 /cumm
Platelet Count                      2.1 lakh/cumm      1.5 - 4.1 lakh/cumm
MCV                                 74.0 fL            83 - 101 fL           LOW
ESR                                 38 mm/hr           0 - 20 mm/hr          HIGH

BIOCHEMISTRY
Fasting Blood Sugar                 132 mg/dL          70 - 100 mg/dL        HIGH
HbA1c                               7.8 %              4.0 - 5.6 %
Serum Creatinine                    0.9 mg/dL          0.6 - 1.1 mg/dL
Serum Urea                          34 mg/dL           15 - 40 mg/dL
SGPT (ALT)                          46 U/L             5 - 40 U/L            HIGH
Serum Cholesterol                   214 mg/dL          < 200 mg/dL
Thyroid Stimulating Hormone (TSH)   3.1 uIU/mL         0.4 - 4.0 uIU/mL
Serum Vitamin D                     18.4 ng/mL

Impression : Mild anaemia with poorly controlled fasting glucose. Please correlate clinically.
`;
