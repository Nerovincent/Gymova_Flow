import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are an expert AI fitness coach on the GymovaFlow
platform. You help clients with workout plans, nutrition basics, and connecting
them with the right personal trainer. Always be encouraging and practical.
When recommending trainers, say you can show them trainers on the platform
that match their goal. Keep responses concise (under 300 words unless a
workout plan is requested). Format workout plans with clear day labels.`

type AttachmentInput = {
  name?: string
  mimeType: string
  size?: number
  url: string
}

type MessageInput = {
  role: string
  content: string
  attachments?: AttachmentInput[]
}

function isAttachmentSupported(mimeType: string): boolean {
  return mimeType.startsWith('image/') || mimeType === 'application/pdf'
}

async function attachmentToInlinePart(attachment: AttachmentInput) {
  if (!isAttachmentSupported(attachment.mimeType) || !attachment.url) return null

  try {
    const res = await fetch(attachment.url)
    if (!res.ok) return null

    const arrayBuffer = await res.arrayBuffer()
    const data = Buffer.from(arrayBuffer).toString('base64')

    return {
      inlineData: {
        mimeType: attachment.mimeType,
        data,
      },
    }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ reply: 'AI service is not configured yet.' }, { status: 500 })
  }

  const { messages } = await req.json()
  const parsedMessages = (messages ?? []) as MessageInput[]

  const contents = await Promise.all(
    parsedMessages.map(async (m) => {
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
        { text: m.content?.trim() || (m.attachments?.length ? 'Please analyze my attachments.' : '') },
      ]

      if (m.role !== 'assistant' && Array.isArray(m.attachments) && m.attachments.length > 0) {
        const attachmentParts = await Promise.all(m.attachments.map(attachmentToInlinePart))
        parts.push(...attachmentParts.filter((part): part is { inlineData: { mimeType: string; data: string } } => part !== null))
      }

      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts,
      }
    })
  )

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      }),
    }
  )

  if (!res.ok) {
    console.error('Gemini ai-coach error:', await res.text())
    return NextResponse.json({ reply: 'Sorry, I could not process that right now.' }, { status: 500 })
  }

  const data = await res.json()
  const text =
    data.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => typeof part.text === 'string')?.text ??
    'Sorry, I could not respond.'
  return NextResponse.json({ reply: text })
}
