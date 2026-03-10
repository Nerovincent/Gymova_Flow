"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  MessageCircle,
  Star,
  ArrowRight,
  UserCircle,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"

const upcomingSessions = [
  {
    id: 1,
    clientName: "Alex M.",
    date: "Today",
    time: "2:00 PM - 3:00 PM",
    location: "Downtown Fitness Center",
    type: "in-person" as const,
    status: "confirmed" as const,
  },
  {
    id: 2,
    clientName: "Jordan K.",
    date: "Tomorrow",
    time: "9:00 AM - 10:00 AM",
    location: "Online",
    type: "virtual" as const,
    status: "confirmed" as const,
  },
  {
    id: 3,
    clientName: "Sam R.",
    date: "Mar 10",
    time: "4:00 PM - 5:00 PM",
    location: "Iron Paradise Gym",
    type: "in-person" as const,
    status: "pending" as const,
  },
]

const stats = [
  { label: "Sessions This Week", value: "8", icon: Calendar, change: "+2 from last week" },
  { label: "Total Clients", value: "24", icon: User, change: "Active" },
  { label: "Earnings (Month)", value: "$2,400", icon: DollarSign, change: "Up 12%" },
]

export default function TrainerDashboardPage() {
  const { user } = useAuth()
  const displayName =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
    user?.email?.split("@")[0] ||
    "Trainer"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {displayName}. Here’s your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-card-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-primary mt-1">{stat.change}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-card-foreground">Upcoming Sessions</CardTitle>
              <Link href="/trainer/sessions">
                <Button variant="ghost" size="sm" className="text-primary">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <p className="text-muted-foreground py-4">
                  No upcoming sessions. Set your availability so clients can book you.
                </p>
              ) : (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground">{session.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.type === "virtual" ? "Virtual" : session.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-card-foreground">{session.date}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {session.time}
                      </div>
                    </div>
                    <span
                      className={`hidden sm:inline px-2 py-1 text-xs font-medium rounded-full ${
                        session.status === "confirmed"
                          ? "bg-primary/20 text-primary"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/trainer/availability" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-secondary"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Set my availability
                </Button>
              </Link>
              <Link href="/trainers" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-secondary"
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  View my public profile
                </Button>
              </Link>
              <Link href="/messages" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-secondary"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>
              <Link href="/trainer/sessions" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-secondary"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  My sessions
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Star className="w-5 h-5 text-primary" />
                Your impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep your availability up to date so clients can find and book you. You can log when
                you’re available from the availability page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
