import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeed } from "@/db/seed";
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
  type BloodBank,
  type BloodInventoryEntry,
  type Doctor,
  type Facility,
  type HealthArticle,
  type MedicineStockEntry,
  type Pharmacy,
} from "@/lib/seed-data";

/**
 * Every reader tries PostgreSQL first and falls back to the bundled demo dataset.
 * That keeps the product usable even if the database is unreachable — a hard
 * requirement for a hackathon demo.
 */
async function read<T>(query: () => Promise<T[]>, fallback: T[]): Promise<T[]> {
  try {
    await ensureSeed();
    const rows = await query();
    return rows.length > 0 ? rows : fallback;
  } catch (error) {
    console.error("[gramacare] using bundled demo data:", (error as Error).message);
    return fallback;
  }
}

const iso = (value: Date | string | null | undefined): string =>
  value instanceof Date ? value.toISOString() : (value ?? new Date().toISOString());

export async function getFacilities(): Promise<Facility[]> {
  return read(async () => {
    const rows = await db.select().from(healthcareCenters).orderBy(asc(healthcareCenters.name));
    return rows.map((row) => ({
      ...row,
      kind: row.kind as Facility["kind"],
      ownership: row.ownership as Facility["ownership"],
      updatedAt: iso(row.updatedAt),
    }));
  }, DEMO_FACILITIES);
}

export async function getPharmacies(): Promise<Pharmacy[]> {
  return read(async () => {
    const rows = await db.select().from(pharmacies).orderBy(asc(pharmacies.name));
    return rows.map((row) => ({ ...row, updatedAt: iso(row.updatedAt) }));
  }, DEMO_PHARMACIES);
}

export async function getMedicineStock(): Promise<MedicineStockEntry[]> {
  return read(async () => {
    const rows = await db.select().from(medicineStock).orderBy(desc(medicineStock.updatedAt));
    return rows.map((row) => ({
      pharmacySlug: row.pharmacySlug,
      medicineName: row.medicineName,
      status: row.status as MedicineStockEntry["status"],
      note: row.note,
      price: row.price,
      updatedAt: iso(row.updatedAt),
    }));
  }, DEMO_MEDICINE_STOCK);
}

export async function getBloodBanks(): Promise<BloodBank[]> {
  return read(async () => {
    const rows = await db.select().from(bloodBanks).orderBy(asc(bloodBanks.name));
    return rows.map((row) => ({ ...row, updatedAt: iso(row.updatedAt) }));
  }, DEMO_BLOOD_BANKS);
}

export async function getBloodInventory(): Promise<BloodInventoryEntry[]> {
  return read(async () => {
    const rows = await db.select().from(bloodInventory);
    return rows.map((row) => ({
      bloodBankSlug: row.bloodBankSlug,
      bloodGroup: row.bloodGroup,
      units: row.units,
      updatedAt: iso(row.updatedAt),
    }));
  }, DEMO_BLOOD_INVENTORY);
}

export async function getDoctors(): Promise<Doctor[]> {
  return read(() => db.select().from(doctors).orderBy(asc(doctors.name)), DEMO_DOCTORS);
}

export async function getArticles(): Promise<HealthArticle[]> {
  return read(() => db.select().from(healthArticles).orderBy(asc(healthArticles.id)), DEMO_ARTICLES);
}

export async function getArticleBySlug(slug: string): Promise<HealthArticle | null> {
  const all = await getArticles();
  return all.find((article) => article.slug === slug) ?? null;
}
