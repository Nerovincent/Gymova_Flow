"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Star, 
  MapPin, 
  MessageCircle, 
  Calendar, 
  Award, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Heart,
  Share2,
  Dumbbell
} from "lucide-react"

const trainers = {
  "1": {
    id: 1,
    name: "Sarah Miller",
    specialty: "Weight Loss Specialist",
    rating: 4.9,
    reviews: 124,
    price: 75,
    location: "Downtown Fitness Center, San Francisco",
    distance: "0.8 miles",
    bio: "With over 8 years of experience in personal training, I specialize in helping clients achieve sustainable weight loss through a combination of strength training, cardio, and nutrition guidance. My approach is science-based and tailored to each individual's goals and lifestyle.",
    specializations: ["Weight Loss", "HIIT", "Nutrition Planning", "Strength Training"],
    certifications: ["NASM Certified Personal Trainer", "Precision Nutrition Level 1", "HIIT Specialist"],
    experience: "8+ years",
    clientsHelped: 500,
    availability: {
      monday: ["9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
      tuesday: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM"],
      wednesday: ["9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
      thursday: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM"],
      friday: ["9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM"],
      saturday: ["10:00 AM", "11:00 AM"],
      sunday: []
    },
    reviewsList: [
      { id: 1, name: "Jennifer K.", rating: 5, date: "2 weeks ago", comment: "Sarah completely transformed my approach to fitness. Lost 25 lbs in 3 months!" },
      { id: 2, name: "Michael T.", rating: 5, date: "1 month ago", comment: "Professional, knowledgeable, and incredibly motivating. Best trainer I've ever had." },
      { id: 3, name: "Ashley R.", rating: 4, date: "2 months ago", comment: "Great trainer with solid nutrition advice. Scheduling can be tight though." }
    ]
  },
  "2": {
    id: 2,
    name: "David Park",
    specialty: "Bodybuilding Coach",
    rating: 4.8,
    reviews: 89,
    price: 85,
    location: "Iron Paradise Gym, San Francisco",
    distance: "1.2 miles",
    bio: "Former competitive bodybuilder turned coach. I help clients build muscle, increase strength, and achieve the physique they've always wanted. My programs are designed for maximum muscle growth while maintaining proper form and preventing injury.",
    specializations: ["Bodybuilding", "Strength Training", "Muscle Hypertrophy", "Contest Prep"],
    certifications: ["ISSA Certified Personal Trainer", "Bodybuilding Specialist", "Sports Nutrition Certified"],
    experience: "10+ years",
    clientsHelped: 350,
    availability: {
      monday: ["6:00 AM", "7:00 AM", "5:00 PM", "6:00 PM", "7:00 PM"],
      tuesday: ["6:00 AM", "7:00 AM", "5:00 PM", "6:00 PM"],
      wednesday: ["6:00 AM", "7:00 AM", "5:00 PM", "6:00 PM", "7:00 PM"],
      thursday: ["6:00 AM", "7:00 AM", "5:00 PM", "6:00 PM"],
      friday: ["6:00 AM", "7:00 AM", "5:00 PM"],
      saturday: ["8:00 AM", "9:00 AM", "10:00 AM"],
      sunday: []
    },
    reviewsList: [
      { id: 1, name: "Chris M.", rating: 5, date: "1 week ago", comment: "David knows his stuff. Gained 15 lbs of muscle in 6 months." },
      { id: 2, name: "James L.", rating: 5, date: "3 weeks ago", comment: "Excellent form coaching. Really focuses on proper technique." },
      { id: 3, name: "Ryan P.", rating: 4, date: "1 month ago", comment: "Great results, intense workouts. Be prepared to work hard!" }
    ]
  }
}

const defaultTrainer = trainers["1"]

export default function TrainerProfilePage() {
  const params = useParams()
  const trainerId = params.id as string
  const trainer = trainers[trainerId as keyof typeof trainers] || defaultTrainer

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/trainers" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Trainers</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-32 h-32 rounded-2xl bg-secondary flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{trainer.name}</h1>
                      <p className="text-muted-foreground">{trainer.specialty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">${trainer.price}</p>
                      <p className="text-sm text-muted-foreground">per session</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-primary fill-primary" />
                      <span className="font-medium text-foreground">{trainer.rating}</span>
                      <span className="text-muted-foreground">({trainer.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{trainer.distance}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{trainer.experience}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="about" className="space-y-6">
                <TabsList className="bg-secondary w-full justify-start">
                  <TabsTrigger value="about" className="data-[state=active]:bg-background">About</TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-background">Reviews</TabsTrigger>
                  <TabsTrigger value="availability" className="data-[state=active]:bg-background">Availability</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Bio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{trainer.bio}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Specializations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {trainer.specializations.map((spec) => (
                          <span key={spec} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Certifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {trainer.certifications.map((cert) => (
                        <div key={cert} className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-primary" />
                          <span className="text-card-foreground">{cert}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-card-foreground">{trainer.location}</p>
                          <p className="text-sm text-muted-foreground">{trainer.distance} from you</p>
                        </div>
                      </div>
                      <div className="mt-4 h-48 bg-secondary rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground">Map Preview</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 text-primary fill-primary" />
                      <span className="text-2xl font-bold text-foreground">{trainer.rating}</span>
                      <span className="text-muted-foreground">({trainer.reviews} reviews)</span>
                    </div>
                  </div>

                  {trainer.reviewsList.map((review) => (
                    <Card key={review.id} className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary" />
                            <div>
                              <p className="font-medium text-card-foreground">{review.name}</p>
                              <p className="text-sm text-muted-foreground">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="availability" className="space-y-4">
                  <p className="text-muted-foreground">Select a day to see available time slots</p>
                  {days.map((day) => (
                    <Card key={day} className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-card-foreground capitalize">{day}</h3>
                          {trainer.availability[day].length === 0 && (
                            <span className="text-sm text-muted-foreground">Not available</span>
                          )}
                        </div>
                        {trainer.availability[day].length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {trainer.availability[day].map((time) => (
                              <button
                                key={time}
                                className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-card border-border">
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">${trainer.price}</p>
                      <p className="text-muted-foreground">per session (60 min)</p>
                    </div>

                    <div className="space-y-3 py-4 border-y border-border">
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="text-card-foreground">Free consultation call</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="text-card-foreground">Personalized training plan</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="text-card-foreground">Progress tracking</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="text-card-foreground">Chat support between sessions</span>
                      </div>
                    </div>

                    <Link href={`/booking/${trainer.id}`} className="block">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                        <Calendar className="w-5 h-5 mr-2" />
                        Book Session
                      </Button>
                    </Link>
                    
                    <Link href="/messages" className="block">
                      <Button variant="outline" className="w-full border-border text-foreground hover:bg-secondary" size="lg">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Message Trainer
                      </Button>
                    </Link>

                    <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
                      <Dumbbell className="w-4 h-4" />
                      <span>{trainer.clientsHelped}+ clients trained</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
