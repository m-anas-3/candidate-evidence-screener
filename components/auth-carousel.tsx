"use client"

import { useEffect, useState } from "react"
import {
  IconBrain,
  IconFileSearch,
  IconMessageCircle,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const slides = [
  {
    icon: IconFileSearch,
    tag: "Evidence-first screening",
    headline: "Review candidates against the work that actually matters.",
    body: "Upload a resume, proposal, and portfolio URL. The AI agent extracts, inspects, and cross-references every piece of evidence against your job requirements — no guesswork.",
    stat: { value: "4 sources", label: "Resume · Proposal · Portfolio · Job criteria" },
  },
  {
    icon: IconBrain,
    tag: "Structured fit scoring",
    headline: "A 100-point score built from documented evidence, not gut feel.",
    body: "Every score is broken into four weighted categories: skills match, relevant experience, proposal specificity, and portfolio relevance. Each point is traceable back to a specific claim in the candidate's materials.",
    stat: { value: "0 guesses", label: "Every point backed by cited evidence" },
  },
  {
    icon: IconMessageCircle,
    tag: "Grounded AI chat",
    headline: "Ask follow-up questions. Get answers anchored in the report.",
    body: "After the screening report is generated, ask the AI anything about the candidate. It answers only from the resume, proposal, and report — never fabricates. All output is advisory.",
    stat: { value: "Human review", label: "Required before any hiring decision" },
  },
]

export function AuthCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 5_000)
    return () => clearInterval(id)
  }, [paused])

  function go(index: number) {
    setCurrent(index)
    setPaused(true)
    // Resume auto-rotation after 10 s of manual interaction
    setTimeout(() => setPaused(false), 10_000)
  }

  const slide = slides[current]!
  const Icon = slide.icon

  return (
    <div className="relative flex flex-col justify-between h-full">
      {/* Slide content */}
      <div className="flex-1 flex flex-col justify-center">
        <div
          key={current}
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-6"
        >
          {/* Tag chip */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5">
            <Icon className="size-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">{slide.tag}</span>
          </div>

          {/* Headline */}
          <h2 className="text-[2rem] font-semibold leading-[1.18] tracking-[-0.03em] text-white xl:text-[2.4rem]">
            {slide.headline}
          </h2>

          {/* Body */}
          <p className="text-[15px] leading-7 text-white/50 max-w-md">
            {slide.body}
          </p>

          {/* Stat pill */}
          <div className="inline-flex flex-col gap-0.5 rounded-xl border border-white/8 bg-white/5 px-4 py-3">
            <span className="text-lg font-bold text-white">{slide.stat.value}</span>
            <span className="text-[11px] text-white/40">{slide.stat.label}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        {/* Dot indicators */}
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
                  ? "w-6 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>

        {/* Arrow controls */}
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => go((current - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
            className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white"
          >
            <IconChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go((current + 1) % slides.length)}
            aria-label="Next slide"
            className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white"
          >
            <IconChevronRight className="size-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/8">
          {!paused && (
            <div
              key={`progress-${current}`}
              className="h-full bg-primary/60 animate-[progress_5s_linear_forwards]"
              style={{ width: "0%" }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
