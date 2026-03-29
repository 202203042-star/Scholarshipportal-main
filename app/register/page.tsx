"use client"

import Link from "next/link"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { GraduationCap, Eye, EyeOff, ShieldCheck } from "lucide-react"

export default function RegisterPage() {
  const { t } = useLanguage()

  const [form, setForm] = useState({
    name: "",
    email: "",
    aadhar: "",
    password: "",
    confirmPassword: "",
    role: "student",
    agree: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm({
      ...form,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleVerifyAadhar = () => {
    if (form.aadhar.length === 12) {
      setVerified(true)
    } else {
      setVerified(false)
      alert("Enter valid 12-digit Aadhaar number")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!verified) {
      setError("Please verify Aadhaar before registering")
      return
    }

    if (!form.agree) {
      setError("You must agree to the terms")
      return
    }

    setError("")
    console.log(form)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-sm p-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-6 justify-center">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-semibold text-foreground">
            ScholarHub
          </span>
        </Link>

        <h1 className="text-2xl font-bold text-foreground text-center">
          Create Account
        </h1>

        <p className="text-sm text-muted-foreground text-center mb-6">
          Register and verify your identity securely.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-500 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
          />

          {/* Aadhaar Field */}
          <div>
            <input
              type="text"
              name="aadhar"
              placeholder="Enter 12-digit Aadhaar Number"
              maxLength={12}
              value={form.aadhar}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
            />

            <button
              type="button"
              onClick={handleVerifyAadhar}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-xl font-medium hover:opacity-90 transition"
            >
              <ShieldCheck size={18} />
              Verify Aadhaar
            </button>

            {verified && (
              <p className="text-green-600 text-sm mt-2 text-center">
                Aadhaar Verified ✔
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-10 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-10 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Terms */}
          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              className="accent-primary"
            />
            I agree to the Terms & Conditions
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-xl font-medium hover:opacity-90 transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  )
}