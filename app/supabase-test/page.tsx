"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type StageStatus = "idle" | "loading" | "ok" | "error"

type Stage = {
  id: string
  label: string
  status: StageStatus
  message: string
}

const initialStages: Stage[] = [
  { id: "env", label: "1. Environment variables", status: "idle", message: "" },
  { id: "auth", label: "2. Auth API (getSession)", status: "idle", message: "" },
  { id: "db", label: "3. Database (trainers table)", status: "idle", message: "" },
]

export default function SupabaseTestPage() {
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [running, setRunning] = useState(false)

  const setStage = (id: string, status: StageStatus, message: string) => {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, message } : s))
    )
  }

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setRunning(true)

      // —— Stage 1: Env vars (client already imported; if we're here, URL/Key were present at build)
      setStage("env", "loading", "")
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (cancelled) return
      if (!url || !key) {
        setStage("env", "error", "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
      } else {
        setStage("env", "ok", `URL and anon key are set (URL: ${url.slice(0, 30)}...)`)
      }

      // —— Stage 2: Auth
      setStage("auth", "loading", "")
      const { data: authData, error: authError } = await supabase.auth.getSession()
      if (cancelled) return
      if (authError) {
        setStage("auth", "error", authError.message)
      } else {
        const hasSession = !!authData.session
        setStage(
          "auth",
          "ok",
          hasSession
            ? "Connected. Active user session found."
            : "Connected. No active session (expected if you haven’t signed in)."
        )
      }

      // —— Stage 3: Database (trainers table)
      setStage("db", "loading", "")
      const { data: dbData, error: dbError } = await supabase
        .from("trainers")
        .select("id")
        .limit(1)
      if (cancelled) return
      if (dbError) {
        setStage("db", "error", dbError.message)
      } else {
        const count = Array.isArray(dbData) ? dbData.length : 0
        setStage("db", "ok", `trainers table reachable. Sample query returned ${count} row(s).`)
      }

      setRunning(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const allOk = stages.every((s) => s.status === "ok")
  const anyError = stages.some((s) => s.status === "error")

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-6 p-6 rounded-xl border border-border bg-card">
        <h1 className="text-2xl font-semibold text-foreground">
          Supabase connection test
        </h1>
        <p className="text-sm text-muted-foreground">
          Checks that Supabase is wired correctly: env, auth, and the{" "}
          <code className="font-mono text-xs bg-muted px-1 rounded">trainers</code> table.
        </p>

        <div className="space-y-3 text-left">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
            >
              <span className="shrink-0 mt-0.5">
                {stage.status === "idle" && "○"}
                {stage.status === "loading" && "…"}
                {stage.status === "ok" && "✅"}
                {stage.status === "error" && "❌"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm">{stage.label}</p>
                {stage.message && (
                  <p className="text-xs text-muted-foreground mt-1 wrap-break-word">
                    {stage.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {running && (
          <p className="text-sm text-muted-foreground">Running checks…</p>
        )}
        {!running && allOk && (
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            All stages passed. Supabase is connected and working.
          </p>
        )}
        {!running && anyError && (
          <p className="text-sm font-medium text-destructive">
            Fix the failed stage(s) above. Check .env.local and Supabase project (tables & RLS).
          </p>
        )}
      </div>
    </main>
  )
}
