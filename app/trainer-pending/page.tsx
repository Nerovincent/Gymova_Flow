"use client"

import Link from "next/link"
import { Clock, CheckCircle, XCircle, Mail, ArrowLeft, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TrainerPendingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="h-16 border-b border-border flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">GymovaFlow</span>
        </Link>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg w-full space-y-8">

          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 bg-amber-500/10 rounded-full blur-2xl" />
              <div className="relative h-28 w-28 rounded-full bg-amber-500/10 flex items-center justify-center border-2 border-amber-500/30">
                <Clock className="h-14 w-14 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-foreground">Application Under Review</h1>
            <p className="text-muted-foreground leading-relaxed">
              Your trainer application has been received and is currently being reviewed by our admin team.
              This usually takes <span className="text-foreground font-medium">2–3 business days</span>.
            </p>
          </div>

          {/* Status steps */}
          <div className="bg-secondary/50 rounded-2xl border border-border p-6 space-y-4">
            <p className="text-sm font-semibold text-foreground uppercase tracking-wide">Application status</p>

            <div className="space-y-3">
              {/* Step 1 - done */}
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Application submitted</p>
                  <p className="text-xs text-muted-foreground">We received your details and credentials</p>
                </div>
              </div>

              {/* Connector */}
              <div className="ml-4 h-4 w-px bg-amber-500/40" />

              {/* Step 2 - in progress */}
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Admin review in progress</p>
                  <p className="text-xs text-muted-foreground">Our team is verifying your application</p>
                </div>
              </div>

              {/* Connector */}
              <div className="ml-4 h-4 w-px bg-border" />

              {/* Step 3 - pending */}
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approval &amp; access granted</p>
                  <p className="text-xs text-muted-foreground">You&apos;ll be able to log in and access your trainer dashboard</p>
                </div>
              </div>
            </div>
          </div>

          {/* What to expect */}
          <div className="flex items-start gap-3 bg-primary/5 rounded-xl border border-primary/20 p-4">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once approved, you&apos;ll receive a confirmation and can log in to access your full trainer dashboard.
              If your application is rejected you&apos;ll be notified with a reason.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link href="/login">
              <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                Check again — try to log in
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="w-full h-12 bg-transparent border-border text-foreground hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to home
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
