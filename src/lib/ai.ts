import type { ReportResult } from "@/lib/explain";

const OPENAI_KEY = process.env.OPENAI_API_KEY ?? process.env.GRAMACARE_AI_KEY;

export function aiEnabled(): boolean {
  return Boolean(OPENAI_KEY);
}

const SAFETY_PROMPT = `You are GramaCare, a health-information assistant for rural Indian users.
HARD RULES:
- Never diagnose, never name a disease as the cause, never prescribe medicine or dosage.
- Explain test names, units and reference ranges in very simple language.
- Use ONLY reference ranges present in the supplied report text.
- Encourage seeing a qualified healthcare professional.
- Write short sentences. Prefer everyday words over medical jargon.`;

type ChatCompletion = { choices?: { message?: { content?: string } }[] };

async function callOpenAI(system: string, user: string, json: boolean): Promise<string | null> {
  if (!OPENAI_KEY) return null;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as ChatCompletion;
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

/**
 * Optional rewrite of the plain-language summary. If no AI key is configured
 * (or the call fails) the deterministic explanation is used unchanged.
 */
export async function enrichReportSummary(result: ReportResult, text: string): Promise<ReportResult> {
  if (!aiEnabled() || result.tests.length === 0) return result;
  const raw = await callOpenAI(
    `${SAFETY_PROMPT}\nReturn JSON: {"overall": string, "questions": string[]}.`,
    `Report text (truncated):\n${text.slice(0, 4000)}\n\nParsed values: ${result.tests
      .map((test) => `${test.name}=${test.valueText} ref=${test.refText ?? "none"}`)
      .join("; ")}`,
    true,
  );
  if (!raw) return result;
  try {
    const parsed = JSON.parse(raw) as { overall?: string; questions?: string[] };
    if (!parsed.overall || typeof parsed.overall !== "string") return result;
    return {
      ...result,
      overall: parsed.overall,
      questions: Array.isArray(parsed.questions) && parsed.questions.length > 0
        ? parsed.questions.slice(0, 7)
        : result.questions,
      engine: "ai-assisted",
    };
  } catch {
    return result;
  }
}

const URGENT = [
  /chest pain/i,
  /breathless|can'?t breathe|difficulty breathing|shortness of breath/i,
  /unconscious|fainted|passed out|not responding/i,
  /seizure|fits\b/i,
  /heavy bleeding|won'?t stop bleeding|bleeding a lot/i,
  /snake ?bite|scorpion/i,
  /accident|injury|fracture|drowning|burn/i,
  /poison|overdose/i,
  /suicid|kill myself|self harm/i,
  /stroke|paralysis|slurred speech|face droop/i,
  /newborn|baby is .*(blue|limp|not feeding)/i,
  /severe (pain|headache|vomit)/i,
  /blood in (vomit|stool|urine|sputum)/i,
];

export function isUrgent(message: string): boolean {
  return URGENT.some((pattern) => pattern.test(message));
}

const CONCEPTS: { match: RegExp; reply: string }[] = [
  {
    match: /haemoglobin|hemoglobin/i,
    reply:
      "Haemoglobin is a protein inside your red blood cells. It picks up oxygen from your lungs and carries it to the rest of the body. A laboratory prints a reference range next to your result — for example 12.0 to 15.5 g/dL. If your number is below that printed range it only means the laboratory found less haemoglobin than its range expects. There can be many reasons, including iron in the diet, recent illness or blood loss. A doctor can tell you which one applies to you. Eating iron-rich foods such as green leafy vegetables, ragi and jaggery is generally helpful, but iron tablets should only be taken if a doctor advises them.",
  },
  {
    match: /hba1c|glycated/i,
    reply:
      "HbA1c shows your average blood sugar over about three months. It is usually written as a percentage. The reference range printed on your own report is the one to compare with. A higher number means sugar has been running higher than the laboratory's range — it does not by itself decide any treatment. Doctors use it together with fasting sugar, your diet and your medicines.",
  },
  {
    match: /platelet/i,
    reply:
      "Platelets are the cells that help blood clot when you cut yourself. Your report prints a reference range beside the count. A count below the printed range can mean easier bruising or bleeding; a count above it can happen after infection. Only a doctor can interpret it with your symptoms.",
  },
  {
    match: /creatinine|kidney/i,
    reply:
      "Creatinine is a waste product your muscles make and your kidneys remove. Blood levels are used to see how well the kidneys are filtering. Compare your number only with the reference range printed on the report, because ranges differ between laboratories.",
  },
  {
    match: /thyroid|tsh/i,
    reply:
      "The thyroid is a gland in the neck that makes hormones controlling energy and metabolism. TSH is the signal the brain sends to the gland. Reports usually print TSH, T3 and T4 with reference ranges. Reading them together needs a doctor.",
  },
  {
    match: /blood pressure|bp\b|hypertension/i,
    reply:
      "A blood pressure reading has two numbers. The top one (systolic) is the pressure while the heart beats; the bottom one (diastolic) is the pressure while it rests. Readings change through the day, so doctors look at repeated readings taken after five minutes of rest. Reducing salt, walking daily and keeping weight in check all help.",
  },
  {
    match: /reference range|normal range|normal value/i,
    reply:
      "A reference range is the spread of values a laboratory found in healthy people, using its own machines and methods. That is why ranges differ between laboratories. GramaCare always compares your result only with the range printed on your own report, and never guesses a range that is missing.",
  },
  {
    match: /anemia|anaemia/i,
    reply:
      "Anaemia means having less haemoglobin than a laboratory's reference range expects. It is a finding, not a single disease — low iron, other nutrient gaps, infection or blood loss can all cause it. GramaCare does not diagnose it or suggest a dose. If your report shows haemoglobin below its printed range, ask a doctor what should be done and whether the test should be repeated.",
  },
  {
    match: /report|upload|pdf|scan/i,
    reply:
      "Open 'Report Explainer' from the menu. Upload a PDF, JPG or PNG of your report (up to 8 MB). The file is read in your browser, the text is extracted, and each measurement is explained using only the reference range printed on that report. Nothing is stored unless you press Save.",
  },
  {
    match: /medicine|tablet|pharmacy|drug|dose|dosage/i,
    reply:
      "GramaCare can help you find which nearby pharmacy reports a medicine in stock, but it never recommends a medicine or a dose. Please ask a doctor or a registered pharmacist before taking or changing any medicine.",
  },
  {
    match: /blood (bank|group|donat)|blood\b/i,
    reply:
      "Open 'Blood' from the menu to see blood groups reported by nearby blood banks, and to raise an emergency blood request with the group, number of units, hospital and urgency. Availability shown in this prototype is demo data, so always call the blood bank as well.",
  },
  {
    match: /hospital|clinic|phc|doctor|specialist/i,
    reply:
      "Open 'Find Care' to see hospitals, clinics and primary health centres near you with distance, open status, services and phone numbers. Use 'Talk to a Doctor' to find specialists and request a consultation.",
  },
];

export async function assistantReply(message: string): Promise<{ reply: string; urgent: boolean }> {
  const urgent = isUrgent(message);
  if (urgent) {
    return {
      urgent: true,
      reply:
        "Your message mentions symptoms that may need urgent, in-person care. Please do not wait for an online reply. Call your local emergency number, or open the Emergency section of GramaCare to see the nearest emergency centres with distance, phone numbers and directions. If there is chest pain, breathlessness, heavy bleeding, a seizure, weakness on one side of the body, or a snake bite, travel to the nearest emergency centre immediately.",
    };
  }

  const aiText = await callOpenAI(
    `${SAFETY_PROMPT}\nAnswer in maximum 140 words. If the question may need urgent care, say so clearly.`,
    message,
    false,
  );
  if (aiText) return { reply: aiText, urgent: false };

  const concept = CONCEPTS.find((entry) => entry.match.test(message));
  if (concept) return { reply: concept.reply, urgent: false };

  return {
    urgent: false,
    reply:
      "GramaCare explains health words and reports, and helps you find nearby healthcare, medicines, blood and emergency support. Ask about a word in your report (for example 'haemoglobin' or 'HbA1c'), or ask how to find a hospital, pharmacy or blood bank near you. For anything about your own body — pain, fever, bleeding, breathlessness — please speak to a qualified healthcare professional rather than relying on this assistant.",
  };
}
