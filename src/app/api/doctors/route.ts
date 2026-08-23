import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { consultations } from "@/db/schema";
import { getDoctors, getFacilities } from "@/lib/data-source";

export const dynamic = "force-dynamic";

export async function GET() {
  const doctors = await getDoctors();
  try {
    const rows = await db.select().from(consultations).orderBy(desc(consultations.createdAt)).limit(25);
    return NextResponse.json({ doctors, requests: rows, source: "db" });
  } catch {
    return NextResponse.json({ doctors, requests: [], source: "demo" });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const patientName = String(body.patientName ?? "").trim();
  const patientPhone = String(body.patientPhone ?? "").trim();
  const doctorSlug = String(body.doctorSlug ?? "").trim();

  if (patientName.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!/^[0-9+\-\s]{8,16}$/.test(patientPhone)) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }

  const doctors = await getDoctors();
  const doctor = doctors.find((item) => item.slug === doctorSlug);
  if (!doctor) {
    return NextResponse.json({ error: "Please choose a doctor." }, { status: 400 });
  }

  try {
    await db.insert(consultations).values({
      patientName: patientName.slice(0, 140),
      patientPhone: patientPhone.slice(0, 24),
      doctorSlug: doctor.slug,
      specialty: doctor.specialty,
      note: String(body.note ?? "").slice(0, 500) || null,
      status: "requested",
    });
  } catch (error) {
    console.error("[gramacare] consultation not stored:", (error as Error).message);
  }

  const facilities = await getFacilities();
  const centre = facilities.find((item) => item.slug === doctor.centerSlug);

  return NextResponse.json({
    ok: true,
    status: "requested",
    doctor: doctor.name,
    centre: centre?.name ?? null,
    message:
      "Consultation requested. The doctor's team will confirm by phone. This is a prototype flow — no live consultation is booked.",
  });
}
