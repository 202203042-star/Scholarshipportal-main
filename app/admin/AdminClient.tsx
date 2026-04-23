"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Scholarship {
  _id: string; title: string; titleHi?: string; titleGu?: string;
  amount: number; deadline: string; isActive: boolean; category: string[]; applicants: string[];
}
interface AbroadScholarship {
  _id?: string; name: string; provider: string; country: string; amount: string;
  deadline: string; eligibility: string; level: string; fields: string; bond: string;
  applyLink: string; documents: string; tips: string; isActive: boolean;
}
interface Notification {
  _id: string; title: string; message: string; type: "info" | "warning" | "success";
  isActive: boolean; createdAt: string; scholarshipId?: string;
}

const EMPTY_FORM = {
  title: "", titleHi: "", titleGu: "", description: "", amount: "", eligibility: "",
  deadline: "", applyLink: "", youtubeLink: "", category: "",
  level: "Central", course: "College", state: "Any", gender: "Any", income: "999999999", documents: "",
};
const EMPTY_ABROAD: Omit<AbroadScholarship, "_id"> = {
  name: "", provider: "", country: "usa", amount: "", deadline: "",
  eligibility: "", level: "Master", fields: "", bond: "No bond",
  applyLink: "", documents: "", tips: "", isActive: true,
};
const EMPTY_NOTIF = { title: "", message: "", type: "info" as const, scholarshipId: "" };
const ALL_CATEGORIES = ["Any", "General", "OBC", "SC", "ST", "Minority", "EWS", "Girls"];
const COUNTRIES = [{ id: "usa", name: "🇺🇸 USA" }, { id: "uk", name: "🇬🇧 UK" }, { id: "canada", name: "🇨🇦 Canada" }, { id: "australia", name: "🇦🇺 Australia" }, { id: "germany", name: "🇩🇪 Germany" }];
const LEVELS = ["Bachelor", "Master", "PhD", "Master / PhD", "PhD / Research", "Any", "Bachelor / Master"];

