import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  bloodBanks,
  bloodInventory,
  doctors,
  healthArticles,
  healthcareCenters,
  medicineStock,
  pharmacies,
} from "@/db/schema";
import {
  DEMO_ARTICLES,
  DEMO_BLOOD_BANKS,
  DEMO_BLOOD_INVENTORY,
  DEMO_DOCTORS,
  DEMO_FACILITIES,
  DEMO_MEDICINE_STOCK,
  DEMO_PHARMACIES,
} from "@/lib/seed-data";

let seedPromise: Promise<boolean> | null = null;

/** Demo records carry ISO strings; the DB default fills createdAt/updatedAt. */
function stripTs<T extends { updatedAt: string }>(rows: T[]): Omit<T, "updatedAt">[] {
  return rows.map(({ updatedAt: _updatedAt, ...rest }) => rest);
}

async function runSeed(): Promise<boolean> {
  try {
    const existing = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(healthcareCenters);

    if ((existing[0]?.count ?? 0) > 0) return true;

    await db.insert(healthcareCenters).values(stripTs(DEMO_FACILITIES)).onConflictDoNothing();
    await db.insert(pharmacies).values(stripTs(DEMO_PHARMACIES)).onConflictDoNothing();
    await db.insert(medicineStock).values(stripTs(DEMO_MEDICINE_STOCK));
    await db.insert(bloodBanks).values(stripTs(DEMO_BLOOD_BANKS)).onConflictDoNothing();
    await db.insert(bloodInventory).values(stripTs(DEMO_BLOOD_INVENTORY));
    await db.insert(doctors).values(DEMO_DOCTORS).onConflictDoNothing();
    await db.insert(healthArticles).values(DEMO_ARTICLES).onConflictDoNothing();
    return true;
  } catch (error) {
    console.error("[gramacare] database seed skipped:", (error as Error).message);
    return false;
  }
}

/** Seeds demo data once per server process. Never throws. */
export function ensureSeed(): Promise<boolean> {
  if (!seedPromise) seedPromise = runSeed();
  return seedPromise;
}
