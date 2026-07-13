"use client"

import type { ComponentProps } from "react"
import { useRouter } from "next/navigation"

import { TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type ClickableTableRowProps = ComponentProps<typeof TableRow> & {
  href: string
  navigationLabel: string
}

export function ClickableTableRow({
  href,
  navigationLabel,
  className,
  children,
  ...props
}: ClickableTableRowProps) {
  const router = useRouter()

  return (
    <TableRow
      {...props}
      role="link"
      tabIndex={0}
      aria-label={navigationLabel}
      className={cn(
        "cursor-pointer transition-colors focus-visible:bg-muted/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
        className
      )}
      onClick={(event) => {
        if (
          event.target instanceof Element &&
          event.target.closest("a, button, input, select, textarea")
        ) {
          return
        }
        router.push(href)
      }}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault()
          router.push(href)
        }
      }}
    >
      {children}
    </TableRow>
  )
}
