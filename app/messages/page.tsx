"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Dumbbell,
  Check,
  CheckCheck,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"

const conversations = [
  {
    id: 1,
    name: "Sarah Miller",
    specialty: "Weight Loss Specialist",
    lastMessage: "Great! I'll see you tomorrow at 2pm for our session.",
    time: "2m ago",
    unread: 2,
    online: true
  },
  {
    id: 2,
    name: "David Park",
    specialty: "Bodybuilding Coach",
    lastMessage: "Don't forget to bring your resistance bands!",
    time: "1h ago",
    unread: 0,
    online: true
  },
  {
    id: 3,
    name: "Emma Roberts",
    specialty: "CrossFit Trainer",
    lastMessage: "How did the workout feel today?",
    time: "3h ago",
    unread: 0,
    online: false
  },
  {
    id: 4,
    name: "Mike Thompson",
    specialty: "Strength Training",
    lastMessage: "Here's the training plan I mentioned...",
    time: "1d ago",
    unread: 0,
    online: false
  },
  {
    id: 5,
    name: "Lisa Chen",
    specialty: "HIIT & Cardio",
    lastMessage: "You're making great progress!",
    time: "2d ago",
    unread: 0,
    online: false
  }
]

const messages = [
  {
    id: 1,
    sender: "trainer",
    content: "Hey Alex! How are you feeling after yesterday's session?",
    time: "10:30 AM",
    read: true
  },
  {
    id: 2,
    sender: "user",
    content: "Hi Sarah! I'm feeling good, just a bit sore in my legs from the squats.",
    time: "10:32 AM",
    read: true
  },
  {
    id: 3,
    sender: "trainer",
    content: "That's completely normal! It means those muscles are getting stronger. Make sure you're stretching and staying hydrated.",
    time: "10:35 AM",
    read: true
  },
  {
    id: 4,
    sender: "user",
    content: "Thanks for the tip! I've been drinking lots of water. Quick question - should I be taking any supplements?",
    time: "10:38 AM",
    read: true
  },
  {
    id: 5,
    sender: "trainer",
    content: "Great question! For your goals, I'd recommend a good quality protein powder and maybe some BCAAs. We can discuss this more in our next session. Speaking of which, are we still on for tomorrow at 2pm?",
    time: "10:42 AM",
    read: true
  },
  {
    id: 6,
    sender: "user",
    content: "Yes, 2pm works perfectly for me!",
    time: "11:15 AM",
    read: true
  },
  {
    id: 7,
    sender: "trainer",
    content: "Great! I'll see you tomorrow at 2pm for our session.",
    time: "11:18 AM",
    read: true
  }
]

function ConversationItem({ 
  conversation, 
  isSelected, 
  onClick 
}: { 
  conversation: typeof conversations[0]
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-border transition-colors ${
        isSelected ? "bg-secondary" : "hover:bg-secondary/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-muted" />
          {conversation.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground truncate">{conversation.name}</h3>
            <span className="text-xs text-muted-foreground">{conversation.time}</span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
        </div>
        {conversation.unread > 0 && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs text-primary-foreground">{conversation.unread}</span>
          </div>
        )}
      </div>
    </button>
  )
}

function MessageBubble({ message }: { message: typeof messages[0] }) {
  const isUser = message.sender === "user"
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] ${isUser ? "order-2" : ""}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-secondary text-foreground rounded-bl-md"
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isUser ? "justify-end" : ""}`}>
          <span className="text-xs text-muted-foreground">{message.time}</span>
          {isUser && (
            message.read 
              ? <CheckCheck className="w-3 h-3 text-primary" />
              : <Check className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const router = useRouter()
  const { session, loading } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showConversations, setShowConversations] = useState(true)

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

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setNewMessage("")
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border lg:hidden">
        <div className="px-4 h-16 flex items-center justify-between">
          {!showConversations ? (
            <>
              <button onClick={() => setShowConversations(true)} className="flex items-center gap-2 text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary" />
                <span className="font-medium text-foreground">{selectedConversation.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">Messages</span>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 pt-16 lg:pt-0 flex">
        <aside className={`
          w-full lg:w-80 border-r border-border bg-background shrink-0
          ${showConversations ? "block" : "hidden lg:block"}
        `}>
          <div className="h-full flex flex-col">
            <div className="hidden lg:flex items-center gap-2 p-4 border-b border-border">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">Messages</span>
              </Link>
            </div>
            
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversation.id === conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation)
                    setShowConversations(false)
                  }}
                />
              ))}
            </div>
          </div>
        </aside>

        <div className={`
          flex-1 flex flex-col
          ${showConversations ? "hidden lg:flex" : "flex"}
        `}>
          <div className="hidden lg:flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-secondary" />
                {selectedConversation.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
              <div>
                <h2 className="font-medium text-foreground">{selectedConversation.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedConversation.specialty}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-center">
              <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">Today</span>
            </div>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-input border-border"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
