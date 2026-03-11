"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Check,
  X,
  Eye,
  Clock,
  Mail,
  Award,
  Briefcase,
  MapPin,
  DollarSign,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"
import { approveTrainer, rejectTrainer } from "@/app/admin/actions"

type ApplicationStatus = "pending" | "approved" | "rejected"

interface Application {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  location?: string
  specializations: string[]
  certifications: string[]
  experience?: string
  hourly_rate?: number
  bio?: string
  appliedAt: string
  status: ApplicationStatus
}

function formatAppliedAt(createdAt: string | null): string {
  if (!createdAt) return "Recently"
  const d = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | ApplicationStatus>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      setLoadError(null)
      const { data, error } = await supabase
        .from("trainer_applications")
        .select("id, user_id, name, email, phone, location, specializations, certifications, experience, hourly_rate, bio, status, created_at")
        .order("created_at", { ascending: false })
      if (error) {
        const msg = error.message || error.code || "Unknown error"
        console.error("Error loading trainer applications:", msg, error)
        setLoadError(
          "Could not load applications. Create the trainer_applications table and RLS policies (see docs/SCHEMA-trainer-applications.md)."
        )
        setApplications([])
        setLoading(false)
        return
      }
      const list: Application[] = (data ?? []).map((row: Record<string, unknown>) => ({
        id: String(row.id),
        user_id: String(row.user_id),
        name: String(row.name ?? ""),
        email: String(row.email ?? ""),
        phone: row.phone != null ? String(row.phone) : undefined,
        location: row.location != null ? String(row.location) : undefined,
        specializations: Array.isArray(row.specializations) ? (row.specializations as string[]) : [],
        certifications: Array.isArray(row.certifications) ? (row.certifications as string[]) : [],
        experience: row.experience != null ? String(row.experience) : undefined,
        hourly_rate: row.hourly_rate != null ? Number(row.hourly_rate) : undefined,
        bio: row.bio != null ? String(row.bio) : undefined,
        appliedAt: formatAppliedAt(row.created_at as string | null),
        status: (row.status as ApplicationStatus) ?? "pending",
      }))
      setApplications(list)
      setLoading(false)
    }
    fetchApplications()
  }, [])

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const pendingCount = applications.filter((a) => a.status === "pending").length
  const approvedCount = applications.filter((a) => a.status === "approved").length
  const rejectedCount = applications.filter((a) => a.status === "rejected").length

  const handleApprove = async (id: string) => {
    setActionError(null)
    const app = applications.find((a) => a.id === id)
    if (!app) return
    const result = await approveTrainer(id, app.user_id)
    if (result?.error) {
      setActionError(result.error)
      return
    }
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "approved" as ApplicationStatus } : a))
    )
    setIsDialogOpen(false)
    setSelectedApplication(null)
  }

  const handleReject = async (id: string) => {
    setActionError(null)
    const app = applications.find((a) => a.id === id)
    if (!app) return
    const result = await rejectTrainer(id, app.user_id)
    if (result?.error) {
      setActionError(result.error)
      return
    }
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected" as ApplicationStatus } : a))
    )
    setIsRejectDialogOpen(false)
    setIsDialogOpen(false)
    setSelectedApplication(null)
    setRejectReason("")
  }

  const openRejectDialog = () => {
    setIsRejectDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trainer Applications</h1>
          <p className="text-muted-foreground mt-1">Review and manage trainer applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <X className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-secondary border-border text-foreground hover:bg-muted">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterStatus === "all" ? "All Status" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem onClick={() => setFilterStatus("all")} className="text-foreground hover:bg-secondary">
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")} className="text-foreground hover:bg-secondary">
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("approved")} className="text-foreground hover:bg-secondary">
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("rejected")} className="text-foreground hover:bg-secondary">
                  Rejected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground">Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadError && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-foreground mb-4">
              {loadError}
            </div>
          )}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {loadError
                  ? "Fix the issue above and refresh the page."
                  : "No applications found. Trainer applications from signup appear here once the trainer_applications table exists (see docs/SCHEMA-trainer-applications.md)."}
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {application.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{application.name}</h4>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          application.status === "pending"
                            ? "bg-amber-500/10 text-amber-500 border-0"
                            : application.status === "approved"
                            ? "bg-green-500/10 text-green-500 border-0"
                            : "bg-red-500/10 text-red-500 border-0"
                        }`}
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{application.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {application.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {application.location}
                        </div>
                      )}
                      {application.experience && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Briefcase className="h-3 w-3" />
                          {application.experience}
                        </div>
                      )}
                      {application.hourly_rate != null && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          ${application.hourly_rate}/hr
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {application.specializations.slice(0, 3).map((spec) => (
                        <Badge key={spec} variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {application.appliedAt}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedApplication(application)
                      setIsDialogOpen(true)
                    }}
                    className="bg-transparent border-border text-foreground hover:bg-secondary"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                  {application.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(application.id)}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedApplication(application)
                          openRejectDialog()
                        }}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Application Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">Application Details</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Review the trainer application from {selectedApplication.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {actionError && (
                  <p className="text-sm text-destructive">{actionError}</p>
                )}
                {/* Applicant Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary text-xl">
                      {selectedApplication.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{selectedApplication.name}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {selectedApplication.email}
                    </div>
                    {selectedApplication.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {selectedApplication.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                {(selectedApplication.experience != null || selectedApplication.hourly_rate != null) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedApplication.experience != null && (
                      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Briefcase className="h-4 w-4" />
                          <span className="text-sm">Experience</span>
                        </div>
                        <p className="font-semibold text-foreground">{selectedApplication.experience}</p>
                      </div>
                    )}
                    {selectedApplication.hourly_rate != null && (
                      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm">Hourly Rate</span>
                        </div>
                        <p className="font-semibold text-foreground">${selectedApplication.hourly_rate}/hour</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Specializations */}
                {selectedApplication.specializations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary" className="bg-primary/10 text-primary border-0">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {selectedApplication.certifications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.certifications.map((cert) => (
                        <Badge key={cert} variant="outline" className="border-border text-foreground">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedApplication.bio && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">About</h4>
                    <p className="text-muted-foreground leading-relaxed">{selectedApplication.bio}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-2">
                {selectedApplication.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={openRejectDialog}
                      className="bg-transparent border-red-500/30 text-red-500 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedApplication.id)}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Application
                    </Button>
                  </>
                )}
                {selectedApplication.status !== "pending" && (
                  <Badge
                    className={`${
                      selectedApplication.status === "approved"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {selectedApplication.status === "approved" ? "Approved" : "Rejected"}
                  </Badge>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Reject Application</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to reject this application? Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectReason" className="text-foreground">Rejection Reason</Label>
            <Textarea
              id="rejectReason"
              placeholder="Enter the reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              className="bg-transparent border-border text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedApplication && handleReject(selectedApplication.id)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
