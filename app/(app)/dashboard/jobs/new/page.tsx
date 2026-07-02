import type { Metadata } from "next"
import Link from "next/link"
import { IconBriefcase } from "@tabler/icons-react"

import { JobForm } from "@/components/job-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = { title: "Create Open Role" }

export default async function NewJobPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Breadcrumb navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/jobs">Roles</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Role</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create a new role
        </h1>
        <p className="text-sm text-muted-foreground">
          Define the requirements and must-have skills to guide the candidate evidence screening.
        </p>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconBriefcase className="size-4.5" />
            </span>
            <div>
              <CardTitle className="text-base font-semibold">Role Criteria</CardTitle>
              <CardDescription className="text-xs">
                Anchors portfolio inspection and resume analysis with hard evidence requirements.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <JobForm />
        </CardContent>
      </Card>
    </div>
  )
}
