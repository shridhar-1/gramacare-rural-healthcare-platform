import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  currentUser,
  ensureDemoAccounts,
  hashPassword,
  SESSION_COOKIE,
  signSession,
} from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const mode = String(body.mode ?? "login");

  if (mode === "guest") {
    const response = NextResponse.json({
      user: { email: "guest", name: "Guest user", role: "guest", organisation: null },
    });
    response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();

  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  await ensureDemoAccounts();

  if (mode === "register") {
    if (name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    try {
      const inserted = await db
        .insert(users)
        .values({
          name: name.slice(0, 120),
          email,
          passwordHash: hashPassword(password),
          role: "patient",
          phone: String(body.phone ?? "").slice(0, 24) || null,
        })
        .returning();
      const created = inserted[0];
      const session = signSession({
        email: created.email,
        name: created.name,
        role: created.role,
        organisation: created.organisation,
      });
      const response = NextResponse.json({
        user: { email: created.email, name: created.name, role: created.role, organisation: created.organisation },
      });
      response.cookies.set(SESSION_COOKIE, session, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    } catch {
      return NextResponse.json({ error: "That email is already registered. Please login." }, { status: 409 });
    }
  }

  try {
    const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const account = found[0];
    if (!account || account.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    const session = signSession({
      email: account.email,
      name: account.name,
      role: account.role,
      organisation: account.organisation,
    });
    const response = NextResponse.json({
      user: { email: account.email, name: account.name, role: account.role, organisation: account.organisation },
    });
    response.cookies.set(SESSION_COOKIE, session, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error("[gramacare] login failed:", (error as Error).message);
    return NextResponse.json({ error: "Login is unavailable right now. Please continue as guest." }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
