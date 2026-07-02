"use client"

import { useState } from "react"
import Link from "next/link"
import { IconFilter, IconSearch, IconUser, IconUserScan, IconX } from "@tabler/icons-react"

import { AnalysisStatusBadge } from "@/components/analysis-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CandidateItem {
  id: string
  job_id: string
  name: string
  analysis_status: string
  created_at: string
  jobs: { title: string } | null
  screening_reports: { score: number | null; recommendation: string | null } | null
}

interface CandidatesTableProps {
  candidates: CandidateItem[]
  jobs: { id: string; title: string }[]
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return "oklch(0.72 0.18 192)"
  if (score >= 60) return "oklch(0.78 0.12 155)"
  if (score >= 40) return "oklch(0.82 0.14 60)"
  return "oklch(0.70 0.20 22)"
}

export function CandidatesTable({ candidates, jobs }: CandidatesTableProps) {
  const [search, setSearch] = useState("")
  const [selectedJob, setSelectedJob] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = candidate.name.toLowerCase().includes(search.toLowerCase())
    const matchesJob = selectedJob === "all" || candidate.job_id === selectedJob
    const matchesStatus = selectedStatus === "all" || candidate.analysis_status === selectedStatus
    return matchesSearch && matchesJob && matchesStatus
  })

  const hasActiveFilters = search || selectedJob !== "all" || selectedStatus !== "all"

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card/50 p-4 rounded-xl border border-border/40 backdrop-blur-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 h-9 border-border/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconX className="size-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <IconFilter className="size-3.5" />
            <span className="hidden sm:inline">Filters:</span>
          </div>

          {/* Job Filter */}
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border/50 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors hover:border-primary/20"
          >
            <option value="all">All Roles</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border/50 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors hover:border-primary/20"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="extracting">Extracting</option>
            <option value="ready">Ready</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          {/* Reset */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setSelectedJob("all")
                setSelectedStatus("all")
              }}
              className="h-9 text-xs px-2.5 text-muted-foreground hover:text-primary"
            >
              <IconX className="size-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-xs text-muted-foreground px-1">
          Showing <span className="font-semibold text-foreground">{filteredCandidates.length}</span> of{" "}
          <span className="font-semibold text-foreground">{candidates.length}</span> candidates
        </p>
      )}

      {/* Table */}
      {filteredCandidates.length > 0 ? (
        <Card className="border-border/40 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/20 border-b border-border/40">
              <TableRow>
                <TableHead className="w-[28%] pl-6 font-semibold text-xs">Candidate</TableHead>
                <TableHead className="w-[22%] font-semibold text-xs">Role</TableHead>
                <TableHead className="font-semibold text-xs">Status</TableHead>
                <TableHead className="font-semibold text-xs">Score</TableHead>
                <TableHead className="font-semibold text-xs">Recommendation</TableHead>
                <TableHead className="font-semibold text-xs">Date</TableHead>
                <TableHead className="w-[10%] text-right pr-6 font-semibold text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => {
                const report = candidate.screening_reports
                const hasReport = report !== null

                return (
                  <TableRow key={candidate.id} className="group hover:bg-muted/10 transition-colors">
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 items-center justify-center rounded-full bg-primary/8 text-primary ring-1 ring-primary/10">
                          <IconUser className="size-3.5" />
                        </span>
                        <span className="text-foreground text-sm font-semibold truncate max-w-[180px] group-hover:text-primary transition-colors">
                          {candidate.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {candidate.jobs ? (
                        <Link
                          href={`/dashboard/jobs/${candidate.job_id}`}
                          className="text-xs text-muted-foreground hover:text-primary font-medium truncate block max-w-[200px] transition-colors"
                        >
                          {candidate.jobs.title}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unavailable</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <AnalysisStatusBadge status={candidate.analysis_status as any} />
                    </TableCell>
                    <TableCell>
                      {hasReport && report.score !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-14 rounded-full bg-muted/40 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${report.score}%`,
                                backgroundColor: getScoreBarColor(report.score),
                              }}
                            />
                          </div>
                          <span className="font-mono text-xs font-semibold">{report.score}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {hasReport && report.recommendation ? (
                        <RecommendationBadge rec={report.recommendation} />
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(candidate.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-border/50 hover:border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                      >
                        <Link
                          href={`/dashboard/jobs/${candidate.job_id}/candidates/${candidate.id}`}
                        >
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-border/40">
          <CardContent className="flex min-h-56 flex-col items-center justify-center py-10 text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground ring-1 ring-border/30">
              <IconUserScan className="size-5" />
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              {hasActiveFilters ? "No matching candidates" : "No candidates yet"}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground/80 leading-relaxed">
              {hasActiveFilters
                ? "No candidates found matching your search and filter criteria. Try adjusting your filters."
                : "Candidates will appear here after you add them to a job role. Start by creating a role and uploading candidate evidence."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearch("")
                  setSelectedJob("all")
                  setSelectedStatus("all")
                }}
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

function RecommendationBadge({ rec }: { rec: string }) {
  const config: Record<string, { label: string; className: string }> = {
    strong_fit: {
      label: "Strong Fit",
      className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    possible_fit: {
      label: "Possible Fit",
      className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    },
    weak_fit: {
      label: "Weak Fit",
      className: "border-destructive/20 bg-destructive/10 text-destructive",
    },
  }
  const item = config[rec] || { label: rec, className: "border-border bg-muted text-muted-foreground" }
  return (
    <Badge variant="outline" className={`text-2xs font-normal ${item.className}`}>
      {item.label}
    </Badge>
  )
}
