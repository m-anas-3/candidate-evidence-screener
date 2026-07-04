"use client"

import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"
import {
  IconLoader2,
  IconMessageCircle,
  IconSend,
  IconSparkles,
  IconUser,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CandidateChat({
  candidateId,
  initialMessages,
  hasReport,
  fullPage = false,
}: {
  candidateId: string
  initialMessages: ChatMessage[]
  hasReport: boolean
  fullPage?: boolean
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send() {
    const trimmed = input.trim()
    if (!trimmed || streaming) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMessage])

    const assistantId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ])
    setStreaming(true)

    try {
      const response = await fetch(`/api/candidates/${candidateId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      })

      if (!response.ok) {
        const json = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(json.error ?? "Request failed.")
      }

      if (!response.body) throw new Error("Empty response.")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const payload = line.slice(6).trim()
          if (payload === "[DONE]") continue

          try {
            const { delta } = JSON.parse(payload) as { delta: string }
            if (delta) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + delta }
                    : m
                )
              )
            }
          } catch {
            // malformed chunk — skip
          }
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again."
      toast.error("Could not answer that question", { description: message })
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
    } finally {
      setStreaming(false)
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!hasReport) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/10 py-16 text-center">
        <IconSparkles className="mb-3 size-8 text-muted-foreground/40" />
        <p className="text-sm font-semibold">No screening report yet</p>
        <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
          Run the fit analysis first. The chat uses the report as evidence to
          answer your questions.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-3", fullPage && "h-full")}>
      {/* Advisory note */}
      <p className="shrink-0 text-xs text-muted-foreground">
        Answers are grounded in this candidate&apos;s resume, proposal, and
        screening report.{" "}
        <span className="font-medium text-foreground">
          Always verify before deciding.
        </span>
      </p>

      {/* Message list */}
      <ScrollArea
        className={cn(
          "rounded-xl border border-border/40 bg-muted/5",
          fullPage ? "min-h-0 flex-1" : "h-[440px]"
        )}
      >
        <div className="space-y-1 p-4 pr-5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <IconMessageCircle className="mb-3 size-8 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-foreground">
                Start a conversation
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Ask about the candidate&apos;s experience, skills, proposal
                quality, or anything in their screening report.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  "How strong is their technical background?",
                  "What evidence supports their seniority claim?",
                  "How specific was their proposal?",
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setInput(q)}
                    className="rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}

          {streaming &&
            messages.at(-1)?.role === "assistant" &&
            messages.at(-1)?.content === "" && (
              <div className="flex items-center gap-2 py-2 pl-10">
                <span className="flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
                </span>
              </div>
            )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="shrink-0 space-y-2">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            aria-label="Ask a question about this candidate"
            className="min-h-[60px] flex-1 resize-none rounded-xl border-border/50 bg-muted/20 text-sm focus:border-primary/40 focus:bg-background"
            disabled={streaming}
            onKeyDown={handleKeyDown}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about experience, skills, proposal quality…"
            rows={2}
            value={input}
          />
          <Button
            aria-label="Send message"
            className="h-[60px] w-11 shrink-0 rounded-xl p-0"
            disabled={!input.trim() || streaming}
            onClick={send}
            size="icon"
            type="button"
          >
            {streaming ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconSend className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/60">
          <kbd className="rounded border border-border/40 px-1 font-mono text-[10px]">
            Enter
          </kbd>{" "}
          to send ·{" "}
          <kbd className="rounded border border-border/40 px-1 font-mono text-[10px]">
            Shift+Enter
          </kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MessageBubble
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 py-1",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/80 text-muted-foreground ring-1 ring-border/40"
        )}
      >
        {isUser ? (
          <IconUser className="size-3.5" />
        ) : (
          <IconSparkles className="size-3.5" />
        )}
      </span>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm border border-border/40 bg-card text-foreground shadow-sm"
        )}
      >
        {message.content ? (
          isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <MarkdownContent content={message.content} />
          )
        ) : (
          <span className="text-muted-foreground italic opacity-60">…</span>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MarkdownContent — renders assistant replies with proper formatting
// ---------------------------------------------------------------------------

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="mt-3 mb-2 text-base font-semibold first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-3 mb-1.5 text-sm font-semibold first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-2.5 mb-1 text-sm font-semibold text-foreground/90 first:mt-0">
            {children}
          </h3>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-2 leading-relaxed last:mb-0">{children}</p>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed text-foreground/90">{children}</li>
        ),
        // Inline bold / italic
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="text-foreground/80 italic">{children}</em>
        ),
        // Inline code
        code: ({ children }) => (
          <code className="rounded bg-muted/60 px-1 py-0.5 font-mono text-[12px] text-foreground/90">
            {children}
          </code>
        ),
        // Horizontal rule
        hr: () => <hr className="my-3 border-border/40" />,
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-primary/40 pl-3 text-muted-foreground italic">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
