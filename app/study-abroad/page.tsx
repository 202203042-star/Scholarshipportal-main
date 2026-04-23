"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AbroadScholarship {
  _id?: string;
  name: string;
  provider: string;
  country: string;
  amount: string;
  deadline: string;
  eligibility: string;
  level: string;
  fields: string;
  bond: string;
  applyLink: string;
  documents: string[];
  tips: string;
  isActive?: boolean;
}

interface Country {
  id: string;
  name: string;
  flag: string;
  tagline: string;
  avgTuition: string;
  visaName: string;
  visaLink: string;
  gradFrom: string;
  gradTo: string;
  generalDocs: string[];
  visaTips: string[];
}

const COUNTRIES: Country[] = [
  {
    id: "usa", name: "USA", flag: "🇺🇸",
    tagline: "World's top universities — MIT, Harvard, Stanford",
    avgTuition: "$20,000–$55,000/year",
    visaName: "F-1 Student Visa",
    visaLink: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    gradFrom: "#1d4ed8", gradTo: "#dc2626",
    generalDocs: ["Valid Indian passport (min 6 months validity)", "I-20 form from US university", "DS-160 visa application form", "SEVIS fee receipt ($350)", "Financial proof ($20,000+ per year)", "Academic transcripts (attested)", "GRE/GMAT/SAT scores", "TOEFL/IELTS scores"],
    visaTips: ["Book visa appointment 2–3 months early", "Show strong ties to India", "Carry all original documents to interview", "Know your program details thoroughly", "Have proof of financial support ready"],
  },
  {
    id: "uk", name: "UK", flag: "🇬🇧",
    tagline: "Oxford, Cambridge, Imperial — 1 year Master's programs",
    avgTuition: "£15,000–£35,000/year",
    visaName: "Student Visa (Tier 4)",
    visaLink: "https://www.gov.uk/student-visa",
    gradFrom: "#1d4ed8", gradTo: "#9333ea",
    generalDocs: ["Valid Indian passport", "CAS from university", "Bank statement (£1,334/month)", "Academic qualifications (attested)", "IELTS/TOEFL scores", "TB test certificate", "Biometric residence permit application"],
    visaTips: ["Apply online at gov.uk/student-visa", "Apply 3 months before course start", "Pay Immigration Health Surcharge (£470/year)", "Biometrics appointment mandatory", "Maintain valid CAS throughout stay"],
  },
  {
    id: "canada", name: "Canada", flag: "🇨🇦",
    tagline: "PR-friendly country with world-class education",
    avgTuition: "CAD $15,000–$40,000/year",
    visaName: "Study Permit",
    visaLink: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
    gradFrom: "#dc2626", gradTo: "#b45309",
    generalDocs: ["Valid Indian passport", "Letter of Acceptance from Canadian university", "Proof of funds (CAD $10,000+ for first year)", "Academic transcripts", "IELTS/TOEFL scores", "Statement of Purpose", "Biometrics"],
    visaTips: ["Apply online at IRCC portal", "Processing takes 4–12 weeks", "Get Biometrics done at VFS Global", "Medical exam may be required", "After graduation, apply for PGWP (Post-Graduation Work Permit)"],
  },
  {
    id: "australia", name: "Australia", flag: "🇦🇺",
    tagline: "Group of 8 universities, post-study work rights",
    avgTuition: "AUD $20,000–$45,000/year",
    visaName: "Student Visa (Subclass 500)",
    visaLink: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    gradFrom: "#1d4ed8", gradTo: "#059669",
    generalDocs: ["Valid Indian passport", "CoE (Confirmation of Enrollment)", "Proof of funds (AUD $21,041/year)", "Academic transcripts", "IELTS/TOEFL/PTE scores", "Overseas Student Health Cover (OSHC)", "Biometrics"],
    visaTips: ["Apply online at immi.homeaffairs.gov.au", "Get OSHC before applying", "Processing takes 4–6 weeks", "After study: 2–4 years Graduate Visa (subclass 485)", "Genuine Temporary Entrant (GTE) requirement — must show intent to return"],
  },
  {
    id: "germany", name: "Germany", flag: "🇩🇪",
    tagline: "Tuition-free public universities, engineering hub",
    avgTuition: "€0–€3,000/year (mostly free at public universities!)",
    visaName: "National Visa (Type D) for Study",
    visaLink: "https://india.diplo.de/in-en/service/-/1714736",
    gradFrom: "#1a1a1a", gradTo: "#dc2626",
    generalDocs: ["Valid Indian passport", "University admission letter (Zulassung)", "APS certificate (mandatory for Indian students)", "Blocked account proof (€11,208)", "Health insurance proof", "Academic transcripts (attested + translated)", "Language certificate"],
    visaTips: ["APS certificate is MANDATORY for Indian students", "Book visa appointment at German Embassy early", "Open blocked account at Deutsche Bank or Fintiba", "Processing takes 6–8 weeks", "Semester fee ~€150–€350 covers public transport"],
  },
];

