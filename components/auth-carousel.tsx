"use client"

import { useEffect, useRef, useState } from "react"
import {
  IconBrain,
  IconChevronLeft,
  IconChevronRight,
  IconFileSearch,
  IconMessageCircle,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const slides = [
  {
    icon: IconFileSearch,
    headline: "Review candidates against the work that actually matters.",
    body: "Upload a resume and proposal, then optionally add a portfolio for manual review. The agent scores only documented resume and proposal evidence against the role.",
  },
  {
    icon: IconBrain,
    headline: "A 100-point score built from documented evidence, not gut feel.",
    body: "Every score is broken into three weighted categories: requirements, relevant experience, and proposal specificity. A portfolio never adds or removes points.",
  },
  {
    icon: IconMessageCircle,
    headline: "Ask follow-up questions. Get answers anchored in the report.",
    body: "After the screening report is generated, ask follow-up questions grounded in the resume, proposal, and saved report. All output is advisory and requires recruiter review.",
  },
]

export function AuthCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 5_000)
    return () => clearInterval(id)
  }, [paused])

  useEffect(
    () => () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current)
      }
    },
    []
  )

  function go(index: number) {
    setCurrent(index)
    setPaused(true)
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current)
    }
    resumeTimeoutRef.current = setTimeout(() => setPaused(false), 10_000)
  }

  const slide = slides[current]!
  const Icon = slide.icon

  return (
    <div className="relative flex h-full flex-col justify-between">
      <div className="flex flex-1 flex-col justify-center">
        <div
          key={current}
          className="animate-in duration-500 fade-in slide-in-from-bottom-3"
        >
          <span className="mb-6 flex size-11 items-center justify-center rounded-lg border border-white/15 bg-white/8 text-primary">
            <Icon className="size-5" aria-hidden />
          </span>
          <h2 className="text-[2rem] leading-[1.18] font-semibold tracking-[-0.03em] text-white xl:text-[2.4rem]">
            {slide.headline}
          </h2>

          <p className="mt-4 max-w-md text-[15px] leading-7 text-white/75">
            {slide.body}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-300",
                i === current
                  ? "h-1.5 w-6 bg-primary"
                  : "h-1.5 w-1.5 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go((current - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
            className="flex size-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            <IconChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go((current + 1) % slides.length)}
            aria-label="Next slide"
            className="flex size-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            <IconChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
