export type FacilityKind = "hospital" | "phc" | "clinic" | "diagnostic";
export type Ownership = "government" | "private" | "trust";

export type Facility = {
  slug: string;
  name: string;
  kind: FacilityKind;
  ownership: Ownership;
  lat: number;
  lng: number;
  village: string;
  district: string;
  pincode: string;
  phone: string;
  openHours: string;
  openNow: boolean;
  emergency: boolean;
  ambulance: boolean;
  services: string[];
  specialists: string[];
  beds: number | null;
  verified: boolean;
  updatedAt: string;
};

export type Pharmacy = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  village: string;
  district: string;
  phone: string;
  openHours: string;
  openNow: boolean;
  delivery: boolean;
  updatedAt: string;
};

export type MedicineStockEntry = {
  pharmacySlug: string;
  medicineName: string;
  status: "available" | "low" | "unavailable";
  note: string | null;
  price: number | null;
  updatedAt: string;
};

export type BloodBank = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  village: string;
  district: string;
  phone: string;
  openHours: string;
  openNow: boolean;
  componentSeparation: boolean;
  updatedAt: string;
};

export type BloodInventoryEntry = {
  bloodBankSlug: string;
  bloodGroup: string;
  units: number;
  updatedAt: string;
};

export type Doctor = {
  slug: string;
  name: string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  languages: string[];
  centerSlug: string | null;
  phone: string;
  teleconsult: boolean;
  availableNow: boolean;
  nextSlot: string | null;
  consultationFee: number;
};

export type HealthArticle = {
  slug: string;
  category: string;
  emoji: string;
  title: string;
  titleKn: string | null;
  titleHi: string | null;
  summary: string;
  keyPoints: string[];
  whenToSeekHelp: string[];
  readMinutes: number;
};

/** Rough centre of the demo service area (rural Bengaluru North / Chikkaballapur belt). */
export const DEMO_AREA = {
  label: "Demo area — Bengaluru North & Chikkaballapur district",
  lat: 13.2285,
  lng: 77.52,
};

export const DEMO_AREA_PLACES: { name: string; lat: number; lng: number }[] = [
  { name: "Doddaballapura", lat: 13.2931, lng: 77.3937 },
  { name: "Rajanakunte", lat: 13.1833, lng: 77.5333 },
  { name: "Yelahanka", lat: 13.1007, lng: 77.5963 },
  { name: "Devanahalli", lat: 13.2451, lng: 77.718 },
  { name: "Hoskote", lat: 13.0696, lng: 77.7978 },
  { name: "Nelamangala", lat: 13.0987, lng: 77.3972 },
  { name: "Chikkaballapura", lat: 13.4327, lng: 78.0619 },
  { name: "Magadi", lat: 12.9667, lng: 77.4 },
];

const iso = (minutesAgo: number) =>
  new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

