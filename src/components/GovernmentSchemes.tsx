"use client";

import { Card, ShieldIcon, PillIcon, DoctorIcon } from "@/components/ui";

const SCHEMES_DATA = [
  {
    id: 1,
    name: "Ayushman Bharat (PM-JAY)",
    problem: "Major surgeries, accidents, and severe illnesses requiring hospitalization.",
    amount: "Up to ₹5,000,000 per family per year.",
    claimSteps: "Generate an ABHA ID online. Present your PM-JAY e-card or Ration Card to the 'Pradhan Mantri Arogya Mitra' at any empanelled hospital before admission.",
    icon: <ShieldIcon />,
    color: "bg-teal-100 text-teal-700",
  },
  {
    id: 2,
    name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    problem: "Maternal health, pregnancy nutrition, and wage loss during pregnancy.",
    amount: "₹5,000 in three installments.",
    claimSteps: "Register at your local Anganwadi Centre (AWC) or Primary Health Centre (PHC) within 150 days of your last menstrual period using your Aadhaar card and bank passbook.",
    icon: <DoctorIcon />,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: 3,
    name: "Free Drugs and Diagnostics Service Initiative",
    problem: "High out-of-pocket costs for basic medicines and lab tests.",
    amount: "100% free essential medicines and diagnostics.",
    claimSteps: "Visit any public health facility (PHC, CHC, or District Hospital). Prescribed generic medicines from the Essential Medicines List are provided free at the pharmacy counter.",
    icon: <PillIcon />,
    color: "bg-blue-100 text-blue-700",
  }
];

export function GovernmentSchemes() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {SCHEMES_DATA.map((scheme) => (
        <Card key={scheme.id} className="flex flex-col gap-4 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span aria-hidden className={`grid size-12 place-items-center rounded-full ${scheme.color}`}>
              {scheme.icon}
            </span>
            <h3 className="text-lg font-bold text-ink-900 leading-tight">{scheme.name}</h3>
          </div>
          
          <div className="space-y-3 mt-2">
            <div>
              <p className="text-xs font-bold text-ink-400 uppercase tracking-wider">For Which Problem?</p>
              <p className="text-[0.95rem] text-ink-700 mt-0.5">{scheme.problem}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-ink-400 uppercase tracking-wider">Benefit Amount</p>
              <p className="text-[0.95rem] font-semibold text-brand-700 mt-0.5">{scheme.amount}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
              <p className="text-xs font-bold text-ink-900 mb-1">📋 How to Claim:</p>
              <p className="text-sm text-ink-600 leading-relaxed">{scheme.claimSteps}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
