"use client"

import Link from "next/link"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { GraduationCap, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const { t } = useLanguage()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ email, password, remember })
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

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground text-center">
          {t("login") || "Login"}
        </h1>

        <p className="text-sm text-muted-foreground text-center mb-6">
          Welcome back! Please enter your details.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              {t("email") || "Email"}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              {t("password") || "Password"}
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="accent-primary"
              />
              Remember me
            </label>

            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-xl font-medium hover:opacity-90 transition"
          >
            {t("login") || "Login"}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-sm text-center mt-6 text-muted-foreground">
          Don’t have an account?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  )
}