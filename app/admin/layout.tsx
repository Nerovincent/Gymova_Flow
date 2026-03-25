"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  UserCheck,
  MessageSquare,
  Settings,
} from "lucide-react"
import { DashboardSidebar, DashboardSidebarLink } from "@/components/dashboard/Sidebar"
import { DashboardTopNav } from "@/components/dashboard/TopNav"
import { adminLogout } from "./actions"

const sidebarLinks: DashboardSidebarLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Trainer Applications", icon: UserCheck, badge: 5 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/trainers", label: "Trainers", icon: Dumbbell },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

function getAdminTitle(pathname: string): string {
  if (pathname.startsWith("/admin/applications")) return "Trainer Applications"
  if (pathname.startsWith("/admin/users")) return "Users"
  if (pathname.startsWith("/admin/trainers")) return "Trainers"
  if (pathname.startsWith("/admin/messages")) return "Messages"
  if (pathname.startsWith("/admin/settings")) return "Settings"
  return "Dashboard"
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName="Admin User"
        userEmail="admin@gymova.com"
        onLogout={() => void adminLogout()}
        links={sidebarLinks}
        title="GymovaFlow"
        signedInAs="admin"
      />
      <DashboardTopNav
        onMenuClick={() => setSidebarOpen(true)}
        onLogout={() => void adminLogout()}
        title={getAdminTitle(pathname)}
      />
      <main className="lg:pl-64 pt-16">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
