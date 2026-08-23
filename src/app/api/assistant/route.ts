import { NextResponse } from "next/server";
import { assistantReply, isUrgent } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { message?: string };
  const message = String(body.message ?? "").slice(0, 800).trim();

  if (message.length < 2) {
    return NextResponse.json({ error: "Please type a question." }, { status: 400 });
  }

  try {
    const { reply, urgent } = await assistantReply(message);
    return NextResponse.json({ reply, urgent, triage: isUrgent(message) });
  } catch {
    return NextResponse.json({ error: "We couldn't answer right now. Please try again." }, { status: 500 });
  }
}
