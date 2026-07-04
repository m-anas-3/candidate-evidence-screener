import "server-only"

import { resolve4, resolve6 } from "node:dns/promises"
import { request as httpRequest } from "node:http"
import { request as httpsRequest } from "node:https"
import { isIP } from "node:net"

import { isPrivateOrReservedAddress } from "./portfolio-security"

const MAX_REDIRECTS = 4
const MAX_RESPONSE_BYTES = 512_000
const REQUEST_TIMEOUT_MS = 8_000
const ALLOWED_CONTENT_TYPES = new Set([
  "text/html",
  "text/plain",
  "application/xhtml+xml",
])

type ResolvedAddress = {
  address: string
  family: 4 | 6
}

export class PortfolioInspectionError extends Error {
  constructor(
    message: string,
    readonly code: "unsafe" | "unavailable"
  ) {
    super(message)
    this.name = "PortfolioInspectionError"
  }
}

type InspectedPortfolio = {
  contentType: string
  finalUrl: string
  text: string
  title: string | null
}

async function validateAndResolve(rawUrl: string) {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new PortfolioInspectionError("Portfolio URL is invalid.", "unsafe")
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !["80", "443"].includes(url.port)) ||
    url.hostname === "localhost" ||
    url.hostname.endsWith(".localhost") ||
    url.hostname.endsWith(".local")
  ) {
    throw new PortfolioInspectionError("Portfolio URL is not public.", "unsafe")
  }

  const literalFamily = isIP(url.hostname)
  let addresses: ResolvedAddress[]

  if (literalFamily === 4 || literalFamily === 6) {
    addresses = [{ address: url.hostname, family: literalFamily }]
  } else {
    // Resolve both families independently. A host remains usable when it only
    // publishes A or AAAA records, while the request is still pinned to an
    // address that passed the SSRF checks below.
    const [ipv4Result, ipv6Result] = await Promise.allSettled([
      resolve4(url.hostname),
      resolve6(url.hostname),
    ])
    addresses = [
      ...(ipv4Result.status === "fulfilled"
        ? ipv4Result.value.map((address) => ({
            address,
            family: 4 as const,
          }))
        : []),
      ...(ipv6Result.status === "fulfilled"
        ? ipv6Result.value.map((address) => ({
            address,
            family: 6 as const,
          }))
        : []),
    ]
  }

  if (addresses.length === 0) {
    throw new PortfolioInspectionError(
      "Portfolio host could not be resolved.",
      "unavailable"
    )
  }

  if (addresses.some(({ address }) => isPrivateOrReservedAddress(address))) {
    throw new PortfolioInspectionError(
      "Portfolio host is not public.",
      "unsafe"
    )
  }

  return { addresses, url }
}

function requestUrl(
  url: URL,
  addresses: ResolvedAddress[]
): Promise<{
  body: Buffer
  contentType: string
  location?: string
  status: number
}> {
  return new Promise((resolve, reject) => {
    const requester = url.protocol === "https:" ? httpsRequest : httpRequest
    const timers: { wallClock?: NodeJS.Timeout } = {}
    const clearWallClockTimer = () => {
      if (timers.wallClock) clearTimeout(timers.wallClock)
    }
    const request = requester(
      url,
      {
        headers: {
          accept: "text/html, application/xhtml+xml, text/plain;q=0.9",
          "accept-encoding": "identity",
          "user-agent": "RecruiterEvidenceScreener/1.0",
        },
        // DNS rebinding defence: we pin the request to the first address from
        // our pre-validated DNS resolution above. This custom lookup callback
        // overrides the OS resolver so the TCP connection always goes to the
        // address we checked, not to whatever the OS might resolve at connect
        // time (which could differ if the TTL expires between our check and
        // the connection attempt).
        lookup: (_hostname, _options, callback) => {
          const selected = addresses[0]
          callback(null, selected.address, selected.family)
        },
      },
      (response) => {
        const chunks: Buffer[] = []
        let totalBytes = 0

        response.on("data", (chunk: Buffer) => {
          totalBytes += chunk.length
          if (totalBytes > MAX_RESPONSE_BYTES) {
            request.destroy(
              new PortfolioInspectionError(
                "Portfolio response is too large.",
                "unavailable"
              )
            )
            return
          }
          chunks.push(chunk)
        })
        response.on("end", () => {
          clearWallClockTimer()
          resolve({
            body: Buffer.concat(chunks),
            contentType: String(response.headers["content-type"] ?? "")
              .split(";", 1)[0]
              .trim()
              .toLowerCase(),
            location: response.headers.location,
            status: response.statusCode ?? 0,
          })
        })
      }
    )

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      clearWallClockTimer()
      request.destroy(
        new PortfolioInspectionError(
          "Portfolio request timed out.",
          "unavailable"
        )
      )
    })
    timers.wallClock = setTimeout(() => {
      request.destroy(
        new PortfolioInspectionError(
          "Portfolio request exceeded its total deadline.",
          "unavailable"
        )
      )
    }, REQUEST_TIMEOUT_MS)
    request.on("error", (error) => {
      clearWallClockTimer()
      // Wrap raw Node.js network errors so callers always receive a typed
      // PortfolioInspectionError rather than an internal Error that could
      // expose OS-level details or stack traces in server logs.
      if (error instanceof PortfolioInspectionError) {
        reject(error)
      } else {
        reject(
          new PortfolioInspectionError(
            "Portfolio connection failed.",
            "unavailable"
          )
        )
      }
    })
    request.end()
  })
}

function normalizeHtml(body: string) {
  const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? null
  const text = body
    .replace(/<(script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim()

  return { text, title: title?.replace(/\s+/g, " ").trim() || null }
}

export async function inspectPublicPortfolio(
  rawUrl: string
): Promise<InspectedPortfolio> {
  let currentUrl = rawUrl

  for (
    let redirectCount = 0;
    redirectCount <= MAX_REDIRECTS;
    redirectCount += 1
  ) {
    const { addresses, url } = await validateAndResolve(currentUrl)
    let response
    try {
      response = await requestUrl(url, addresses)
    } catch (error) {
      if (error instanceof PortfolioInspectionError) throw error
      throw new PortfolioInspectionError(
        "Portfolio could not be fetched.",
        "unavailable"
      )
    }

    if (response.status >= 300 && response.status < 400 && response.location) {
      if (redirectCount === MAX_REDIRECTS) {
        throw new PortfolioInspectionError(
          "Portfolio redirected too many times.",
          "unsafe"
        )
      }
      currentUrl = new URL(response.location, url).toString()
      continue
    }

    if (response.status < 200 || response.status >= 300) {
      throw new PortfolioInspectionError(
        "Portfolio returned an unavailable response.",
        "unavailable"
      )
    }

    if (!ALLOWED_CONTENT_TYPES.has(response.contentType)) {
      throw new PortfolioInspectionError(
        "Portfolio content type is not supported.",
        "unavailable"
      )
    }

    const decoded = response.body.toString("utf8")
    const normalized =
      response.contentType === "text/plain"
        ? { text: decoded.replace(/\s+/g, " ").trim(), title: null }
        : normalizeHtml(decoded)

    if (!normalized.text) {
      throw new PortfolioInspectionError(
        "Portfolio did not contain readable text.",
        "unavailable"
      )
    }

    return {
      contentType: response.contentType,
      finalUrl: url.toString(),
      text: normalized.text.slice(0, 50_000),
      title: normalized.title,
    }
  }

  throw new PortfolioInspectionError(
    "Portfolio could not be inspected.",
    "unavailable"
  )
}
