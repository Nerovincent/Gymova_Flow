import { NextRequest, NextResponse } from 'next/server'

const MODEL = 'gemini-2.5-flash-lite'

const SYSTEM_PROMPT = `You are GymBot, an expert AI fitness coach embedded in GymovaFlow — a marketplace that connects clients with verified personal trainers.

## Your role
You help clients with:
- Personalised workout plans (beginner to advanced)
- Nutrition fundamentals and meal timing
- Goal setting and progress tracking advice
- Finding the right trainer on the platform

## Behaviour rules
- Tone: Warm, encouraging, and direct. No filler phrases like "Great question!"
- Always ask ONE clarifying question before writing a full workout plan (e.g. experience level, available equipment, days per week)
- For trainer recommendations: NEVER invent trainer names or ratings. Instead say: "Based on your goal, I can help you filter trainers on the platform by specialisation — would you like strength coaches, weight loss specialists, or something else?"
- Keep responses under 280 words UNLESS the user explicitly requests a full workout plan
- Format workout plans with clearly labelled day headers (e.g. **Day 1 – Push**)
- If a user mentions pain, injury, or a medical condition, recommend they consult a doctor before training and offer general mobility/rehab advice only

## Response format
- Use markdown: bold for labels, bullet points for lists, headers for days
- End every response with a short follow-up nudge (one line, e.g. "Want me to add a nutrition plan to match?")
- Never end with a generic "Let me know if you need anything!"`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface GeminiContent {
  role: 'user' | 'model'
  parts: [{ text: string }]
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 })
  }

  let messages: ChatMessage[]
  try {
    const body = await req.json()
    messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const contents: GeminiContent[] = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const payload = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.7,        // Balanced: creative but not hallucination-prone
      topP: 0.9,
      maxOutputTokens: 1024,   // Enough for full workout plans; prevents runaway output
      candidateCount: 1,
    },
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error('[GymBot API error]', res.status, errText)
      return NextResponse.json(
        { error: 'The AI service returned an error. Please try again.' },
        { status: 502 }
      )
    }

    const data = await res.json()
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I'm having trouble responding right now. Please try again in a moment."

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[GymBot network error]', err)
    return NextResponse.json(
      { error: 'Network error reaching AI service.' },
      { status: 503 }
    )
  }
}