export const DEMO_FACILITIES: Facility[] = [
  {
    slug: "grama-general-hospital-doddaballapura",
    name: "Grama General Hospital, Doddaballapura",
    kind: "hospital",
    ownership: "government",
    lat: 13.2951,
    lng: 77.3922,
    village: "Doddaballapura",
    district: "Bengaluru Rural",
    pincode: "561203",
    phone: "+91 98450 01001",
    openHours: "24 hours",
    openNow: true,
    emergency: true,
    ambulance: true,
    services: ["Emergency care", "General medicine", "Obstetrics", "Surgery", "X-ray", "Laboratory", "Pharmacy"],
    specialists: ["General Medicine", "Obstetrics", "General Surgery", "Paediatrics"],
    beds: 120,
    verified: true,
    updatedAt: iso(46),
  },
  {
    slug: "grama-primary-health-centre-rajanakunte",
    name: "Rajanakunte Primary Health Centre",
    kind: "phc",
    ownership: "government",
    lat: 13.1842,
    lng: 77.5348,
    village: "Rajanakunte",
    district: "Bengaluru Urban",
    pincode: "560064",
    phone: "+91 98450 01002",
    openHours: "9:00 AM – 4:30 PM",
    openNow: true,
    emergency: false,
    ambulance: false,
    services: ["Out-patient care", "Maternal & child health", "Vaccination", "Basic laboratory", "Health screening"],
    specialists: ["General Medicine"],
    beds: 12,
    verified: true,
    updatedAt: iso(120),
  },
  {
    slug: "seva-community-clinic-hoskote",
    name: "Seva Community Clinic, Hoskote",
    kind: "clinic",
    ownership: "trust",
    lat: 13.0702,
    lng: 77.7961,
    village: "Hoskote",
    district: "Bengaluru Rural",
    pincode: "562114",
    phone: "+91 98450 01003",
    openHours: "8:30 AM – 8:00 PM",
    openNow: true,
    emergency: false,
    ambulance: true,
    services: ["Out-patient care", "Dressing & minor injuries", "Diabetes check-up", "Blood pressure check-up"],
    specialists: ["General Medicine", "Diabetes"],
    beds: 6,
    verified: false,
    updatedAt: iso(310),
  },
  {
    slug: "nammuru-medicity-hospital-yelahanka",
    name: "Nammuru Medicity Hospital, Yelahanka",
    kind: "hospital",
    ownership: "private",
    lat: 13.1018,
    lng: 77.5942,
    village: "Yelahanka",
    district: "Bengaluru Urban",
    pincode: "560064",
    phone: "+91 98450 01004",
    openHours: "24 hours",
    openNow: true,
    emergency: true,
    ambulance: true,
    services: ["Emergency care", "ICU", "Cardiology", "Orthopaedics", "CT scan", "Laboratory", "Blood bank", "Pharmacy"],
    specialists: ["Cardiology", "Orthopaedics", "Paediatrics", "General Medicine", "Gynaecology"],
    beds: 220,
    verified: true,
    updatedAt: iso(22),
  },
  {
    slug: "grama-taluk-hospital-devanahalli",
    name: "Devanahalli Taluk Hospital",
    kind: "hospital",
    ownership: "government",
    lat: 13.2463,
    lng: 77.7162,
    village: "Devanahalli",
    district: "Bengaluru Rural",
    pincode: "562110",
    phone: "+91 98450 01005",
    openHours: "24 hours",
    openNow: true,
    emergency: true,
    ambulance: true,
    services: ["Emergency care", "General medicine", "Obstetrics", "Neonatal care", "X-ray", "Laboratory"],
    specialists: ["General Medicine", "Obstetrics", "Paediatrics"],
    beds: 90,
    verified: true,
    updatedAt: iso(64),
  },
  {
    slug: "sanjeevini-diagnostic-lab-nelamangala",
    name: "Sanjeevini Diagnostic Laboratory, Nelamangala",
    kind: "diagnostic",
    ownership: "private",
    lat: 13.0996,
    lng: 77.3955,
    village: "Nelamangala",
    district: "Bengaluru Rural",
    pincode: "562123",
    phone: "+91 98450 01006",
    openHours: "7:30 AM – 9:00 PM",
    openNow: true,
    emergency: false,
    ambulance: false,
    services: ["Blood tests", "Urine tests", "ECG", "Ultrasound", "Home sample collection"],
    specialists: ["Pathology", "Radiology"],
    beds: null,
    verified: true,
    updatedAt: iso(15),
  },
  {
    slug: "grama-primary-health-centre-magadi-road",
    name: "Magadi Road Primary Health Centre",
    kind: "phc",
    ownership: "government",
    lat: 12.9689,
    lng: 77.4022,
    village: "Magadi",
    district: "Ramanagara",
    pincode: "562120",
    phone: "+91 98450 01007",
    openHours: "8:30 AM – 4:00 PM",
    openNow: false,
    emergency: false,
    ambulance: false,
    services: ["Out-patient care", "Vaccination", "Antenatal check-up", "Malaria & TB programme"],
    specialists: ["General Medicine"],
    beds: 10,
    verified: true,
    updatedAt: iso(720),
  },
  {
    slug: "spandana-speciality-clinic-chikkaballapura",
    name: "Spandana Speciality Clinic, Chikkaballapura",
    kind: "clinic",
    ownership: "private",
    lat: 13.4339,
    lng: 78.0602,
    village: "Chikkaballapura",
    district: "Chikkaballapura",
    pincode: "562101",
    phone: "+91 98450 01008",
    openHours: "10:00 AM – 7:00 PM",
    openNow: true,
    emergency: false,
    ambulance: false,
    services: ["General medicine", "Skin & hair", "Child health", "Teleconsultation"],
    specialists: ["General Medicine", "Dermatology", "Paediatrics"],
    beds: null,
    verified: false,
    updatedAt: iso(190),
  },
  {
    slug: "grama-mobile-medical-unit-bidasare",
    name: "GramaCare Mobile Medical Unit — Bidasare",
    kind: "clinic",
    ownership: "trust",
    lat: 13.2412,
    lng: 77.5602,
    village: "Bidasare",
    district: "Bengaluru Urban",
    pincode: "560064",
    phone: "+91 98450 01009",
    openHours: "Visits: Mon, Wed, Fri · 9:00 AM – 1:00 PM",
    openNow: true,
    emergency: false,
    ambulance: false,
    services: ["Village outreach clinic", "Vaccination", "Health screening", "Medicine distribution"],
    specialists: ["General Medicine"],
    beds: null,
    verified: false,
    updatedAt: iso(95),
  },
  {
    slug: "grama-district-hospital-chikkaballapura",
    name: "Grama District Hospital, Chikkaballapura",
    kind: "hospital",
    ownership: "government",
    lat: 13.4361,
    lng: 78.0645,
    village: "Chikkaballapura",
    district: "Chikkaballapura",
    pincode: "562101",
    phone: "+91 98450 01010",
    openHours: "24 hours",
    openNow: true,
    emergency: true,
    ambulance: true,
    services: ["Emergency care", "General medicine", "Surgery", "Obstetrics", "Blood bank", "ICU", "Laboratory"],
    specialists: ["General Medicine", "General Surgery", "Obstetrics", "Orthopaedics"],
    beds: 150,
    verified: true,
    updatedAt: iso(38),
  },
  {
    slug: "arogya-womens-hospital-hoskote",
    name: "Arogya Women's & Children's Hospital, Hoskote",
    kind: "hospital",
    ownership: "private",
    lat: 13.0724,
    lng: 77.7939,
    village: "Hoskote",
    district: "Bengaluru Rural",
    pincode: "562114",
    phone: "+91 98450 01011",
    openHours: "24 hours",
    openNow: true,
    emergency: true,
    ambulance: true,
    services: ["Maternity", "Neonatal ICU", "Gynaecology", "Child health", "Ultrasound", "Laboratory"],
    specialists: ["Gynaecology", "Paediatrics", "Anaesthesia"],
    beds: 80,
    verified: true,
    updatedAt: iso(55),
  },
  {
    slug: "grama-24x7-emergency-centre-yelahanka-gate",
    name: "GramaCare 24×7 Emergency Point, Yelahanka Gate",
    kind: "clinic",
    ownership: "trust",
    lat: 13.1552,
    lng: 77.5805,
    village: "Yelahanka Gate",
    district: "Bengaluru Urban",
    pincode: "560064",
    phone: "+91 98450 01012",
    openHours: "24 hours",
    openNow: true,
    emergency: true,
    ambulance: true,
    services: ["First aid", "Emergency stabilisation", "Ambulance dispatch", "Referral transport"],
    specialists: ["Emergency Medicine"],
    beds: 8,
    verified: false,
    updatedAt: iso(9),
  },
];

