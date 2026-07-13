import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"

import "./globals.css"
import { QueryProvider } from "@/components/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: {
    default: "Freelance Candidate Evidence Screener",
    template: "%s | Candidate Evidence Screener",
  },
  description:
    "Evidence-backed screening for freelance candidate resumes and proposals.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans antialiased">
      <body>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
          <Toaster closeButton position="top-right" richColors />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
