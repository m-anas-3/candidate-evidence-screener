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

  await supabase.auth.getClaims()

  return response
}
