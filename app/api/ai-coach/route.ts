import { NextRequest, NextResponse } from "next/server"

<<<<<<< HEAD
const SYSTEM_PROMPT = `You are an expert AI fitness coach on the GymovaFlow platform. You help clients with workout plans, nutrition basics, and connecting them with the right personal trainer. Always be encouraging and practical. When recommending trainers, say you can show them trainers on the platform that match their goal. Keep responses concise (under 300 words unless a workout plan is requested). Format workout plans with clear day labels.`
=======
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
>>>>>>> 782cdc9 (Enhance AI coach API by refining system prompt and improving error handling in response generation)

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
<<<<<<< HEAD
    return NextResponse.json(
      { reply: "AI Coach is not configured. Please contact support." },
      { status: 503 }
    )
  }

  let messages: { role: string; content: string }[]
=======
    return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 })
  }

  let messages: ChatMessage[]
>>>>>>> 782cdc9 (Enhance AI coach API by refining system prompt and improving error handling in response generation)
  try {
    const body = await req.json()
    messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
<<<<<<< HEAD
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
=======
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
>>>>>>> 782cdc9 (Enhance AI coach API by refining system prompt and improving error handling in response generation)
