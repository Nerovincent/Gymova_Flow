"use client"

import Link from "next/link"
import { XCircle, ArrowLeft, Dumbbell, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TrainerRejectedPage() {
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
              <div className="absolute -inset-6 bg-red-500/10 rounded-full blur-2xl" />
              <div className="relative h-28 w-28 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/30">
                <XCircle className="h-14 w-14 text-red-500" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-foreground">Application Not Approved</h1>
            <p className="text-muted-foreground leading-relaxed">
              Unfortunately your trainer application was not approved at this time.
              If you believe this is a mistake or would like more information, please reach out to our support team.
            </p>
          </div>

          {/* Contact info */}
          <div className="flex items-start gap-3 bg-secondary/50 rounded-xl border border-border p-4">
            <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Contact support</p>
              <p className="text-sm text-muted-foreground mt-1">
                Email us at{" "}
                <a href="mailto:support@gymovaflow.com" className="text-primary hover:underline">
                  support@gymovaflow.com
                </a>{" "}
                with your registered email and we&apos;ll look into it.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
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
