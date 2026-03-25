"use client"

import { AthleteDashboardShell } from "@/components/dashboard/AthleteDashboardShell"

export default function TrainerProfileLoading() {
  return (
    <AthleteDashboardShell title="Trainer Profile">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-32 h-32 rounded-2xl bg-secondary animate-pulse shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
                <div className="h-5 w-36 bg-secondary rounded animate-pulse" />
                <div className="h-6 w-24 bg-secondary rounded animate-pulse mt-4" />
              </div>
            </div>
            <div className="h-10 w-full max-w-md bg-secondary rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-32 bg-secondary rounded-xl animate-pulse" />
              <div className="h-24 bg-secondary rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="h-64 bg-secondary rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </AthleteDashboardShell>
  )
}
