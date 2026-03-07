"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Send,
  Sparkles,
  ArrowLeft,
  User,
  Dumbbell,
  Lightbulb,
  Target,
  Users,
  RefreshCw,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"

const examplePrompts = [
  {
    icon: Lightbulb,
    title: "Create a workout routine",
    prompt: "Create a beginner workout routine for building muscle"
  },
  {
    icon: Target,
    title: "Help me lose weight",
    prompt: "Help me create a plan to lose 10 pounds in 2 months"
  },
  {
    icon: Users,
    title: "Find the right trainer",
    prompt: "Suggest trainers for muscle gain and strength training"
  },
  {
    icon: Dumbbell,
    title: "Exercise suggestions",
    prompt: "What are the best exercises for building core strength?"
  }
]

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
}

const initialMessages: Message[] = []

export default function AICoachPage() {
  const router = useRouter()
  const { session, loading } = useAuth()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login")
    }
  }, [loading, session, router])

  if (loading || (!session && typeof window !== "undefined")) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground">Checking your session...</span>
      </div>
    )
  }

  const handleSend = async (message: string) => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "Create a beginner workout routine for building muscle": `Great! Here's a beginner-friendly muscle-building routine:

**3-Day Split Program**

**Day 1 - Push (Chest, Shoulders, Triceps)**
- Bench Press: 3 sets x 8-10 reps
- Shoulder Press: 3 sets x 10 reps
- Incline Dumbbell Press: 3 sets x 10 reps
- Tricep Dips: 3 sets x 12 reps
- Lateral Raises: 3 sets x 12 reps

**Day 2 - Pull (Back, Biceps)**
- Pull-ups or Lat Pulldown: 3 sets x 8-10 reps
- Barbell Rows: 3 sets x 10 reps
- Face Pulls: 3 sets x 12 reps
- Bicep Curls: 3 sets x 12 reps
- Hammer Curls: 3 sets x 12 reps

**Day 3 - Legs**
- Squats: 4 sets x 8-10 reps
- Romanian Deadlifts: 3 sets x 10 reps
- Leg Press: 3 sets x 12 reps
- Leg Curls: 3 sets x 12 reps
- Calf Raises: 4 sets x 15 reps

Rest 1-2 minutes between sets. Train 3 days per week with rest days in between. Would you like me to recommend a trainer who can help you perfect your form?`,

        "Help me create a plan to lose 10 pounds in 2 months": `Here's a sustainable plan to lose 10 pounds in 2 months:

**Nutrition Guidelines**
- Create a 500 calorie deficit daily (leads to ~1 lb/week loss)
- Aim for 0.8-1g protein per pound of body weight
- Eat plenty of vegetables and fiber
- Stay hydrated (aim for 8+ glasses of water daily)
- Limit processed foods and added sugars

**Exercise Plan**
- 3-4 strength training sessions per week
- 2-3 cardio sessions (30-45 min each)
- Daily 10,000 steps

**Weekly Schedule Example**
- Monday: Strength (Full Body)
- Tuesday: HIIT Cardio (20 min)
- Wednesday: Rest or Light Walk
- Thursday: Strength (Full Body)
- Friday: Steady-State Cardio (45 min)
- Saturday: Strength (Full Body)
- Sunday: Active Recovery

**Tips for Success**
- Track your food intake
- Sleep 7-9 hours per night
- Take progress photos weekly
- Be patient and consistent

Would you like me to connect you with a weight loss specialist trainer?`,

        "Suggest trainers for muscle gain and strength training": `Based on your goal of muscle gain and strength training, I recommend these trainers:

**1. David Park - Bodybuilding Coach**
⭐ 4.8 (89 reviews) | $85/session
Specializes in: Bodybuilding, Strength Training, Muscle Hypertrophy
Location: 1.2 miles away
"Former competitive bodybuilder with 10+ years of coaching experience."

**2. Mike Thompson - Strength & Conditioning**
⭐ 4.7 (98 reviews) | $70/session
Specializes in: Strength Training, Athletic Performance
Location: 2.0 miles away
"Certified strength coach focused on building raw strength."

**3. Sarah Miller - Weight Loss & Muscle Toning**
⭐ 4.9 (124 reviews) | $75/session
Specializes in: Weight Loss, HIIT, Nutrition
Location: 0.8 miles away
"Great for beginners looking to build lean muscle."

Would you like me to help you book a session with any of these trainers?`,

        "What are the best exercises for building core strength?": `Here are the best exercises for building core strength:

**Beginner Core Exercises**
1. **Dead Bug** - 3 sets x 10 reps each side
   - Great for learning core bracing
   
2. **Plank** - 3 sets x 30-60 seconds
   - Foundation of core stability
   
3. **Bird Dog** - 3 sets x 10 reps each side
   - Improves balance and coordination

**Intermediate Exercises**
4. **Hollow Body Hold** - 3 sets x 20-30 seconds
   - Builds anterior core strength
   
5. **Pallof Press** - 3 sets x 10 reps each side
   - Anti-rotation strength
   
6. **Ab Wheel Rollout** - 3 sets x 8-10 reps
   - Advanced core stability

**Advanced Exercises**
7. **Hanging Leg Raises** - 3 sets x 10-12 reps
8. **L-Sit** - 3 sets x 15-20 seconds
9. **Dragon Flag** - 3 sets x 5-8 reps

**Pro Tips:**
- Focus on quality over quantity
- Breathe properly - exhale on exertion
- Don't neglect obliques and lower back
- Train core 2-3 times per week

Want me to create a complete core workout program for you?`
      }

      const defaultResponse = `I'd be happy to help you with that! Here are some thoughts:

Based on your question, I recommend:

1. **Start with a clear goal** - Define what success looks like for you
2. **Create a consistent schedule** - Consistency beats intensity
3. **Track your progress** - What gets measured gets improved
4. **Consider working with a trainer** - Expert guidance accelerates results

Would you like me to:
- Create a personalized workout plan?
- Recommend trainers in your area?
- Provide nutrition guidance?

Just let me know how I can help further!`

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: responses[message] || defaultResponse
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleExampleClick = (prompt: string) => {
    handleSend(prompt)
  }

  const handleNewChat = () => {
    setMessages([])
    setInput("")
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">AI Fitness Coach</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleNewChat}>
            <RefreshCw className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-16 pb-24 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">AI Fitness Coach</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Ask me anything about fitness, workouts, nutrition, or finding the right trainer for your goals.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example.prompt)}
                    className="text-left p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <example.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-card-foreground">{example.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{example.prompt}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${message.role === "user" ? "order-1" : ""}`}>
                    <Card className={`${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border-border"}`}>
                      <CardContent className="p-4">
                        <p className={`text-sm whitespace-pre-wrap ${message.role === "user" ? "text-primary-foreground" : "text-card-foreground"}`}>
                          {message.content}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Ask me anything about fitness..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend(input)}
              disabled={isLoading}
              className="flex-1 bg-input border-border"
            />
            <Button 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI Coach provides general fitness guidance. Consult a professional for personalized advice.
          </p>
        </div>
      </div>
    </div>
  )
}