export const DEMO_PHARMACIES: Pharmacy[] = [
  {
    slug: "sanjeevini-medical-stores-doddaballapura",
    name: "Sanjeevini Medical Stores, Doddaballapura",
    lat: 13.2942,
    lng: 77.3945,
    village: "Doddaballapura",
    district: "Bengaluru Rural",
    phone: "+91 98450 02001",
    openHours: "8:00 AM – 10:00 PM",
    openNow: true,
    delivery: true,
    updatedAt: iso(25),
  },
  {
    slug: "grama-janaushadhi-kendra-rajanakunte",
    name: "Janaushadhi Kendra, Rajanakunte",
    lat: 13.1851,
    lng: 77.5321,
    village: "Rajanakunte",
    district: "Bengaluru Urban",
    phone: "+91 98450 02002",
    openHours: "9:00 AM – 8:00 PM",
    openNow: true,
    delivery: false,
    updatedAt: iso(70),
  },
  {
    slug: "nammuru-pharmacy-yelahanka",
    name: "Nammuru Pharmacy, Yelahanka",
    lat: 13.1031,
    lng: 77.5921,
    village: "Yelahanka",
    district: "Bengaluru Urban",
    phone: "+91 98450 02003",
    openHours: "24 hours",
    openNow: true,
    delivery: true,
    updatedAt: iso(12),
  },
  {
    slug: "hoskote-medical-hall",
    name: "Hoskote Medical Hall",
    lat: 13.0711,
    lng: 77.7952,
    village: "Hoskote",
    district: "Bengaluru Rural",
    phone: "+91 98450 02004",
    openHours: "8:30 AM – 9:30 PM",
    openNow: true,
    delivery: true,
    updatedAt: iso(180),
  },
  {
    slug: "devanahalli-health-store",
    name: "Devanahalli Health Store",
    lat: 13.2472,
    lng: 77.7151,
    village: "Devanahalli",
    district: "Bengaluru Rural",
    phone: "+91 98450 02005",
    openHours: "9:00 AM – 9:00 PM",
    openNow: true,
    delivery: false,
    updatedAt: iso(340),
  },
  {
    slug: "magadi-village-medicals",
    name: "Magadi Village Medicals",
    lat: 12.9678,
    lng: 77.4011,
    village: "Magadi",
    district: "Ramanagara",
    phone: "+91 98450 02006",
    openHours: "9:00 AM – 8:00 PM",
    openNow: false,
    delivery: false,
    updatedAt: iso(600),
  },
];

