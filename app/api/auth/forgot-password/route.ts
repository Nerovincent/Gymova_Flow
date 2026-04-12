import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

function getBaseUrl(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured && configured.length > 0) return configured.replace(/\/$/, "")
  const proto = request.headers.get("x-forwarded-proto") ?? "https"
  const host = request.headers.get("host") ?? "localhost:3000"
  const protocol = host.startsWith("localhost") ? "http" : proto
  return `${protocol}://${host}`
}

function isSupabaseEmailRateLimitError(error: { status?: number; code?: string } | null | undefined): boolean {
  return error?.status === 429 || error?.code === "over_email_send_rate_limit"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Missing required field: email" }, { status: 400 })
    }

    const baseUrl = getBaseUrl(request)
    
    // We use generateLink to create the recovery OTP/link so we can send it via Resend
    const { data: linkData, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${baseUrl}/reset-password`,
      },
    })

    if (error) {
      if (isSupabaseEmailRateLimitError(error)) {
        return NextResponse.json(
          { error: "Please wait at least 1 minute before requesting another reset link." },
          { status: 429 }
        )
      }
      console.error("[forgot-password] Supabase reset password request failed:", error)
      return NextResponse.json({ error: "Could not send reset link." }, { status: 500 })
    }

    if (linkData?.properties?.action_link) {
      try {
        const { sendEmail } = await import("@/lib/email")
        const { resetPasswordEmail } = await import("@/lib/email/templates")
        
        await sendEmail({
          to: email,
          subject: "Reset your password – GymovaFlow",
          html: resetPasswordEmail(linkData.properties.action_link),
        })
      } catch (err) {
        console.error("Failed to send reset password email:", err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Unexpected error in forgot-password route:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
