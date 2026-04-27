"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Bot,
  Dumbbell,
  LayoutDashboard,
  UserCheck,
  Users,
} from "lucide-react"
import { DashboardSidebar, DashboardSidebarLink } from "@/components/dashboard/Sidebar"
import { DashboardTopNav } from "@/components/dashboard/TopNav"
import { RoleGate } from "@/components/auth/RoleGate"
import { adminLogout } from "./actions"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/components/auth/AuthProvider"

const sidebarLinks: DashboardSidebarLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Trainer Applications", icon: UserCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/trainers", label: "Trainers", icon: Dumbbell },
  { href: "/admin/ai-models", label: "AI Models", icon: Bot },
]

function getAdminTitle(pathname: string): string {
  if (pathname.startsWith("/admin/applications")) return "Trainer Applications"
  if (pathname.startsWith("/admin/users")) return "Users"
  if (pathname.startsWith("/admin/trainers")) return "Trainers"
  if (pathname.startsWith("/admin/ai-models")) return "AI Models"
  return "Dashboard"
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { session, profile } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    void adminLogout()
  }

  return (
    <RoleGate allowedRoles={["admin"]} requireApprovedTrainer={false} loadingMessage="Checking admin access...">
      <div
        className="min-h-screen bg-background lg:grid"
        style={{ gridTemplateColumns: isSidebarCollapsed ? "5rem minmax(0,1fr)" : "16rem minmax(0,1fr)" }}
      >
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={isSidebarCollapsed}
          onToggleCollapsed={() => setIsSidebarCollapsed((value) => !value)}
          userName={profile?.full_name || session?.user?.email || "Admin"}
          userEmail={session?.user?.email ?? null}
          avatarUrl={profile?.avatar_url ?? null}
          onLogout={handleLogout}
          links={sidebarLinks}
          title="GymovaFlow"
          signedInAs="admin"
          homeHref="/admin"
        />
        <div className="min-w-0">
          <DashboardTopNav
            onMenuClick={() => setSidebarOpen(true)}
            onLogout={handleLogout}
            title={getAdminTitle(pathname)}
          />
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </RoleGate>
  )
}
