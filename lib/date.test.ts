import { describe, expect, it } from "vitest"

import { formatDate } from "@/lib/date"

describe("display date formatting", () => {
  it("uses the requested timezone near a UTC day boundary", () => {
    const timestamp = "2026-07-05T20:30:00.000Z"

    expect(formatDate(timestamp, "full", "Asia/Karachi")).toBe("Jul 6, 2026")
    expect(formatDate(timestamp, "full", "America/New_York")).toBe(
      "Jul 5, 2026"
    )
  })

  it("supports the compact month and day display", () => {
    expect(
      formatDate("2026-07-05T20:30:00.000Z", "month-day", "Asia/Karachi")
    ).toBe("Jul 6")
  })
})
