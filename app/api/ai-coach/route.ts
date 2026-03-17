import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are an expert AI fitness coach on the GymovaFlow platform. You help clients with workout plans, nutrition basics, and connecting them with the right personal trainer. Always be encouraging and practical. When recommending trainers, say you can show them trainers on the platform that match their goal. Keep responses concise (under 300 words unless a workout plan is requested). Format workout plans with clear day labels.`

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { reply: "AI Coach is not configured. Please contact support." },
      { status: 503 }
    )
  }

  let messages: { role: string; content: string }[]
  try {
    const body = await req.json()
    messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: "No messages provided." }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ reply: "Invalid request body." }, { status: 400 })
  }

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }))

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      }),
    }
  )

  if (!geminiRes.ok) {
    const errText = await geminiRes.text()
    console.error("Gemini API error:", errText)
    return NextResponse.json(
      { reply: "Sorry, I had trouble connecting to the AI service. Please try again." },
      { status: 502 }
    )
  }

  const data = await geminiRes.json()
  const reply =
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    "Sorry, I could not generate a response. Please try again."

  return NextResponse.json({ reply })
}