const STATIC_ABROAD_DATA = [
  { _id: "static-1", name: "Fulbright-Nehru Master's Fellowships", provider: "USIEF", country: "usa", amount: "Full funding — tuition + living + airfare", deadline: "July 15 every year", eligibility: "Indian citizens, Bachelor's, min 55%, 3 yrs work exp", level: "Master", fields: "Arts, Humanities, STEM, Management", bond: "Must return to India after program", applyLink: "https://www.usief.org.in", documents: "USIEF application, Transcripts, 3 references, SOP, TOEFL/IELTS", tips: "Apply early. Focus on community impact in SOP.", isActive: true },
  { _id: "static-2", name: "Fulbright-Nehru Doctoral Fellowships", provider: "USIEF", country: "usa", amount: "Full funding — tuition + stipend + airfare", deadline: "July 15 every year", eligibility: "Indian citizens, PhD enrolled, min 55%", level: "PhD", fields: "Any field", bond: "Must return to India", applyLink: "https://www.usief.org.in", documents: "USIEF form, Research proposal, Transcripts, TOEFL", tips: "Contact US faculty supervisor before applying.", isActive: true },
  { _id: "static-3", name: "Inlaks Shivdasani Foundation Scholarship", provider: "Inlaks Foundation", country: "usa", amount: "Up to $100,000 total", deadline: "April (varies)", eligibility: "Indian citizens under 30, top academic record", level: "Master / PhD", fields: "Arts, Humanities, Sciences", bond: "No bond", applyLink: "https://www.inlaksfoundation.org/scholarships/", documents: "CV, Transcripts, 2 references, SOP, Admission letter", tips: "Must have admission first. Very competitive.", isActive: true },
  { _id: "static-4", name: "Tata Scholarship for Cornell University", provider: "Tata Education and Development Trust", country: "usa", amount: "Full tuition + living expenses", deadline: "January (Cornell deadline)", eligibility: "Indian citizens admitted to Cornell, financial need", level: "Bachelor / Master", fields: "Any Cornell program", bond: "No bond", applyLink: "https://sfs.cornell.edu/aid/tata", documents: "Cornell application, Financial need docs, Transcripts", tips: "Apply through Cornell financial aid — automatically considered.", isActive: true },
  { _id: "static-5", name: "AAUW International Fellowship", provider: "AAUW", country: "usa", amount: "$18,000-$30,000", deadline: "November 15", eligibility: "Women, non-US citizens, enrolled full-time in US university", level: "Master / PhD", fields: "Any", bond: "No bond", applyLink: "https://www.aauw.org", documents: "Online application, Transcripts, 2 references, SOP", tips: "For women only. Focus on leadership in application.", isActive: true },
  { _id: "static-6", name: "Chevening Scholarships", provider: "UK FCDO", country: "uk", amount: "Full funding — tuition + living + flights + visa", deadline: "November 5 every year", eligibility: "Indian citizens, 2+ yrs work exp, Bachelor degree", level: "Master", fields: "Any — future leaders focus", bond: "Must return to India for 2 years", applyLink: "https://www.chevening.org/scholarships/", documents: "Chevening application, 2 references, Transcripts, IELTS 6.5+", tips: "Leadership is key. Apply 3 years after graduation for best chance.", isActive: true },
  { _id: "static-7", name: "Gates Cambridge Scholarship", provider: "Bill and Melinda Gates Foundation", country: "uk", amount: "Full cost of study + maintenance + flights", deadline: "October / December", eligibility: "Non-UK citizens admitted to Cambridge", level: "Master / PhD", fields: "Any Cambridge program", bond: "No bond", applyLink: "https://www.gatescambridge.org/apply/", documents: "Cambridge application, SOP, 3 references, IELTS", tips: "Apply to Cambridge first. Focus on social impact.", isActive: true },
  { _id: "static-8", name: "Commonwealth Scholarships UK", provider: "Commonwealth Scholarship Commission", country: "uk", amount: "Full funding — tuition + stipend + airfare", deadline: "October-December", eligibility: "Indian citizens, good academics, financial need", level: "Master / PhD", fields: "Development-related fields", bond: "Must return to home country", applyLink: "https://cscuk.fcdo.gov.uk/apply/", documents: "CSC application, Transcripts, References, IELTS", tips: "Strong development impact essay needed.", isActive: true },
  { _id: "static-9", name: "Felix Scholarship", provider: "Felix Foundation", country: "uk", amount: "Full tuition + living expenses", deadline: "January", eligibility: "Indian citizens under 30, financial need, strong academics", level: "Master / DPhil", fields: "Oxford, SOAS, Reading programs", bond: "No bond", applyLink: "https://www.felixscholarship.org/", documents: "University application, Financial need proof, IELTS", tips: "Apply to university first. Need-based — strong financial docs needed.", isActive: true },
  { _id: "static-10", name: "Vanier Canada Graduate Scholarships", provider: "Government of Canada", country: "canada", amount: "CAD 50,000/year for 3 years", deadline: "November (nominated by university)", eligibility: "International PhD students at Canadian universities", level: "PhD", fields: "Health, Natural Sciences, Engineering, Social Sciences", bond: "No bond", applyLink: "https://vanier.gc.ca", documents: "University nomination, Research proposal, Transcripts", tips: "University must nominate you — contact faculty early.", isActive: true },
  { _id: "static-11", name: "Ontario Graduate Scholarship", provider: "Province of Ontario", country: "canada", amount: "CAD 10,000-15,000/year", deadline: "Varies by university (Jan-Feb)", eligibility: "International students in Ontario universities", level: "Master / PhD", fields: "Any", bond: "No bond", applyLink: "https://osap.gov.on.ca", documents: "University portal application, Transcripts, Research proposal", tips: "Apply through your Ontario university graduate office.", isActive: true },
  { _id: "static-12", name: "Shastri Indo-Canadian Institute Fellowship", provider: "Shastri Institute", country: "canada", amount: "CAD 5,000-15,000", deadline: "October-November", eligibility: "Indian citizens — researchers, faculty, PhD students", level: "PhD / Research", fields: "Any academic field", bond: "No bond", applyLink: "https://www.shastriinstitute.org", documents: "Online application, Research proposal, CV, References", tips: "India-Canada specific. Build connections with Canadian faculty first.", isActive: true },
  { _id: "static-13", name: "Australia Awards Scholarships", provider: "Australian Government DFAT", country: "australia", amount: "Full funding — tuition + living + airfare + insurance", deadline: "April 30 every year", eligibility: "Indian citizens, Bachelors, 2 yrs work exp", level: "Master / PhD", fields: "Development-priority fields", bond: "Must return to India for 2 years", applyLink: "https://www.australiaawardsindia.org/", documents: "OASIS application, Transcripts, Work exp proof, IELTS 6.5+", tips: "Strongest scholarship for India. Development impact essay is key.", isActive: true },
  { _id: "static-14", name: "Research Training Program RTP", provider: "Australian Government", country: "australia", amount: "Full tuition + AUD 28,000/year stipend", deadline: "Varies by university Oct-Dec", eligibility: "International PhD/Research Masters students", level: "PhD / Research Masters", fields: "Any research field", bond: "No bond", applyLink: "https://www.education.gov.au", documents: "University research application, Research proposal, IELTS 6.5+", tips: "Contact a supervisor first. Most universities use RTP for PhD.", isActive: true },
  { _id: "static-15", name: "University of Melbourne Graduate Research Scholarship", provider: "University of Melbourne", country: "australia", amount: "Full tuition + AUD 28,000/year", deadline: "October 31 Round 1", eligibility: "International students applying for PhD/Research Masters", level: "PhD / Research Masters", fields: "Any Melbourne program", bond: "No bond", applyLink: "https://study.unimelb.edu.au", documents: "Melbourne graduate application, Research proposal, IELTS", tips: "Get supervisor pre-approval before applying. Very competitive.", isActive: true },
  { _id: "static-16", name: "DAAD Scholarships", provider: "DAAD Germany", country: "germany", amount: "861-1200 EUR/month + travel allowance", deadline: "October 15 for following year", eligibility: "Indian citizens, Bachelors min 60%, IELTS 6.5 or German B2", level: "Master / PhD", fields: "Engineering, Sciences, Agriculture, Social Sciences, Arts", bond: "No bond", applyLink: "https://www.daad.in/en/find-funding/scholarships-for-indians-to-study-in-germany/", documents: "DAAD portal application, Motivation letter, CV, Transcripts, References", tips: "Germany most prestigious scholarship. German language boosts chances.", isActive: true },
  { _id: "static-17", name: "Deutschlandstipendium", provider: "German Federal Government", country: "germany", amount: "300 EUR/month tax-free", deadline: "Varies by university April-May", eligibility: "Students at German universities, high academic performance", level: "Bachelor / Master", fields: "Any", bond: "No bond", applyLink: "https://www.deutschlandstipendium.de/en/", documents: "University portal application, Transcripts, CV, Motivation letter", tips: "Apply through your German university. Less competitive than DAAD.", isActive: true },
  { _id: "static-18", name: "Konrad-Adenauer-Stiftung Scholarship", provider: "Konrad-Adenauer Foundation", country: "germany", amount: "850-1200 EUR/month + book allowance", deadline: "July 15 / January 15", eligibility: "International students at German universities, high academics", level: "Master / PhD", fields: "Social Sciences, Politics, Law, Economics", bond: "No bond", applyLink: "https://www.kas.de/en/web/begabtenfoerderung-und-kultur/scholarships", documents: "Online application, Motivation letter, CV, Transcripts, 2 references", tips: "Focus on civic/democratic values. Need enrolled admission in Germany.", isActive: true },
];

