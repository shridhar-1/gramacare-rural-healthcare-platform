import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bloodInventory, healthcareCenters, medicineStock } from "@/db/schema";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await currentUser();
  const body = (await request.json().catch(() => ({}))) as {
    kind?: "facility" | "medicine" | "blood";
    slug?: string;
    medicineName?: string;
    status?: string;
    openNow?: boolean;
    emergency?: boolean;
    bloodGroup?: string;
    units?: number;
  };

  if (!user || (user.role !== "provider" && user.role !== "admin")) {
    return NextResponse.json(
      { error: "Please login as a provider to update availability." },
      { status: 401 },
    );
  }

  const slug = String(body.slug ?? "").trim();
  if (!slug) return NextResponse.json({ error: "Missing centre reference." }, { status: 400 });

  try {
    if (body.kind === "facility") {
      await db
        .update(healthcareCenters)
        .set({
          openNow: Boolean(body.openNow),
          emergency: Boolean(body.emergency),
          updatedAt: new Date(),
        })
        .where(eq(healthcareCenters.slug, slug));
    } else if (body.kind === "medicine" && body.medicineName) {
      await db
        .update(medicineStock)
        .set({
          status: ["available", "low", "unavailable"].includes(String(body.status))
            ? String(body.status)
            : "unavailable",
          updatedAt: new Date(),
        })
        .where(eq(medicineStock.pharmacySlug, slug));
    } else if (body.kind === "blood" && body.bloodGroup) {
      await db
        .update(bloodInventory)
        .set({
          units: Math.min(Math.max(Number(body.units ?? 0) || 0, 0), 99),
          updatedAt: new Date(),
        })
        .where(eq(bloodInventory.bloodBankSlug, slug));
    } else {
      return NextResponse.json({ error: "Unsupported update." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[gramacare] provider update failed:", (error as Error).message);
    return NextResponse.json({ error: "Could not save the update right now." }, { status: 500 });
  }
}