const stock = (
  pharmacySlug: string,
  medicineName: string,
  status: MedicineStockEntry["status"],
  price: number,
  note?: string,
): MedicineStockEntry => ({
  pharmacySlug,
  medicineName,
  status,
  price,
  note: note ?? null,
  updatedAt: iso(Math.floor(Math.random() * 90) + 10),
});

export const DEMO_MEDICINE_NAMES = [
  "Paracetamol 500mg",
  "Paracetamol 125mg Syrup",
  "Amoxicillin 500mg",
  "Azithromycin 500mg",
  "Metformin 500mg",
  "Insulin (Human) 100IU",
  "Amlodipine 5mg",
  "Telmisartan 40mg",
  "Atorvastatin 10mg",
  "Cetirizine 10mg",
  "ORS Sachet",
  "Iron + Folic Acid Tablet",
  "Calcium + Vitamin D3",
  "Pantoprazole 40mg",
  "Salbutamol Inhaler",
];

export const DEMO_MEDICINE_STOCK: MedicineStockEntry[] = [
  stock("sanjeevini-medical-stores-doddaballapura", "Paracetamol 500mg", "available", 22, "Strip of 15 tablets"),
  stock("sanjeevini-medical-stores-doddaballapura", "Amoxicillin 500mg", "available", 96, "Strip of 10 capsules"),
  stock("sanjeevini-medical-stores-doddaballapura", "Metformin 500mg", "low", 34, "Few strips left"),
  stock("sanjeevini-medical-stores-doddaballapura", "Insulin (Human) 100IU", "available", 320, "Refrigerated stock"),
  stock("sanjeevini-medical-stores-doddaballapura", "ORS Sachet", "available", 18),
  stock("grama-janaushadhi-kendra-rajanakunte", "Paracetamol 500mg", "available", 12, "Generic (Janaushadhi)"),
  stock("grama-janaushadhi-kendra-rajanakunte", "Amlodipine 5mg", "available", 16),
  stock("grama-janaushadhi-kendra-rajanakunte", "Metformin 500mg", "available", 20),
  stock("grama-janaushadhi-kendra-rajanakunte", "Iron + Folic Acid Tablet", "available", 24),
  stock("grama-janaushadhi-kendra-rajanakunte", "Azithromycin 500mg", "unavailable", 0, "Expected next week"),
  stock("grama-janaushadhi-kendra-rajanakunte", "Atorvastatin 10mg", "low", 28),
  stock("nammuru-pharmacy-yelahanka", "Paracetamol 500mg", "available", 20),
  stock("nammuru-pharmacy-yelahanka", "Insulin (Human) 100IU", "low", 310, "2 vials left"),
  stock("nammuru-pharmacy-yelahanka", "Salbutamol Inhaler", "available", 165),
  stock("nammuru-pharmacy-yelahanka", "Pantoprazole 40mg", "available", 68),
  stock("nammuru-pharmacy-yelahanka", "Cetirizine 10mg", "available", 15),
  stock("hoskote-medical-hall", "Paracetamol 125mg Syrup", "available", 42),
  stock("hoskote-medical-hall", "Amoxicillin 500mg", "low", 88),
  stock("hoskote-medical-hall", "ORS Sachet", "available", 16),
  stock("hoskote-medical-hall", "Telmisartan 40mg", "available", 58),
  stock("hoskote-medical-hall", "Calcium + Vitamin D3", "available", 92),
  stock("devanahalli-health-store", "Paracetamol 500mg", "available", 21),
  stock("devanahalli-health-store", "Azithromycin 500mg", "available", 110),
  stock("devanahalli-health-store", "Metformin 500mg", "available", 30),
  stock("devanahalli-health-store", "Iron + Folic Acid Tablet", "low", 26),
  stock("magadi-village-medicals", "Paracetamol 500mg", "unavailable", 0, "Stock-out reported"),
  stock("magadi-village-medicals", "Amlodipine 5mg", "low", 14),
  stock("magadi-village-medicals", "ORS Sachet", "available", 15),
];

