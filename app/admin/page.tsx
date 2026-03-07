import {
  Users,
  UserCheck,
  Dumbbell,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const stats = [
  {
    title: "Total Users",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Active Trainers",
    value: "534",
    change: "+8.2%",
    trend: "up",
    icon: Dumbbell,
  },
  {
    title: "Pending Applications",
    value: "23",
    change: "+5",
    trend: "up",
    icon: UserCheck,
  },
  {
    title: "Monthly Revenue",
    value: "$89,420",
    change: "+18.3%",
    trend: "up",
    icon: DollarSign,
  },
]

const pendingApplications = [
  {
    id: 1,
    name: "Sarah Mitchell",
    email: "sarah.m@email.com",
    avatar: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=100&h=100&fit=crop&crop=face",
    specializations: ["HIIT", "Weight Training"],
    experience: "5 years",
    appliedAt: "2 hours ago",
  },
  {
    id: 2,
    name: "James Rodriguez",
    email: "james.r@email.com",
    avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&h=100&fit=crop&crop=face",
    specializations: ["CrossFit", "Nutrition"],
    experience: "8 years",
    appliedAt: "5 hours ago",
  },
  {
    id: 3,
    name: "Emily Chen",
    email: "emily.c@email.com",
    avatar: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=100&h=100&fit=crop&crop=face",
    specializations: ["Yoga", "Pilates"],
    experience: "3 years",
    appliedAt: "1 day ago",
  },
]

const recentActivity = [
  { action: "New user registered", user: "Michael Brown", time: "5 min ago", type: "user" },
  { action: "Trainer application approved", user: "Lisa Wang", time: "1 hour ago", type: "approved" },
  { action: "Trainer application rejected", user: "Tom Harris", time: "2 hours ago", type: "rejected" },
  { action: "New booking completed", user: "Anna Smith", time: "3 hours ago", type: "booking" },
  { action: "New user registered", user: "David Lee", time: "4 hours ago", type: "user" },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening with GymovaFlow.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-green-500" : "text-red-500"
                }`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Applications */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-foreground">Pending Trainer Applications</CardTitle>
            <Link href="/admin/applications">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApplications.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/30">
                    <AvatarImage src={application.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {application.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{application.name}</h4>
                    <p className="text-sm text-muted-foreground">{application.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {application.specializations.slice(0, 2).map((spec) => (
                        <Badge key={spec} variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                          {spec}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted-foreground">• {application.experience}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {application.appliedAt}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="bg-transparent border-border text-foreground hover:bg-secondary">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.type === "approved" ? "bg-green-500" :
                  activity.type === "rejected" ? "bg-red-500" :
                  activity.type === "booking" ? "bg-primary" :
                  "bg-muted-foreground"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
