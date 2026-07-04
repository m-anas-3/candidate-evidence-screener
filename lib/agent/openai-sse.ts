function parseContentDelta(line: string): string | null {
  if (!line.startsWith("data:")) return null

  const payload = line.slice(5).trim()
  if (!payload || payload === "[DONE]") return null

  try {
    const delta = (
      JSON.parse(payload) as {
        choices: { delta: { content?: string } }[]
      }
    ).choices[0]?.delta?.content

    return typeof delta === "string" && delta ? delta : null
  } catch {
    // A complete but malformed SSE line is not usable.
    return null
  }
}

export async function* readOpenAIContentDeltas(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        buffer += decoder.decode()
        break
      }

      buffer += decoder.decode(value, { stream: true })

      let newlineIndex = buffer.indexOf("\n")
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).replace(/\r$/, "")
        buffer = buffer.slice(newlineIndex + 1)

        const delta = parseContentDelta(line)
        if (delta) yield delta

        newlineIndex = buffer.indexOf("\n")
      }
    }

    const delta = parseContentDelta(buffer.replace(/\r$/, ""))
    if (delta) yield delta
  } finally {
    reader.releaseLock()
  }
}
