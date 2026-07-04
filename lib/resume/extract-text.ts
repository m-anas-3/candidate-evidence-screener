import "server-only"
import "pdf-parse/worker"

import {
  FormatError,
  InvalidPDFException,
  PasswordException,
  PDFParse,
} from "pdf-parse"

import { MAX_ANALYSIS_RESUME_CHARACTERS } from "@/lib/security/ai-guardrails"

export const MAX_RESUME_TEXT_CHARACTERS = MAX_ANALYSIS_RESUME_CHARACTERS
export const MIN_RESUME_TEXT_CHARACTERS = 40

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d] as const

export class ResumeExtractionError extends Error {
  constructor(
    public readonly userMessage: string,
    public readonly code:
      | "corrupt_pdf"
      | "empty_pdf"
      | "invalid_pdf"
      | "protected_pdf"
      | "text_too_large"
  ) {
    super(userMessage)
    this.name = "ResumeExtractionError"
  }
}

export function hasPdfMagicBytes(bytes: Uint8Array): boolean {
  return PDF_MAGIC.every((byte, index) => bytes[index] === byte)
}

export function normalizeResumeText(value: string): string {
  return value
    .replaceAll("\u0000", "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export async function extractResumeText(bytes: Uint8Array): Promise<string> {
  if (!hasPdfMagicBytes(bytes)) {
    throw new ResumeExtractionError(
      "The uploaded file is not a valid PDF.",
      "invalid_pdf"
    )
  }

  let parser: PDFParse | undefined

  try {
    parser = new PDFParse({ data: bytes })
    const result = await parser.getText()
    const text = normalizeResumeText(result.text)

    if (text.length < MIN_RESUME_TEXT_CHARACTERS) {
      throw new ResumeExtractionError(
        "No usable text was found. Scanned or image-only PDFs are not supported.",
        "empty_pdf"
      )
    }

    if (text.length > MAX_RESUME_TEXT_CHARACTERS) {
      throw new ResumeExtractionError(
        `The resume contains too much text. Upload a shorter resume with no more than ${MAX_RESUME_TEXT_CHARACTERS.toLocaleString()} characters.`,
        "text_too_large"
      )
    }

    return text
  } catch (error) {
    console.error("Raw pdf-parse error", {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    if (error instanceof ResumeExtractionError) {
      throw error
    }

    if (error instanceof PasswordException) {
      throw new ResumeExtractionError(
        "Password-protected PDFs are not supported. Upload an unlocked PDF.",
        "protected_pdf"
      )
    }

    if (error instanceof InvalidPDFException || error instanceof FormatError) {
      throw new ResumeExtractionError(
        "The PDF is corrupt or could not be read.",
        "corrupt_pdf"
      )
    }

    throw error
  } finally {
    if (parser) {
      try {
        await parser.destroy()
      } catch (error) {
        console.error("PDF parser cleanup failed", {
          name: error instanceof Error ? error.name : "UnknownError",
        })
      }
    }
  }
}