export const DEMO_BLOOD_BANKS: BloodBank[] = [
  {
    slug: "grama-district-blood-bank-chikkaballapura",
    name: "Grama District Blood Bank, Chikkaballapura",
    lat: 13.4358,
    lng: 78.0628,
    village: "Chikkaballapura",
    district: "Chikkaballapura",
    phone: "+91 98450 03001",
    openHours: "24 hours",
    openNow: true,
    componentSeparation: true,
    updatedAt: iso(20),
  },
  {
    slug: "nammuru-blood-centre-yelahanka",
    name: "Nammuru Blood Centre, Yelahanka",
    lat: 13.1022,
    lng: 77.5955,
    village: "Yelahanka",
    district: "Bengaluru Urban",
    phone: "+91 98450 03002",
    openHours: "8:00 AM – 10:00 PM",
    openNow: true,
    componentSeparation: true,
    updatedAt: iso(35),
  },
  {
    slug: "arogya-blood-bank-hoskote",
    name: "Arogya Blood Bank, Hoskote",
    lat: 13.0731,
    lng: 77.7948,
    village: "Hoskote",
    district: "Bengaluru Rural",
    phone: "+91 98450 03003",
    openHours: "9:00 AM – 9:00 PM",
    openNow: true,
    componentSeparation: false,
    updatedAt: iso(48),
  },
  {
    slug: "grama-taluk-blood-storage-devanahalli",
    name: "Devanahalli Taluk Blood Storage Unit",
    lat: 13.2468,
    lng: 77.7171,
    village: "Devanahalli",
    district: "Bengaluru Rural",
    phone: "+91 98450 03004",
    openHours: "24 hours",
    openNow: true,
    componentSeparation: false,
    updatedAt: iso(26),
  },
];

const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const unitsByBank: Record<string, number[]> = {
  "grama-district-blood-bank-chikkaballapura": [14, 3, 11, 2, 6, 1, 18, 4],
  "nammuru-blood-centre-yelahanka": [9, 1, 7, 0, 4, 2, 12, 3],
  "arogya-blood-bank-hoskote": [6, 0, 5, 1, 3, 0, 8, 1],
  "grama-taluk-blood-storage-devanahalli": [4, 1, 3, 0, 2, 0, 5, 0],
};

export const DEMO_BLOOD_INVENTORY: BloodInventoryEntry[] = DEMO_BLOOD_BANKS.flatMap((bank) =>
  groups.map((group, index) => ({
    bloodBankSlug: bank.slug,
    bloodGroup: group,
    units: unitsByBank[bank.slug][index],
    updatedAt: iso(30 + index * 3),
  })),
);

