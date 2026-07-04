/**
 * Next.js instrumentation hook — runs once when the server process starts.
 *
 * Problem: on this machine the OS system resolver (used by Node's dns.lookup,
 * and therefore by every outbound HTTPS call) cannot resolve api.openai.com,
 * even though dns.resolve4 (network DNS) returns a valid IP and direct TCP to
 * that IP succeeds.  Every OpenAI / LangChain call therefore throws:
 *   "getaddrinfo ENOTFOUND api.openai.com"
 *
 * Fix: replace dns.lookup globally with a version that runs dns.resolve4 first
 * (network DNS client, bypasses the macOS system resolver) and only falls back
 * to the original system lookup if resolve4 itself fails.  The http/https
 * internals call dns.lookup with { all: true } so the patch handles both the
 * single-result (callback(err, addr, family)) and all-results
 * (callback(err, [{address, family}])) calling conventions correctly.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Must use require() so we get the mutable CJS module object — the ESM
    // namespace is sealed and does not allow property assignment.
    const { createRequire } = await import("module")
    const cjsRequire = createRequire(import.meta.url)
    const dns = cjsRequire("dns") as typeof import("dns")

    const origLookup = dns.lookup.bind(dns)

    // @ts-expect-error – overriding the overloaded dns.lookup; the runtime
    // shape matches what Node's net/http/https internals expect.
    dns.lookup = (
      hostname: string,
      options:
        | { all?: boolean; hints?: number; family?: number }
        | ((
            err: NodeJS.ErrnoException | null,
            address: string,
            family: number
          ) => void),
      callback?: (
        err: NodeJS.ErrnoException | null,
        address: string | { address: string; family: number }[],
        family?: number
      ) => void
    ) => {
      if (typeof options === "function") {
        callback = options as never
        options = {}
      }

      const wantsAll = typeof options === "object" && options.all === true

      dns.resolve4(hostname, (err, addresses) => {
        if (!err && addresses && addresses.length > 0) {
          if (wantsAll) {
            // http/https calls lookup with { all: true } and expects an array
            ;(
              callback as (
                err: null,
                addresses: { address: string; family: number }[]
              ) => void
            )(
              null,
              addresses.map((addr) => ({ address: addr, family: 4 }))
            )
          } else {
            ;(callback as (err: null, address: string, family: number) => void)(
              null,
              addresses[0],
              4
            )
          }
        } else {
          // resolve4 failed — fall back to original system resolver
          Reflect.apply(origLookup, dns, [hostname, options, callback])
        }
      })
    }
  }
}
