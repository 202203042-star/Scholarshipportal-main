"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, CheckCircle2, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", agree: false });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords match nahi kar rahe"); return; }
    if (form.password.length < 6) { setError("Password kam se kam 6 characters ka hona chahiye"); return; }
    if (!form.agree) { setError("Terms & Conditions agree karo"); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration fail ho gayi"); setLoading(false); return; }

      const loginRes = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (loginRes?.error) { router.push("/login"); } else { router.push("/"); }
    } catch {
      setError("Server error. Terminal mein error dekho.");
      setLoading(false);
    }
  }

  const inputClass = "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors";
  const passMatch = form.confirmPassword && form.password === form.confirmPassword;
  const passMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{background:"linear-gradient(135deg,#1d4ed8,#4f46e5)"}}>
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ScholarHub</h1>
          <p className="text-gray-500 mt-1 text-sm">Create your scholarship account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
          <p className="text-gray-500 text-sm mb-6">Fill in your details to get started</p>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm mb-5">
              <span className="mt-0.5 flex-shrink-0">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" name="name" required value={form.name} onChange={handleChange}
                  placeholder="Aapka poora naam" className={inputClass} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="email" name="email" required value={form.email} onChange={handleChange}
                  placeholder="you@example.com" className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type={showPass ? "text" : "password"} name="password" required minLength={6}
                  value={form.password} onChange={handleChange} placeholder="Min 6 characters"
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                      form.password.length >= i*2
                        ? i<=2 ? "bg-red-400" : i===3 ? "bg-yellow-400" : "bg-green-500"
                        : "bg-gray-200"
                    }`} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1 w-12">
                    {form.password.length < 4 ? "Weak" : form.password.length < 6 ? "Fair" : form.password.length < 8 ? "Good" : "Strong"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type={showConfirm ? "text" : "password"} name="confirmPassword" required
                  value={form.confirmPassword} onChange={handleChange} placeholder="Password dobara daalo"
                  className={`w-full pl-10 pr-11 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 hover:bg-white transition-colors ${
                    passMismatch ? "border-red-300 focus:ring-red-400" :
                    passMatch ? "border-green-300 focus:ring-green-400" :
                    "border-gray-200 focus:ring-blue-500"
                  }`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passMismatch && <p className="text-red-500 text-xs mt-1">Passwords match nahi kar rahe</p>}
              {passMatch && <p className="text-green-600 text-xs mt-1 flex items-center gap-1"><CheckCircle2 size={11} /> Passwords match</p>}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange}
                className="mt-0.5 accent-blue-600 w-4 h-4 flex-shrink-0" />
              <span className="text-xs text-gray-500">
                I agree to the <span className="text-blue-600 font-medium">Terms & Conditions</span> and <span className="text-blue-600 font-medium">Privacy Policy</span>
              </span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{background:"linear-gradient(135deg,#1d4ed8,#4f46e5)"}}>
              {loading ? <><Loader2 className="animate-spin" size={16} /> Creating account...</> : "Create Account"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}