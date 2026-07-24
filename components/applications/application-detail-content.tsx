"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeftIcon,
  BotIcon,
  MessageCircleIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  XCircleIcon,
  CheckCircleIcon,
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react"
import type { AdoptionStatus, ApplicationDocumentType, GovernmentIDType } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { ApplicationTimeline } from "@/components/applications/application-timeline"
import { PetAppliedForCard } from "@/components/applications/pet-applied-for-card"
import { ApplicationFormSections } from "@/components/applications/application-form-sections"
import { ApplicationActionsCard } from "@/components/applications/application-actions-card"
import { PET_SPECIES_LABELS, PET_GENDER_LABELS } from "@/lib/constants/pet"
import type { PetSpecies, PetGender } from "@prisma/client"
import { AIInsightsPanel } from "@/components/applications/ai-insights-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateApplicationAIInsightAction } from "@/app/(dashboard)/applications/actions/ai.action"
import { withdrawApplicationAction } from "@/app/(dashboard)/applications/actions/application.action"
import { startChatModeAction, reviewDecisionAction } from "@/app/(dashboard)/applications/actions/chat.action"
import { SetBreadcrumbLabel } from "@/components/dashboard/breadcrumb-context"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"

// ---------- Types ----------

type ApplicationDetailData = {
  id: string
  status: AdoptionStatus
  createdAt: Date
  submittedAt: Date | null
  reviewedAt: Date | null
  reviewNotes: string | null
  rejectionReason: string | null
  signatureUrl: string | null
  livingEnvironment: any
  householdLifestyle: any
  petExperience: any
  adoptionCommitment: any
  agreements: any
  aiInsight?: any
  applicant: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    avatar: string
    occupation: string | null
    dateOfBirth: Date | null
  }
  pet: {
    id: string
    name: string
    species: PetSpecies
    breed: string | null
    gender: PetGender | null
    size: string
    status: string
    petImages: { id: string; url: string; isPrimary: boolean }[]
    shelter: {
      id: string
      name: string
      city: string
      province: string
      logo?: string | null
    } | null
    postedBy: {
      id: string
      firstName: string
      lastName: string
      avatar?: string | null
    } | null
  }
  documents: {
    id: string
    type: ApplicationDocumentType
    idType: GovernmentIDType
    name: string
    url: string
  }[]
  reviewedBy: {
    firstName: string
    lastName: string
  } | null
}

type ApplicationDetailContentProps = {
  application: ApplicationDetailData
  userRole: string
}

// ---------- Component ----------

