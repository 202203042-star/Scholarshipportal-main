"use client"

import { useLanguage } from "@/lib/language-context"
import { useRouter } from "next/navigation"
import { GraduationCap } from "lucide-react"
import type { Language } from "@/lib/translations"

const languageOptions: { code: Language; native: string; flag: string }[] = [
  { code: "en", native: "English", flag: "A" },
  { code: "hi", native: "\u0939\u093F\u0928\u094D\u0926\u0940", flag: "\u0905" },
  { code: "gu", native: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0", flag: "\u0A85" },
]

export function LanguageSelection() {
  const { setLang } = useLanguage()
  const router = useRouter()

  function handleSelect(code: Language) {
    setLang(code)
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-balance text-2xl font-bold text-foreground">
            Choose Your Language
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">
            Select a language to continue to the Scholarship Portal
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {languageOptions.map((option) => (
            <button
              key={option.code}
              onClick={() => handleSelect(option.code)}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-lg font-bold text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {option.flag}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold text-foreground">{option.native}</span>
                <span className="text-xs text-muted-foreground">
                  {option.code === "en" ? "English" : option.code === "hi" ? "Hindi" : "Gujarati"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
