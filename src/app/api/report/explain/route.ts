import { NextResponse } from "next/server";
import { db } from "@/db";
import { medicalReports } from "@/db/schema";
import { currentUser } from "@/lib/session";
import { explainReport, SAMPLE_REPORT_TEXT } from "@/lib/explain";
import { aiEnabled, enrichReportSummary } from "@/lib/ai";

export const dynamic = "force-dynamic";

const MAX_CHARS = 20000;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { text?: string };
  const text = String(body.text ?? "").slice(0, MAX_CHARS);

  if (text.trim().length < 8) {
    return NextResponse.json(
      { error: "We couldn't read enough text from this report. Please paste the text manually." },
      { status: 400 },
    );
  }

  try {
    const result = explainReport(text);
    const enriched = aiEnabled()
      ? await enrichReportSummary(result, text)
      : result;
    return NextResponse.json({ result: enriched, aiAssisted: enriched.engine === "ai-assisted" });
  } catch {
    return NextResponse.json({ error: "We couldn't process the report right now. Please try again." }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ sample: SAMPLE_REPORT_TEXT, aiEnabled: aiEnabled() });
}

/** Saving an explanation is optional and only for signed-in users. */
export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user || user.email === "guest") {
    return NextResponse.json(
      { ok: false, error: "Please login to save report explanations. Guest explanations stay on your device." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    result?: Record<string, unknown>;
  };
  if (!body.result) {
    return NextResponse.json({ ok: false, error: "Nothing to save." }, { status: 400 });
  }

  try {
    await db.insert(medicalReports).values({
      userEmail: user.email,
      title: String(body.title ?? "Report explanation").slice(0, 180),
      result: body.result,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[gramacare] report not saved:", (error as Error).message);
    return NextResponse.json({ ok: false, error: "Could not save right now. You can still download it." }, { status: 500 });
  }
}
