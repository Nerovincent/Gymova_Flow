"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Search,
  Calendar,
  MessageCircle,
  Sparkles,
  User,
  Menu,
  X,
  Dumbbell,
  Bell,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/components/auth/AuthProvider"

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trainers", label: "Find Trainers", icon: Search },
  { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/ai-coach", label: "AI Coach", icon: Sparkles },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

function Sidebar({
  isOpen,
  onClose,
  userName,
  userEmail,
  onLogout,
}: {
  isOpen: boolean
  onClose: () => void
  userName?: string | null
  userEmail?: string | null
  onLogout: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">GymovaFlow</span>
            </Link>
            <button className="lg:hidden text-sidebar-foreground" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || 
                (link.href !== "/dashboard" && pathname.startsWith(link.href))
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-primary" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border space-y-3">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-sidebar-accent" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {userName || "Account"}
                </p>
                {userEmail && (
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {userEmail}
                  </p>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/70"
              onClick={onLogout}
            >
              Sign out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

function TopNav({ onMenuClick, onLogout }: { onMenuClick: () => void; onLogout: () => void }) {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-background/80 backdrop-blur-md border-b border-border z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-foreground" onClick={onMenuClick}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex border-border"
            onClick={onLogout}
          >
            Sign out
          </Button>
          <div className="w-9 h-9 rounded-full bg-secondary" />
        </div>
      </div>
    </header>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const router = useRouter()
  const { user, session, loading } = useAuth()

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login")
    }
  }, [loading, session, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  if (loading || (!session && typeof window !== "undefined")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground">Loading your dashboard...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={(user?.user_metadata as any)?.full_name || user?.email || null}
        userEmail={user?.email ?? null}
        onLogout={handleLogout}
      />
      <TopNav onMenuClick={() => setSidebarOpen(true)} onLogout={handleLogout} />
      <main className="lg:pl-64 pt-16">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
