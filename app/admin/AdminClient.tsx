"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Scholarship {
  _id: string;
  title: string;
  amount: number;
  deadline: string;
  isActive: boolean;
  category: string[];
  applicants: string[];
}

const EMPTY_FORM = {
  title: "", description: "", amount: "", eligibility: "",
  deadline: "", applyLink: "", youtubeLink: "", category: "",
  level: "Central", course: "College", state: "Any", gender: "Any",
  income: "999999999", documents: "",
};

const ALL_CATEGORIES = ["Any", "General", "OBC", "SC", "ST", "Minority", "EWS", "Girls"];

export default function AdminClient() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const loadScholarships = () => {
    setLoading(true);
    setError("");
    fetch("/api/scholarships")
      .then(r => r.json())
      .then(d => { setScholarships(d.scholarships || []); setLoading(false); })
      .catch(() => { setError("Scholarships load nahi hui"); setLoading(false); });
  };

  useEffect(() => { loadScholarships(); }, []);

  function toggleCategoryFilter(cat: string) {
    if (cat === "Any") { setSelectedCategories([]); return; }
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

 async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      description: form.description,
      amount: Number(form.amount),
      income: Number(form.income),
      eligibility: form.eligibility,
      category: form.category.split(",").map(c => c.trim()).filter(Boolean),
      deadline: new Date(form.deadline).toISOString(),
      applyLink: form.applyLink,
      youtubeLink: form.youtubeLink,
      level: form.level,
      course: form.course,
      state: form.state,
      gender: form.gender,
      documents: form.documents,
    };
    const url = editingId ? `/api/scholarships/${editingId}` : "/api/scholarships";
    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowForm(false);
        loadScholarships();
      } else {
        setError(data.error || "Save nahi hua. Dobara try karo.");
      }
    } catch {
      setSaving(false);
      setError("Network error — save nahi hua");
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" permanently delete karna chahte ho?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/scholarships/${id}`, { method: "DELETE" });
      if (res.ok) {
        setScholarships(prev => prev.filter(s => s._id !== id));
      } else {
        setError("Delete nahi hua. Dobara try karo.");
      }
    } catch {
      setError("Network error");
    }
    setDeletingId(null);
  }

  async function handleToggleActive(s: Scholarship) {
    setTogglingId(s._id);
    try {
      const res = await fetch(`/api/scholarships/${s._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      if (res.ok) {
        setScholarships(prev =>
          prev.map(sc => sc._id === s._id ? { ...sc, isActive: !sc.isActive } : sc)
        );
      } else {
        const data = await res.json();
        setError(data.error || "Toggle nahi hua");
      }
    } catch {
      setError("Network error");
    }
    setTogglingId(null);
  }

  function handleEdit(s: any) {
    setForm({
      title: s.title || "",
      description: s.description || "",
      amount: s.amount?.toString() || "",
      eligibility: s.eligibility || "",
      deadline: s.deadline ? new Date(s.deadline).toISOString().split("T")[0] : "",
      applyLink: s.applyLink || "",
      youtubeLink: s.youtubeLink || "",
      category: Array.isArray(s.category) ? s.category.join(", ") : s.category || "",
      level: s.level || "Central",
      course: s.course || "College",
      state: s.state || "Any",
      gender: s.gender || "Any",
      income: s.income?.toString() || "999999999",
      documents: s.documents || "",
    });
    setEditingId(s._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filtered = scholarships.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategories.length === 0 ||
      selectedCategories.some(c => s.category?.includes(c));
    return matchSearch && matchCat;
  });

  const active = scholarships.filter(s => s.isActive).length;

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "10px",
    padding: "10px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>

      {/* Navbar */}
      <nav style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "0 32px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 12px rgba(102,126,234,0.4)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"
          }}>🎓</div>
          <div>
            <p style={{ color: "white", fontWeight: 700, fontSize: "16px", margin: 0 }}>ScholarHub</p>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px", margin: 0 }}>Admin Panel</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={loadScholarships} style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            color: "white", padding: "8px 16px", borderRadius: "8px",
            fontSize: "13px", cursor: "pointer"
          }}>Refresh</button>
          <Link href="/login" style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)",
            color: "white", padding: "8px 16px", borderRadius: "8px",
            fontSize: "13px", textDecoration: "none", display: "flex", alignItems: "center"
          }}>Logout</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
          {[
            { label: "Total Scholarships", value: scholarships.length, gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
            { label: "Active", value: active, gradient: "linear-gradient(135deg, #11998e, #38ef7d)" },
            { label: "Inactive", value: scholarships.length - active, gradient: "linear-gradient(135deg, #f093fb, #f5576c)" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "white", borderRadius: "16px", padding: "24px",
              display: "flex", alignItems: "center", gap: "16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)"
            }}>
              <div style={{
                background: stat.gradient, borderRadius: "14px",
                width: "56px", height: "56px",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: "20px" }}>{stat.value}</span>
              </div>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0, fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
            borderRadius: "10px", padding: "12px 16px", fontSize: "14px", marginBottom: "20px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            {error}
            <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "16px" }}>×</button>
          </div>
        )}

        {/* Form Card */}
        <div style={{
          background: "white", borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.06)", marginBottom: "28px", overflow: "hidden"
        }}>
          <div style={{
            padding: "20px 28px",
            background: editingId ? "#fff5f5" : "#f5f3ff",
            borderBottom: showForm ? "1px solid #f0f0f0" : "none",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>
              {editingId ? "Edit Scholarship" : "Add New Scholarship"}
            </h3>
            <button
              onClick={() => { setShowForm(!showForm); if (showForm) { setEditingId(null); setForm(EMPTY_FORM); } }}
              style={{
                background: showForm ? "#f1f5f9" : "linear-gradient(135deg, #667eea, #764ba2)",
                color: showForm ? "#64748b" : "white", border: "none",
                borderRadius: "8px", padding: "8px 18px",
                fontSize: "13px", cursor: "pointer", fontWeight: 600
              }}>
              {showForm ? "Close" : "+ Add Scholarship"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Scholarship Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. PM Scholarship 2025" style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Scholarship Amount (₹) *</label>
                  <input required type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="e.g. 50000" style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Deadline *</label>
                  <input required type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={inputStyle} />
                </div>

                {/* Category chips */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                    Category * <span style={{ color: "#94a3b8", fontWeight: 400 }}>(multiple select kar sakte ho)</span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {["General", "OBC", "SC", "ST", "Minority", "EWS", "Girls"].map(cat => {
                      const selected = form.category.split(",").map(c => c.trim()).includes(cat);
                      return (
                        <button key={cat} type="button"
                          onClick={() => {
                            const current = form.category.split(",").map(c => c.trim()).filter(Boolean);
                            const updated = selected ? current.filter(c => c !== cat) : [...current, cat];
                            setForm({ ...form, category: updated.join(", ") });
                          }}
                          style={{
                            padding: "6px 16px", borderRadius: "20px", fontSize: "13px",
                            fontWeight: 600, cursor: "pointer", border: "1.5px solid",
                            borderColor: selected ? "#667eea" : "#e2e8f0",
                            background: selected ? "linear-gradient(135deg, #667eea, #764ba2)" : "white",
                            color: selected ? "white" : "#64748b", transition: "all 0.15s"
                          }}>
                          {selected ? "✓ " : ""}{cat}
                        </button>
                      );
                    })}
                  </div>
                  {form.category && (
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", margin: "6px 0 0" }}>
                      Selected: {form.category}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Max Family Income (₹/year)</label>
                  <input type="number" value={form.income} onChange={e => setForm({ ...form, income: e.target.value })}
                    placeholder="e.g. 250000" style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Level</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} style={{ ...inputStyle, background: "white" }}>
                    {["Central", "State", "Private", "NGO"].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Course</label>
                  <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} style={{ ...inputStyle, background: "white" }}>
                    {["College", "School", "Both"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={{ ...inputStyle, background: "white" }}>
                    {["Any", "Male", "Female"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>State</label>
                  <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Apply Link</label>
                  <input type="url" value={form.applyLink} onChange={e => setForm({ ...form, applyLink: e.target.value })}
                    placeholder="https://..." style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>YouTube Link</label>
                  <input value={form.youtubeLink} onChange={e => setForm({ ...form, youtubeLink: e.target.value })}
                    placeholder="https://youtube.com/..." style={inputStyle} />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Eligibility *</label>
                  <input required value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })}
                    placeholder="e.g. 12th pass, family income under 2.5 lakh" style={inputStyle} />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Description *</label>
                  <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    style={{ ...inputStyle, resize: "vertical" }} />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Documents Required</label>
                  <textarea rows={2} value={form.documents} onChange={e => setForm({ ...form, documents: e.target.value })}
                    placeholder="e.g. Aadhar Card, Income Certificate"
                    style={{ ...inputStyle, resize: "vertical" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #f0f0f0" }}>
                <button type="submit" disabled={saving} style={{
                  background: saving ? "#94a3b8" : "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "white", border: "none", borderRadius: "10px",
                  padding: "12px 28px", fontSize: "14px", fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: saving ? "none" : "0 4px 12px rgba(102,126,234,0.4)"
                }}>
                  {saving ? "Saving..." : editingId ? "Update" : "Add Scholarship"}
                </button>
                {editingId && (
                  <button type="button"
                    onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(false); }}
                    style={{
                      background: "white", color: "#64748b",
                      border: "1.5px solid #e2e8f0", borderRadius: "10px",
                      padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer"
                    }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Scholarship List */}
        <div style={{
          background: "white", borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden"
        }}>
          {/* List Header */}
          <div style={{
            padding: "20px 28px", borderBottom: "1px solid #f0f0f0",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "12px"
          }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>
              Total Scholarships
              <span style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white", borderRadius: "20px",
                padding: "2px 12px", fontSize: "13px", marginLeft: "10px"
              }}>{filtered.length}</span>
            </h3>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search scholarship..."
                style={{
                  border: "1.5px solid #e2e8f0", borderRadius: "10px",
                  padding: "9px 14px", fontSize: "13px", outline: "none", width: "200px"
                }} />
              <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "white", border: "none", borderRadius: "10px",
                  padding: "9px 18px", fontSize: "13px", fontWeight: 600,
                  cursor: "pointer", boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
                }}>
                + Add Scholarship
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div style={{
            padding: "14px 28px", borderBottom: "1px solid #f8f8f8",
            display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center"
          }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b", marginRight: "4px" }}>Filter:</span>
            {ALL_CATEGORIES.map(cat => {
              const isSelected = cat === "Any" ? selectedCategories.length === 0 : selectedCategories.includes(cat);
              return (
                <button key={cat} onClick={() => toggleCategoryFilter(cat)}
                  style={{
                    padding: "5px 14px", borderRadius: "20px", fontSize: "12px",
                    fontWeight: 600, cursor: "pointer", border: "1.5px solid",
                    borderColor: isSelected ? "#667eea" : "#e2e8f0",
                    background: isSelected ? "linear-gradient(135deg, #667eea, #764ba2)" : "white",
                    color: isSelected ? "white" : "#64748b", transition: "all 0.15s"
                  }}>
                  {cat}
                </button>
              );
            })}
          </div>

          {/* List Body */}
          <div style={{ padding: "16px 28px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                <p style={{ margin: 0 }}>Loading...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎓</div>
                <p style={{ color: "#64748b", margin: "0 0 16px" }}>Koi scholarship nahi mili</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filtered.map(s => (
                  <div key={s._id} style={{
                    border: "1.5px solid #f0f4ff", borderRadius: "12px",
                    padding: "16px 20px", display: "flex",
                    alignItems: "center", justifyContent: "space-between",
                    background: s.isActive ? "#fafbff" : "#fafafa"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#667eea")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#f0f4ff")}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: "#1a1a2e", margin: "0 0 4px", fontSize: "15px" }}>
                        {s.title}
                      </p>
                      <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                        ₹{s.amount.toLocaleString("en-IN")} &nbsp;·&nbsp;
                        {Array.isArray(s.category) ? s.category.join(", ") : s.category} &nbsp;·&nbsp;
                        {s.applicants?.length || 0} applicants &nbsp;·&nbsp;
                        {new Date(s.deadline).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "16px", flexShrink: 0 }}>

                      {/* Active/Inactive Toggle */}
                      <button
                        onClick={() => handleToggleActive(s)}
                        disabled={togglingId === s._id}
                        title={s.isActive ? "Inactive karo" : "Active karo"}
                        style={{
                          padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                          cursor: togglingId === s._id ? "not-allowed" : "pointer",
                          border: "1.5px solid",
                          borderColor: s.isActive ? "#bbf7d0" : "#fecaca",
                          background: s.isActive ? "#f0fdf4" : "#fef2f2",
                          color: s.isActive ? "#16a34a" : "#dc2626",
                          opacity: togglingId === s._id ? 0.5 : 1,
                          transition: "all 0.15s"
                        }}>
                        {togglingId === s._id ? "..." : s.isActive ? "Active" : "Inactive"}
                      </button>

                      <button onClick={() => handleEdit(s)} style={{
                        background: "#eff6ff", color: "#2563eb", border: "none",
                        borderRadius: "8px", padding: "6px 14px",
                        fontSize: "12px", fontWeight: 600, cursor: "pointer"
                      }}>
                        Edit
                      </button>

                      <button onClick={() => handleDelete(s._id, s.title)}
                        disabled={deletingId === s._id}
                        style={{
                          background: "#fef2f2", color: "#dc2626", border: "none",
                          borderRadius: "8px", padding: "6px 14px",
                          fontSize: "12px", fontWeight: 600,
                          cursor: deletingId === s._id ? "not-allowed" : "pointer",
                          opacity: deletingId === s._id ? 0.5 : 1
                        }}>
                        {deletingId === s._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}