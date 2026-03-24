import { NextRequest, NextResponse } from "next/server"

type ParsedMatch = { id: number; reason: string }

function toShortReason(input: unknown): string {
  if (typeof input !== "string") return ""
  const words = input
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
  return words.slice(0, 12).join(" ")
}

function extractJsonArray(text: string): unknown[] {
  const clean = text.replace(/```json|```/g, "").trim()
  try {
    const parsed = JSON.parse(clean)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    const start = clean.indexOf("[")
    const end = clean.lastIndexOf("]")
    if (start === -1 || end === -1 || end <= start) return []
    try {
      const parsed = JSON.parse(clean.slice(start, end + 1))
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ matches: [] }, { status: 503 })
  }

  let goals: Record<string, unknown>
  let trainers: unknown[]
  try {
    const body = await req.json()
    goals = body.goals ?? {}
    trainers = body.trainers ?? []
  } catch {
    return NextResponse.json({ matches: [] }, { status: 400 })
  }

  if (!Array.isArray(trainers) || trainers.length === 0) {
    return NextResponse.json({ matches: [] })
  }

  const validTrainerIds = new Set(
    trainers
      .map((trainer) => {
        const row = trainer as { id?: unknown }
        const id = Number(row.id)
        return Number.isInteger(id) && id > 0 ? id : null
      })
      .filter((id): id is number => id !== null)
  )

  const prompt = `You are a fitness trainer matching engine. A client has the following goals:
${JSON.stringify(goals, null, 2)}

Available trainers (JSON):
${JSON.stringify(trainers, null, 2)}

Return ONLY a JSON array of trainer IDs ranked by match quality, best first.
Include a short reason (max 12 words) for each.
Format:
[{"id": 1, "reason": "Specializes in weight loss and HIIT"}, ...]`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 },
        }),
      }
    )

    if (!res.ok) {
      console.error("Gemini match-trainer error:", await res.text())
      return NextResponse.json({ matches: [] }, { status: 502 })
    }

    const data = await res.json()
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]"
    const parsed = extractJsonArray(text)
    const seen = new Set<number>()
    const matches = parsed
      .map((item: unknown): ParsedMatch | null => {
        const row = item as { id?: unknown; reason?: unknown }
        const id = Number(row.id)
        const reason = toShortReason(row.reason)
        if (!Number.isInteger(id) || id <= 0 || !reason) return null
        if (!validTrainerIds.has(id)) return null
        if (seen.has(id)) return null
        seen.add(id)
        return { id, reason }
      })
      .filter((row): row is ParsedMatch => row !== null)

    return NextResponse.json({ matches })
  } catch (err) {
    console.error("match-trainer fetch error:", err)
    return NextResponse.json({ matches: [] }, { status: 502 })
  }
}
