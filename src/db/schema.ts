import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/** Roles: patient (default), doctor, provider (hospital/pharmacy/blood bank), admin */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 24 }).notNull().default("patient"),
  phone: varchar("phone", { length: 24 }),
  language: varchar("language", { length: 8 }).notNull().default("en"),
  organisation: varchar("organisation", { length: 160 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const healthcareCenters = pgTable("healthcare_centers", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  kind: varchar("kind", { length: 32 }).notNull(), // hospital | phc | clinic | diagnostic
  ownership: varchar("ownership", { length: 16 }).notNull(), // government | private | trust
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  village: varchar("village", { length: 120 }).notNull(),
  district: varchar("district", { length: 120 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  phone: varchar("phone", { length: 24 }).notNull(),
  openHours: varchar("open_hours", { length: 80 }).notNull(),
  openNow: boolean("open_now").notNull().default(true),
  emergency: boolean("emergency").notNull().default(false),
  ambulance: boolean("ambulance").notNull().default(false),
  services: jsonb("services").$type<string[]>().notNull().default([]),
  specialists: jsonb("specialists").$type<string[]>().notNull().default([]),
  beds: integer("beds"),
  verified: boolean("verified").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const pharmacies = pgTable("pharmacies", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  village: varchar("village", { length: 120 }).notNull(),
  district: varchar("district", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 24 }).notNull(),
  openHours: varchar("open_hours", { length: 80 }).notNull(),
  openNow: boolean("open_now").notNull().default(true),
  delivery: boolean("delivery").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 140 }).notNull(),
  generic: varchar("generic", { length: 140 }).notNull(),
  strength: varchar("strength", { length: 60 }).notNull(),
  form: varchar("form", { length: 40 }).notNull(),
});

export const medicineStock = pgTable("medicine_stock", {
  id: serial("id").primaryKey(),
  pharmacySlug: varchar("pharmacy_slug", { length: 120 }).notNull(),
  medicineName: varchar("medicine_name", { length: 140 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(), // available | low | unavailable
  note: varchar("note", { length: 120 }),
  price: integer("price"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bloodBanks = pgTable("blood_banks", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  village: varchar("village", { length: 120 }).notNull(),
  district: varchar("district", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 24 }).notNull(),
  openHours: varchar("open_hours", { length: 80 }).notNull(),
  openNow: boolean("open_now").notNull().default(true),
  componentSeparation: boolean("component_separation").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bloodInventory = pgTable("blood_inventory", {
  id: serial("id").primaryKey(),
  bloodBankSlug: varchar("blood_bank_slug", { length: 120 }).notNull(),
  bloodGroup: varchar("blood_group", { length: 4 }).notNull(),
  units: integer("units").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 140 }).notNull(),
  specialty: varchar("specialty", { length: 80 }).notNull(),
  qualifications: varchar("qualifications", { length: 120 }).notNull(),
  experienceYears: integer("experience_years").notNull().default(5),
  languages: jsonb("languages").$type<string[]>().notNull().default([]),
  centerSlug: varchar("center_slug", { length: 120 }),
  phone: varchar("phone", { length: 24 }).notNull(),
  teleconsult: boolean("teleconsult").notNull().default(true),
  availableNow: boolean("available_now").notNull().default(true),
  nextSlot: varchar("next_slot", { length: 60 }),
  consultationFee: integer("consultation_fee").notNull().default(0),
});

export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  patientName: varchar("patient_name", { length: 140 }).notNull(),
  patientPhone: varchar("patient_phone", { length: 24 }).notNull(),
  doctorSlug: varchar("doctor_slug", { length: 120 }).notNull(),
  specialty: varchar("specialty", { length: 80 }).notNull(),
  note: text("note"),
  status: varchar("status", { length: 20 }).notNull().default("requested"), // requested | accepted | completed
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const emergencyRequests = pgTable("emergency_requests", {
  id: serial("id").primaryKey(),
  kind: varchar("kind", { length: 40 }).notNull(),
  contactName: varchar("contact_name", { length: 140 }),
  contactPhone: varchar("contact_phone", { length: 24 }),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  village: varchar("village", { length: 140 }),
  note: text("note"),
  status: varchar("status", { length: 20 }).notNull().default("logged"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bloodRequests = pgTable("blood_requests", {
  id: serial("id").primaryKey(),
  bloodGroup: varchar("blood_group", { length: 4 }).notNull(),
  units: integer("units").notNull().default(1),
  hospital: varchar("hospital", { length: 160 }).notNull(),
  village: varchar("village", { length: 140 }).notNull(),
  urgency: varchar("urgency", { length: 20 }).notNull().default("within-24-hours"),
  contactPhone: varchar("contact_phone", { length: 24 }),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const healthArticles = pgTable("health_articles", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  category: varchar("category", { length: 60 }).notNull(),
  emoji: varchar("emoji", { length: 8 }).notNull().default("🩺"),
  title: varchar("title", { length: 180 }).notNull(),
  titleKn: varchar("title_kn", { length: 180 }),
  titleHi: varchar("title_hi", { length: 180 }),
  summary: text("summary").notNull(),
  keyPoints: jsonb("key_points").$type<string[]>().notNull().default([]),
  whenToSeekHelp: jsonb("when_to_seek_help").$type<string[]>().notNull().default([]),
  readMinutes: integer("read_minutes").notNull().default(3),
});

export const savedFacilities = pgTable("saved_facilities", {
  id: serial("id").primaryKey(),
  userEmail: varchar("user_email", { length: 160 }).notNull(),
  centerSlug: varchar("center_slug", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const medicalReports = pgTable("medical_reports", {
  id: serial("id").primaryKey(),
  userEmail: varchar("user_email", { length: 160 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  result: jsonb("result").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type HealthcareCenterRow = typeof healthcareCenters.$inferSelect;
export type PharmacyRow = typeof pharmacies.$inferSelect;
export type BloodBankRow = typeof bloodBanks.$inferSelect;
export type DoctorRow = typeof doctors.$inferSelect;
export type ArticleRow = typeof healthArticles.$inferSelect;
