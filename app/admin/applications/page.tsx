"use client"

import { useState } from "react"
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

type ApplicationStatus = "pending" | "approved" | "rejected"

interface Application {
  id: number
  name: string
  email: string
  avatar: string
  phone: string
  location: string
  specializations: string[]
  certifications: string[]
  experience: string
  hourlyRate: number
  bio: string
  appliedAt: string
  status: ApplicationStatus
}

const initialApplications: Application[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    email: "sarah.m@email.com",
    avatar: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=100&h=100&fit=crop&crop=face",
    phone: "+1 (555) 123-4567",
    location: "Los Angeles, CA",
    specializations: ["HIIT", "Weight Training", "Nutrition"],
    certifications: ["NASM-CPT", "ACE Certified"],
    experience: "5 years",
    hourlyRate: 85,
    bio: "Passionate about helping clients achieve their fitness goals through personalized training programs. Specialized in high-intensity interval training and strength conditioning. Former competitive athlete with a background in sports science.",
    appliedAt: "2 hours ago",
    status: "pending",
  },
  {
    id: 2,
    name: "James Rodriguez",
    email: "james.r@email.com",
    avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&h=100&fit=crop&crop=face",
    phone: "+1 (555) 234-5678",
    location: "Miami, FL",
    specializations: ["CrossFit", "Nutrition", "Strength Training"],
    certifications: ["CrossFit Level 2", "Precision Nutrition"],
    experience: "8 years",
    hourlyRate: 95,
    bio: "CrossFit coach with 8 years of experience training athletes of all levels. My approach combines functional fitness with proper nutrition guidance to deliver sustainable results. Competed in regional CrossFit games.",
    appliedAt: "5 hours ago",
    status: "pending",
  },
  {
    id: 3,
    name: "Emily Chen",
    email: "emily.c@email.com",
    avatar: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=100&h=100&fit=crop&crop=face",
    phone: "+1 (555) 345-6789",
    location: "San Francisco, CA",
    specializations: ["Yoga", "Pilates", "Flexibility"],
    certifications: ["RYT-500", "BASI Pilates"],
    experience: "6 years",
    hourlyRate: 75,
    bio: "Certified yoga instructor and Pilates teacher focused on mind-body connection. I help clients improve flexibility, reduce stress, and build core strength through mindful movement practices.",
    appliedAt: "1 day ago",
    status: "pending",
  },
  {
    id: 4,
    name: "Marcus Johnson",
    email: "marcus.j@email.com",
    avatar: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop&crop=face",
    phone: "+1 (555) 456-7890",
    location: "Chicago, IL",
    specializations: ["Bodybuilding", "Weight Training"],
    certifications: ["ISSA-CPT", "NASM-PES"],
    experience: "10 years",
    hourlyRate: 110,
    bio: "Professional bodybuilder and certified personal trainer with a decade of experience. Specialized in muscle building, contest prep, and body transformation programs for serious fitness enthusiasts.",
    appliedAt: "2 days ago",
    status: "pending",
  },
  {
    id: 5,
    name: "Lisa Wang",
    email: "lisa.w@email.com",
    avatar: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=100&h=100&fit=crop&crop=face",
    phone: "+1 (555) 567-8901",
    location: "Seattle, WA",
    specializations: ["Running", "Endurance", "HIIT"],
    certifications: ["RRCA Certified Coach", "ACE-CPT"],
    experience: "4 years",
    hourlyRate: 70,
    bio: "Marathon runner and endurance coach helping clients go from couch to 5K and beyond. My training programs focus on building sustainable running habits and preventing injuries.",
    appliedAt: "3 days ago",
    status: "approved",
  },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | ApplicationStatus>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const pendingCount = applications.filter((a) => a.status === "pending").length
  const approvedCount = applications.filter((a) => a.status === "approved").length
  const rejectedCount = applications.filter((a) => a.status === "rejected").length

  const handleApprove = (id: number) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "approved" as ApplicationStatus } : app))
    )
    setIsDialogOpen(false)
    setSelectedApplication(null)
  }

  const handleReject = (id: number) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "rejected" as ApplicationStatus } : app))
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
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No applications found</p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/30">
                    <AvatarImage src={application.avatar} />
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
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {application.location}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Briefcase className="h-3 w-3" />
                        {application.experience}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        ${application.hourlyRate}/hr
                      </div>
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
                {/* Applicant Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/30">
                    <AvatarImage src={selectedApplication.avatar} />
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
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {selectedApplication.location}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-sm">Experience</span>
                    </div>
                    <p className="font-semibold text-foreground">{selectedApplication.experience}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Hourly Rate</span>
                    </div>
                    <p className="font-semibold text-foreground">${selectedApplication.hourlyRate}/hour</p>
                  </div>
                </div>

                {/* Specializations */}
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

                {/* Certifications */}
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

                {/* Bio */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">About</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedApplication.bio}</p>
                </div>
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
