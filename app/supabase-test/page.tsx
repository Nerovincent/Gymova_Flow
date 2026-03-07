"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function SupabaseTestPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const checkConnection = async () => {
      setStatus("loading")
      setMessage("")

      // This just checks that the client can talk to Supabase.
      // It does NOT require an authenticated user.
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setStatus("error")
        setMessage(error.message)
      } else {
        setStatus("ok")
        setMessage(
          data.session
            ? "Connected to Supabase and found an authenticated user session."
            : "Connected to Supabase successfully. No active user session (this is expected if you haven't set up auth yet)."
        )
      }
    }

    void checkConnection()
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-lg text-center space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Supabase Connection Test</h1>
        <p className="text-sm text-muted-foreground">
          This page checks that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured correctly.
        </p>
        <p className="font-mono text-sm">
          Status:{" "}
          <span className="font-bold">
            {status === "idle" && "idle"}
            {status === "loading" && "checking..."}
            {status === "ok" && "ok ✅"}
            {status === "error" && "error ❌"}
          </span>
        </p>
        {message && <p className="text-sm break-words">{message}</p>}
      </div>
    </main>
  )
}

