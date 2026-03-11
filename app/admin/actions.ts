"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const ADMIN_COOKIE_NAME = "admin_session"
const DEFAULT_EMAIL = "admin@gymovaflow.com"
const DEFAULT_PASSWORD = "admin123"

function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL ?? DEFAULT_EMAIL,
    password: process.env.ADMIN_PASSWORD ?? DEFAULT_PASSWORD,
  }
}

async function requireAdminSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  if (!session) {
    redirect("/admin/login")
  }
}

export async function adminLogin(formData: FormData) {
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const { email: validEmail, password: validPassword } = getAdminCredentials()
  if (email !== validEmail || password !== validPassword) {
    return { error: "Invalid email or password." }
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  redirect("/admin")
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
  redirect("/admin/login")
}

export async function approveTrainer(
  applicationId: string,
  userId: string
): Promise<{ error?: string }> {
  await requireAdminSession()

  const { error: appError } = await supabaseAdmin
    .from("trainer_applications")
    .update({ status: "approved" })
    .eq("id", applicationId)

  if (appError) {
    return { error: "Failed to update application: " + appError.message }
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ trainer_status: "approved" })
    .eq("id", userId)

  if (profileError) {
    return {
      error:
        "Application approved but profile update failed: " + profileError.message,
    }
  }

  return {}
}

export async function rejectTrainer(
  applicationId: string,
  userId: string
): Promise<{ error?: string }> {
  await requireAdminSession()

  const { error: appError } = await supabaseAdmin
    .from("trainer_applications")
    .update({ status: "rejected" })
    .eq("id", applicationId)

  if (appError) {
    return { error: "Failed to update application: " + appError.message }
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ trainer_status: "rejected" })
    .eq("id", userId)

  if (profileError) {
    console.error("Profile rejection status update failed:", profileError)
  }

  return {}
}
