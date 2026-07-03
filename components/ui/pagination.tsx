import * as React from "react"
import { IconChevronLeft, IconChevronRight, IconDots } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  size?: "default" | "sm" | "lg" | "icon"
} & React.ComponentProps<"button">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <button
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        isActive && "border-primary/30 bg-primary/8 text-primary font-semibold",
        "h-8 w-8 cursor-pointer rounded-lg text-xs",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      aria-label="Go to previous page"
      data-slot="pagination-previous"
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "h-8 gap-1.5 px-3 text-xs cursor-pointer rounded-lg text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    >
      <IconChevronLeft className="size-3.5" />
      <span>Previous</span>
    </button>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      aria-label="Go to next page"
      data-slot="pagination-next"
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "h-8 gap-1.5 px-3 text-xs cursor-pointer rounded-lg text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    >
      <span>Next</span>
      <IconChevronRight className="size-3.5" />
    </button>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex h-8 w-8 items-center justify-center text-muted-foreground", className)}
      {...props}
    >
      <IconDots className="size-3.5" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
