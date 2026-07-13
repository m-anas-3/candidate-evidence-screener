"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"

import { cn } from "@/lib/utils"

const ease = [0.22, 1, 0.36, 1] as const

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease },
  },
}

export function MotionReveal({
  children,
  className,
  delay = 0,
  onLoad = false,
}: {
  children: ReactNode
  className?: string
  delay?: number
  onLoad?: boolean
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      {...(onLoad
        ? { animate: { opacity: 1, y: 0 } }
        : {
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, amount: 0.22 },
          })}
      transition={{ duration: 0.56, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

export function MotionStagger({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.07, delayChildren: 0.04 },
              },
            }
      }
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.16 }}
    >
      {children}
    </motion.div>
  )
}

export function MotionItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={reduceMotion ? undefined : itemVariants}
    >
      {children}
    </motion.div>
  )
}

export function MotionProgressBar({
  value,
  max,
  className,
}: {
  value: number
  max: number
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const scaleX = max > 0 ? value / max : 0

  return (
    <motion.div
      className={cn("h-full origin-left rounded-full bg-primary", className)}
      initial={reduceMotion ? false : { scaleX: 0 }}
      whileInView={reduceMotion ? undefined : { scaleX }}
      style={reduceMotion ? { scaleX } : undefined}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.7, delay: 0.12, ease }}
    />
  )
}

export function MotionTracePath({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <span
      aria-hidden
      className={cn("absolute overflow-hidden bg-border", className)}
    >
      <motion.span
        className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-primary"
        initial={reduceMotion ? false : { x: "-110%" }}
        animate={reduceMotion ? undefined : { x: ["-110%", "320%"] }}
        transition={{
          duration: 2.9,
          repeat: Infinity,
          repeatDelay: 1.4,
          ease: "easeInOut",
        }}
      />
    </span>
  )
}
