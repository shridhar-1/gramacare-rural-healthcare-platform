import { NextResponse } from "next/server";
import { getFacilities } from "@/lib/data-source";

export const dynamic = "force-dynamic";

export async function GET() {
  const facilities = await getFacilities();
  return NextResponse.json({ source: "demo", count: facilities.length, facilities });
}
