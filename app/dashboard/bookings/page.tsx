"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, MoreVertical, Video, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const upcomingBookings = [
  {
    id: 1,
    trainer: "Mike Thompson",
    specialty: "Strength Training",
    date: "March 7, 2026",
    time: "2:00 PM - 3:00 PM",
    location: "Downtown Gym",
    type: "in-person",
    status: "confirmed"
  },
  {
    id: 2,
    trainer: "Lisa Chen",
    specialty: "HIIT & Cardio",
    date: "March 8, 2026",
    time: "9:00 AM - 10:00 AM",
    location: "FitZone Studio",
    type: "in-person",
    status: "confirmed"
  },
  {
    id: 3,
    trainer: "James Wilson",
    specialty: "Yoga & Flexibility",
    date: "March 10, 2026",
    time: "7:00 PM - 8:00 PM",
    location: "Online",
    type: "virtual",
    status: "pending"
  }
]

const pastBookings = [
  {
    id: 4,
    trainer: "Sarah Miller",
    specialty: "Weight Loss",
    date: "March 3, 2026",
    time: "10:00 AM - 11:00 AM",
    location: "Fitness First",
    type: "in-person",
    status: "completed"
  },
  {
    id: 5,
    trainer: "David Park",
    specialty: "Bodybuilding",
    date: "March 1, 2026",
    time: "6:00 PM - 7:00 PM",
    location: "Iron Paradise Gym",
    type: "in-person",
    status: "completed"
  }
]

function BookingCard({ booking }: { booking: typeof upcomingBookings[0] }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-secondary" />
            <div>
              <h3 className="font-semibold text-card-foreground">{booking.trainer}</h3>
              <p className="text-sm text-muted-foreground">{booking.specialty}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              booking.status === "confirmed" 
                ? "bg-primary/20 text-primary" 
                : booking.status === "pending"
                ? "bg-yellow-500/20 text-yellow-500"
                : "bg-muted text-muted-foreground"
            }`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Reschedule</DropdownMenuItem>
                <DropdownMenuItem>Message Trainer</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Cancel Booking</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {booking.date}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {booking.time}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {booking.type === "virtual" ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            {booking.location}
          </div>
        </div>

        {booking.status !== "completed" && (
          <div className="flex items-center gap-2">
            {booking.type === "virtual" ? (
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Video className="w-4 h-4 mr-2" />
                Join Session
              </Button>
            ) : (
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <MapPin className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            )}
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
              <User className="w-4 h-4 mr-2" />
              View Trainer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
        <p className="text-muted-foreground">Manage your training sessions</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-background">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-background">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
