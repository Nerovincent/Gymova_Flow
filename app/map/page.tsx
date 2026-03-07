"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  MapPin, 
  Star, 
  List,
  X,
  Navigation,
  Dumbbell,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useState } from "react"

const trainers = [
  {
    id: 1,
    name: "Sarah Miller",
    specialty: "Weight Loss",
    rating: 4.9,
    reviews: 124,
    price: 75,
    distance: "0.8 mi",
    lat: 37.7849,
    lng: -122.4094
  },
  {
    id: 2,
    name: "David Park",
    specialty: "Bodybuilding",
    rating: 4.8,
    reviews: 89,
    price: 85,
    distance: "1.2 mi",
    lat: 37.7599,
    lng: -122.4148
  },
  {
    id: 3,
    name: "Emma Roberts",
    specialty: "CrossFit",
    rating: 4.9,
    reviews: 156,
    price: 80,
    distance: "1.5 mi",
    lat: 37.7749,
    lng: -122.3994
  },
  {
    id: 4,
    name: "Mike Thompson",
    specialty: "Strength Training",
    rating: 4.7,
    reviews: 98,
    price: 70,
    distance: "2.0 mi",
    lat: 37.8024,
    lng: -122.4394
  },
  {
    id: 5,
    name: "Lisa Chen",
    specialty: "HIIT & Cardio",
    rating: 4.8,
    reviews: 112,
    price: 65,
    distance: "2.3 mi",
    lat: 37.7924,
    lng: -122.4344
  },
  {
    id: 6,
    name: "Carlos Rodriguez",
    specialty: "Boxing & MMA",
    rating: 4.8,
    reviews: 143,
    price: 75,
    distance: "0.5 mi",
    lat: 37.7824,
    lng: -122.4169
  }
]

function MapMarker({ 
  trainer, 
  isSelected, 
  onClick 
}: { 
  trainer: typeof trainers[0]
  isSelected: boolean
  onClick: () => void
}) {
  const x = ((trainer.lng + 122.45) * 800)
  const y = ((37.82 - trainer.lat) * 800)
  
  return (
    <button
      onClick={onClick}
      className={`absolute transform -translate-x-1/2 -translate-y-full transition-all ${
        isSelected ? "z-20 scale-125" : "z-10 hover:scale-110"
      }`}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <div className={`relative ${isSelected ? "animate-bounce" : ""}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
          isSelected ? "bg-primary" : "bg-card border-2 border-primary"
        }`}>
          <MapPin className={`w-5 h-5 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
        </div>
        {isSelected && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45 -z-10" />
        )}
      </div>
    </button>
  )
}

function TrainerListCard({ 
  trainer, 
  isSelected, 
  onClick 
}: { 
  trainer: typeof trainers[0]
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg transition-colors ${
        isSelected 
          ? "bg-primary/10 border border-primary" 
          : "bg-card border border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-secondary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{trainer.name}</h3>
          <p className="text-sm text-muted-foreground">{trainer.specialty}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-primary fill-primary" />
              <span className="text-xs text-foreground">{trainer.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">{trainer.distance}</span>
            <span className="text-xs font-medium text-primary">${trainer.price}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTrainer, setSelectedTrainer] = useState<number | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selected = trainers.find(t => t.id === selectedTrainer)

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-full mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground hidden sm:inline">GymovaFlow</span>
            </Link>
          </div>
          
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/trainers">
              <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary">
                <List className="w-4 h-4 mr-2" />
                List View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16 relative">
        <div className="absolute inset-0 bg-secondary">
          <div className="relative w-full h-full overflow-hidden">
            <div 
              className="absolute inset-0" 
              style={{
                background: `
                  linear-gradient(90deg, var(--border) 1px, transparent 1px),
                  linear-gradient(var(--border) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px"
              }}
            />
            
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
              <Button size="icon" variant="secondary" className="bg-card border border-border">
                <Navigation className="w-4 h-4" />
              </Button>
            </div>

            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 z-30">
              <p className="text-xs text-muted-foreground">San Francisco, CA</p>
              <p className="text-sm font-medium text-foreground">{filteredTrainers.length} trainers nearby</p>
            </div>

            {filteredTrainers.map((trainer) => (
              <MapMarker
                key={trainer.id}
                trainer={trainer}
                isSelected={selectedTrainer === trainer.id}
                onClick={() => setSelectedTrainer(trainer.id)}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="absolute top-1/2 -translate-y-1/2 z-40 w-6 h-16 bg-card border border-border rounded-r-lg flex items-center justify-center transition-all"
          style={{ left: isPanelOpen ? "384px" : "0" }}
        >
          {isPanelOpen ? (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <div 
          className={`absolute top-0 left-0 h-full w-96 bg-background border-r border-border z-30 transition-transform duration-300 ${
            isPanelOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Trainers Near You</h2>
              <p className="text-sm text-muted-foreground">{filteredTrainers.length} results</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredTrainers.map((trainer) => (
                <TrainerListCard
                  key={trainer.id}
                  trainer={trainer}
                  isSelected={selectedTrainer === trainer.id}
                  onClick={() => setSelectedTrainer(trainer.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {selected && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 lg:left-auto lg:translate-x-0 lg:right-4">
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-4">
                <button
                  onClick={() => setSelectedTrainer(null)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-secondary flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground">{selected.name}</h3>
                    <p className="text-sm text-muted-foreground">{selected.specialty}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-sm text-card-foreground">{selected.rating}</span>
                        <span className="text-sm text-muted-foreground">({selected.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {selected.distance}
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary mt-2">${selected.price}/session</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <Link href={`/trainers/${selected.id}`} className="flex-1">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/booking/${selected.id}`}>
                    <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
