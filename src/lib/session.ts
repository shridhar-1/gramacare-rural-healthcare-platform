import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeed } from "@/db/seed";

export const SESSION_COOKIE = "gramacare_session";

export type SessionUser = {
  email: string;
  name: string;
  role: string;
  organisation: string | null;
};

export function hashPassword(password: string): string {
  return createHash("sha256").update(`gramacare::${password}`).digest("hex");
}

/**
 * Signed session token: `payload.signature`.
 * Keeps the demo dependency-free while avoiding plain-text spoofing.
 */
export function signSession(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const secret = process.env.GRAMACARE_SESSION_SECRET ?? "gramacare-demo-secret";
  const signature = createHash("sha256").update(`${payload}.${secret}`).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySession(token: string | undefined): SessionUser | null {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const secret = process.env.GRAMACARE_SESSION_SECRET ?? "gramacare-demo-secret";
  const expected = createHash("sha256").update(`${payload}.${secret}`).digest("base64url");
  if (signature !== expected) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export async function currentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Creates the demo accounts once. Never throws. */
export async function ensureDemoAccounts(): Promise<void> {
  try {
    await ensureSeed();
    const demo: (SessionUser & { password: string })[] = [
      {
        email: "provider@gramacare.in",
        name: "Rajanakunte PHC Desk",
        role: "provider",
        organisation: "Rajanakunte Primary Health Centre",
        password: "gramacare123",
      },
      {
        email: "doctor@gramacare.in",
        name: "Dr. Anjali Rao",
        role: "doctor",
        organisation: "Grama General Hospital",
        password: "gramacare123",
      },
      {
        email: "admin@gramacare.in",
        name: "GramaCare Admin",
        role: "admin",
        organisation: "GramaCare",
        password: "gramacare123",
      },
    ];

    for (const account of demo) {
      const existing = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.email, account.email))
        .limit(1);
      if (existing.length > 0) continue;
      await db.insert(users).values({
        name: account.name,
        email: account.email,
        passwordHash: hashPassword(account.password),
        role: account.role,
        organisation: account.organisation,
      });
    }
  } catch (error) {
    console.error("[gramacare] demo accounts not created:", (error as Error).message);
  }
}

export function guestToken(): string {
  return randomUUID();
}
