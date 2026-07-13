import type { Metadata } from "next"

import { LandingPage } from "@/components/landing-page"
import { createClient } from "@/lib/supabase/server"

const title = "Evidence Screener — Evidence-Backed Freelance Candidate Review"
const description =
  "Compare freelance candidate resumes and proposals against role requirements with source-linked findings, explicit evidence gaps, and recruiter-controlled review."

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Evidence Screener",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
}

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  return <LandingPage isAuthenticated={Boolean(data?.claims)} />
}
