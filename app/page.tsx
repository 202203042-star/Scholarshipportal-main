"use client";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const C = {
  navy:"#0f2044", navyMid:"#1a3360",
  blue:"#1d4ed8", indigo:"#4f46e5",
  cyan:"#0891b2",
  green:"#059669",
  recGreen:"#047857",
};

const T = {
  en: {
    tagline:"Find & Apply for Scholarships",
    studentIncome:"Family Income",
    totalScholarships:"Total Scholarships",
    recommended:"Recommended",
    studentProfile:"Student Profile",
    incomeField:"Annual Family Income (₹)",
    categoryField:"Category",
    courseField:"Level of Study",
    stateField:"State / UT",
    genderField:"Gender",
    updateProfile:"Find My Scholarships",
    scholarshipsRecommended:"scholarships match your profile",
    searchPlaceholder:"Search scholarships...",
    allCategories:"All Categories",
    allCourses:"All Courses",
    school:"School", engineering:"Engineering", medical:"Medical",
    arts:"Arts", commerce:"Commerce", science:"Science",
    allLevels:"All Types", central:"Central Govt",
    stateLvl:"State Govt", trust:"Trust / NGO",
    scholarships:"Scholarships", showing:"results",
    name:"Scholarship", level:"Type", courseCol:"Course",
    stateCol:"State", amount:"Amount", details:"Details", apply:"Apply",
    noResults:"No scholarships match your filters.",
    recommended_badge:"Recommended",
    description:"About this Scholarship",
    eligibility:"Eligibility Criteria",
    documents:"Documents Required",
    applyNow:"Apply on Official Site →",
    howToFill:"▶ Watch Tutorial",
    lastDate:"Last Date",
    applyModal:"Apply for",
    lastDateLabel:"Application Deadline",
    stepsTitle:"Steps to Apply",
    steps:["Gather all required documents","Click Apply on Official Site below","Register / Login on portal","Fill personal & academic details","Upload scanned documents","Submit and save your application number"],
    applyOnSite:"Apply on Official Site →",
    watchVideo:"▶ Watch Tutorial",
    docWallet:"My Documents",
    docWalletDesc:"Your documents are saved securely in your browser.",
    docName:"Document Name",
    docFile:"Upload File",
    addDocument:"Add Document",
    noDocuments:"No documents yet. Upload Aadhaar, marksheets, caste certificate etc.",
    remove:"Remove",
    docAdded:"Document saved!",
    anyOpt:"Any",
    profile:"My Profile",
    logout:"Logout",
    genderAny:"Any", genderMale:"Male", genderFemale:"Female",
    navHome:"Home", navScholarships:"Scholarships", navContact:"Contact Us",
    profileModal:"Student Profile",
    contactTitle:"Contact Us",
    contactSub:"We're here to help you find the right scholarship.",
    contactName:"Your Name", contactEmail:"Your Email",
    contactMsg:"Your Message", contactSend:"Send Message",
    contactSent:"✅ Message sent! We'll get back to you within 24 hours.",
    helpTitle:"Help & FAQ",
    secureNote:"🔒 Your documents are stored locally in your browser. They are never uploaded to any server.",
  },
  hi: {
    tagline:"छात्रवृत्ति खोजें और आवेदन करें",
    studentIncome:"पारिवारिक आय",
    totalScholarships:"कुल छात्रवृत्तियाँ",
    recommended:"अनुशंसित",
    studentProfile:"छात्र प्रोफ़ाइल",
    incomeField:"वार्षिक पारिवारिक आय (₹)",
    categoryField:"श्रेणी",
    courseField:"अध्ययन का स्तर",
    stateField:"राज्य / UT",
    genderField:"लिंग",
    updateProfile:"मेरी छात्रवृत्तियाँ खोजें",
    scholarshipsRecommended:"छात्रवृत्तियाँ मेल खाती हैं",
    searchPlaceholder:"छात्रवृत्ति खोजें...",
    allCategories:"सभी श्रेणियाँ",
    allCourses:"सभी कोर्स",
    school:"स्कूल", engineering:"इंजीनियरिंग", medical:"मेडिकल",
    arts:"आर्ट्स", commerce:"कॉमर्स", science:"साइंस",
    allLevels:"सभी प्रकार", central:"केंद्र सरकार",
    stateLvl:"राज्य सरकार", trust:"ट्रस्ट / NGO",
    scholarships:"छात्रवृत्तियाँ", showing:"परिणाम",
    name:"छात्रवृत्ति", level:"प्रकार", courseCol:"कोर्स",
    stateCol:"राज्य", amount:"राशि", details:"विवरण", apply:"आवेदन करें",
    noResults:"कोई छात्रवृत्ति नहीं मिली।",
    recommended_badge:"अनुशंसित",
    description:"इस छात्रवृत्ति के बारे में",
    eligibility:"पात्रता मानदंड",
    documents:"आवश्यक दस्तावेज़",
    applyNow:"आधिकारिक साइट पर आवेदन करें →",
    howToFill:"▶ ट्यूटोरियल देखें",
    lastDate:"अंतिम तिथि",
    applyModal:"आवेदन करें",
    lastDateLabel:"आवेदन की अंतिम तिथि",
    stepsTitle:"आवेदन के चरण",
    steps:["सभी दस्तावेज़ एकत्र करें","नीचे 'आधिकारिक साइट' पर क्लिक करें","पोर्टल पर रजिस्टर / लॉगिन करें","व्यक्तिगत और शैक्षणिक विवरण भरें","स्कैन किए दस्तावेज़ अपलोड करें","सबमिट करें और आवेदन नंबर नोट करें"],
    applyOnSite:"आधिकारिक साइट पर आवेदन करें →",
    watchVideo:"▶ ट्यूटोरियल देखें",
    docWallet:"मेरे दस्तावेज़",
    docWalletDesc:"आपके दस्तावेज़ ब्राउज़र में सुरक्षित हैं।",
    docName:"दस्तावेज़ का नाम",
    docFile:"फ़ाइल अपलोड करें",
    addDocument:"दस्तावेज़ जोड़ें",
    noDocuments:"अभी तक कोई दस्तावेज़ नहीं।",
    remove:"हटाएं",
    docAdded:"दस्तावेज़ सहेजा!",
    anyOpt:"कोई भी",
    profile:"मेरी प्रोफ़ाइल",
    logout:"लॉगआउट",
    genderAny:"कोई भी", genderMale:"पुरुष", genderFemale:"महिला",
    navHome:"होम", navScholarships:"छात्रवृत्तियाँ", navContact:"संपर्क करें",
    profileModal:"छात्र प्रोफ़ाइल",
    contactTitle:"संपर्क करें",
    contactSub:"हम आपको सही छात्रवृत्ति खोजने में मदद करेंगे।",
    contactName:"आपका नाम", contactEmail:"आपका ईमेल",
    contactMsg:"आपका संदेश", contactSend:"संदेश भेजें",
    contactSent:"✅ संदेश भेजा गया!",
    helpTitle:"सहायता और FAQ",
    secureNote:"🔒 आपके दस्तावेज़ localStorage में सुरक्षित हैं।",
  },
  gu: {
    tagline:"શિષ્યવૃત્તિ શોધો અને અરજી કરો",
    studentIncome:"કુટુંબની આવક",
    totalScholarships:"કુલ શિષ્યવૃત્તિઓ",
    recommended:"ભલામણ",
    studentProfile:"વિદ્યાર્થી પ્રોફાઇલ",
    incomeField:"વાર્ષિક કુટુંબની આવક (₹)",
    categoryField:"શ્રેણી",
    courseField:"અભ્યાસ સ્તર",
    stateField:"રાજ્ય / UT",
    genderField:"જાતિ",
    updateProfile:"મારી શિષ્યવૃત્તિ શોધો",
    scholarshipsRecommended:"શિષ્યવૃત્તિઓ મળે છે",
    searchPlaceholder:"શિષ્યવૃત્તિ શોધો...",
    allCategories:"બધી શ્રેણીઓ",
    allCourses:"બધા કોર્સ",
    school:"શાળા", engineering:"એન્જિનિયરિંગ", medical:"મેડિકલ",
    arts:"આર્ટ્સ", commerce:"કૉમર્સ", science:"સાયન્સ",
    allLevels:"બધા પ્રકાર", central:"કેન્દ્ર સરકાર",
    stateLvl:"રાજ્ય સરકાર", trust:"ટ્રસ્ટ / NGO",
    scholarships:"શિષ્યવૃત્તિઓ", showing:"પરિણામ",
    name:"શિષ્યવૃત્તિ", level:"પ્રકાર", courseCol:"કોર્સ",
    stateCol:"રાજ્ય", amount:"રકમ", details:"વિગત", apply:"અરજી",
    noResults:"કોઈ શિષ્યવૃત્તિ મળી નહીં.",
    recommended_badge:"ભલામણ",
    description:"આ શિષ્યવૃત્તિ વિશે",
    eligibility:"પાત્રતા માપદંડ",
    documents:"જરૂરી દસ્તાવેજો",
    applyNow:"સત્તાવાર સાઇટ પર અરજી →",
    howToFill:"▶ ટ્યુટોરિયલ જુઓ",
    lastDate:"છેલ્લી તારીખ",
    applyModal:"અરજી કરો",
    lastDateLabel:"અરજીની છેલ્લી તારીખ",
    stepsTitle:"અરજી ના પગલાં",
    steps:["બધા દસ્તાવેજ ભેગા કરો","'સત્તાવાર સાઇટ' ક્લિક કરો","પોર્ટલ પર નોંધણી / લૉગિન","વ્યક્તિગત અને શૈક્ષણિક માહિતી ભરો","સ્કૅન દસ્તાવેજ અપલોડ કરો","સબમિટ કરો અને અરજી નંબર નોંધો"],
    applyOnSite:"સત્તાવાર સાઇટ પર અરજી →",
    watchVideo:"▶ ટ્યુટોરિયલ જુઓ",
    docWallet:"મારા દસ્તાવેજો",
    docWalletDesc:"તમારા દસ્તાવેજ બ્રાઉઝરમાં સુરક્ષિત છે.",
    docName:"દસ્તાવેજનું નામ",
    docFile:"ફાઇલ અપલોડ",
    addDocument:"દસ્તાવેજ ઉમેરો",
    noDocuments:"હજુ કોઈ દસ્તાવેજ નથી.",
    remove:"કાઢો",
    docAdded:"દસ્તાવેજ સચવાઈ!",
    anyOpt:"કોઈ પણ",
    profile:"મારી પ્રોફાઇલ",
    logout:"લૉગઆઉટ",
    genderAny:"કોઈ પણ", genderMale:"પુરુષ", genderFemale:"સ્ત્રી",
    navHome:"હોમ", navScholarships:"શિષ્યવૃત્તિઓ", navContact:"સંપર્ક",
    profileModal:"વિદ્યાર્થી પ્રોફાઇલ",
    contactTitle:"સંપર્ક કરો",
    contactSub:"અમે તમને સાચી શિષ્યવૃત્તિ શોધવામાં મદદ કરીશું.",
    contactName:"તમારું નામ", contactEmail:"તમારો ઇમેઇલ",
    contactMsg:"તમારો સંદેશ", contactSend:"સંદેશ મોકલો",
    contactSent:"✅ સંદેશ મોકલ્યો! 24 કલાકમાં જવાબ.",
    helpTitle:"સહાય અને FAQ",
    secureNote:"🔒 તમારા દસ્તાવેજ localStorage માં સુરક્ષિત છે.",
  },
};
type Lang = "en"|"hi"|"gu";