export function ApplicationDetailContent({
  application,
  userRole,
}: ApplicationDetailContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  // AI Insight state
  const [aiInsight, setAiInsight] = useState<any>(application.aiInsight ?? null)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  // Select Chat Mode Dialog state
  const [isChatSelectionOpen, setIsChatSelectionOpen] = useState(false)
  const [selectedChatMode, setSelectedChatMode] = useState<"AI_ASSISTED" | "MANUAL">("AI_ASSISTED")
  const [isStartingChat, setIsStartingChat] = useState(false)

  // Reject Application Dialog state
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReasonNotes, setRejectionReasonNotes] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)

  const { pet, applicant } = application
  const isAdopter = userRole === "ADOPTER"
  const isReviewer = ["SHELTER_STAFF", "PET_OWNER", "ADMIN"].includes(userRole)
  const canWithdraw = isAdopter && (application.status === "PENDING" || application.status === "UNDER_REVIEW")

  // Trigger AI Screening Analysis
  const handleGenerateAiInsights = async () => {
    setIsGeneratingAi(true)
    try {
      const res = await generateApplicationAIInsightAction(application.id)
      if (res.success && res.data) {
        setAiInsight(res.data)
        setActiveTab("ai")
        toast.success("Teddy AI Screening Insights generated!")
        router.refresh()
      } else {
        toast.error((res as any).error || "Failed to generate AI insights.")
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.")
    } finally {
      setIsGeneratingAi(false)
    }
  }

  // Confirm Chat Mode Selection
  const handleStartChatConfirm = async () => {
    setIsStartingChat(true)
    try {
      const res = await startChatModeAction(application.id, selectedChatMode)
      if (res.success) {
        toast.success("Interview started successfully.")
        setIsChatSelectionOpen(false)
        router.push(`/applications/${application.id}/chat`)
      } else {
        toast.error(res.error || "Failed to start interview.")
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.")
    } finally {
      setIsStartingChat(false)
    }
  }

  // Reject Application Submission
  const handleRejectSubmit = async () => {
    if (!rejectionReasonNotes.trim()) {
      toast.error("Please provide a reason for rejecting the application.")
      return
    }
    setIsRejecting(true)
    try {
      const res = await reviewDecisionAction(application.id, "REJECTED", rejectionReasonNotes)
      if (res.success) {
        toast.success("Application rejected.")
        setIsRejectDialogOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to reject application.")
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.")
    } finally {
      setIsRejecting(false)
    }
  }

  // Withdraw Application Submission
  function handleWithdrawConfirm() {
    startTransition(async () => {
      const response = await withdrawApplicationAction(application.id)
      if (response.success) {
        toast.success("Application withdrawn successfully")
        setShowWithdrawConfirm(false)
        router.push("/applications")
        router.refresh()
      } else {
        toast.error(response.error ?? "Failed to withdraw application.")
      }
    })
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-4 md:p-6">
      <SetBreadcrumbLabel segment={application.id} label={pet.name} />

      <div className="mx-auto w-full px-6 space-y-6">
        {/* Back + Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/applications">
                <ArrowLeftIcon className="size-4 mr-1" />
                Back
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {isAdopter ? `Application for ${pet.name}` : `${applicant.firstName}'s Application`}
                </h1>
                <ApplicationStatusBadge status={application.status} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {isAdopter
                  ? "Review your submitted application details."
                  : `Adoption application for ${pet.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Progress Timeline */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Application Progress
          </h3>
          <ApplicationTimeline
            applicationStatus={application.status}
            createdAt={application.createdAt}
            submittedAt={application.submittedAt}
            reviewedAt={application.reviewedAt}
          />
        </div>

        {/* Two-column Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
          {/* Left Column — Application Content / Tabs */}
          <div className="space-y-6">
            {isReviewer ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {aiInsight !== null && (
                  <TabsList className="grid grid-cols-2 max-w-md gap-1 rounded-lg border bg-[#8B7E74]/10 p-1 h-auto shadow-none mb-6">
                    <TabsTrigger
                      value="info"
                      className="rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground focus-visible:outline-none cursor-pointer"
                    >
                      Application Info
                    </TabsTrigger>
                    <TabsTrigger
                      value="ai"
                      className="rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground focus-visible:outline-none cursor-pointer"                    >
                      Teddy AI Review
                    </TabsTrigger>
                  </TabsList>
                )}

                <TabsContent value="info" className="mt-0 focus-visible:outline-none">
                  <ApplicationFormSections
                    data={{
                      applicant,
                      livingEnvironment: application.livingEnvironment,
                      householdLifestyle: application.householdLifestyle,
                      petExperience: application.petExperience,
                      adoptionCommitment: application.adoptionCommitment,
                      agreements: application.agreements,
                      signatureUrl: application.signatureUrl,
                      documents: application.documents,
                    }}
                  />
                </TabsContent>

                {aiInsight !== null && (
                  <TabsContent value="ai" className="mt-0 focus-visible:outline-none">
                    <AIInsightsPanel
                      applicationId={application.id}
                      initialInsight={aiInsight}
                      userRole={userRole}
                      applicationStatus={application.status}
                    />
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <ApplicationFormSections
                data={{
                  applicant,
                  livingEnvironment: application.livingEnvironment,
                  householdLifestyle: application.householdLifestyle,
                  petExperience: application.petExperience,
                  adoptionCommitment: application.adoptionCommitment,
                  agreements: application.agreements,
                  signatureUrl: application.signatureUrl,
                  documents: application.documents,
                }}
              />
            )}
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-6">
            {/* Pet Info Card */}
            <PetAppliedForCard pet={pet} />

            {/* Applicant Info Card (Reviewers only) */}
            {isReviewer ? (
              <Card className="border-primary/15 bg-card">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Applicant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 overflow-hidden rounded-full border bg-muted shrink-0">
                      <Image
                        src={applicant.avatar}
                        alt={`${applicant.firstName} ${applicant.lastName}`}
                        fill
                        className="object-cover"
                        unoptimized={applicant.avatar.startsWith("/uploads/")}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {applicant.firstName} {applicant.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">Adoption Applicant</p>
                    </div>
                  </div>
                  <div className="space-y-2 border-t pt-3 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MailIcon className="size-3.5 shrink-0" />
                      <span className="truncate">{applicant.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <PhoneIcon className="size-3.5 shrink-0" />
                      <span>{applicant.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPinIcon className="size-3.5 shrink-0" />
                      <span className="truncate">{applicant.address}</span>
                    </div>
                    {applicant.occupation ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BriefcaseIcon className="size-3.5 shrink-0" />
                        <span>{applicant.occupation}</span>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Adopter Status Explanation Cards */}
            {isAdopter && (application.status === "PENDING" || application.status === "UNDER_REVIEW") && (
              <Card className="border-blue-500/30 bg-blue-500/10 shadow-xs">
                <CardContent className="p-4 space-y-2 text-blue-950 dark:text-blue-200">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="size-4 text-blue-600 shrink-0" />
                    <span>
                      {application.status === "PENDING" ? "Application Queued" : "Screening in Progress"}
                    </span>
                  </div>
                  <p className="text-xs text-blue-900/90 dark:text-blue-200 leading-relaxed">
                    {application.status === "PENDING"
                      ? "Your application has been received and is queued for shelter review."
                      : "Shelter staff is currently reviewing your application profile & compatibility details."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Approved Application Reminder Card */}
            {application.status === "APPROVED" && (
              <Card className="border-[#AE8F65]/30 bg-[#AE8F65]/10 shadow-xs">
                <CardContent className="p-4 space-y-3 text-[#5A462B] dark:text-[#E4D4C0]">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge className="bg-[#AE8F65] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-none">
                        Application Approved
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed mt-1">
                      The adoption request for <strong>{pet.name}</strong> is approved. Coordinate handover and pickup details in the chat room.
                    </p>
                  </div>
                  <Button asChild size="sm" className="w-full bg-[#AE8F65] hover:bg-[#9A7D58] text-white text-xs font-medium rounded-xl cursor-pointer shadow-none">
                    <Link href={`/applications/${application.id}/chat`}>
                      Open Chat Room
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <ApplicationActionsCard
              applicationId={application.id}
              status={application.status}
              isReviewer={isReviewer}
              isAdopter={isAdopter}
              aiInsight={aiInsight}
              isGeneratingAi={isGeneratingAi}
              canWithdraw={canWithdraw}
              isPendingWithdraw={isPending}
              onGenerateAi={handleGenerateAiInsights}
              onViewAi={() => setActiveTab("ai")}
              onStartInterview={() => setIsChatSelectionOpen(true)}
              onReject={() => setIsRejectDialogOpen(true)}
              onWithdraw={() => setShowWithdrawConfirm(true)}
            />
          </div>
        </div>
      </div>

      {/* Select Chat Mode Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isChatSelectionOpen}
        onClose={() => setIsChatSelectionOpen(false)}
        onConfirm={handleStartChatConfirm}
        title="Select Interview & Chat Mode"
        variant="info"
        confirmText="Start Interview & Open Chat"
        cancelText="Cancel"
        isLoading={isStartingChat}
        description={
          <div className="space-y-3 pt-1">
            <p className="text-sm text-gray-500">
              Choose how you would like to conduct the adoption interview with <strong>{applicant.firstName}</strong>:
            </p>
            <div className="space-y-2.5 pt-1">
              <div
                className={`p-3.5 border rounded-xl cursor-pointer transition-all ${selectedChatMode === "AI_ASSISTED"
                  ? "border-[#AE8F65] bg-[#AE8F65]/10 shadow-xs"
                  : "border-border hover:bg-muted/40"
                  }`}
                onClick={() => setSelectedChatMode("AI_ASSISTED")}
              >
                <div className="flex items-center justify-between font-bold text-sm text-foreground">
                  <span>AI-Assisted TeddyAI Interview</span>
                  {selectedChatMode === "AI_ASSISTED" && (
                    <CheckCircleIcon className="size-4 text-[#AE8F65]" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  TeddyAI conducts a structured automated screening interview based on custom flags. You can monitor live and interject anytime.
                </p>
              </div>

              <div
                className={`p-3.5 border rounded-xl cursor-pointer transition-all ${selectedChatMode === "MANUAL"
                  ? "border-[#AE8F65] bg-[#AE8F65]/10 shadow-xs"
                  : "border-border hover:bg-muted/40"
                  }`}
                onClick={() => setSelectedChatMode("MANUAL")}
              >
                <div className="flex items-center justify-between font-bold text-sm text-foreground">
                  <span>Manual Direct Chat</span>
                  {selectedChatMode === "MANUAL" && (
                    <CheckCircleIcon className="size-4 text-[#AE8F65]" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Chat directly with the applicant in real-time without automated AI question queues.
                </p>
              </div>
            </div>
          </div>
        }
      />

      <ConfirmationDialog
        isOpen={isRejectDialogOpen}
        onClose={() => {
          setIsRejectDialogOpen(false)
          setRejectionReasonNotes("")
        }}
        onConfirm={handleRejectSubmit}
        title="Reject Adoption Application"
        description={
          <div className="space-y-3 pt-1">
            <p className="text-sm text-gray-500">
              Are you sure you want to reject <strong>{applicant.firstName}&apos;s</strong> application for <strong>{pet.name}</strong>? Please enter the rejection reason below:
            </p>
            <textarea
              placeholder="Enter rejection reason or feedback for applicant..."
              className="w-full min-h-[90px] text-xs p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none text-foreground bg-background"
              value={rejectionReasonNotes}
              onChange={(e) => setRejectionReasonNotes(e.target.value)}
              disabled={isRejecting}
            />
          </div>
        }
        confirmText="Confirm Rejection"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isRejecting}
      />

      <ConfirmationDialog
        isOpen={showWithdrawConfirm}
        onClose={() => setShowWithdrawConfirm(false)}
        onConfirm={handleWithdrawConfirm}
        title="Withdraw Adoption Application?"
        description={
          <>
            Are you sure you want to withdraw your adoption application for{" "}
            <strong>{pet.name}</strong>? This action will cancel your request and remove it from your active list.
          </>
        }
        confirmText="Yes, Withdraw"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isPending}
      />
    </div>
  )
}
