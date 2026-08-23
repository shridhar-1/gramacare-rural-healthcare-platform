import { NextResponse } from "next/server";
import { getMedicineStock, getPharmacies } from "@/lib/data-source";

export const dynamic = "force-dynamic";

export async function GET() {
  const [pharmacies, stock] = await Promise.all([getPharmacies(), getMedicineStock()]);
  return NextResponse.json({ source: "demo", pharmacies, stock });
}