const CATEGORY_OPTIONS = ["All Categories","SC","ST","OBC","General","Minority"];
const CAST_OPTIONS     = ["SC","ST","OBC","General","Minority"];
const LEVEL_OPTIONS    = ["All Levels","Central","State","Trust"];
const STATES = ["Any","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry"];

function toCourseKey(c:string):string {
  if(c==="Any") return "Any";
  if(c==="School") return "School";
  return "College";
}

interface Scholarship {
  _id?: string;
  id?: number;
  name?: string;
  title?: string;
  titleHi?: string;
  titleGu?: string;
  gender: string;
  category: string | string[];
  course: string;
  state: string;
  level: string;
  income: number;
  amount: string | number;
  lastDate?: string;
  deadline?: string;
  applyLink?: string;
  youtubeLink?: string;
  description: string;
  eligibility: string;
  documents?: string;
  isActive?: boolean;
}

interface Profile {
  income: string;
  category: string;
  course: string;
  state: string;
  gender: string;
}

interface DocEntry {
  id: string;
  name: string;
  fileName: string;
  dataUrl: string;
}

function isRecommended(s: Scholarship, p: Profile | null): boolean {
  if (!p) return false;
  const inc = parseInt(p.income) || 0;
  const gm = s.gender === "Any" || p.gender === "Any" || s.gender === p.gender;
  const ck = toCourseKey(p.course);
  const cat = Array.isArray(s.category) ? s.category : [s.category];
  return gm &&
    (inc === 0 || s.income >= inc) &&
    (cat.includes("General") || cat.includes(p.category) || p.category === "General") &&
    (ck === "Any" || s.course === "Any" || s.course === ck) &&
    (!p.state || p.state === "Any" || s.state === "Any" || s.state === p.state);
}

