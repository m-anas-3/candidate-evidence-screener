"use client"

import Link from "next/link"
import { useState } from "react"
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion"
import { IconArrowRight, IconMenu2, IconShieldCheck } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#safeguards", label: "Safeguards" },
  { href: "/case-study", label: "Case study" },
  { href: "#faq", label: "FAQ" },
] as const

export function LandingHeader({
  isAuthenticated,
  primaryHref,
  primaryLabel,
  linkPrefix = "",
}: {
  isAuthenticated: boolean
  primaryHref: string
  primaryLabel: string
  linkPrefix?: "" | "/"
}) {
  const { scrollY } = useScroll()
  const reduceMotion = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    const shouldFloat = latest > 28
    setScrolled((current) => (current === shouldFloat ? current : shouldFloat))
  })

  return (
    <header className="pointer-events-none sticky top-0 z-50 h-[4.75rem]">
      <motion.div
        initial={false}
        animate={{
          scale: reduceMotion ? 1 : scrolled ? 0.985 : 1,
          y: scrolled ? 10 : 0,
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 28, mass: 0.7 }
        }
        className={cn(
          "pointer-events-auto mx-auto w-full border transition-[max-width,border-color,border-radius,background-color,box-shadow] ease-out motion-safe:duration-500 motion-reduce:duration-0",
          scrolled
            ? "max-w-[calc(100%-1rem)] rounded-xl border-foreground/15 bg-background/82 shadow-[0_14px_36px_color-mix(in_srgb,var(--ink)_12%,transparent)] backdrop-blur-sm supports-[backdrop-filter]:bg-background/76 sm:max-w-[calc(100%-2rem)] xl:max-w-[74rem]"
            : "max-w-full rounded-none border-x-0 border-t-0 border-border/80 bg-background/96"
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-[90rem] items-center justify-between gap-5 transition-[height,padding] ease-out motion-safe:duration-500 motion-reduce:duration-0",
            scrolled ? "h-14 px-4 sm:px-6" : "h-[4.5rem] px-5 sm:px-8 lg:px-12"
          )}
        >
          <HeaderBrand compact={scrolled} />

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-7 lg:flex"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={
                  item.href.startsWith("#")
                    ? `${linkPrefix}${item.href}`
                    : item.href
                }
                className="text-[0.8125rem] font-medium text-foreground/68 transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 sm:flex">
            {!isAuthenticated && (
              <Link
                href="/login"
                className="text-[0.8125rem] font-medium transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
              >
                Sign in
              </Link>
            )}
            <Button
              asChild
              className={cn(
                "border-foreground/10 text-[0.8125rem] shadow-none transition-[height,padding]",
                scrolled ? "h-9 px-4" : "h-10 px-5"
              )}
            >
              <Link href={primaryHref}>
                {primaryLabel}
                <IconArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
          </div>

          <details className="landing-menu relative sm:hidden">
            <summary
              className={cn(
                "flex list-none items-center justify-center rounded-full border bg-background/70 text-foreground transition-[width,height,background-color] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                scrolled ? "size-9" : "size-10"
              )}
            >
              <span className="sr-only">Open navigation</span>
              <IconMenu2 className="size-[1.125rem]" />
            </summary>
            <nav
              aria-label="Mobile navigation"
              className="absolute top-12 right-0 w-[17rem] rounded-lg border bg-popover/96 p-2 text-popover-foreground shadow-[0_18px_42px_color-mix(in_srgb,var(--ink)_14%,transparent)] backdrop-blur-sm"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={
                    item.href.startsWith("#")
                      ? `${linkPrefix}${item.href}`
                      : item.href
                  }
                  className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 border-t pt-2">
                {!isAuthenticated && (
                  <Link
                    href="/login"
                    className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    Sign in
                  </Link>
                )}
                <Link
                  href={primaryHref}
                  className="mt-1 flex items-center justify-between rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {primaryLabel}
                  <IconArrowRight className="size-4" />
                </Link>
              </div>
            </nav>
          </details>
        </div>
      </motion.div>
    </header>
  )
}

function HeaderBrand({ compact }: { compact: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Evidence Screener home"
      className="inline-flex items-center gap-3 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center border border-foreground bg-foreground text-background transition-[width,height] duration-500",
          "motion-reduce:duration-0",
          compact ? "size-7" : "size-8"
        )}
      >
        <IconShieldCheck className="size-4" />
      </span>
      <span>
        <span className="block text-[0.8125rem] leading-none font-semibold tracking-[-0.02em]">
          Evidence Screener
        </span>
        <span
          className={cn(
            "mt-1 block overflow-hidden text-[0.5rem] leading-none font-semibold tracking-[0.14em] text-primary uppercase transition-[max-height,opacity] duration-300",
            compact ? "max-h-0 opacity-0" : "max-h-3 opacity-100"
          )}
        >
          Candidate evidence review
        </span>
      </span>
    </Link>
  )
}
