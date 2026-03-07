"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, MapPin, Star, Search, Sparkles, TrendingUp, Target, Flame, Send, ArrowRight } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

const upcomingSessions = [
  {
    id: 1,
    trainer: "Mike Thompson",
    specialty: "Strength Training",
    date: "Today",
    time: "2:00 PM",
    location: "Downtown Gym"
  },
  {
    id: 2,
    trainer: "Lisa Chen",
    specialty: "HIIT & Cardio",
    date: "Tomorrow",
    time: "9:00 AM",
    location: "FitZone Studio"
  },
  {
    id: 3,
    trainer: "James Wilson",
    specialty: "Yoga & Flexibility",
    date: "Mar 10",
    time: "7:00 PM",
    location: "Zen Fitness Center"
  }
]

const recommendedTrainers = [
  {
    id: 1,
    name: "Sarah Miller",
    specialty: "Weight Loss",
    rating: 4.9,
    reviews: 124,
    price: 75,
    image: null
  },
  {
    id: 2,
    name: "David Park",
    specialty: "Bodybuilding",
    rating: 4.8,
    reviews: 89,
    price: 85,
    image: null
  },
  {
    id: 3,
    name: "Emma Roberts",
    specialty: "CrossFit",
    rating: 4.9,
    reviews: 156,
    price: 80,
    image: null
  }
]

const progressStats = [
  { label: "Workouts This Week", value: "5", icon: Flame, change: "+2 from last week" },
  { label: "Sessions Completed", value: "24", icon: Target, change: "This month" },
  { label: "Current Streak", value: "12 days", icon: TrendingUp, change: "Personal best!" }
]

const aiSuggestions = [
  "Create a beginner workout routine",
  "Help me lose 10 pounds",
  "Suggest trainers for muscle gain"
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [aiMessage, setAiMessage] = useState("")

  const displayName =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
    user?.email?.split("@")[0] ||
    "there"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {displayName}</h1>
          <p className="text-muted-foreground">Here is your fitness overview for today.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search trainers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {progressStats.map((stat, index) => (
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
              <Link href="/dashboard/bookings">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground">{session.trainer}</p>
                    <p className="text-sm text-muted-foreground">{session.specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-card-foreground">{session.date}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {session.time}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{session.location}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-card-foreground">Recommended Trainers</CardTitle>
              <Link href="/trainers">
                <Button variant="ghost" size="sm" className="text-primary">
                  Browse All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommendedTrainers.map((trainer) => (
                  <Link key={trainer.id} href={`/trainers/${trainer.id}`}>
                    <div className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-center">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3" />
                      <p className="font-medium text-card-foreground">{trainer.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{trainer.specialty}</p>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span className="text-xs text-card-foreground">{trainer.rating}</span>
                        <span className="text-xs text-muted-foreground">({trainer.reviews})</span>
                      </div>
                      <p className="text-sm font-semibold text-primary">${trainer.price}/session</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Fitness Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ask me anything about fitness, workouts, or finding the right trainer.
              </p>
              
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setAiMessage(suggestion)}
                    className="w-full text-left text-sm p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-card-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Input
                  placeholder="Ask AI Coach..."
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  className="pr-10 bg-input border-border"
                />
                <Link href="/ai-coach">
                  <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-primary hover:bg-primary/90">
                    <Send className="w-3 h-3 text-primary-foreground" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/trainers" className="block">
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-secondary">
                  <Search className="w-4 h-4 mr-2" />
                  Find a Trainer
                </Button>
              </Link>
              <Link href="/map" className="block">
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-secondary">
                  <MapPin className="w-4 h-4 mr-2" />
                  View Map
                </Button>
              </Link>
              <Link href="/messages" className="block">
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-secondary">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Session
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
