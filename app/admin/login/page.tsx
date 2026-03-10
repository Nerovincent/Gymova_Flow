"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Dumbbell, LogIn } from "lucide-react"
import { adminLogin } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_: { error?: string } | null, formData: FormData) => {
      const result = await adminLogin(formData)
      return result
    },
    null as { error?: string } | null
  )

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <Link href="/" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">GymovaFlow</span>
        </Link>

        <Card className="bg-card border-border">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Admin sign in</CardTitle>
            <CardDescription>
              Use your admin credentials to access the panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@gymovaflow.com"
                  autoComplete="email"
                  required
                  className="bg-background border-border"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="bg-background border-border"
                  disabled={isPending}
                />
              </div>
              {state?.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in
                  </>
                )}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Default: admin@gymovaflow.com / admin123. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local to override.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
