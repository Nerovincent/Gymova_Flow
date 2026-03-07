"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Star,
  MapPin,
  ChevronDown,
  UserX,
  Eye,
  DollarSign,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const trainers = [
  {
    id: 1,
    name: "Marcus Johnson",
    email: "marcus.j@email.com",
    avatar: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop&crop=face",
    location: "Chicago, IL",
    specializations: ["Bodybuilding", "Weight Training"],
    rating: 4.9,
    totalSessions: 342,
    hourlyRate: 110,
    joinedAt: "Sep 2023",
    status: "active",
    earnings: 28500,
  },
  {
    id: 2,
    name: "Sarah Mitchell",
    email: "sarah.m@email.com",
    avatar: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=100&h=100&fit=crop&crop=face",
    location: "Los Angeles, CA",
    specializations: ["HIIT", "Weight Training"],
    rating: 4.8,
    totalSessions: 256,
    hourlyRate: 85,
    joinedAt: "Nov 2023",
    status: "active",
    earnings: 21200,
  },
  {
    id: 3,
    name: "James Rodriguez",
    email: "james.r@email.com",
    avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&h=100&fit=crop&crop=face",
    location: "Miami, FL",
    specializations: ["CrossFit", "Nutrition"],
    rating: 4.9,
    totalSessions: 428,
    hourlyRate: 95,
    joinedAt: "Jul 2023",
    status: "active",
    earnings: 34800,
  },
  {
    id: 4,
    name: "Emily Chen",
    email: "emily.c@email.com",
    avatar: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=100&h=100&fit=crop&crop=face",
    location: "San Francisco, CA",
    specializations: ["Yoga", "Pilates"],
    rating: 5.0,
    totalSessions: 189,
    hourlyRate: 75,
    joinedAt: "Jan 2024",
    status: "active",
    earnings: 12400,
  },
  {
    id: 5,
    name: "Lisa Wang",
    email: "lisa.w@email.com",
    avatar: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=100&h=100&fit=crop&crop=face",
    location: "Seattle, WA",
    specializations: ["Running", "Endurance"],
    rating: 4.7,
    totalSessions: 98,
    hourlyRate: 70,
    joinedAt: "Mar 2024",
    status: "active",
    earnings: 6200,
  },
  {
    id: 6,
    name: "David Park",
    email: "david.p@email.com",
    avatar: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&h=100&fit=crop&crop=face",
    location: "Boston, MA",
    specializations: ["Boxing", "MMA"],
    rating: 4.6,
    totalSessions: 45,
    hourlyRate: 90,
    joinedAt: "May 2024",
    status: "inactive",
    earnings: 3600,
  },
]

export default function TrainersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesStatus = filterStatus === "all" || trainer.status === filterStatus
    const matchesSearch = trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trainer.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalEarnings = trainers.reduce((sum, t) => sum + t.earnings, 0)
  const totalSessions = trainers.reduce((sum, t) => sum + t.totalSessions, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trainers</h1>
        <p className="text-muted-foreground mt-1">Manage approved trainers on the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Trainers</p>
            <p className="text-2xl font-bold text-foreground mt-1">{trainers.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Trainers</p>
            <p className="text-2xl font-bold text-foreground mt-1">{trainers.filter((t) => t.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Sessions</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalSessions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="text-2xl font-bold text-primary mt-1">${totalEarnings.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-secondary border-border text-foreground hover:bg-muted">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterStatus === "all" ? "All Status" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem onClick={() => setFilterStatus("all")} className="text-foreground hover:bg-secondary">
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")} className="text-foreground hover:bg-secondary">
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("inactive")} className="text-foreground hover:bg-secondary">
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrainers.map((trainer) => (
          <Card key={trainer.id} className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 border-2 border-primary/30">
                    <AvatarImage src={trainer.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {trainer.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{trainer.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {trainer.location}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem className="text-foreground hover:bg-secondary">
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-secondary">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem className="text-destructive hover:bg-destructive/10">
                      <UserX className="h-4 w-4 mr-2" />
                      Suspend Trainer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {trainer.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium text-foreground">{trainer.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">${trainer.hourlyRate}/hr</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{trainer.totalSessions} sessions</span>
                </div>
                <div>
                  <Badge
                    variant="secondary"
                    className={`${
                      trainer.status === "active"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-muted text-muted-foreground"
                    } border-0`}
                  >
                    {trainer.status.charAt(0).toUpperCase() + trainer.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Earnings</span>
                  <span className="font-semibold text-primary">${trainer.earnings.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