const notifTypeConfig: Record<string, { bg: string; color: string; border: string; label: string; emoji: string; gradFrom: string; gradTo: string }> = {
  info:    { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "Info",    emoji: "ℹ️", gradFrom: "#3b82f6", gradTo: "#2563eb" },
  warning: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", label: "Warning", emoji: "⚠️", gradFrom: "#f59e0b", gradTo: "#d97706" },
  success: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Success", emoji: "✅", gradFrom: "#22c55e", gradTo: "#16a34a" },
};

export default function AdminClient() {
  const [scholarships, setScholarships]     = useState<Scholarship[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [form, setForm]                     = useState(EMPTY_FORM);
  const [saving, setSaving]                 = useState(false);
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [deletingId, setDeletingId]         = useState<string | null>(null);
  const [togglingId, setTogglingId]         = useState<string | null>(null);
  const [search, setSearch]                 = useState("");
  const [showForm, setShowForm]             = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab]           = useState<"active" | "inactive">("active");
  const [mainTab, setMainTab]               = useState<"scholarships" | "studyabroad" | "notifications">("scholarships");
  const [abroadList, setAbroadList]         = useState<AbroadScholarship[]>([]);
  const [abroadLoading, setAbroadLoading]   = useState(true);
  const [abroadForm, setAbroadForm]         = useState(EMPTY_ABROAD);
  const [abroadSaving, setAbroadSaving]     = useState(false);
  const [abroadEditingId, setAbroadEditingId] = useState<string | null>(null);
  const [abroadDeletingId, setAbroadDeletingId] = useState<string | null>(null);
  const [showAbroadForm, setShowAbroadForm] = useState(false);
  const [abroadCountryFilter, setAbroadCountryFilter] = useState("all");
  const [abroadError, setAbroadError]       = useState("");
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [notifForm, setNotifForm]           = useState(EMPTY_NOTIF);
  const [notifSaving, setNotifSaving]       = useState(false);
  const [notifEditingId, setNotifEditingId] = useState<string | null>(null);
  const [notifDeletingId, setNotifDeletingId] = useState<string | null>(null);
  const [showNotifForm, setShowNotifForm]   = useState(false);
  const [sendingMail, setSendingMail]       = useState(false);
  const [mailResult, setMailResult]         = useState<{ success: boolean; message: string } | null>(null);

  const loadScholarships = () => {
    setLoading(true); setError("");
    fetch("/api/scholarships").then(r => r.json()).then(d => { setScholarships(d.scholarships || []); setLoading(false); }).catch(() => { setError("Failed to load scholarships"); setLoading(false); });
  };
  const loadAbroad = () => {
    setAbroadList(STATIC_ABROAD_DATA); setAbroadLoading(false);
    fetch("/api/study-abroad").then(r => r.json()).then(d => { if (d.scholarships && d.scholarships.length > 0) setAbroadList(d.scholarships); }).catch(() => {});
  };
  const loadNotifications = () => {
    fetch("/api/notifications").then(r => r.json()).then(d => setNotifications(d.notifications || [])).catch(() => {});
  };

  useEffect(() => { loadScholarships(); loadAbroad(); loadNotifications(); }, []);

  function toggleCategoryFilter(cat: string) {
    if (cat === "Any") { setSelectedCategories([]); return; }
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    const payload = { title: form.title, titleHi: form.titleHi, titleGu: form.titleGu, description: form.description, amount: Number(form.amount), income: Number(form.income), eligibility: form.eligibility, category: form.category.split(",").map(c => c.trim()).filter(Boolean), deadline: new Date(form.deadline).toISOString(), applyLink: form.applyLink, youtubeLink: form.youtubeLink, level: form.level, course: form.course, state: form.state, gender: form.gender, documents: form.documents };
    const url = editingId ? `/api/scholarships/${editingId}` : "/api/scholarships";
    try {
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json(); setSaving(false);
      if (res.ok) { setForm(EMPTY_FORM); setEditingId(null); setShowForm(false); loadScholarships(); }
      else setError(data.error || "Save failed");
    } catch { setSaving(false); setError("Network error"); }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Do you want to delete "${title}"?`)) return;
    setDeletingId(id);
    try { const res = await fetch(`/api/scholarships/${id}`, { method: "DELETE" }); if (res.ok) setScholarships(prev => prev.filter(s => s._id !== id)); else setError("Delete failed"); } catch { setError("Network error"); }
    setDeletingId(null);
  }

  async function handleToggleActive(s: Scholarship) {
    setTogglingId(s._id);
    try { const res = await fetch(`/api/scholarships/${s._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !s.isActive }) }); if (res.ok) setScholarships(prev => prev.map(sc => sc._id === s._id ? { ...sc, isActive: !sc.isActive } : sc)); else setError("Toggle failed"); } catch { setError("Network error"); }
    setTogglingId(null);
  }

  function handleEdit(s: any) {
    setForm({ title: s.title || "", titleHi: s.titleHi || "", titleGu: s.titleGu || "", description: s.description || "", amount: s.amount?.toString() || "", eligibility: s.eligibility || "", deadline: s.deadline ? new Date(s.deadline).toISOString().split("T")[0] : "", applyLink: s.applyLink || "", youtubeLink: s.youtubeLink || "", category: Array.isArray(s.category) ? s.category.join(", ") : s.category || "", level: s.level || "Central", course: s.course || "College", state: s.state || "Any", gender: s.gender || "Any", income: s.income?.toString() || "999999999", documents: s.documents || "" });
    setEditingId(s._id); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleAbroadSubmit(e: React.FormEvent) {
    e.preventDefault(); setAbroadSaving(true); setAbroadError("");
    const payload = { ...abroadForm, documents: abroadForm.documents.split(",").map(d => d.trim()).filter(Boolean) };
    const isStaticItem = abroadEditingId?.startsWith("static-");
    if (isStaticItem) { setAbroadList(prev => prev.map(s => s._id === abroadEditingId ? { ...s, ...payload } : s)); setAbroadForm(EMPTY_ABROAD); setAbroadEditingId(null); setShowAbroadForm(false); setAbroadSaving(false); return; }
    const url = abroadEditingId ? `/api/study-abroad/${abroadEditingId}` : "/api/study-abroad";
    try {
      const res = await fetch(url, { method: abroadEditingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setAbroadSaving(false);
      if (res.ok) { const data = await res.json(); if (!abroadEditingId) setAbroadList(prev => [data.scholarship, ...prev]); setAbroadForm(EMPTY_ABROAD); setAbroadEditingId(null); setShowAbroadForm(false); loadAbroad(); }
      else { if (!abroadEditingId) { const newItem = { ...payload, _id: "local-" + Date.now(), isActive: true }; setAbroadList(prev => [newItem as AbroadScholarship, ...prev]); } setAbroadForm(EMPTY_ABROAD); setAbroadEditingId(null); setShowAbroadForm(false); }
    } catch { const newItem = { ...payload, _id: "local-" + Date.now(), isActive: true }; setAbroadList(prev => [newItem as AbroadScholarship, ...prev]); setAbroadForm(EMPTY_ABROAD); setAbroadEditingId(null); setShowAbroadForm(false); setAbroadSaving(false); }
  }

  async function handleAbroadDelete(id: string, name: string) {
    if (!confirm(`Do you want to delete "${name}"?`)) return;
    setAbroadDeletingId(id);
    if (id.startsWith("static-") || id.startsWith("local-")) { setAbroadList(prev => prev.filter(s => s._id !== id)); setAbroadDeletingId(null); return; }
    try { const res = await fetch(`/api/study-abroad/${id}`, { method: "DELETE" }); if (res.ok) setAbroadList(prev => prev.filter(s => s._id !== id)); else setAbroadList(prev => prev.filter(s => s._id !== id)); } catch { setAbroadList(prev => prev.filter(s => s._id !== id)); }
    setAbroadDeletingId(null);
  }

  async function handleAbroadToggle(s: AbroadScholarship) {
    setAbroadList(prev => prev.map(x => x._id === s._id ? { ...x, isActive: !x.isActive } : x));
    if (s._id?.startsWith("static-") || s._id?.startsWith("local-")) return;
    try { await fetch(`/api/study-abroad/${s._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !s.isActive }) }); } catch {}
  }

  function handleAbroadEdit(s: AbroadScholarship) {
    setAbroadForm({ ...s, documents: Array.isArray(s.documents) ? (s.documents as any[]).join(", ") : s.documents || "" });
    setAbroadEditingId(s._id!); setShowAbroadForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleNotifSubmit(e: React.FormEvent) {
    e.preventDefault(); setNotifSaving(true);
    const url = notifEditingId ? `/api/notifications/${notifEditingId}` : "/api/notifications";
    try { const res = await fetch(url, { method: notifEditingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notifForm) }); setNotifSaving(false); if (res.ok) { setNotifForm(EMPTY_NOTIF); setNotifEditingId(null); setShowNotifForm(false); loadNotifications(); } } catch { setNotifSaving(false); }
  }

  async function handleNotifDelete(id: string) {
    if (!confirm("Do you want to delete this notification?")) return;
    setNotifDeletingId(id);
    try { const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" }); if (res.ok) setNotifications(prev => prev.filter(n => n._id !== id)); } catch {}
    setNotifDeletingId(null);
  }

  async function handleNotifToggle(n: Notification) {
    try { const res = await fetch(`/api/notifications/${n._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !n.isActive }) }); if (res.ok) setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isActive: !x.isActive } : x)); } catch {}
  }

  function handleNotifEdit(n: Notification) {
    setNotifForm({ title: n.title, message: n.message, type: n.type, scholarshipId: n.scholarshipId || "" });
    setNotifEditingId(n._id); setShowNotifForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSendEmail(n: Notification) {
    setSendingMail(true); setMailResult(null);
    try { const res = await fetch("/api/notifications/send-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: n._id, scholarshipId: n.scholarshipId }) }); const data = await res.json(); setMailResult({ success: res.ok, message: data.message || (res.ok ? "Email sent!" : "Failed") }); } catch { setMailResult({ success: false, message: "Network error" }); }
    setSendingMail(false); setTimeout(() => setMailResult(null), 5000);
  }

  const activeScholarships   = scholarships.filter(s => s.isActive);
  const inactiveScholarships = scholarships.filter(s => !s.isActive);
  const filterList = (list: Scholarship[]) => list.filter(s => { const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()); const matchCat = selectedCategories.length === 0 || selectedCategories.some(c => s.category?.includes(c)); return matchSearch && matchCat; });
  const filteredActive   = filterList(activeScholarships);
  const filteredInactive = filterList(inactiveScholarships);
  const filteredAbroad   = abroadCountryFilter === "all" ? abroadList : abroadList.filter(s => s.country === abroadCountryFilter);
  const selectedScholarshipForNotif = notifForm.scholarshipId ? scholarships.find(s => s._id === notifForm.scholarshipId) : null;

  const inp = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 transition-all bg-white box-border font-[inherit]";
  const lbl = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5";

  const countryFlag: Record<string, string> = { usa: "", uk: "", canada: "", australia: "", germany: "" };
  const countryName: Record<string, string> = { usa: "USA", uk: "UK", canada: "Canada", australia: "Australia", germany: "Germany" };

  /* ── ScholarshipCard ── */
  const ScholarshipCard = ({ s }: { s: Scholarship }) => (
    <div className={`group flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${s.isActive ? "bg-white border-slate-200 hover:border-yellow-300 hover:shadow-sm" : "bg-slate-50 border-slate-200 opacity-70"}`}>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm mb-0.5 truncate">{s.title}</p>
        {s.titleHi && <p className="text-xs text-indigo-500 mb-0.5 truncate">{s.titleHi}</p>}
        {s.titleGu && <p className="text-xs text-emerald-600 mb-1 truncate">{s.titleGu}</p>}
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">₹{s.amount.toLocaleString("en-IN")}</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{Array.isArray(s.category) ? s.category.join(", ") : s.category}</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s.applicants?.length || 0} applicants</span>
          <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full font-medium">Due: {new Date(s.deadline).toLocaleDateString("en-IN")}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => handleToggleActive(s)} disabled={togglingId === s._id}
          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${s.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"} disabled:opacity-50`}>
          {togglingId === s._id ? "..." : s.isActive ? "Active" : "Inactive"}
        </button>
        <button onClick={() => handleEdit(s)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all">Edit</button>
        <button onClick={() => handleDelete(s._id, s.title)} disabled={deletingId === s._id}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50">
          {deletingId === s._id ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Playfair Display', serif; }
        .admin-nav-btn { position: relative; overflow: hidden; }
        .admin-nav-btn::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,0.08); opacity:0; transition:opacity 0.2s; }
        .admin-nav-btn:hover::after { opacity:1; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:#f1f5f9; } ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#f7f8fa" }}>

        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-50" style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#2563eb 100%)", boxShadow: "0 2px 20px rgba(15,32,68,0.5)" }}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>🎓</div>
              <div>
                <p className="font-display text-white font-bold text-lg leading-none">ScholarHub</p>
                <p className="text-yellow-200 text-[10px] font-semibold tracking-widest uppercase mt-0.5">Admin Panel</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { loadScholarships(); loadAbroad(); loadNotifications(); }}
                className="admin-nav-btn flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg border border-white/20 transition-all hover:border-white/40">
                ↻ Refresh
              </button>
              <Link href="/login"
                className="admin-nav-btn flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg border border-white/20 transition-all hover:border-white/40">
                Logout
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* ── STATS ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Scholarships", value: scholarships.length,         icon: "🎓", from: "#1e3a8a", to: "#1d4ed8" },
              { label: "Active",             value: activeScholarships.length,   icon: "✅", from: "#059669", to: "#047857" },
              { label: "Inactive",           value: inactiveScholarships.length, icon: "⏸️", from: "#dc2626", to: "#b91c1c" },
              { label: "Study Abroad",       value: abroadList.length,           icon: "✈️", from: "#0891b2", to: "#0e7490" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-slate-200" style={{ boxShadow: "0 2px 12px rgba(15,32,68,0.06)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `linear-gradient(135deg,${stat.from},${stat.to})` }}>
                  <span className="text-white font-bold text-lg">{stat.value}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-xl">{stat.icon}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 text-lg font-bold ml-4">×</button>
            </div>
          )}

          {/* ── MAIN TABS ── */}
          <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-slate-200" style={{ boxShadow: "0 1px 6px rgba(15,32,68,0.06)" }}>
            {[
              { key: "scholarships",  label: "India Scholarships", icon: "🎓", count: scholarships.length },
              { key: "studyabroad",   label: "Study Abroad",        icon: "✈️", count: abroadList.length },
              { key: "notifications", label: "Notifications",       icon: "🔔", count: notifications.length },
            ].map(tab => (
              <button key={tab.key} onClick={() => setMainTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${mainTab === tab.key ? "text-white shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
                style={mainTab === tab.key ? { background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", boxShadow: "0 2px 12px rgba(15,32,68,0.3)" } : {}}>
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${mainTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* ════════════════ INDIA SCHOLARSHIPS ════════════════ */}
          {mainTab === "scholarships" && (
            <div className="space-y-6">
              {/* Add / Edit Form */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(15,32,68,0.06)" }}>
                <div className={`flex items-center justify-between px-6 py-4 ${editingId ? "bg-amber-50 border-b border-amber-100" : "bg-slate-50 border-b border-slate-100"}`}>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-lg">{editingId ? "Edit Scholarship" : "Add New Scholarship"}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{editingId ? "Update the scholarship details below" : "Fill in the details to add a new scholarship"}</p>
                  </div>
                  <button onClick={() => { setShowForm(!showForm); if (showForm) { setEditingId(null); setForm(EMPTY_FORM); } }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${showForm ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "text-white shadow-sm hover:opacity-90"}`}
                    style={!showForm ? { background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#1e3a8a" } : {}}>
                    {showForm ? "✕ Close" : "+ Add Scholarship"}
                  </button>
                </div>
                {showForm && (
                  <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className={lbl}>Scholarship Title (English) *</label>
                        <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. PM Scholarship 2025" className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Hindi Title (हिंदी नाम)</label>
                        <input value={form.titleHi} onChange={e => setForm({ ...form, titleHi: e.target.value })} placeholder="प्रधानमंत्री छात्रवृत्ति" className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Gujarati Title (ગુજરાતી નામ)</label>
                        <input value={form.titleGu} onChange={e => setForm({ ...form, titleGu: e.target.value })} placeholder="પ્રધાનમંત્રી શિષ્યવૃત્તિ" className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Amount (₹) *</label>
                        <input required type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="50000" className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Deadline *</label>
                        <input required type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inp} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={lbl + " mb-2"}>Category *</label>
                        <div className="flex flex-wrap gap-2">
                          {["General", "OBC", "SC", "ST", "Minority", "EWS", "Girls"].map(cat => {
                            const selected = form.category.split(",").map(c => c.trim()).includes(cat);
                            return (
                              <button key={cat} type="button"
                                onClick={() => { const cur = form.category.split(",").map(c => c.trim()).filter(Boolean); const upd = selected ? cur.filter(c => c !== cat) : [...cur, cat]; setForm({ ...form, category: upd.join(", ") }); }}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${selected ? "text-white border-transparent shadow-sm" : "text-slate-600 border-slate-200 bg-white hover:border-yellow-300"}`}
                                style={selected ? { background: "linear-gradient(135deg,#f59e0b,#fbbf24)" } : {}}>
                                {selected ? "✓ " : ""}{cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label className={lbl}>Max Family Income (₹/year)</label>
                        <input type="number" value={form.income} onChange={e => setForm({ ...form, income: e.target.value })} placeholder="250000" className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Level</label>
                        <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className={inp}>
                          {["Central", "State", "Private", "NGO"].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Course</label>
                        <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} className={inp}>
                          {["College", "School", "Both"].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Gender</label>
                        <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className={inp}>
                          {["Any", "Male", "Female"].map(g => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>State</label>
                        <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Apply Link</label>
                        <input type="url" value={form.applyLink} onChange={e => setForm({ ...form, applyLink: e.target.value })} placeholder="https://..." className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>YouTube Link</label>
                        <input value={form.youtubeLink} onChange={e => setForm({ ...form, youtubeLink: e.target.value })} placeholder="https://youtube.com/..." className={inp} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={lbl}>Eligibility *</label>
                        <input required value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} placeholder="e.g. 12th pass, income under 2.5 lakh" className={inp} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={lbl}>Description *</label>
                        <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inp + " resize-y"} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={lbl}>Documents Required</label>
                        <textarea rows={2} value={form.documents} onChange={e => setForm({ ...form, documents: e.target.value })} placeholder="e.g. Aadhar Card, Income Certificate" className={inp + " resize-y"} />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
                      <button type="submit" disabled={saving}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
                        {saving ? "Saving..." : editingId ? "✓ Update Scholarship" : "✓ Add Scholarship"}
                      </button>
                      {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(false); }}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Scholarship List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(15,32,68,0.06)" }}>
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-4 border-b border-slate-100" style={{ background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)" }}>
                  <h3 className="font-display font-bold text-white text-lg">
                    All Scholarships
                    <span className="ml-2 text-sm font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">{scholarships.length}</span>
                  </h3>
                  <div className="flex gap-3">
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                      className="border border-white/20 rounded-lg px-3 py-1.5 text-sm bg-white/10 text-white placeholder-white/50 outline-none focus:bg-white/20 transition-all w-44" />
                    <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="px-4 py-1.5 rounded-lg text-sm font-bold bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-all">
                      + Add
                    </button>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-slate-100 bg-slate-50">
                  {ALL_CATEGORIES.map(cat => {
                    const isSelected = cat === "Any" ? selectedCategories.length === 0 : selectedCategories.includes(cat);
                    return (
                      <button key={cat} onClick={() => toggleCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${isSelected ? "text-white border-transparent" : "text-slate-500 border-slate-200 bg-white hover:border-yellow-300"}`}
                        style={isSelected ? { background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", border: "1px solid #f59e0b" } : {}}>
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Active / Inactive Tabs */}
                <div className="flex border-b border-slate-100">
                  {[{ key: "active", label: `Active`, count: filteredActive.length, color: "#059669" }, { key: "inactive", label: `Inactive`, count: filteredInactive.length, color: "#dc2626" }].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                      className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === tab.key ? "bg-white" : "bg-slate-50 text-slate-400 hover:text-slate-600"}`}
                      style={{ color: activeTab === tab.key ? tab.color : undefined, borderBottom: activeTab === tab.key ? `2px solid ${tab.color}` : "2px solid transparent" }}>
                      {tab.label} <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: activeTab === tab.key ? (tab.key === "active" ? "#d1fae5" : "#fee2e2") : "#f1f5f9", color: tab.color }}>{tab.count}</span>
                    </button>
                  ))}
                </div>

                {/* List */}
                <div className="p-5">
                  {loading ? (
                    <div className="text-center py-16">
                      <div className="inline-block w-8 h-8 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-slate-400 text-sm">Loading...</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {(activeTab === "active" ? filteredActive : filteredInactive).length === 0 ? (
                        <div className="text-center py-16">
                          <p className="text-4xl mb-3">🎓</p>
                          <p className="text-slate-400 text-sm">No scholarships found</p>
                        </div>
                      ) : (activeTab === "active" ? filteredActive : filteredInactive).map(s => <ScholarshipCard key={s._id} s={s} />)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STUDY ABROAD ════════════════ */}
          {mainTab === "studyabroad" && (
            <div className="space-y-6">
              {abroadError && (
                <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <span>⚠️ {abroadError}</span>
                  <button onClick={() => setAbroadError("")} className="text-red-400 hover:text-red-600 text-lg font-bold">×</button>
                </div>
              )}

              {/* Add / Edit Form */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(15,32,68,0.06)" }}>
                <div className={`flex items-center justify-between px-6 py-4 ${abroadEditingId ? "bg-amber-50 border-b border-amber-100" : "bg-emerald-50 border-b border-emerald-100"}`}>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-lg">{abroadEditingId ? "Edit Study Abroad Scholarship" : "Add Study Abroad Scholarship"}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">International scholarship details</p>
                  </div>
                  <button onClick={() => { setShowAbroadForm(!showAbroadForm); if (showAbroadForm) { setAbroadEditingId(null); setAbroadForm(EMPTY_ABROAD); } }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${showAbroadForm ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "text-white shadow-sm hover:opacity-90"}`}
                    style={!showAbroadForm ? { background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#1e3a8a" } : {}}>
                    {showAbroadForm ? "✕ Close" : "+ Add Scholarship"}
                  </button>
                </div>
                {showAbroadForm && (
                  <form onSubmit={handleAbroadSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className={lbl}>Scholarship Name *</label>
                        <input required value={abroadForm.name} onChange={e => setAbroadForm({ ...abroadForm, name: e.target.value })} placeholder="e.g. Chevening Scholarship" className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Provider / Organization *</label>
                        <input required value={abroadForm.provider} onChange={e => setAbroadForm({ ...abroadForm, provider: e.target.value })} placeholder="e.g. UK FCDO" className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Country *</label>
                        <select required value={abroadForm.country} onChange={e => setAbroadForm({ ...abroadForm, country: e.target.value })} className={inp}>
                          {COUNTRIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Amount / Funding *</label>
                        <input required value={abroadForm.amount} onChange={e => setAbroadForm({ ...abroadForm, amount: e.target.value })} placeholder="e.g. Full funding" className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Deadline *</label>
                        <input required value={abroadForm.deadline} onChange={e => setAbroadForm({ ...abroadForm, deadline: e.target.value })} placeholder="e.g. November 5 every year" className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Level *</label>
                        <select required value={abroadForm.level} onChange={e => setAbroadForm({ ...abroadForm, level: e.target.value })} className={inp}>
                          {LEVELS.map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Fields / Courses</label>
                        <input value={abroadForm.fields} onChange={e => setAbroadForm({ ...abroadForm, fields: e.target.value })} placeholder="e.g. Engineering, MBA, Any" className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Service / Return Bond</label>
                        <select value={abroadForm.bond} onChange={e => setAbroadForm({ ...abroadForm, bond: e.target.value })} className={inp}>
                          <option value="No bond">No bond</option>
                          <option value="Must return to India after program">Must return to India after program</option>
                          <option value="Must return to India for 2 years">Must return to India for 2 years</option>
                          <option value="Must return to home country">Must return to home country</option>
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Apply Link *</label>
                        <input required type="url" value={abroadForm.applyLink} onChange={e => setAbroadForm({ ...abroadForm, applyLink: e.target.value })} placeholder="https://..." className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Status</label>
                        <div className="flex gap-3">
                          {[true, false].map(v => (
                            <button key={String(v)} type="button" onClick={() => setAbroadForm({ ...abroadForm, isActive: v })}
                              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${abroadForm.isActive === v ? (v ? "bg-emerald-50 text-emerald-700 border-emerald-400" : "bg-red-50 text-red-600 border-red-400") : "bg-white text-slate-500 border-slate-200"}`}>
                              {v ? "Active" : "Inactive"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className={lbl}>Eligibility *</label>
                        <input required value={abroadForm.eligibility} onChange={e => setAbroadForm({ ...abroadForm, eligibility: e.target.value })} placeholder="e.g. Indian citizens, Bachelor's degree, 55% min" className={inp} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={lbl}>Documents Required <span className="text-slate-400 font-normal normal-case">(comma separated)</span></label>
                        <textarea rows={2} value={abroadForm.documents} onChange={e => setAbroadForm({ ...abroadForm, documents: e.target.value })} placeholder="Online application, Transcripts, 2 references, IELTS" className={inp + " resize-y"} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={lbl}>Pro Tip</label>
                        <textarea rows={2} value={abroadForm.tips} onChange={e => setAbroadForm({ ...abroadForm, tips: e.target.value })} placeholder="Tips for applicants..." className={inp + " resize-y"} />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
                      <button type="submit" disabled={abroadSaving}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
                        {abroadSaving ? "Saving..." : abroadEditingId ? "✓ Update" : "✓ Add Scholarship"}
                      </button>
                      {abroadEditingId && (
                        <button type="button" onClick={() => { setAbroadEditingId(null); setAbroadForm(EMPTY_ABROAD); setShowAbroadForm(false); }}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Study Abroad List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(15,32,68,0.06)" }}>
                <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-4 border-b border-slate-100" style={{ background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)" }}>
                  <h3 className="font-display font-bold text-white text-lg">
                    Study Abroad Scholarships
                    <span className="ml-2 text-sm font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">{abroadList.length}</span>
                  </h3>
                  <button onClick={() => { setShowAbroadForm(true); setAbroadEditingId(null); setAbroadForm(EMPTY_ABROAD); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-4 py-1.5 rounded-lg text-sm font-bold bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-all">
                    + Add
                  </button>
                </div>

                {/* Country Filter */}
                <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-slate-100 bg-slate-50">
                  <button onClick={() => setAbroadCountryFilter("all")}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${abroadCountryFilter === "all" ? "text-white border-transparent" : "text-slate-500 border-slate-200 bg-white"}`}
                    style={abroadCountryFilter === "all" ? { background: "linear-gradient(135deg,#f59e0b,#fbbf24)" } : {}}>
                    All Countries
                  </button>
                  {COUNTRIES.map(c => (
                    <button key={c.id} onClick={() => setAbroadCountryFilter(c.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${abroadCountryFilter === c.id ? "text-white border-transparent" : "text-slate-500 border-slate-200 bg-white"}`}
                      style={abroadCountryFilter === c.id ? { background: "linear-gradient(135deg,#f59e0b,#fbbf24)" } : {}}>
                      {c.name} ({abroadList.filter(s => s.country === c.id).length})
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {abroadLoading ? (
                    <div className="text-center py-16"><div className="inline-block w-8 h-8 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mb-3"></div><p className="text-slate-400 text-sm">Loading...</p></div>
                  ) : filteredAbroad.length === 0 ? (
                    <div className="text-center py-16"><p className="text-4xl mb-3">✈️</p><p className="text-slate-400 text-sm">No scholarships found</p></div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAbroad.map(s => (
                        <div key={s._id} className={`group flex items-start justify-between gap-4 p-4 rounded-xl border transition-all ${s.isActive ? "bg-white border-slate-200 hover:border-yellow-300 hover:shadow-sm" : "bg-slate-50 border-slate-200 opacity-70"}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              <span className="text-[11px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full">{countryName[s.country]}</span>
                              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{s.level}</span>
                              {s.bond !== "No bond" && <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Return Bond</span>}
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${s.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>{s.isActive ? "Active" : "Inactive"}</span>
                            </div>
                            <p className="font-semibold text-slate-900 text-sm mb-0.5">{s.name}</p>
                            <p className="text-xs text-slate-500 mb-1">by {s.provider}</p>
                            <p className="text-xs text-slate-400">{s.amount} · {s.deadline} · {s.fields}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => handleAbroadToggle(s)} className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${s.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>{s.isActive ? "Active" : "Inactive"}</button>
                            <button onClick={() => handleAbroadEdit(s)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all">Edit</button>
                            <button onClick={() => handleAbroadDelete(s._id!, s.name)} disabled={abroadDeletingId === s._id} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50">{abroadDeletingId === s._id ? "..." : "Delete"}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ NOTIFICATIONS ════════════════ */}
          {mainTab === "notifications" && (
            <div className="space-y-6">
              {mailResult && (
                <div className={`flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-semibold border ${mailResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                  <span>{mailResult.success ? "✅" : "❌"}</span> {mailResult.message}
                </div>
              )}

              {/* Notification Form */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(15,32,68,0.06)" }}>
                <div className={`flex items-center justify-between px-6 py-4 ${notifEditingId ? "bg-amber-50 border-b border-amber-100" : "bg-yellow-50 border-b border-yellow-100"}`}>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-lg">{notifEditingId ? "Edit Notification" : "New Notification"}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Send email notifications to students</p>
                  </div>
                  <button onClick={() => { setShowNotifForm(!showNotifForm); if (showNotifForm) { setNotifEditingId(null); setNotifForm(EMPTY_NOTIF); } }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${showNotifForm ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "text-slate-900 shadow-sm hover:opacity-90"}`}
                    style={!showNotifForm ? { background: "linear-gradient(135deg,#f59e0b,#d97706)" } : {}}>
                    {showNotifForm ? "✕ Close" : "🔔 New Notification"}
                  </button>
                </div>
                {showNotifForm && (
                  <form onSubmit={handleNotifSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className={lbl}>Select Scholarship <span className="text-slate-400 font-normal normal-case">(optional)</span></label>
                        <select value={notifForm.scholarshipId} onChange={e => setNotifForm({ ...notifForm, scholarshipId: e.target.value })} className={inp}>
                          <option value="">All Registered Students</option>
                          {scholarships.map(s => <option key={s._id} value={s._id}>{s.isActive ? "🟢" : "🔴"} {s.title} — ₹{s.amount.toLocaleString("en-IN")}</option>)}
                        </select>
                        <div className="mt-3">
                          {selectedScholarshipForNotif ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start gap-3">
                              <span className="text-lg">🎓</span>
                              <div>
                                <p className="font-bold text-yellow-900 text-sm">{selectedScholarshipForNotif.title}</p>
                                <p className="text-xs text-yellow-700 mt-0.5 font-semibold">The email will only go to applicants for this scholarship</p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl px-4 py-3 flex items-center gap-3">
                              <span>📢</span>
                              <p className="text-sm text-slate-500">The email will go to all registered students</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className={lbl}>Title *</label>
                        <input required value={notifForm.title} onChange={e => setNotifForm({ ...notifForm, title: e.target.value })} placeholder="e.g. New Scholarship Available!" className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Type</label>
                        <div className="flex gap-2">
                          {(["info", "warning", "success"] as const).map(t => (
                            <button key={t} type="button" onClick={() => setNotifForm({ ...notifForm, type: t })}
                              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${notifForm.type === t ? "text-white border-transparent shadow-sm" : "text-slate-600 border-slate-200 bg-white hover:border-slate-300"}`}
                              style={notifForm.type === t ? { background: `linear-gradient(135deg,${notifTypeConfig[t].gradFrom},${notifTypeConfig[t].gradTo})` } : {}}>
                              {notifTypeConfig[t].emoji} {notifTypeConfig[t].label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className={lbl}>Message *</label>
                        <textarea required rows={4} value={notifForm.message} onChange={e => setNotifForm({ ...notifForm, message: e.target.value })} placeholder="This message will appear in the student email..." className={inp + " resize-y"} />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
                      <button type="submit" disabled={notifSaving}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-900 transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
                        {notifSaving ? "Saving..." : notifEditingId ? "✓ Update" : "✓ Create Notification"}
                      </button>
                      {notifEditingId && (
                        <button type="button" onClick={() => { setNotifEditingId(null); setNotifForm(EMPTY_NOTIF); setShowNotifForm(false); }}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Notifications List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(15,32,68,0.06)" }}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100" style={{ background: "linear-gradient(135deg,#78350f,#b45309)" }}>
                  <h3 className="font-display font-bold text-white text-lg">
                    All Notifications
                    <span className="ml-2 text-sm font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">{notifications.length}</span>
                  </h3>
                </div>
                <div className="p-5">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16"><p className="text-4xl mb-3">🔔</p><p className="text-slate-400 text-sm">No notifications found</p></div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map(n => {
                        const cfg = notifTypeConfig[n.type];
                        const linked = n.scholarshipId ? scholarships.find(s => s._id === n.scholarshipId) : null;
                        return (
                          <div key={n._id} className={`rounded-xl border p-4 transition-all ${n.isActive ? "" : "opacity-60"}`} style={{ background: n.isActive ? cfg.bg : "#f8fafc", borderColor: n.isActive ? cfg.border : "#e2e8f0" }}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>{cfg.emoji} {cfg.label}</span>
                                  {linked ? (
                                    <span className="text-[11px] font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200 px-2.5 py-0.5 rounded-full">🎓 {linked.title}</span>
                                  ) : (
                                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded-full">All Students</span>
                                  )}
                                  <span className="text-[11px] text-slate-400">{new Date(n.createdAt).toLocaleDateString("en-IN")}</span>
                                </div>
                                <p className="font-bold text-slate-900 text-sm mb-1">{n.title}</p>
                                <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                              </div>
                              <div className="flex flex-col gap-2 flex-shrink-0">
                                <button onClick={() => handleSendEmail(n)} disabled={sendingMail}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 transition-all hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                                  style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
                                  📧 {sendingMail ? "Sending..." : "Send Email"}
                                </button>
                                <div className="flex gap-1.5">
                                  <button onClick={() => handleNotifToggle(n)}
                                    className={`flex-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition-all ${n.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                                    {n.isActive ? "Active" : "Inactive"}
                                  </button>
                                  <button onClick={() => handleNotifEdit(n)} className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-yellow-50 text-yellow-800 hover:bg-yellow-100 transition-all">Edit</button>
                                  <button onClick={() => handleNotifDelete(n._id)} disabled={notifDeletingId === n._id} className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50">
                                    {notifDeletingId === n._id ? "..." : "Del"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}