import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_COOKIE_NAME = "admin_session"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }
  if (pathname === "/admin/login") {
    const loggedIn = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    if (loggedIn) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return NextResponse.next()
  }
  const loggedIn = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!loggedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }
  return NextResponse.next()
}