export const DEMO_DOCTORS: Doctor[] = [
  {
    slug: "dr-anjali-rao",
    name: "Dr. Anjali Rao",
    specialty: "General Medicine",
    qualifications: "MBBS, MD (Internal Medicine)",
    experienceYears: 12,
    languages: ["Kannada", "Hindi", "English"],
    centerSlug: "grama-general-hospital-doddaballapura",
    phone: "+91 98450 04001",
    teleconsult: true,
    availableNow: true,
    nextSlot: "Today, 5:00 PM",
    consultationFee: 0,
  },
  {
    slug: "dr-manjunath-hiremath",
    name: "Dr. Manjunath Hiremath",
    specialty: "General Medicine",
    qualifications: "MBBS",
    experienceYears: 8,
    languages: ["Kannada", "English"],
    centerSlug: "grama-primary-health-centre-rajanakunte",
    phone: "+91 98450 04002",
    teleconsult: true,
    availableNow: true,
    nextSlot: "Today, 2:30 PM",
    consultationFee: 0,
  },
  {
    slug: "dr-shobha-bhat",
    name: "Dr. Shobha Bhat",
    specialty: "Gynaecology",
    qualifications: "MBBS, MS (OBG)",
    experienceYears: 15,
    languages: ["Kannada", "Hindi", "English"],
    centerSlug: "arogya-womens-hospital-hoskote",
    phone: "+91 98450 04003",
    teleconsult: true,
    availableNow: false,
    nextSlot: "Tomorrow, 10:00 AM",
    consultationFee: 300,
  },
  {
    slug: "dr-ravi-kumar",
    name: "Dr. Ravi Kumar",
    specialty: "Paediatrics",
    qualifications: "MBBS, DCH",
    experienceYears: 10,
    languages: ["Kannada", "Telugu", "English"],
    centerSlug: "nammuru-medicity-hospital-yelahanka",
    phone: "+91 98450 04004",
    teleconsult: true,
    availableNow: true,
    nextSlot: "Today, 6:15 PM",
    consultationFee: 250,
  },
  {
    slug: "dr-farida-begum",
    name: "Dr. Farida Begum",
    specialty: "Cardiology",
    qualifications: "MBBS, MD, DM (Cardiology)",
    experienceYears: 14,
    languages: ["Kannada", "Urdu", "Hindi", "English"],
    centerSlug: "nammuru-medicity-hospital-yelahanka",
    phone: "+91 98450 04005",
    teleconsult: true,
    availableNow: false,
    nextSlot: "Wed, 11:00 AM",
    consultationFee: 600,
  },
  {
    slug: "dr-nagaraj-gowda",
    name: "Dr. Nagaraj Gowda",
    specialty: "Orthopaedics",
    qualifications: "MBBS, MS (Ortho)",
    experienceYears: 11,
    languages: ["Kannada", "Hindi", "English"],
    centerSlug: "grama-district-hospital-chikkaballapura",
    phone: "+91 98450 04006",
    teleconsult: false,
    availableNow: true,
    nextSlot: "Today, 4:00 PM",
    consultationFee: 350,
  },
  {
    slug: "dr-lakshmi-narayanan",
    name: "Dr. Lakshmi Narayanan",
    specialty: "Dermatology",
    qualifications: "MBBS, MD (Dermatology)",
    experienceYears: 7,
    languages: ["Tamil", "Kannada", "English"],
    centerSlug: "spandana-speciality-clinic-chikkaballapura",
    phone: "+91 98450 04007",
    teleconsult: true,
    availableNow: true,
    nextSlot: "Today, 7:30 PM",
    consultationFee: 400,
  },
  {
    slug: "dr-imran-shaikh",
    name: "Dr. Imran Shaikh",
    specialty: "Diabetes & Endocrinology",
    qualifications: "MBBS, MD, DM (Endocrinology)",
    experienceYears: 9,
    languages: ["Kannada", "Urdu", "Hindi", "English"],
    centerSlug: "seva-community-clinic-hoskote",
    phone: "+91 98450 04008",
    teleconsult: true,
    availableNow: true,
    nextSlot: "Tomorrow, 9:00 AM",
    consultationFee: 450,
  },
  {
    slug: "dr-prakash-naik",
    name: "Dr. Prakash Naik",
    specialty: "Emergency Medicine",
    qualifications: "MBBS, MEM",
    experienceYears: 6,
    languages: ["Kannada", "Hindi", "English"],
    centerSlug: "grama-24x7-emergency-centre-yelahanka-gate",
    phone: "+91 98450 04009",
    teleconsult: false,
    availableNow: true,
    nextSlot: "On duty now",
    consultationFee: 0,
  },
  {
    slug: "dr-vidya-shetty",
    name: "Dr. Vidya Shetty",
    specialty: "Pathology",
    qualifications: "MBBS, MD (Pathology)",
    experienceYears: 13,
    languages: ["Kannada", "Konkani", "English"],
    centerSlug: "sanjeevini-diagnostic-lab-nelamangala",
    phone: "+91 98450 04010",
    teleconsult: true,
    availableNow: true,
    nextSlot: "Today, 8:00 PM",
    consultationFee: 0,
  },
];

