import { NextResponse } from "next/server";
import { db } from "@/db";
import { bloodRequests } from "@/db/schema";
import { getBloodBanks, getBloodInventory } from "@/lib/data-source";

export const dynamic = "force-dynamic";

export async function GET() {
  const [banks, inventory] = await Promise.all([getBloodBanks(), getBloodInventory()]);
  return NextResponse.json({ source: "demo", banks, inventory });
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const bloodGroup = String(payload.bloodGroup ?? "").trim();
  const hospital = String(payload.hospital ?? "").trim();
  const village = String(payload.village ?? "").trim();
  const units = Number(payload.units ?? 1);
  const urgency = String(payload.urgency ?? "within-24-hours");

  if (!/^(A|B|AB|O)[+-]$/.test(bloodGroup)) {
    return NextResponse.json({ error: "Please choose a valid blood group." }, { status: 400 });
  }
  if (hospital.length < 2 || village.length < 2) {
    return NextResponse.json({ error: "Please enter the hospital and the location." }, { status: 400 });
  }

  try {
    await db.insert(bloodRequests).values({
      bloodGroup,
      units: Number.isFinite(units) ? Math.min(Math.max(Math.round(units), 1), 20) : 1,
      hospital: hospital.slice(0, 160),
      village: village.slice(0, 140),
      urgency: urgency.slice(0, 20),
      contactPhone: String(payload.contactPhone ?? "").slice(0, 24) || null,
      status: "open",
    });
    return NextResponse.json({ ok: true, stored: true });
  } catch (error) {
    console.error("[gramacare] blood request stored in memory only:", (error as Error).message);
    return NextResponse.json({ ok: true, stored: false });
  }
}
