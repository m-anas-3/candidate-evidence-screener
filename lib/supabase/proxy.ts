import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import type { Database } from "@/lib/supabase/database.types"
import { getSupabaseConfig } from "@/lib/supabase/env"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { publishableKey, url } = getSupabaseConfig()

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options)
        })

        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value)
        })
      },
    },
  })

  const { data } = await supabase.auth.getClaims()

  if (!data?.claims && isProtectedPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.search = ""

    const redirectResponse = NextResponse.redirect(loginUrl)

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie)
    })

    for (const header of ["cache-control", "expires", "pragma"]) {
      const value = response.headers.get(header)

      if (value) {
        redirectResponse.headers.set(header, value)
      }
    }

    return redirectResponse
  }

  return response
}

function isProtectedPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/")
}
