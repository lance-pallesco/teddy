"use client"

import Link from "next/link"
import type { AdoptionStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ApplicationActionsCardProps {
  applicationId: string
  status: AdoptionStatus
  isReviewer: boolean
  isAdopter: boolean
  aiInsight: any
  isGeneratingAi: boolean
  canWithdraw: boolean
  isPendingWithdraw: boolean
  onGenerateAi: () => void
  onViewAi: () => void
  onStartInterview: () => void
  onReject: () => void
  onWithdraw: () => void
}

export function ApplicationActionsCard({
  applicationId,
  status,
  isReviewer,
  isAdopter,
  aiInsight,
  isGeneratingAi,
  canWithdraw,
  isPendingWithdraw,
  onGenerateAi,
  onViewAi,
  onStartInterview,
  onReject,
  onWithdraw,
}: ApplicationActionsCardProps) {
  const isTerminalState = status === "REJECTED" || status === "WITHDRAWN"

  // Reviewer Action Flags
  const showGenerateAi = isReviewer && status === "PENDING" && aiInsight === null
  const showViewAi =
    isReviewer &&
    aiInsight !== null &&
    (status === "PENDING" || status === "UNDER_REVIEW" || status === "INTERVIEW_IN_PROGRESS")
  const showStartInterview = isReviewer && status === "UNDER_REVIEW"
  const showOpenChatReviewer = isReviewer && (status === "INTERVIEW_IN_PROGRESS" || status === "APPROVED")
  const showReject = isReviewer && (status === "PENDING" || status === "UNDER_REVIEW")

  // Adopter Action Flags
  const showOpenChatAdopter = isAdopter && (status === "INTERVIEW_IN_PROGRESS" || status === "APPROVED")
  const showWithdraw = isAdopter && (status === "PENDING" || status === "UNDER_REVIEW")

  return (
    <Card className="border-primary/15 shadow-xs">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Application Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2.5">
        {isTerminalState ? (
          <p className="text-xs text-muted-foreground italic text-center py-1">
            Application process ended ({status.toLowerCase()}).
          </p>
        ) : (
          <div className="space-y-2">
            {/* 1. Generate AI Insights (Reviewer - PENDING & No AI) */}
            {showGenerateAi && (
              <Button
                className="w-full bg-[#AE8F65] hover:bg-[#9A7D58] text-white font-medium text-xs rounded-xl h-9 cursor-pointer transition-colors shadow-none"
                size="sm"
                onClick={onGenerateAi}
                disabled={isGeneratingAi}
              >
                {isGeneratingAi ? "Generating AI Insights..." : "Generate Teddy AI Screening Insights"}
              </Button>
            )}

            {/* 2. View AI Insights (Reviewer - Insights exist) */}
            {showViewAi && (
              <Button
                variant="outline"
                className="w-full border-[#AE8F65]/40 text-[#7A613F] dark:text-[#D4B896] hover:bg-[#AE8F65]/10 font-medium text-xs rounded-xl h-9 cursor-pointer transition-colors shadow-none"
                size="sm"
                onClick={onViewAi}
              >
                View Teddy AI Screening Insights
              </Button>
            )}

            {/* 3. Start Interview & Open Chat (Reviewer - UNDER_REVIEW) */}
            {showStartInterview && (
              <Button
                className="w-full bg-[#AE8F65] hover:bg-[#9A7D58] text-white font-medium text-xs rounded-xl h-9 cursor-pointer transition-colors shadow-none"
                size="sm"
                onClick={onStartInterview}
              >
                Start Interview & Open Chat
              </Button>
            )}

            {/* 4. Open Discussion Chat Room (Reviewer - Active Chat / Approved) */}
            {showOpenChatReviewer && (
              <Button
                asChild
                className="w-full bg-[#AE8F65] hover:bg-[#9A7D58] text-white font-medium text-xs rounded-xl h-9 cursor-pointer transition-colors shadow-none"
                size="sm"
              >
                <Link href={`/applications/${applicationId}/chat`}>
                  Open Discussion Chat Room
                </Link>
              </Button>
            )}

            {showReject && (
              <Button
                variant="outline"
                className="w-full border-rose-200 bg-red-500 text-white hover:bg-red-600 hover:text-white font-medium text-xs rounded-xl h-9 cursor-pointer transition-colors shadow-none"
                size="sm"
                onClick={onReject}
              >
                Reject Application
              </Button>
            )}

            {/* 6. Enter Chat Room (Adopter - Active Chat / Approved) */}
            {showOpenChatAdopter && (
              <Button
                asChild
                className="w-full bg-[#AE8F65] hover:bg-[#9A7D58] text-white font-medium text-xs rounded-xl h-9 cursor-pointer transition-colors shadow-none"
                size="sm"
              >
                <Link href={`/applications/${applicationId}/chat`}>
                  {status === "APPROVED" ? "Enter Discussion Chat Room" : "Enter Chat Room with Shelter/Owner"}
                </Link>
              </Button>
            )}

            {/* 7. Withdraw Application (Adopter - PENDING or UNDER_REVIEW) */}
            {showWithdraw && (
              <Button
                variant="destructive"
                className="w-full bg-red-500 text-white hover:bg-red-600 hover:text-white font-medium text-xs rounded-xl h-9 cursor-pointer transition-colors shadow-none"
                size="sm"
                disabled={!canWithdraw || isPendingWithdraw}
                onClick={onWithdraw}
              >
                {isPendingWithdraw ? "Withdrawing..." : "Withdraw Application"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
