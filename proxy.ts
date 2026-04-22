import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const ADMIN_COOKIE_NAME = "admin_session"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create Supabase server client for protected routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // We can't set cookies in the proxy response, just read them
          })
        },
      },
    }
  )

  // Get current user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /admin routes - must have admin cookie and admin role
  if (pathname.startsWith("/admin")) {
    const loggedIn = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    if (!loggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // If user is authenticated, verify admin role
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (!profile || profile.role !== "admin") {
        // Redirect non-admins based on their role
        if (profile?.role === "trainer") {
          return NextResponse.redirect(new URL("/trainer", request.url))
        }
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    return NextResponse.next()
  }

  // Protect /trainer routes - must be approved trainer
  if (pathname.startsWith("/trainer")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, trainer_status")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "trainer" || profile.trainer_status !== "approved") {
      // Redirect to appropriate dashboard based on role/status
      if (profile?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      if (
        profile?.role === "trainer" &&
        profile?.trainer_status === "pending"
      ) {
        return NextResponse.redirect(new URL("/trainer-pending", request.url))
      }
      if (
        profile?.role === "trainer" &&
        profile?.trainer_status === "rejected"
      ) {
        return NextResponse.redirect(new URL("/trainer-rejected", request.url))
      }
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  }

  // Protect /dashboard routes - must be authenticated
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // Protect trainer-pending and trainer-rejected routes
  if (pathname.startsWith("/trainer-pending") || pathname.startsWith("/trainer-rejected")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}