export const DEMO_ARTICLES: HealthArticle[] = [
  {
    slug: "eating-well-on-a-small-budget",
    category: "Nutrition",
    emoji: "🥗",
    title: "Eating well on a small budget",
    titleKn: "ಕಡಿಮೆ ಖರ್ಚಿನಲ್ಲಿ ಉತ್ತಮ ಆಹಾರ",
    titleHi: "कम खर्च में अच्छा पोषण",
    summary:
      "A balanced plate can be built from local grains, pulses, seasonal vegetables and one source of protein each day.",
    keyPoints: [
      "Fill half the plate with vegetables and leafy greens.",
      "Add one bowl of dal, sprouts, eggs, milk or curd every day.",
      "Use iodised salt and avoid adding extra salt at the table.",
      "Ragi, jowar and millets are nutritious and usually cheaper than refined flour.",
    ],
    whenToSeekHelp: [
      "Losing weight without trying.",
      "Swelling in the feet or face.",
      "A child who is not gaining weight for two months.",
    ],
    readMinutes: 3,
  },
  {
    slug: "antenatal-check-up-schedule",
    category: "Maternal health",
    emoji: "🤰",
    title: "Why antenatal check-ups matter",
    titleKn: "ಗರ್ಭಿಣಿ ತಪಾಸಣೆ ಏಕೆ ಮುಖ್ಯ",
    titleHi: "प्रसव पूर्व जांच क्यों ज़रूरी है",
    summary:
      "Regular check-ups during pregnancy find problems early, when they are easiest to treat. Most services are free at government centres.",
    keyPoints: [
      "Register the pregnancy at the nearest PHC in the first three months.",
      "At least four antenatal visits are recommended, plus iron and folic acid tablets.",
      "Two doses of tetanus vaccine are usually given during pregnancy.",
      "Plan the place of delivery and transport in advance.",
    ],
    whenToSeekHelp: [
      "Bleeding, severe headache or blurred vision.",
      "Swelling of the face and hands.",
      "The baby moves less than usual.",
      "Labour pain before 37 weeks.",
    ],
    readMinutes: 4,
  },
  {
    slug: "child-fever-basics",
    category: "Child health",
    emoji: "🧒",
    title: "Fever in children: what to do at home",
    titleKn: "ಮಕ್ಕಳಲ್ಲಿ ಜ್ವರ: ಮನೆಯಲ್ಲಿ ಮಾಡಬೇಕಾದ್ದು",
    titleHi: "बच्चों में बुखार: घर पर क्या करें",
    summary:
      "Most fevers settle in two to three days with rest, fluids and the right dose of paracetamol. Watch for danger signs instead of the number on the thermometer.",
    keyPoints: [
      "Give fluids often — water, breast milk, buttermilk or ORS.",
      "Use paracetamol syrup dosed by weight, not by age alone.",
      "Keep the child lightly clothed. Do not bundle up or sponge with ice-cold water.",
      "Complete the full course of any medicine a doctor has prescribed.",
    ],
    whenToSeekHelp: [
      "Any fever in a baby under three months.",
      "Fever lasting more than three days.",
      "Refusing to drink, repeated vomiting, or very few wet nappies.",
      "Seizure, drowsiness, difficulty breathing or a rash that does not fade on pressing.",
    ],
    readMinutes: 4,
  },
  {
    slug: "handwashing-and-clean-water",
    category: "Hygiene",
    emoji: "🧼",
    title: "Handwashing and safe drinking water",
    titleKn: "ಕೈ ತೊಳೆಯುವುದು ಮತ್ತು ಸುರಕ್ಷಿತ ನೀರು",
    titleHi: "हाथ धोना और सुरक्षित पीने का पानी",
    summary:
      "Washing hands with soap before eating and after using the toilet prevents most diarrhoea and stomach infections.",
    keyPoints: [
      "Wash hands with soap for 20 seconds — front, back and between fingers.",
      "Boil or filter drinking water if the source is shared or open.",
      "Keep drinking water in a covered vessel with a ladle or tap.",
      "Wash hands before feeding a child and after changing a nappy.",
    ],
    whenToSeekHelp: [
      "Diarrhoea with blood, or lasting more than three days.",
      "Signs of dehydration — sunken eyes, dry mouth, very little urine.",
      "Vomiting everything taken in.",
    ],
    readMinutes: 3,
  },
  {
    slug: "vaccination-schedule-explained",
    category: "Vaccination",
    emoji: "💉",
    title: "Your child's vaccination schedule, explained simply",
    titleKn: "ಮಗುವಿನ ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿ — ಸರಳ ವಿವರಣೆ",
    titleHi: "बच्चे का टीकाकरण कार्यक्रम, आसान भाषा में",
    summary:
      "Vaccines are free at government health centres. Missing a dose does not mean starting again — the schedule continues from where it stopped.",
    keyPoints: [
      "BCG, Hepatitis B and OPV are given at birth.",
      "Pentavalent and Rotavirus vaccines are given at 6, 10 and 14 weeks.",
      "Measles-Rubella is given at 9–12 months with a second dose later.",
      "Always carry the mother-child protection card to every visit.",
    ],
    whenToSeekHelp: [
      "High fever or crying non-stop for more than three hours after a vaccine.",
      "Any rash, swelling of lips or breathing difficulty after vaccination.",
    ],
    readMinutes: 4,
  },
  {
    slug: "living-well-with-diabetes",
    category: "Diabetes",
    emoji: "🩸",
    title: "Living well with diabetes",
    titleKn: "ಮಧುಮೇಹದೊಂದಿಗೆ ಆರೋಗ್ಯಕರ ಜೀವನ",
    titleHi: "मधुमेह के साथ स्वस्थ जीवन",
    summary:
      "Diabetes is managed with regular meals, daily walking, medicines as prescribed, and periodic checks of sugar, eyes and feet.",
    keyPoints: [
      "Eat meals at regular times; avoid sugary drinks and deep-fried snacks.",
      "Thirty minutes of brisk walking on most days helps control sugar.",
      "Take medicines exactly as prescribed, even on days you feel fine.",
      "Check feet daily for cracks, blisters or numbness.",
    ],
    whenToSeekHelp: [
      "Sugar readings that stay very high or very low.",
      "A foot wound that is not healing.",
      "Sweating, trembling, confusion or fainting.",
      "Blurred vision or frequent infections.",
    ],
    readMinutes: 5,
  },
  {
    slug: "understanding-blood-pressure",
    category: "Blood pressure",
    emoji: "❤️",
    title: "Understanding blood pressure readings",
    titleKn: "ರಕ್ತದೊತ್ತಡ ಓದುವಿಕೆ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು",
    titleHi: "रक्तचाप की रीडिंग समझना",
    summary:
      "A blood pressure reading has two numbers. High readings on repeated measurement, not one reading, decide whether treatment is needed.",
    keyPoints: [
      "The top number (systolic) is the pressure when the heart beats; the bottom (diastolic) is when it rests.",
      "Rest for five minutes before measuring; avoid tea, tobacco or exertion just before.",
      "Use the correct cuff size and keep the arm at heart level.",
      "Reducing salt, keeping weight in check and walking daily all help.",
    ],
    whenToSeekHelp: [
      "Severe headache, chest pain or breathlessness.",
      "Sudden weakness on one side of the body or slurred speech.",
      "Readings that stay high even after lifestyle changes.",
    ],
    readMinutes: 4,
  },
  {
    slug: "first-aid-basics",
    category: "First aid",
    emoji: "🚑",
    title: "First aid basics for every home",
    titleKn: "ಪ್ರತಿ ಮನೆಗೆ ಬೇಕಾದ ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ",
    titleHi: "हर घर के लिए प्राथमिक चिकित्सा",
    summary:
      "Simple first aid stops small injuries from becoming serious while you arrange transport to a health centre.",
    keyPoints: [
      "For bleeding: press firmly with a clean cloth for ten minutes without lifting it.",
      "For burns: cool running water for 15–20 minutes. Never apply toothpaste, oil or ghee.",
      "For a fall with neck or back pain: do not move the person; keep them still and call for help.",
      "For choking in an adult: give firm back blows between the shoulder blades.",
    ],
    whenToSeekHelp: [
      "Bleeding that does not stop with pressure.",
      "Breathing difficulty, blue lips or unconsciousness.",
      "Deep wounds, animal bites or snake bite — go immediately to the nearest emergency centre.",
    ],
    readMinutes: 5,
  },
  {
    slug: "preventive-health-checkups",
    category: "Preventive healthcare",
    emoji: "🩺",
    title: "Which health checks should you do every year?",
    titleKn: "ಪ್ರತಿ ವರ್ಷ ಯಾವ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಬೇಕು?",
    titleHi: "हर साल कौन सी जांच करानी चाहिए?",
    summary:
      "Yearly checks catch silent problems such as high blood pressure, diabetes and anaemia before they cause symptoms.",
    keyPoints: [
      "Blood pressure at every visit after the age of 30.",
      "Blood sugar and lipid profile once a year after 35.",
      "Haemoglobin check for women and adolescent girls.",
      "Cervical cancer screening for women aged 30–60 as advised locally.",
    ],
    whenToSeekHelp: [
      "Any reading your report marks as outside its reference range.",
      "Unexplained tiredness, weight loss or breathlessness.",
    ],
    readMinutes: 3,
  },
];