// Fallback static scholarships (if DB is empty)
const STATIC_SCHOLARSHIPS: AbroadScholarship[] = [
  { name: "Fulbright-Nehru Master's Fellowships", provider: "USIEF", country: "usa", amount: "Full funding — tuition + living + airfare", deadline: "July 15 every year", eligibility: "Indian citizens, Bachelor's degree, min 55%, 3 yrs work experience", level: "Master", fields: "Arts, Humanities, Social Sciences, STEM, Management", bond: "Must return to India after program", applyLink: "https://www.usief.org.in/Fellowships/Fulbright-Nehru-Master-Fellowships.aspx", documents: ["Online USIEF application", "Academic transcripts", "3 reference letters", "Statement of purpose", "TOEFL/IELTS", "Passport copy"], tips: "Apply early — competition is very high. Focus on community impact in SOP.", isActive: true },
  { name: "Fulbright-Nehru Doctoral Fellowships", provider: "USIEF", country: "usa", amount: "Full funding — tuition + monthly stipend + airfare", deadline: "July 15 every year", eligibility: "Indian citizens, PhD enrolled or faculty, min 55%", level: "PhD", fields: "Any field", bond: "Must return to India", applyLink: "https://www.usief.org.in/Fellowships/Fulbright-Nehru-Doctoral-Research-Fellowships.aspx", documents: ["USIEF online form", "Research proposal", "Transcripts", "3 references", "TOEFL/IELTS"], tips: "Strong research proposal is key. Contact US faculty supervisor before applying.", isActive: true },
  { name: "Inlaks Shivdasani Foundation Scholarship", provider: "Inlaks Foundation", country: "usa", amount: "Up to $100,000 total over program", deadline: "April (varies)", eligibility: "Indian citizens under 30, top academic record", level: "Master / PhD", fields: "Arts, Humanities, Social Sciences, Sciences", bond: "No bond", applyLink: "https://www.inlaksfoundation.org/scholarships/", documents: ["Online application", "CV", "Transcripts", "2 references", "SOP", "Admission letter"], tips: "Must have admission first. Very competitive — apply only with strong profile.", isActive: true },
  { name: "Tata Scholarship for Cornell University", provider: "Tata Education and Development Trust", country: "usa", amount: "Full tuition + living expenses", deadline: "January (Cornell admission deadline)", eligibility: "Indian citizens admitted to Cornell, demonstrated financial need", level: "Bachelor / Master", fields: "Any Cornell program", bond: "No bond", applyLink: "https://sfs.cornell.edu/aid/tata", documents: ["Cornell admission application", "Financial need documents", "Transcripts", "SOP"], tips: "Apply through Cornell's financial aid — Tata scholarship is automatically considered.", isActive: true },
  { name: "AAUW International Fellowship", provider: "AAUW", country: "usa", amount: "$18,000–$30,000", deadline: "November 15", eligibility: "Women who are not US citizens, enrolled full-time in US university", level: "Master / PhD", fields: "Any", bond: "No bond", applyLink: "https://www.aauw.org/resources/programs/fellowships-grants/current-opportunities/international/", documents: ["Online application", "Transcripts", "2 references", "SOP", "Admission proof"], tips: "For women only. Focus on leadership and career goals in application.", isActive: true },
  { name: "Chevening Scholarships", provider: "UK FCDO", country: "uk", amount: "Full funding — tuition + living + flights + visa", deadline: "November 5 every year", eligibility: "Indian citizens, 2+ years work experience, Bachelor's degree", level: "Master", fields: "Any — focus on future leaders", bond: "Must return to India for 2 years", applyLink: "https://www.chevening.org/scholarships/", documents: ["Online Chevening application", "2 references", "Transcripts", "IELTS 6.5+", "Work experience proof", "SOP"], tips: "Leadership and networking is key. Apply 3 years after graduation for best chance.", isActive: true },
  { name: "Commonwealth Scholarships UK", provider: "Commonwealth Scholarship Commission", country: "uk", amount: "Full funding — tuition + stipend + airfare", deadline: "October–December", eligibility: "Indian citizens, good academic record, financial need", level: "Master / PhD", fields: "Development-related fields preferred", bond: "Must return to home country", applyLink: "https://cscuk.fcdo.gov.uk/apply/", documents: ["CSC online application", "Transcripts", "References", "IELTS", "Research proposal"], tips: "Strong development impact in application. Apply through Indian National Nominating Agency.", isActive: true },
  { name: "Gates Cambridge Scholarship", provider: "Bill & Melinda Gates Foundation", country: "uk", amount: "Full cost of study + maintenance + flights", deadline: "October / December", eligibility: "Non-UK citizens admitted to Cambridge, any field", level: "Master / PhD", fields: "Any Cambridge program", bond: "No bond", applyLink: "https://www.gatescambridge.org/apply/", documents: ["Cambridge application", "SOP", "3 references", "Academic record", "IELTS/TOEFL"], tips: "Apply to Cambridge first. Gates is considered during admission. Focus on social impact.", isActive: true },
  { name: "Felix Scholarship", provider: "Felix Foundation", country: "uk", amount: "Full tuition + living expenses", deadline: "January", eligibility: "Indian citizens under 30, financial need, strong academics", level: "Master / DPhil", fields: "Any (Oxford, SOAS, Reading programs)", bond: "No bond", applyLink: "https://www.felixscholarship.org/", documents: ["University application", "Financial need proof", "Transcripts", "References", "IELTS"], tips: "Apply to university first. Felix is need-based — strong financial documentation needed.", isActive: true },
  { name: "Vanier Canada Graduate Scholarships", provider: "Government of Canada", country: "canada", amount: "CAD $50,000/year for 3 years", deadline: "November (nominated by university)", eligibility: "International PhD students at Canadian universities", level: "PhD", fields: "Health, Natural Sciences, Engineering, Social Sciences, Humanities", bond: "No bond", applyLink: "https://vanier.gc.ca/en/home-accueil.html", documents: ["Nominated by university", "Research proposal", "Transcripts", "References"], tips: "Cannot apply directly — your Canadian university must nominate you. Contact faculty early.", isActive: true },
  { name: "Ontario Graduate Scholarship", provider: "Province of Ontario", country: "canada", amount: "CAD $10,000–$15,000/year", deadline: "Varies by university (usually Jan–Feb)", eligibility: "International students enrolled in Ontario universities", level: "Master / PhD", fields: "Any", bond: "No bond", applyLink: "https://osap.gov.on.ca/OSAPPortal/en/A-ZListofAid/PRDR019245.html", documents: ["University portal application", "Transcripts", "Research proposal", "2 references"], tips: "Apply through your Ontario university's graduate office. Strong academic record needed.", isActive: true },
  { name: "Shastri Indo-Canadian Institute Fellowship", provider: "Shastri Institute", country: "canada", amount: "CAD $5,000–$15,000", deadline: "October–November", eligibility: "Indian citizens — researchers, faculty, PhD students", level: "PhD / Research", fields: "Any academic field", bond: "No bond", applyLink: "https://www.shastriinstitute.org/grants-fellowships", documents: ["Online application", "Research proposal", "CV", "References from both countries"], tips: "India-Canada specific — good for collaborative research. Build connections with Canadian faculty first.", isActive: true },
  { name: "Australia Awards Scholarships", provider: "Australian Government (DFAT)", country: "australia", amount: "Full funding — tuition + living + airfare + insurance", deadline: "April 30 every year", eligibility: "Indian citizens, Bachelor's degree, 2 yrs work experience", level: "Master / PhD", fields: "Development-priority fields", bond: "Must return to India for 2 years", applyLink: "https://www.australiaawardsindia.org/", documents: ["OASIS application", "Transcripts", "Work experience proof", "References", "IELTS 6.5+", "Development impact statement"], tips: "Strongest scholarship for India. Development impact essay is the most important part.", isActive: true },
  { name: "Research Training Program (RTP)", provider: "Australian Government", country: "australia", amount: "Full tuition + AUD $28,000/year stipend", deadline: "Varies by university (Oct–Dec)", eligibility: "International PhD/Masters by Research students", level: "PhD / Research Masters", fields: "Any research field", bond: "No bond", applyLink: "https://www.education.gov.au/research-training-program", documents: ["University research application", "Research proposal", "Transcripts", "IELTS 6.5+", "Publications if any"], tips: "Contact a supervisor first. Most Australian universities use RTP for PhD funding.", isActive: true },
  { name: "DAAD Scholarships", provider: "DAAD Germany", country: "germany", amount: "€861–€1,200/month + travel allowance", deadline: "October 15 (for following year)", eligibility: "Indian citizens, Bachelor's with min 60%, IELTS 6.5 / German B2", level: "Master / PhD", fields: "Engineering, Sciences, Agriculture, Social Sciences, Arts", bond: "No bond", applyLink: "https://www.daad.in/en/find-funding/scholarships-for-indians-to-study-in-germany/", documents: ["DAAD portal application", "Motivation letter", "CV (Europass format)", "Transcripts + degree certificate", "2 references", "Language proof", "Research proposal (PhD)"], tips: "Germany's most prestigious scholarship. German language knowledge boosts chances even for English programs.", isActive: true },
  { name: "Deutschlandstipendium", provider: "German Federal Government", country: "germany", amount: "€300/month (tax-free)", deadline: "Varies by university (usually April–May)", eligibility: "Students at participating German universities, high academics", level: "Bachelor / Master", fields: "Any", bond: "No bond", applyLink: "https://www.deutschlandstipendium.de/en/", documents: ["University portal application", "Transcripts", "CV", "Motivation letter"], tips: "Apply through your German university's portal. Less competitive than DAAD — good starting point.", isActive: true },
  { name: "Konrad-Adenauer-Stiftung Scholarship", provider: "Konrad-Adenauer Foundation", country: "germany", amount: "€850–€1,200/month + book allowance", deadline: "July 15 / January 15", eligibility: "International students at German universities, high academics", level: "Master / PhD", fields: "Social Sciences, Politics, Law, Economics", bond: "No bond", applyLink: "https://www.kas.de/en/web/begabtenfoerderung-und-kultur/scholarships", documents: ["Online application", "Motivation letter", "CV", "Transcripts", "2 references"], tips: "Focus on civic/democratic values in motivation letter. Need enrolled admission in Germany.", isActive: true },
];

