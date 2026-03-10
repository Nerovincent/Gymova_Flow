import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserX } from "lucide-react"

export default function TrainerNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="bg-card border-border max-w-md w-full">
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          <div className="flex justify-center">
            <UserX className="w-16 h-16 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Trainer not found</h1>
          <p className="text-muted-foreground">
            This trainer doesn&apos;t exist or may have been removed.
          </p>
          <Link href="/trainers">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Back to Trainers
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
