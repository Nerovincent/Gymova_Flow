import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are an expert AI fitness coach on the GymovaFlow
platform. You help clients with workout plans, nutrition basics, and connecting
them with the right personal trainer. Always be encouraging and practical.
When recommending trainers, say you can show them trainers on the platform
that match their goal. Keep responses concise (under 300 words unless a
workout plan is requested). Format workout plans with clear day labels.`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  const contents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      }),
    }
  )
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not respond.'
  return NextResponse.json({ reply: text })
}