function catBadge(c: string | string[]) {
  const cat = Array.isArray(c) ? c[0] : c;
  const m: Record<string, string> = {
    SC: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    ST: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    OBC: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
    Minority: "bg-pink-50 text-pink-700 ring-1 ring-pink-200",
    General: "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
  };
  return m[cat] || "bg-gray-50 text-gray-600 ring-1 ring-gray-200";
}

function lvlBadge(l: string) {
  if (l === "Central") return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
  if (l === "State") return "bg-teal-50 text-teal-700 ring-1 ring-teal-200";
  return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
}

export default function ScholarshipPage() {
  const { data: session } = useSession();
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];
  const [SCHOLARSHIPS, setScholarships] = useState<Scholarship[]>([]);
  const [scholarshipsLoading, setScholarshipsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState<"home" | "scholarships" | "contact" | "help">("home");
  const [profile, setProfile] = useState<Profile>({ income: "", category: "SC", course: "Any", state: "Any", gender: "Any" });
  const [savedProfile, setSavedProfile] = useState<Profile | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("All Categories");
  const [searchCourse, setSearchCourse] = useState("Any");
  const [searchLevel, setSearchLevel] = useState("All Levels");
  const [searchGender, setSearchGender] = useState("Any");
  const [searchState, setSearchState] = useState("Any");
  const [detailS, setDetailS] = useState<Scholarship | null>(null);
  const [applyS, setApplyS] = useState<Scholarship | null>(null);
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [docName, setDocName] = useState("");
  const [docToast, setDocToast] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", msg: "" });
  const [contactSent, setContactSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch scholarships from MongoDB
  useEffect(() => {
   fetch("/api/scholarships")
  .then(r => r.json())
  .then(d => {
    setScholarships(d.scholarships || []);
    setScholarshipsLoading(false);
  })
      .catch(() => setScholarshipsLoading(false));
  }, []);

  useEffect(() => {
    try {
      const sp = localStorage.getItem("sh_profile"); if (sp) setSavedProfile(JSON.parse(sp));
      const pf = localStorage.getItem("sh_profileForm"); if (pf) setProfile(JSON.parse(pf));
      const dc = localStorage.getItem("sh_docs"); if (dc) setDocs(JSON.parse(dc));
      const lg = localStorage.getItem("sh_lang"); if (lg) setLang(lg as Lang);
    } catch {}
  }, []);

  useEffect(() => { try { localStorage.setItem("sh_profileForm", JSON.stringify(profile)); } catch {} }, [profile]);
  useEffect(() => { try { if (savedProfile) localStorage.setItem("sh_profile", JSON.stringify(savedProfile)); } catch {} }, [savedProfile]);
  useEffect(() => { try { localStorage.setItem("sh_docs", JSON.stringify(docs)); } catch {} }, [docs]);
  useEffect(() => { try { localStorage.setItem("sh_lang", lang); } catch {} }, [lang]);

  const sName = (s: Scholarship) => {
  if (lang === "hi" && s.titleHi) return s.titleHi;
  if (lang === "gu" && s.titleGu) return s.titleGu;
  return s.title || s.name || "";
};
  const sAmount = (s: Scholarship) => typeof s.amount === "number" ? `₹${s.amount.toLocaleString("en-IN")}` : s.amount;
  const sLastDate = (s: Scholarship) => s.lastDate || (s.deadline ? new Date(s.deadline).toLocaleDateString("en-IN") : "—");
  const sCategory = (s: Scholarship) => Array.isArray(s.category) ? s.category[0] : s.category;

  const recCount = SCHOLARSHIPS.filter(s => isRecommended(s, savedProfile)).length;
  const hasFilters = searchCategory !== "All Categories" || searchCourse !== "Any" || searchGender !== "Any" || searchLevel !== "All Levels" || searchState !== "Any" || !!searchName;
  const clearFilters = () => { setSearchCategory("All Categories"); setSearchCourse("Any"); setSearchGender("Any"); setSearchLevel("All Levels"); setSearchState("Any"); setSearchName(""); };

  const displayed = SCHOLARSHIPS
    .filter(s => {
      const nm = sName(s).toLowerCase().includes(searchName.toLowerCase());
      const cat = searchCategory === "All Categories" || (Array.isArray(s.category) ? s.category.includes(searchCategory) : s.category === searchCategory);
      const ck = toCourseKey(searchCourse);
      const crs = ck === "Any" || s.course === "Any" || s.course === ck;
      const lvl = searchLevel === "All Levels" || s.level === searchLevel;
      const gdr = searchGender === "Any" || s.gender === "Any" || s.gender === searchGender;
      const st = searchState === "Any" || s.state === "Any" || s.state === searchState;
      return nm && cat && crs && lvl && gdr && st;
    })
    .sort((a, b) => (isRecommended(b, savedProfile) ? 1 : 0) - (isRecommended(a, savedProfile) ? 1 : 0));

  function handleDocAdd() {
    const file = fileRef.current?.files?.[0];
    if (!file || !docName.trim()) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const newDoc = { id: Date.now().toString(), name: docName.trim(), fileName: file.name, dataUrl: e.target?.result as string };
      setDocs(prev => [...prev, newDoc]);
      setDocName(""); if (fileRef.current) fileRef.current.value = "";
      setDocToast(true); setTimeout(() => setDocToast(false), 2500);
    };
    reader.readAsDataURL(file);
  }

  const sl = "border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";
  const il = "border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";
  const courseLabel = (c: string) => c === "Any" ? t.anyOpt : c === "School" ? t.school : c === "Engineering" ? t.engineering : c === "Medical" ? t.medical : c === "Arts" ? t.arts : c === "Commerce" ? t.commerce : c === "Science" ? t.science : c;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Segoe UI',system-ui,sans-serif" }}>

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-3">
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0" style={{ background: `linear-gradient(135deg,${C.blue},${C.indigo})` }}>🎓</div>
              <div className="hidden sm:block">
                <p className="font-bold text-slate-900 leading-none text-base">ScholarHub</p>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5 font-medium tracking-wide uppercase">{t.tagline}</p>
              </div>
              <p className="sm:hidden font-bold text-slate-900 text-base">ScholarHub</p>
            </div>

            <nav className="hidden md:flex items-center gap-0.5 ml-2">
              {(["home", "scholarships", "contact", "help"] as const).map(k => {
                const labels: { [key: string]: string } = { home: t.navHome, scholarships: t.navScholarships, contact: t.navContact, help: "Help" };
                const active = activeNav === k;
                return (
                  <button key={k} onClick={() => setActiveNav(k)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
                    {labels[k]}
                  </button>
                );
              })}
            </nav>

            <div className="flex-1 mx-2 hidden lg:flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={searchName} onChange={e => setSearchName(e.target.value)} placeholder={t.searchPlaceholder} className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full" />
              {searchName && <button onClick={() => setSearchName("")} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs font-semibold flex-shrink-0">
                {(["en", "hi", "gu"] as Lang[]).map(l => (
                  <button key={l} onClick={() => setLang(l)} className={`px-2.5 py-1.5 transition-colors ${lang === l ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
                    {l === "en" ? "EN" : l === "hi" ? "हिं" : "ગુ"}
                  </button>
                ))}
              </div>

              {session ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-sm font-medium text-slate-700">
                    👋 {session.user?.name?.split(" ")[0]}
                  </span>
                  <button onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-sm font-medium text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                    {t.logout}
                  </button>
                </div>
              ) : (
                <Link href="/login"
                  className="flex items-center gap-1.5 text-sm font-medium text-white px-4 py-1.5 rounded-lg transition-all hover:opacity-90 flex-shrink-0"
                  style={{ background: `linear-gradient(135deg,${C.blue},${C.indigo})` }}>
                  Login
                </Link>
              )}

              <button onClick={() => setShowProfile(true)}
                className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:border-blue-300 hover:text-blue-700 flex-shrink-0">
                <span className="text-base leading-none">👤</span>
                <span className="hidden sm:inline">{t.profile}</span>
              </button>
            </div>
          </div>

          <div className="lg:hidden pb-3">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 focus-within:bg-white focus-within:border-blue-400 transition-all">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={searchName} onChange={e => setSearchName(e.target.value)} placeholder={t.searchPlaceholder} className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full" />
            </div>
          </div>
        </div>
      </header>

      {/* CONTACT PAGE */}
      {activeNav === "contact" && (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <button onClick={() => setActiveNav("home")}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 mb-6 transition-colors">
            ← Back to Home
          </button>
          <div className="bg-white rounded-2xl border border-slate-200 p-8" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{t.contactTitle}</h2>
            <p className="text-sm text-slate-400 mb-6">{t.contactSub}</p>
            {contactSent ? (
              <div className="text-center py-10 text-emerald-600 font-semibold text-base">{t.contactSent}</div>
            ) : (
              <div className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t.contactName}</label><input value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} className={il} placeholder="Your name" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t.contactEmail}</label><input type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} className={il} placeholder="your@email.com" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t.contactMsg}</label><textarea value={contactForm.msg} onChange={e => setContactForm({ ...contactForm, msg: e.target.value })} rows={5} className={`${il} resize-none`} placeholder="How can we help you?" /></div>
                <button onClick={() => setContactSent(true)} className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg,${C.blue},${C.indigo})` }}>{t.contactSend}</button>
              </div>
            )}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-4 text-center text-xs text-slate-500">
              {[["📧", "Email", "support@scholarhub.in"], ["📞", "Phone", "1800-XXX-XXXX"], ["⏰", "Hours", "Mon–Sat 9am–6pm"]].map(([e, l, v]) => (
                <div key={l}><div className="text-xl mb-1">{e}</div><div className="font-bold text-slate-700">{l}</div><div>{v}</div></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HELP PAGE */}
      {activeNav === "help" && (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <button onClick={() => setActiveNav("home")}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 mb-6 transition-colors">
            ← Back to Home
          </button>
          <div className="bg-white rounded-2xl border border-slate-200 p-8" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t.helpTitle}</h2>
            {[
              ["How does scholarship recommendation work?", "Set your profile with income, category, course, gender and state. The system automatically matches and sorts scholarships that fit your profile to the top."],
              ["Are my documents safe?", t.secureNote],
              ["How do I apply for a scholarship?", "Click the green 'Apply' button on any scholarship row. This opens the apply modal with step-by-step instructions and a direct link to the official portal."],
              ["What documents do I need?", "Click 'Details' on any scholarship to see the exact list of required documents."],
              ["Can I use this in Hindi or Gujarati?", "Yes! Use the EN / हिं / ગુ switcher in the top navbar."],
            ].map(([q, a], i) => (
              <div key={i} className="mb-5 pb-5 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
                <p className="font-bold text-slate-800 text-sm mb-1.5">{q}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{a as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      {(activeNav === "home" || activeNav === "scholarships") && (<>

        {/* Stat Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: "💰", label: t.studentIncome, value: savedProfile?.income ? `₹${parseInt(savedProfile.income).toLocaleString("en-IN")}` : "—", from: "#0f2044", to: "#1a3360", glow: "rgba(15,32,68,0.2)" },
              { emoji: "🎓", label: t.totalScholarships, value: String(SCHOLARSHIPS.length), from: "#1d4ed8", to: "#4f46e5", glow: "rgba(29,78,216,0.2)" },
              { emoji: "⭐", label: t.recommended, value: String(recCount), from: "#b45309", to: "#d97706", glow: "rgba(180,83,9,0.2)" },
            ].map(({ emoji, label, value, from, to, glow }) => (
              <div key={label} className="rounded-2xl p-5 flex items-center gap-4" style={{ background: `linear-gradient(135deg,${from},${to})`, boxShadow: `0 4px 20px ${glow}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>{emoji}</div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.65)" }}>{label}</p>
                  <p className="text-3xl font-bold text-white leading-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Profile Form */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3" style={{ background: "linear-gradient(to right,#f8fafc,#f1f5f9)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg,${C.blue},${C.indigo})` }}>
                <span className="text-white text-sm">👤</span>
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">{t.studentProfile}</h2>
                {session?.user?.name && (
                  <p className="text-xs text-blue-600 font-medium">Welcome, {session.user.name}!</p>
                )}
              </div>
              {savedProfile && (
                <span className="ml-auto text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  ✅ {recCount} {t.scholarshipsRecommended}
                </span>
              )}
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="lg:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.incomeField}</label>
                  <input type="number" placeholder="e.g. 250000" value={profile.income} onChange={e => setProfile({ ...profile, income: e.target.value })} className={il} />
                </div>
                {[
                  { lbl: t.categoryField, el: <select value={profile.category} onChange={e => setProfile({ ...profile, category: e.target.value })} className={sl}>{CAST_OPTIONS.map(c => <option key={c}>{c}</option>)}</select> },
                  { lbl: t.courseField, el: <select value={profile.course} onChange={e => setProfile({ ...profile, course: e.target.value })} className={sl}><option value="Any">{t.anyOpt}</option><option value="School">{t.school}</option><option value="Engineering">{t.engineering}</option><option value="Medical">{t.medical}</option><option value="Arts">{t.arts}</option><option value="Commerce">{t.commerce}</option><option value="Science">{t.science}</option></select> },
                  { lbl: t.genderField, el: <select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })} className={sl}><option value="Any">{t.genderAny}</option><option value="Male">{t.genderMale}</option><option value="Female">{t.genderFemale}</option></select> },
                  { lbl: t.stateField, el: <select value={profile.state} onChange={e => setProfile({ ...profile, state: e.target.value })} className={sl}>{STATES.map(s => <option key={s}>{s}</option>)}</select> },
                ].map(({ lbl, el }) => (
                  <div key={lbl}><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{lbl}</label>{el}</div>
                ))}
                <div className="flex flex-col gap-2 items-stretch">
                  <button onClick={() => setSavedProfile({ ...profile })}
                    className="w-full py-2 px-4 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: `linear-gradient(135deg,${C.blue},${C.indigo})`, boxShadow: "0 2px 8px rgba(29,78,216,0.3)" }}>
                    {t.updateProfile}
                  </button>
                  {savedProfile && (
                    <button onClick={() => { setSavedProfile(null); setProfile({ income: "", category: "SC", course: "Any", state: "Any", gender: "Any" }); }}
                      className="w-full py-2 px-4 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                      style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}>
                      Clear All ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <div className="grid grid-cols-5 gap-3">
              <select value={searchCategory} onChange={e => setSearchCategory(e.target.value)} className={sl}>
                {CATEGORY_OPTIONS.map(c => <option key={c}>{c === "All Categories" ? t.allCategories : c}</option>)}
              </select>
              <select value={searchCourse} onChange={e => setSearchCourse(e.target.value)} className={sl}>
                <option value="Any">{t.allCourses}</option>
                <option value="School">{t.school}</option>
                <option value="Engineering">{t.engineering}</option>
                <option value="Medical">{t.medical}</option>
                <option value="Arts">{t.arts}</option>
                <option value="Commerce">{t.commerce}</option>
                <option value="Science">{t.science}</option>
              </select>
              <select value={searchGender} onChange={e => setSearchGender(e.target.value)} className={sl}>
                <option value="Any">{t.genderField}: {t.genderAny}</option>
                <option value="Male">👨 {t.genderMale}</option>
                <option value="Female">👩 {t.genderFemale}</option>
              </select>
              <select value={searchLevel} onChange={e => setSearchLevel(e.target.value)} className={sl}>
                {LEVEL_OPTIONS.map(l => <option key={l}>{l === "All Levels" ? t.allLevels : l === "State" ? t.stateLvl : l === "Central" ? t.central : t.trust}</option>)}
              </select>
              <select value={searchState} onChange={e => setSearchState(e.target.value)} className={sl}>
                <option value="Any">{t.stateField}: {t.anyOpt}</option>
                {STATES.filter(s => s !== "Any").map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">{displayed.length} {t.showing}</span>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="py-2 px-5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: `linear-gradient(135deg,${C.blue},${C.indigo})`, boxShadow: "0 2px 8px rgba(29,78,216,0.25)" }}>
                  Clear all ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3" style={{ background: `linear-gradient(to right,${C.navy},${C.navyMid})` }}>
              <span className="text-lg">🏆</span>
              <h2 className="font-bold text-white text-base">{t.scholarships}</h2>
              <span className="ml-auto text-xs font-semibold text-white/60 bg-white/10 px-3 py-1 rounded-full">{displayed.length} {t.showing}</span>
            </div>
            <div className="overflow-x-auto">
              {scholarshipsLoading ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">⏳</div>
                  <p className="text-slate-500 text-sm">Loading scholarships...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100" style={{ background: "#f8fafc" }}>
                      <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.name}</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.level}</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.courseCol}</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.stateCol}</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.amount}</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((s, i) => {
                      const rec = isRecommended(s, savedProfile);
                      return (
                        <tr key={s._id || s.id} className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors"
                          style={{ background: i % 2 === 0 ? "#ffffff" : "#fafafa", borderLeft: rec ? "3px solid #2563eb" : "3px solid transparent" }}>
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col gap-1.5">
                              {rec && <span className="inline-flex items-center self-start text-[11px] font-bold text-white px-2.5 py-0.5 rounded-md" style={{ background: C.green }}>{t.recommended_badge}</span>}
                              <span className="font-semibold text-slate-800 text-sm leading-snug">{sName(s)}</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${catBadge(s.category)}`}>{sCategory(s)}</span>
                                {s.gender !== "Any" && (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.gender === "Female" ? "bg-pink-50 text-pink-700 ring-1 ring-pink-200" : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"}`}>
                                    {s.gender === "Female" ? "👩 " + t.genderFemale : "👨 " + t.genderMale}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${lvlBadge(s.level)}`}>{s.level === "Central" ? t.central : s.level === "State" ? t.stateLvl : t.trust}</span></td>
                          <td className="px-4 py-3.5"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${s.course === "School" ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700"}`}>{s.course === "School" ? t.school : lang === "hi" ? "कॉलेज" : lang === "gu" ? "કૉલેજ" : "College"}</span></td>
                          <td className="px-4 py-3.5 text-slate-500 text-xs">{s.state}</td>
                          <td className="px-4 py-3.5 text-emerald-700 font-bold text-xs">{sAmount(s)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex gap-2">
                              <button onClick={() => setDetailS(s)} className="text-xs font-bold px-3.5 py-1.5 rounded-lg text-white transition-all hover:opacity-90" style={{ background: C.cyan }}>{t.details}</button>
                              <button onClick={() => setApplyS(s)} className="text-xs font-bold px-3.5 py-1.5 rounded-lg text-white transition-all hover:opacity-90" style={{ background: C.green }}>{t.apply}</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {displayed.length === 0 && !scholarshipsLoading && (
                      <tr><td colSpan={6} className="text-center py-16">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-slate-500 font-medium text-sm">{t.noResults}</p>
                        {hasFilters && <button onClick={clearFilters} className="mt-3 text-sm text-blue-600 font-semibold hover:underline">Clear all filters</button>}
                        {!hasFilters && <p className="text-slate-400 text-xs mt-2">Admin se scholarships add karwao</p>}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </>)}

      {/* DETAILS MODAL */}
      {detailS && (
        <Modal onClose={() => setDetailS(null)}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `linear-gradient(135deg,${C.blue},${C.indigo})` }}>🎓</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{sName(detailS)}</h3>
              <div className="flex gap-2 flex-wrap mt-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${catBadge(detailS.category)}`}>{sCategory(detailS)}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${lvlBadge(detailS.level)}`}>{detailS.level === "Central" ? t.central : detailS.level === "State" ? t.stateLvl : t.trust}</span>
                {isRecommended(detailS, savedProfile) && <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white" style={{ background: C.green }}>{t.recommended_badge}</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[["💰 Amount", sAmount(detailS)], [`📅 ${t.lastDate}`, sLastDate(detailS)], ["📚 Course", detailS.course === "School" ? t.school : lang === "hi" ? "कॉलेज" : lang === "gu" ? "કૉલેજ" : "College"], ["🗺️ State", detailS.state]].map(([l, v]) => (
              <div key={l} className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{l}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
          {[{ title: t.description, content: detailS.description }, { title: t.eligibility, content: detailS.eligibility }, { title: t.documents, content: detailS.documents || "—" }].map(({ title, content }) => (
            <div key={title} className="mb-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">{title}</p>
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 leading-relaxed">{content}</p>
            </div>
          ))}
          <div className="flex gap-3 mt-5 flex-wrap">
            {detailS.applyLink && <a href={detailS.applyLink} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-sm font-bold text-white py-2.5 rounded-xl transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg,${C.green},${C.recGreen})` }}>{t.applyNow}</a>}
            {detailS.youtubeLink && <a href={detailS.youtubeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-white py-2.5 px-5 rounded-xl transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}>{t.howToFill}</a>}
          </div>
        </Modal>
      )}

      {/* APPLY MODAL */}
      {applyS && (
        <Modal onClose={() => setApplyS(null)}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `linear-gradient(135deg,${C.green},${C.recGreen})` }}>📋</div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{t.applyModal}</p>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{sName(applyS)}</h3>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">⏰</span>
            <div><p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">{t.lastDateLabel}</p><p className="font-bold text-red-700 text-base">{sLastDate(applyS)}</p></div>
          </div>
          {applyS.documents && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">{t.documents}</p>
              <div className="space-y-1.5">
                {applyS.documents.split(",").map((doc, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                    <span className="text-blue-500 text-xs">📄</span>
                    <span className="text-sm text-slate-600">{doc.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-3">{t.stepsTitle}</p>
            <ol className="space-y-2">
              {t.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-sm text-amber-900">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex gap-3 flex-wrap">
            {applyS.applyLink && <a href={applyS.applyLink} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-sm font-bold text-white py-2.5 rounded-xl hover:opacity-90 transition-all" style={{ background: `linear-gradient(135deg,${C.green},${C.recGreen})` }}>{t.applyOnSite}</a>}
            {applyS.youtubeLink && <a href={applyS.youtubeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-white py-2.5 px-5 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}>{t.watchVideo}</a>}
          </div>
        </Modal>
      )}

      {/* PROFILE MODAL */}
      {showProfile && (
        <Modal onClose={() => setShowProfile(false)} wide>
          <div className="-mx-6 -mt-6 px-6 pt-6 pb-5 rounded-t-2xl mb-5" style={{ background: `linear-gradient(135deg,${C.navy},${C.navyMid})` }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "rgba(255,255,255,0.12)" }}>👤</div>
              <div>
                <h3 className="text-white font-bold text-lg">{session?.user?.name || t.profileModal}</h3>
                <p className="text-white/60 text-sm">{session?.user?.email || (savedProfile ? `${savedProfile.category} · ${savedProfile.state}` : "No profile saved yet")}</p>
              </div>
              {savedProfile && <div className="ml-auto text-center bg-white/10 rounded-xl px-4 py-2"><p className="text-white/60 text-[10px] uppercase tracking-wide font-bold">Matched</p><p className="text-white font-bold text-2xl">{recCount}</p></div>}
            </div>
          </div>
          {savedProfile && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[[`💰 ${t.incomeField}`, `₹${parseInt(savedProfile.income || "0").toLocaleString("en-IN")}`], [`🏷️ ${t.categoryField}`, savedProfile.category], [`📚 ${t.courseField}`, courseLabel(savedProfile.course)], [`🗺️ ${t.stateField}`, savedProfile.state], [`👤 ${t.genderField}`, savedProfile.gender === "Male" ? t.genderMale : savedProfile.gender === "Female" ? t.genderFemale : t.genderAny]].map(([l, v]) => (
                <div key={l} className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{l}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 text-xs text-blue-700 font-medium flex items-start gap-2">
            <span>{t.secureNote}</span>
          </div>
          <div className="border-t border-slate-100 pt-5">
            <h4 className="font-bold text-slate-800 text-sm mb-1">{t.docWallet}</h4>
            <p className="text-xs text-slate-400 mb-4">{t.docWalletDesc}</p>
            <div className="flex flex-wrap gap-3 mb-4 items-end">
              <div className="flex-1 min-w-[130px]">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">{t.docName}</label>
                <input type="text" placeholder="e.g. Aadhaar Card" value={docName} onChange={e => setDocName(e.target.value)} className={il} />
              </div>
              <div className="flex-1 min-w-[130px]">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">{t.docFile}</label>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white text-slate-600 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700" />
              </div>
              <button onClick={handleDocAdd} className="text-sm font-bold text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all whitespace-nowrap" style={{ background: `linear-gradient(135deg,${C.blue},${C.indigo})` }}>
                + {t.addDocument}
              </button>
            </div>
            {docToast && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-xl px-4 py-2 mb-3">✅ {t.docAdded}</div>}
            {docs.length === 0
              ? <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">📂 {t.noDocuments}</div>
              : <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {docs.map(d => (
                  <div key={d.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{d.fileName.endsWith(".pdf") ? "📄" : "🖼️"}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{d.name}</p>
                        <p className="text-xs text-slate-400 truncate">{d.fileName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <a href={d.dataUrl} download={d.fileName} className="text-xs text-blue-600 hover:underline font-medium">↓ Download</a>
                      <button onClick={() => setDocs(prev => prev.filter(x => x.id !== d.id))} className="text-xs text-red-500 hover:text-red-700 font-medium">{t.remove}</button>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
          <button onClick={() => setShowProfile(false)} className="mt-5 w-full border border-slate-200 text-slate-500 hover:bg-slate-50 font-medium py-2.5 rounded-xl text-sm transition-colors">
            Close
          </button>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl ${wide ? "max-w-xl" : "max-w-lg"} w-full max-h-[90vh] overflow-y-auto p-6 relative`} style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-bold transition-colors">✕</button>
        {children}
      </div>
    </div>
  );
}