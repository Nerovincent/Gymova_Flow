import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export const sendEmail = async ({ to, subject, html, replyTo }: SendEmailOptions) => {
  const from = process.env.EMAIL_FROM
  if (!from) {
    throw new Error("EMAIL_FROM environment variable is not set.")
  }
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set.")
  }

  try {
    const response = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    })

    if (response.error) {
      console.error("[Resend] API error:", response.error)
      throw new Error(response.error.message)
    }

    console.log(`[Resend] Email sent to ${Array.isArray(to) ? to.join(", ") : to} — id: ${response.data?.id}`)
    return response
  } catch (error) {
    console.error("[Resend] sendEmail threw:", error)
    throw error
  }
}
