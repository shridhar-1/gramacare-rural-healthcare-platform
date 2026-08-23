import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeed } from "@/db/seed";
import { currentUser } from "@/lib/session";
import { getArticles, getBloodBanks, getDoctors, getFacilities, getMedicineStock, getPharmacies } from "@/lib/data-source";
import { Badge, Card, LinkButton, SectionHeading } from "@/components/ui";
import { AdminLanguageNote } from "@/components/AdminLanguageNote";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const user = await currentUser();
  const isAdmin = user?.role === "admin";

  const [facilities, pharmacies, stock, banks, doctors, articles] = await Promise.all([
    getFacilities(),
    getPharmacies(),
    getMedicineStock(),
    getBloodBanks(),
    getDoctors(),
    getArticles(),
  ]);

  let live = { users: 0, emergency: 0, bloodRequests: 0, consultations: 0 };
  if (isAdmin) {
    try {
      await ensureSeed();
      const [row] = await db
        .select({
          users: sql<number>`(select count(*)::int from users)`,
          emergency: sql<number>`(select count(*)::int from emergency_requests)`,
          bloodRequests: sql<number>`(select count(*)::int from blood_requests)`,
          consultations: sql<number>`(select count(*)::int from consultations)`,
        })
        .from(sql`(select 1) as one`);
      live = row ?? live;
    } catch {
      live = { users: 0, emergency: 0, bloodRequests: 0, consultations: 0 };
    }
  }

  const cards = [
    { label: "Users", value: live.users, demo: !isAdmin },
    { label: "Healthcare facilities", value: facilities.length, demo: false },
    { label: "Doctors", value: doctors.length, demo: false },
    { label: "Pharmacies", value: pharmacies.length, demo: false },
    { label: "Blood banks", value: banks.length, demo: false },
    { label: "Medicine stock entries", value: stock.length, demo: false },
    { label: "Health education articles", value: articles.length, demo: false },
    { label: "Emergency requests", value: live.emergency, demo: !isAdmin },
    { label: "Blood requests", value: live.bloodRequests, demo: !isAdmin },
    { label: "Consultations", value: live.consultations, demo: !isAdmin },
  ];

  const emergencyReady = facilities.filter((facility) => facility.emergency).length;
  const openNow = facilities.filter((facility) => facility.openNow).length;
  const stockOuts = stock.filter((row) => row.status === "unavailable").length;

  return (
    <div className="space-y-6">
      <SectionHeading
        as="h1"
        title="Admin Dashboard"
        subtitle="Operational overview of the GramaCare prototype. Counts come from PostgreSQL when available."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={isAdmin ? "success" : "warning"}>
              {isAdmin ? `Signed in as ${user?.email}` : "Read-only view"}
            </Badge>
            <LinkButton href="/login" variant="secondary">
              Login
            </LinkButton>
          </div>
        }
      />

      {!isAdmin ? (
        <Card className="space-y-2 border-amber-200 bg-amber-50/70">
          <p className="font-semibold text-amber-900">Sign in as admin to see live request counts</p>
          <p className="text-sm text-amber-900/85">
            Demo login: <strong>admin@gramacare.in / gramacare123</strong>. Directory counts below are the demo dataset,
            which is also what the app falls back to if the database is unavailable.
          </p>
        </Card>
      ) : null}

      <AdminLanguageNote />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label} className="space-y-1">
            <p className="text-2xl font-extrabold text-ink-900">{card.value}</p>
            <p className="text-xs text-ink-400">{card.label}</p>
            {card.demo ? <Badge tone="info">hidden</Badge> : null}
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card as="section" className="space-y-2">
          <h2 className="text-base font-bold text-ink-900">Facility readiness</h2>
          <p className="text-sm text-ink-500">
            {emergencyReady} of {facilities.length} centres report emergency capability. {openNow} are open now.
          </p>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-red-500"
              style={{ width: `${Math.round((emergencyReady / Math.max(facilities.length, 1)) * 100)}%` }}
            />
          </div>
        </Card>
        <Card as="section" className="space-y-2">
          <h2 className="text-base font-bold text-ink-900">Medicine stock-outs</h2>
          <p className="text-sm text-ink-500">
            {stockOuts} of {stock.length} tracked medicine entries are reported unavailable across{" "}
            {pharmacies.length} pharmacies.
          </p>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${Math.round((stockOuts / Math.max(stock.length, 1)) * 100)}%` }}
            />
          </div>
        </Card>
        <Card as="section" className="space-y-2">
          <h2 className="text-base font-bold text-ink-900">Content</h2>
          <p className="text-sm text-ink-500">
            {articles.length} health-education articles published in English, with Kannada and Hindi titles where
            available.
          </p>
          <p className="text-xs text-ink-400">
            Reports explained are stored only for signed-in users who press Save — there is no bulk report log.
          </p>
        </Card>
      </div>

      <Card as="section" className="space-y-2">
        <h2 className="text-base font-bold text-ink-900">Data notes</h2>
        <ul className="space-y-1.5 text-sm text-ink-500">
          <li>• Facility, pharmacy, blood-bank and doctor records are demo data and are labelled as such in the UI.</li>
          <li>• Medicine and blood availability is demo data, not a live feed from any health system.</li>
          <li>• Uploaded reports are never stored unless a signed-in user explicitly saves an explanation.</li>
        </ul>
      </Card>
    </div>
  );
}
