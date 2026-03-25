"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  Image as ImageIcon,
  Paperclip,
  Send,
  Sparkles,
  User,
  Dumbbell,
  Lightbulb,
  Target,
  Users,
  RefreshCw,
  X,
} from "lucide-react"
import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { AthleteDashboardShell } from "@/components/dashboard/AthleteDashboardShell"
import { supabase } from "@/lib/supabaseClient"

const ATTACHMENT_BUCKET = "ai-chat-attachments"
const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPTED_ATTACHMENT_TYPES = ["application/pdf", "image/"]

interface AttachmentMeta {
  id: string
  name: string
  mimeType: string
  size: number
  path: string
  url: string
}

// Lightweight markdown renderer: bold, headers, unordered lists
function MarkdownContent({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // H3 ###
    if (line.startsWith("### ")) {
      elements.push(
        <p key={i} className="font-semibold mt-3 mb-1">
          {renderInline(line.slice(4))}
        </p>
      )
    }
    // H2 ##
    else if (line.startsWith("## ")) {
      elements.push(
        <p key={i} className="font-bold mt-4 mb-1">
          {renderInline(line.slice(3))}
        </p>
      )
    }
    // H1 #
    else if (line.startsWith("# ")) {
      elements.push(
        <p key={i} className="font-bold text-base mt-4 mb-1">
          {renderInline(line.slice(2))}
        </p>
      )
    }
    // Unordered list - or *
    else if (/^[-*] /.test(line)) {
      elements.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className="shrink-0 mt-px">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      )
    }
    // Numbered list
    else if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)$/)
      if (match) {
        elements.push(
          <div key={i} className="flex gap-2 my-0.5">
            <span className="shrink-0 mt-px">{match[1]}.</span>
            <span>{renderInline(match[2])}</span>
          </div>
        )
      }
    }
    // Empty line = spacer
    else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />)
    }
    // Normal paragraph
    else {
      elements.push(
        <p key={i} className="my-0.5">
          {renderInline(line)}
        </p>
      )
    }
  }

  return <div className={`text-sm leading-relaxed ${className ?? ""}`}>{elements}</div>
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

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
  attachments?: AttachmentMeta[]
}

const initialMessages: Message[] = []

function AICoachContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const sentInitialRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const isAcceptedAttachmentType = (type: string) => {
    return ACCEPTED_ATTACHMENT_TYPES.some((accepted) =>
      accepted.endsWith("/") ? type.startsWith(accepted) : type === accepted
    )
  }

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return

    const next = Array.from(files).filter((file) => {
      if (!isAcceptedAttachmentType(file.type)) return false
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) return false
      return true
    })

    if (next.length === 0) return
    setPendingFiles((prev) => [...prev, ...next].slice(0, 4))
  }

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadAttachments = async (files: File[]): Promise<AttachmentMeta[]> => {
    const owner = user?.id ?? "anonymous"

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
        const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const path = `${owner}/${fileId}-${safeName}`

        const { error: uploadError } = await supabase.storage
          .from(ATTACHMENT_BUCKET)
          .upload(path, file, { upsert: false, contentType: file.type })

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const { data: signedData } = await supabase.storage
          .from(ATTACHMENT_BUCKET)
          .createSignedUrl(path, 60 * 60 * 24 * 7)

        const publicUrl = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path).data.publicUrl

        return {
          id: fileId,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          path,
          url: signedData?.signedUrl ?? publicUrl,
        }
      })
    )

    return uploaded
  }

  // Auto-send query from ?q= param (e.g. from dashboard quick-send)
  useEffect(() => {
    if (sentInitialRef.current) return
    const q = searchParams?.get("q")
    if (q) {
      sentInitialRef.current = true
      handleSend(q)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleSend = async (messageText?: string) => {
    const message = (messageText ?? input).trim()
    if (!message && pendingFiles.length === 0) return

    const filesToUpload = [...pendingFiles]
    setPendingFiles([])
    setInput("")
    setIsLoading(true)

    try {
      const attachments = filesToUpload.length > 0 ? await uploadAttachments(filesToUpload) : []

      const userMsg: Message = {
        id: Date.now(),
        role: "user",
        content: message || "Please analyze my attachment(s).",
        attachments,
      }

      const newMessages = [...messages, userMsg]
      setMessages(newMessages)

      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments?.map((a) => ({
              name: a.name,
              mimeType: a.mimeType,
              size: a.size,
              url: a.url,
            })),
          })),
        }),
      })
      const { reply } = await res.json()
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: reply }])
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I had trouble connecting. Please try again.",
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleClick = (prompt: string) => {
    handleSend(prompt)
  }

  const handleNewChat = () => {
    setMessages([])
    setInput("")
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col">
      <main className="flex-1 pb-6">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            {/* <p className="text-sm text-muted-foreground">Personalized guidance for workouts and nutrition</p> */}
            <Button variant="ghost" size="sm" onClick={handleNewChat}>
              <RefreshCw className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
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
            <div className="space-y-4 sm:space-y-5">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : ""}`}>
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[90%] sm:max-w-[80%] ${message.role === "user" ? "order-1" : ""}`}>
                    <Card className={message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none border-transparent shadow-sm"
                      : "bg-card border border-border rounded-2xl rounded-tl-none shadow-sm"
                    }>
                      <CardContent className="p-3 sm:p-3.5">
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mb-2 space-y-2">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="rounded-lg border border-white/20 bg-white/5 p-2">
                                {attachment.mimeType.startsWith("image/") ? (
                                  <a href={attachment.url} target="_blank" rel="noreferrer" className="block">
                                    <img
                                      src={attachment.url}
                                      alt={attachment.name}
                                      className="w-full max-h-40 object-cover rounded-md mb-2"
                                    />
                                  </a>
                                ) : null}
                                <div className="flex items-center gap-2 text-xs">
                                  {attachment.mimeType.startsWith("image/") ? (
                                    <ImageIcon className="w-3.5 h-3.5" />
                                  ) : (
                                    <FileText className="w-3.5 h-3.5" />
                                  )}
                                  <span className="truncate">{attachment.name}</span>
                                  <span className="opacity-80">{formatFileSize(attachment.size)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {message.role === "assistant" ? (
                          <MarkdownContent
                            text={message.content}
                            className="text-card-foreground"
                          />
                        ) : (
                          <p className="text-sm whitespace-pre-wrap text-primary-foreground">
                            {message.content}
                          </p>
                        )}
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
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                  </div>
                  <Card className="bg-card border border-border rounded-2xl rounded-tl-none shadow-sm">
                    <CardContent className="p-3">
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

      <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="border-border"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Attach image or PDF"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
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
              disabled={(!input.trim() && pendingFiles.length === 0) || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFileSelection(e.target.files)
              e.currentTarget.value = ""
            }}
          />

          {pendingFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {pendingFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs bg-background">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className="max-w-[180px] truncate text-foreground">{file.name}</span>
                  <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => removePendingFile(index)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-2">
            AI Coach provides general fitness guidance. Consult a professional for personalized advice.
          </p>
        </div>
      </div>
    </div>
  )
}

function AICoachFallback() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
      <span className="text-muted-foreground">Loading AI Coach...</span>
    </div>
  )
}

export default function AICoachPage() {
  return (
    <AthleteDashboardShell title="AI Coach" contentClassName="p-0">
      <Suspense fallback={<AICoachFallback />}>
        <AICoachContent />
      </Suspense>
    </AthleteDashboardShell>
  )
}
