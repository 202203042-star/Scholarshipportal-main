"use client"

import { use } from "react"
import { ScholarshipDetails } from "@/components/scholarship-details"

export default function ScholarshipPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <ScholarshipDetails id={id} />
}
