"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconSearch, IconUser, IconUserScan, IconX } from "@tabler/icons-react"

import { AnalysisStatusBadge } from "@/components/analysis-status-badge"
import { DeleteRecordButton } from "@/components/delete-record-button"
import { LocalDate } from "@/components/local-date"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Database } from "@/lib/supabase/database.types"

const PAGE_SIZE = 15

interface CandidateItem {
  id: string
  job_id: string
  name: string
  analysis_status: string
  created_at: string
  jobs: { title: string } | null
  screening_reports: {
    score: number | null
    recommendation: string | null
  } | null
}

function getScoreColor(score: number) {
  if (score >= 80) return "oklch(0.72 0.18 192)"
  if (score >= 60) return "oklch(0.78 0.12 155)"
  if (score >= 40) return "oklch(0.82 0.14 60)"
  return "oklch(0.70 0.20 22)"
}

export function CandidatesTable({
  candidates,
  jobs,
}: {
  candidates: CandidateItem[]
  jobs: { id: string; title: string }[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [jobFilter, setJobFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchName = c.name.toLowerCase().includes(search.toLowerCase())
      const matchJob = jobFilter === "all" || c.job_id === jobFilter
      const matchStatus =
        statusFilter === "all" || c.analysis_status === statusFilter
      return matchName && matchJob && matchStatus
    })
  }, [candidates, search, jobFilter, statusFilter])

  // Reset to page 1 whenever filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  const hasFilters =
    search !== "" || jobFilter !== "all" || statusFilter !== "all"

  function clearFilters() {
    setSearch("")
    setJobFilter("all")
    setStatusFilter("all")
    setPage(1)
  }

  function handleFilterChange(fn: () => void) {
    fn()
    setPage(1)
  }

  // Build page numbers to display
  function pageNumbers(): (number | "ellipsis")[] {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | "ellipsis")[] = [1]
    if (safePage > 3) pages.push("ellipsis")
    for (
      let i = Math.max(2, safePage - 1);
      i <= Math.min(totalPages - 1, safePage + 1);
      i++
    ) {
      pages.push(i)
    }
    if (safePage < totalPages - 2) pages.push("ellipsis")
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="space-y-4">
      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative max-w-xs flex-1">
          <IconSearch className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) =>
              handleFilterChange(() => setSearch(e.target.value))
            }
            className="h-9 border-border/50 pr-8 pl-8 text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleFilterChange(() => setSearch(""))}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <IconX className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role filter */}
          <select
            value={jobFilter}
            onChange={(e) =>
              handleFilterChange(() => setJobFilter(e.target.value))
            }
            className="h-9 rounded-lg border border-border/50 bg-background px-3 text-xs text-foreground transition-colors hover:border-primary/20 focus:ring-1 focus:ring-primary/30 focus:outline-none"
          >
            <option value="all">All Roles</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              handleFilterChange(() => setStatusFilter(e.target.value))
            }
            className="h-9 rounded-lg border border-border/50 bg-background px-3 text-xs text-foreground transition-colors hover:border-primary/20 focus:ring-1 focus:ring-primary/30 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="extracting">Extracting</option>
            <option value="ready">Ready</option>
            <option value="processing">Processing</option>
            <option value="completed">Analyzed</option>
            <option value="failed">Failed</option>
          </select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-primary"
            >
              <IconX className="mr-1 size-3" />
              Clear
            </Button>
          )}
        </div>

        {/* Results count */}
        {hasFilters && (
          <p className="ml-auto text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {candidates.length}
            </span>
          </p>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      {pageItems.length > 0 ? (
        <>
          <Card className="overflow-hidden border-border/40">
            <Table>
              <TableHeader className="border-b border-border/40 bg-muted/20">
                <TableRow>
                  <TableHead className="w-[26%] pl-5 text-xs font-semibold">
                    Candidate
                  </TableHead>
                  <TableHead className="w-[22%] text-xs font-semibold">
                    Role
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold">Score</TableHead>
                  <TableHead className="text-xs font-semibold">
                    Recommendation
                  </TableHead>
                  <TableHead className="text-xs font-semibold">Added</TableHead>
                  <TableHead className="w-[9%] pr-5 text-right text-xs font-semibold" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((c) => {
                  const report = c.screening_reports
                  const candidateHref = `/dashboard/jobs/${c.job_id}/candidates/${c.id}?from=${encodeURIComponent("/dashboard/candidates")}`
                  return (
                    <TableRow
                      key={c.id}
                      role="link"
                      tabIndex={0}
                      aria-label={`Review ${c.name}`}
                      className="group cursor-pointer transition-colors hover:bg-muted/10 focus-visible:bg-muted/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
                      onClick={(event) => {
                        if (
                          event.target instanceof Element &&
                          event.target.closest(
                            "a, button, input, select, textarea"
                          )
                        ) {
                          return
                        }
                        router.push(candidateHref)
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.target === event.currentTarget &&
                          (event.key === "Enter" || event.key === " ")
                        ) {
                          event.preventDefault()
                          router.push(candidateHref)
                        }
                      }}
                    >
                      {/* Name */}
                      <TableCell className="py-3.5 pl-5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary ring-1 ring-primary/10">
                            <IconUser className="size-3.5" />
                          </span>
                          <span className="max-w-[160px] truncate text-[13px] font-semibold text-foreground transition-colors group-hover:text-primary">
                            {c.name}
                          </span>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell className="py-3.5">
                        {c.jobs ? (
                          <Link
                            href={`/dashboard/jobs/${c.job_id}`}
                            className="block max-w-[170px] truncate text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                          >
                            {c.jobs.title}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">
                        <AnalysisStatusBadge
                          status={
                            c.analysis_status as Database["public"]["Enums"]["candidate_analysis_status"]
                          }
                        />
                      </TableCell>

                      {/* Score */}
                      <TableCell className="py-3.5">
                        {report?.score != null ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted/40">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${report.score}%`,
                                  backgroundColor: getScoreColor(report.score),
                                }}
                              />
                            </div>
                            <span className="font-mono text-xs font-semibold">
                              {report.score}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Recommendation */}
                      <TableCell className="py-3.5">
                        {report?.recommendation ? (
                          <RecBadge rec={report.recommendation} />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3.5 text-xs text-muted-foreground">
                        <LocalDate value={c.created_at} />
                      </TableCell>

                      {/* Delete action */}
                      <TableCell className="py-3.5 pr-5">
                        <div className="flex items-center justify-end">
                          <DeleteRecordButton
                            id={c.id}
                            name={c.name}
                            recordType="candidate"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>

          {/* ── Pagination ─────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-muted-foreground">
                Page {safePage} of {totalPages} ·{" "}
                <span className="font-medium text-foreground">
                  {filtered.length}
                </span>{" "}
                candidates
              </p>
              <Pagination className="w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                    />
                  </PaginationItem>

                  {pageNumbers().map((p, i) =>
                    p === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={p === safePage}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={safePage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <Card className="border-2 border-dashed border-border/40">
          <CardContent className="flex min-h-56 flex-col items-center justify-center py-12 text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/30">
              <IconUserScan className="size-5 text-muted-foreground" />
            </span>
            <h3 className="text-sm font-semibold">
              {hasFilters ? "No matching candidates" : "No candidates yet"}
            </h3>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              {hasFilters
                ? "Try adjusting your search or filters."
                : "Add candidates to a role to see them here."}
            </p>
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-4"
              >
                Reset filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function RecBadge({ rec }: { rec: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    strong_fit: {
      label: "Strong documented match",
      cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    possible_fit: {
      label: "Potential documented match",
      cls: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    weak_fit: {
      label: "Limited documented match",
      cls: "border-destructive/20 bg-destructive/10 text-destructive",
    },
  }
  const item = map[rec] ?? {
    label: rec,
    cls: "border-border bg-muted text-muted-foreground",
  }
  return (
    <Badge variant="outline" className={`text-[10px] font-normal ${item.cls}`}>
      {item.label}
    </Badge>
  )
}
