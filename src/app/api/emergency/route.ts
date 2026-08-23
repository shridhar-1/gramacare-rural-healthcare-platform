import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { emergencyRequests } from "@/db/schema";
import { getFacilities } from "@/lib/data-source";

export const dynamic = "force-dynamic";

export async function GET() {
  const facilities = await getFacilities();
  const emergency = facilities.filter((facility) => facility.emergency);
  try {
    const rows = await db
      .select()
      .from(emergencyRequests)
      .orderBy(desc(emergencyRequests.createdAt))
      .limit(20);
    return NextResponse.json({ emergency, requests: rows });
  } catch {
    return NextResponse.json({ emergency, requests: [] });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const lat = Number(body.lat);
  const lng = Number(body.lng);

  try {
    await db.insert(emergencyRequests).values({
      kind: String(body.kind ?? "help-near-me").slice(0, 40),
      contactName: String(body.contactName ?? "").slice(0, 140) || null,
      contactPhone: String(body.contactPhone ?? "").slice(0, 24) || null,
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      village: String(body.village ?? "").slice(0, 140) || null,
      note: String(body.note ?? "").slice(0, 500) || null,
      status: "logged",
    });
    return NextResponse.json({ ok: true, stored: true });
  } catch (error) {
    console.error("[gramacare] emergency request not stored:", (error as Error).message);
    return NextResponse.json({ ok: true, stored: false });
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { id?: number; status?: string };
  if (!body.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  try {
    await db
      .update(emergencyRequests)
      .set({ status: String(body.status ?? "closed").slice(0, 20) })
      .where(eq(emergencyRequests.id, body.id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
