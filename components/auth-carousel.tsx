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
    headline: "Review candidates against the work that actually matters.",
    body: "Upload a resume and proposal, then optionally add a portfolio for manual review. The agent scores only documented resume and proposal evidence against the role."
  },
  {
    icon: IconBrain,
    headline: "A 100-point score built from documented evidence, not gut feel.",
    body: "Every score is broken into three weighted categories: requirements, relevant experience, and proposal specificity. A portfolio never adds or removes points."
  },
  {
    icon: IconMessageCircle,
    headline: "Ask follow-up questions. Get answers anchored in the report.",
    body: "After the screening report is generated, ask the AI anything about the candidate. It answers only from the resume, proposal, and report — never fabricates. All output is advisory."
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
    <div className="relative flex h-full flex-col justify-between">
      {/* Slide content */}
      <div className="flex flex-1 flex-col justify-center">
        <div
          key={current}
          className="animate-in duration-500 fade-in slide-in-from-bottom-3"
        >

          {/* Headline */}
          <h2 className="text-[2rem] leading-[1.18] font-semibold tracking-[-0.03em] text-white xl:text-[2.4rem]">
            {slide.headline}
          </h2>

          {/* Body */}
          <p className="max-w-md text-[15px] leading-7 text-white/75">
            {slide.body}
          </p>

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
                  ? "h-1.5 w-6 bg-primary"
                  : "h-1.5 w-1.5 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
