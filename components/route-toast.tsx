"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

export function RouteToast({
  id,
  message,
  variant = "success",
}: {
  id: string
  message: string
  variant?: "error" | "success"
}) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    toast[variant](message, { id })
    router.replace(pathname, { scroll: false })
  }, [id, message, pathname, router, variant])

  return null
}