export default function StudyAbroadPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("usa");
  const [selectedScholarship, setSelectedScholarship] = useState<AbroadScholarship | null>(null);
  const [activeSection, setActiveSection] = useState<"scholarships" | "visa" | "docs">("scholarships");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [scholarships, setScholarships] = useState<AbroadScholarship[]>([]);
  const [loading, setLoading] = useState(true);

  // Load scholarships from DB, fallback to static data
  useEffect(() => {
    fetch("/api/study-abroad")
      .then(r => r.json())
      .then(d => {
        const data = d.scholarships || [];
        setScholarships(data.length > 0 ? data : STATIC_SCHOLARSHIPS);
        setLoading(false);
      })
      .catch(() => {
        setScholarships(STATIC_SCHOLARSHIPS);
        setLoading(false);
      });
  }, []);

  const country = COUNTRIES.find(c => c.id === selectedCountry)!;

  const countryScholarships = scholarships.filter(
    s => s.country === selectedCountry && s.isActive !== false
  );

  const filteredScholarships = countryScholarships.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fields.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel = levelFilter === "All" || s.level.includes(levelFilter);
    return matchSearch && matchLevel;
  });

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Segoe UI',system-ui,sans-serif" }}>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-lg" style={{ background: "linear-gradient(135deg,#1d4ed8,#4f46e5)" }}>🎓</div>
            <div className="hidden sm:block">
              <p className="font-bold text-slate-900 leading-none text-base group-hover:text-blue-600 transition-colors">ScholarHub</p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5 font-medium tracking-wide uppercase">Study Abroad</p>
            </div>
          </Link>
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Study Abroad</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2 border border-slate-200 focus-within:bg-white focus-within:border-blue-400 transition-all">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search scholarships..." className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-40" />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>}
            </div>
            <Link href="/" className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">← Back</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0f2044 0%,#1a3360 50%,#1d4ed8 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 relative z-10">
          <div className="max-w-2xl">
            {/* ✅ FIX: icon removed from this badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs font-semibold mb-5 backdrop-blur-sm">
              International Scholarships for Indian Students
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
              Study Abroad with Full Funding
            </h1>
            <p className="text-blue-200 text-base leading-relaxed mb-6">
              Complete guide for Indian students — country-wise scholarships, visa process, required documents, and pro tips.
            </p>
            {/* ── Country Tabs ── */}
            <div className="flex flex-wrap gap-3">
              {COUNTRIES.map(c => {
                const count = scholarships.filter(s => s.country === c.id && s.isActive !== false).length;
                return (
                  <button key={c.id} onClick={() => { setSelectedCountry(c.id); setSelectedScholarship(null); setActiveSection("scholarships"); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedCountry === c.id ? "bg-white text-blue-700 shadow-lg scale-105" : "bg-white/10 text-white border border-white/20 hover:bg-white/20"}`}>
                    {/* ✅ Only show the name, no flag emoji */}
                    <span>{c.name}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${selectedCountry === c.id ? "bg-blue-100 text-blue-700" : "bg-white/10 text-white/70"}`}>
                      {loading ? "..." : count} scholarships
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── COUNTRY OVERVIEW CARD ── */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ background: `linear-gradient(135deg,${country.gradFrom},${country.gradTo})`, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{country.name}</h2>
                    <p className="text-white/70 text-sm">{country.tagline}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20">
                    <p className="text-white/60 text-[10px] uppercase tracking-wide font-bold">Avg Tuition</p>
                    <p className="text-white font-bold text-sm">{country.avgTuition}</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20">
                    <p className="text-white/60 text-[10px] uppercase tracking-wide font-bold">Total Scholarships</p>
                    <p className="text-white font-bold text-sm">{loading ? "..." : countryScholarships.length} options</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20">
                    <p className="text-white/60 text-[10px] uppercase tracking-wide font-bold">Visa Type</p>
                    <p className="text-white font-bold text-sm">{country.visaName}</p>
                  </div>
                </div>
              </div>
              <a href={country.visaLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-5 py-3 rounded-xl hover:bg-blue-50 transition-all">
                Official Visa Guide →
              </a>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex border-t border-white/20">
            {([
              { key: "scholarships", label: `Scholarships (${loading ? "..." : countryScholarships.length})` },
              { key: "visa", label: "Visa Process" },
              { key: "docs", label: "Documents Needed" },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveSection(tab.key)}
                className={`flex-1 py-3 text-sm font-bold transition-all ${activeSection === tab.key ? "bg-white/20 text-white border-b-2 border-white" : "text-white/60 hover:text-white/90 hover:bg-white/10"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── SCHOLARSHIPS SECTION ── */}
        {activeSection === "scholarships" && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3.5 py-2 flex-1 min-w-[200px]">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name, field, provider..." className="outline-none text-sm text-slate-700 placeholder-slate-400 w-full bg-transparent" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["All", "Bachelor", "Master", "PhD"].map(l => (
                  <button key={l} onClick={() => setLevelFilter(l)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${levelFilter === l ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"}`}>
                    {l}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400 font-medium ml-auto">{filteredScholarships.length} scholarships</span>
            </div>

            {loading ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="text-4xl mb-3">⏳</div>
                <p className="text-slate-500 text-sm">Loading scholarships...</p>
              </div>
            ) : (
              <div className="grid gap-5">
                {filteredScholarships.map((s, i) => (
                  <div key={s._id || i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                    <div className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">{s.level}</span>
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{s.fields}</span>
                            {s.bond !== "No bond" && <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">Return Bond</span>}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 leading-snug">{s.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">by {s.provider}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-slate-400 font-medium mb-1">Amount</div>
                          <div className="text-sm font-bold text-emerald-700 leading-snug max-w-[200px]">{s.amount}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Deadline</p>
                          <p className="text-sm font-semibold text-slate-700">{s.deadline}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Eligibility</p>
                          <p className="text-sm text-slate-600 leading-snug">{s.eligibility}</p>
                        </div>
                        <div className={`border rounded-xl px-3.5 py-3 ${s.bond === "No bond" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                          <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${s.bond === "No bond" ? "text-emerald-600" : "text-amber-600"}`}>Service Bond</p>
                          <p className={`text-sm font-semibold leading-snug ${s.bond === "No bond" ? "text-emerald-700" : "text-amber-700"}`}>{s.bond}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 flex items-start gap-2.5">
                        <span className="text-blue-500 text-sm flex-shrink-0 mt-0.5">💡</span>
                        <p className="text-sm text-blue-700 leading-relaxed"><span className="font-bold">Pro Tip:</span> {s.tips}</p>
                      </div>

                      <div className="flex flex-wrap gap-3 items-center">
                        <button onClick={() => setSelectedScholarship(selectedScholarship?._id === s._id && selectedScholarship?.name === s.name ? null : s)}
                          className="text-sm font-bold px-4 py-2 rounded-xl border transition-all"
                          style={{ borderColor: (selectedScholarship?.name === s.name) ? "#dc2626" : "#e2e8f0", color: (selectedScholarship?.name === s.name) ? "#dc2626" : "#475569", background: (selectedScholarship?.name === s.name) ? "#fef2f2" : "white" }}>
                          {selectedScholarship?.name === s.name ? "▲ Hide Documents" : "Show Required Documents"}
                        </button>
                        <a href={s.applyLink} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-bold px-5 py-2 rounded-xl text-white transition-all hover:opacity-90"
                          style={{ background: `linear-gradient(135deg,${country.gradFrom},${country.gradTo})` }}>
                          Apply Now →
                        </a>
                      </div>

                      {selectedScholarship?.name === s.name && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Documents Required</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(Array.isArray(s.documents) ? s.documents : (s.documents as any)?.split(",").map((d: string) => d.trim()) || []).map((doc: string, di: number) => (
                              <div key={di} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
                                <span className="text-blue-500 flex-shrink-0">📄</span>
                                <span className="text-sm text-slate-700">{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredScholarships.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-slate-500 font-medium">No scholarships found for this filter.</p>
                    <button onClick={() => { setSearchQuery(""); setLevelFilter("All"); }} className="mt-3 text-blue-600 text-sm font-semibold hover:underline">Clear filters</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── VISA SECTION ── */}
        {activeSection === "visa" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg,${country.gradFrom},${country.gradTo})` }}>🛂</div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{country.visaName}</h3>
                <p className="text-slate-500 text-sm">For Indian students going to {country.name}</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              {country.visaTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: `linear-gradient(135deg,${country.gradFrom},${country.gradTo})` }}>{i + 1}</span>
                  <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
            <a href={country.visaLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-bold text-sm text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all"
              style={{ background: `linear-gradient(135deg,${country.gradFrom},${country.gradTo})` }}>
              Official {country.visaName} Guide →
            </a>
          </div>
        )}

        {/* ── DOCUMENTS SECTION ── */}
        {activeSection === "docs" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg,${country.gradFrom},${country.gradTo})` }}>📄</div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Documents Checklist</h3>
                <p className="text-slate-500 text-sm">General documents for Indian students applying to {country.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {country.generalDocs.map((doc, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5">
                  <span className="text-emerald-500 text-lg flex-shrink-0">✅</span>
                  <p className="text-sm text-slate-700 leading-relaxed">{doc}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div>
                <p className="font-bold text-amber-800 text-sm mb-1">Important for Indian Students</p>
                <p className="text-amber-700 text-sm leading-relaxed">All Indian academic documents (marksheets, degree certificates) need to be attested by the issuing university and if required, apostilled by the Indian Ministry of External Affairs. Start this process 2–3 months in advance.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── BOTTOM CTA ── */}
        <div className="mt-8 rounded-2xl p-6 sm:p-8 text-center" style={{ background: "linear-gradient(135deg,#0f2044,#1d4ed8)" }}>
          <p className="text-white font-bold text-xl mb-2">Ready to Study Abroad?</p>
          <p className="text-blue-200 text-sm mb-5">Also check India-specific scholarships on ScholarHub main portal</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-blue-50 transition-all">
            View India Scholarships →
          </Link>
        </div>
      </div>
    </div>
  );
}