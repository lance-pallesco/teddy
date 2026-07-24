"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Bot,
  User,
  Shield,
  ArrowLeft,
  Send,
  Pin,
  CheckCircle,
  AlertTriangle,
  FileText,
  AlertOctagon,
  Clock,
  Sparkles,
  HelpCircle,
  ThumbsDown,
  ThumbsUp,
  Copy,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { toast } from "sonner"
import {
  sendChatMessageAction,
  interjectQuestionAction,
  endInterviewEarlyAction,
  togglePinMessageAction,
  reviewDecisionAction,
  suggestQuestionAction,
} from "@/app/(dashboard)/applications/actions/chat.action"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PetAppliedForCard } from "@/components/applications/pet-applied-for-card"

interface ChatMessage {
  id: string
  senderId: string | null
  senderName: string
  senderRole: string
  content: string
  isPinned: boolean
  createdAt: string | Date
  senderAvatar?: string | null
}

interface ApplicationChatRoomProps {
  applicationId: string
  initialMessages: ChatMessage[]
  initialApplication: any
  currentUser: { id: string; role: string; firstName: string; lastName: string; avatar?: string | null }
  isReviewer: boolean
}

export function ApplicationChatRoom({
  applicationId,
  initialMessages,
  initialApplication,
  currentUser,
  isReviewer,
}: ApplicationChatRoomProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [app, setApp] = useState(initialApplication)
  const [inputText, setInputText] = useState("")
  const [interjectText, setInterjectText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isInterjecting, setIsInterjecting] = useState(false)
  const [isNudging, setIsNudging] = useState(false)
  const [suggestedQuestion, setSuggestedQuestion] = useState<string | null>(null)

  // Final Decision & Drawer dialog states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDecisionOpen, setIsDecisionOpen] = useState(false)
  const [decisionType, setDecisionType] = useState<"APPROVED" | "REJECTED" | null>(null)
  const [decisionNotes, setDecisionNotes] = useState("")
  const [isDecisionSubmitting, setIsDecisionSubmitting] = useState(false)

  // End Interview Early Confirmation state
  const [isEndEarlyOpen, setIsEndEarlyOpen] = useState(false)
  const [isEndingEarly, setIsEndingEarly] = useState(false)

  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Scroll message container to bottom smoothly
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      })
    }
  }

  // Automatically scroll to bottom when messages list updates (new message sent/received)
  useEffect(() => {
    scrollToBottom(true)
  }, [messages.length])

  // Live polling: Fetch fresh messages and application state every 3 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/applications/${applicationId}/chat-data`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setMessages(result.data.messages)
            setApp(result.data.application)
          }
        }
      } catch (err) {
        console.error("Error polling chat data:", err)
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [applicationId])

  // Handlers
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputText.trim() || isSending) return

    const originalText = inputText
    setInputText("")
    setIsSending(true)

    // Optimistic message update
    const tempId = Math.random().toString()
    const tempMsg: ChatMessage = {
      id: tempId,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderRole: isReviewer ? "REVIEWER" : "ADOPTER",
      content: originalText,
      isPinned: false,
      createdAt: new Date(),
      senderAvatar: currentUser.avatar ?? null,
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      const res = await sendChatMessageAction(applicationId, originalText)
      if (!res.success) {
        toast.error(res.error || "Failed to send message.")
        // Rollback optimistic update
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        setInputText(originalText)
      } else {
        // Refresh router in background to update server cache
        router.refresh()
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.")
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setInputText(originalText)
    } finally {
      setIsSending(false)
    }
  }

  const handleInterject = async () => {
    if (!interjectText.trim() || isInterjecting) return
    setIsInterjecting(true)
    const textToSubmit = interjectText
    setInterjectText("")

    try {
      const res = await interjectQuestionAction(applicationId, textToSubmit)
      if (res.success) {
        toast.success("Question interjected successfully.")
        router.refresh()
      } else {
        toast.error(res.error || "Failed to interject question.")
        setInterjectText(textToSubmit)
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.")
      setInterjectText(textToSubmit)
    } finally {
      setIsInterjecting(false)
    }
  }

  const handleEndInterviewEarly = () => {
    setIsEndEarlyOpen(true)
  }

  const handleEndInterviewEarlyConfirm = async () => {
    setIsEndingEarly(true)
    try {
      const res = await endInterviewEarlyAction(applicationId)
      if (res.success) {
        toast.success("Interview finished early. Chat room locked.")
        setIsEndEarlyOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to finish interview.")
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.")
    } finally {
      setIsEndingEarly(false)
    }
  }

  const handleTogglePin = async (messageId: string) => {
    try {
      const res = await togglePinMessageAction(messageId)
      if (res.success) {
        const data = res.data as any
        toast.success(data.isPinned ? "Message pinned" : "Message unpinned")
      } else {
        toast.error(res.error || "Failed to pin message.")
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.")
    }
  }

  const handleSuggestQuestion = async () => {
    setIsNudging(true)
    setSuggestedQuestion(null)
    try {
      const res = await suggestQuestionAction(applicationId)
      if (res.success) {
        setSuggestedQuestion(res.data as string)
      } else {
        toast.error(res.error || "Failed to get suggestions.")
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.")
    } finally {
      setIsNudging(false)
    }
  }

  const handleDecisionSubmit = async () => {
    if (!decisionType) return
    setIsDecisionSubmitting(true)
    try {
      const res = await reviewDecisionAction(applicationId, decisionType, decisionNotes)
      if (res.success) {
        toast.success(`Application successfully ${decisionType.toLowerCase()}!`)
        setIsDecisionOpen(false)
        router.push(`/applications/${applicationId}`)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to submit final decision.")
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.")
    } finally {
      setIsDecisionSubmitting(false)
    }
  }

  // Parse questions & progress
  const chatQuestions = (app.chatQuestions as any[]) || []
  const questionIndex = app.chatQuestionIndex || 0
  const isAiAssisted = app.chatMode === "AI_ASSISTED"
  const isChatActive = app.chatStatus === "ACTIVE"
  const isApplicationActive = app.status === "INTERVIEW_IN_PROGRESS"
  const postSummary = app.aiPostInterviewSummary as any
  const isInterviewCompleted = !!postSummary || app.chatStatus === "COMPLETED"

  // Check if current user is the actual adopter / applicant for this application
  const isAdopter = currentUser.role === "ADOPTER" && currentUser.id === app.applicantId

  // During active AI interview (!isInterviewCompleted), ONLY the adopter can send messages to TeddyAI.
  // All other roles (Shelter staff, Pet owner, Admin) are blocked from direct chat during active AI interview.
  const isReviewerBlockedDuringAi = isAiAssisted && !isInterviewCompleted && !isAdopter
  const isTypingUnlocked = isChatActive && isApplicationActive && !isReviewerBlockedDuringAi

  // Extract flag updates for live resolution
  const screeningFlags = chatQuestions.filter(q => q.flag !== null)

  return (
    <div className="flex flex-col w-full h-[calc(100vh-4.5rem)] border rounded-xl overflow-hidden bg-background">
      {/* FULL-WIDTH CHAT WINDOW */}
      <div className="flex flex-col flex-1 h-full min-w-0 relative overflow-hidden">
        {/* Chat Header with Sheet Drawer Trigger */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b bg-muted/20 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="icon" className="rounded-full shrink-0">
              <Link href={`/applications/${applicationId}`}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                Discussion: {app.pet.name} Adoption
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {isAiAssisted ? "TeddyAI Co-Pilot Interview" : "Direct Adopter Chat"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={isChatActive ? "success" : "secondary"} className="h-6 text-[10px] hidden sm:inline-flex px-2">
              {isChatActive ? "Active" : "Locked / Reviewing"}
            </Badge>

            {/* Details & Actions Slide-Over Sheet Drawer */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-lg gap-1.5 border-border hover:bg-muted/60 shadow-xs cursor-pointer">
                  <SlidersHorizontal className="size-3.5 text-foreground/80" />
                  <span>{isReviewer ? "Details & Actions" : "Pet Details"}</span>
                  {isReviewer && isAiAssisted && chatQuestions.length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-bold bg-primary/10 text-primary border-none">
                      {isInterviewCompleted ? "100%" : `${Math.min(100, Math.round(((questionIndex + 1) / chatQuestions.length) * 100))}%`}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full border-l shadow-2xl bg-background overflow-hidden">
                <SheetHeader className="p-0 border-none space-y-0 text-left shrink-0">
                  <SheetTitle className="sr-only">Application Details & Pet Information</SheetTitle>
                  <SheetDescription className="sr-only">Details about {app.pet.name} and adoption interview options.</SheetDescription>
                </SheetHeader>

                {/* Middle Scrollable Section */}
                <div className="flex-1 overflow-y-auto p-5 pt-12 space-y-5 scrollbar-thin">
                  {/* Pet Applied For Card */}
                  <PetAppliedForCard pet={app.pet} />

                  {isReviewer ? (
                    <>
                      {/* Section 1: Progress Tracker */}
                      {isAiAssisted && chatQuestions.length > 0 && (() => {
                        const currentNum = Math.min(questionIndex + 1, chatQuestions.length)
                        const progressPercent = isInterviewCompleted || questionIndex >= chatQuestions.length
                          ? 100
                          : Math.min(100, Math.round((currentNum / chatQuestions.length) * 100))
                        return (
                          <Card className="border-border/60 shadow-xs">
                            <CardHeader className="p-4 pb-2 border-b">
                              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Interview Progress
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-muted-foreground">Question {currentNum} of {chatQuestions.length}</span>
                                <span className="font-bold text-primary">{progressPercent}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })()}

                      {/* Section 2: Post-Interview AI Summary */}
                      {postSummary && (
                        <Card className="border-[#AE8F65]/30 bg-[#AE8F65]/10 shadow-xs">
                          <CardHeader className="p-4 pb-2 border-b border-[#AE8F65]/20">
                            <CardTitle className="text-xs font-bold text-[#8C6D43] uppercase tracking-wider flex items-center gap-1.5">
                              <Image src="/logo.png" alt="TeddyAI" width={14} height={14} className="object-contain" />
                              TeddyAI Post-Interview Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 space-y-3 text-xs leading-relaxed">
                            {/* Flag Resolutions list */}
                            {Array.isArray(postSummary.flagResolutions) && (
                              <div className="space-y-2">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Flag Resolutions</span>
                                {postSummary.flagResolutions.map((res: any, idx: number) => (
                                  <div key={idx} className="flex gap-2 items-start border-b border-[#AE8F65]/15 pb-2 last:border-0 last:pb-0">
                                    {res.status === "RESOLVED" ? (
                                      <CheckCircle className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    ) : res.status === "PARTIALLY_RESOLVED" ? (
                                      <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                                    ) : (
                                      <AlertOctagon className="size-3.5 text-rose-500 shrink-0 mt-0.5" />
                                    )}
                                    <div className="space-y-0.5">
                                      <span className="font-semibold block text-foreground">{res.flag}</span>
                                      <span className="text-[10px] text-muted-foreground block">{res.explanation}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Quality Scores */}
                            {postSummary.qualityAssessment && (
                              <div className="space-y-1.5 border-t border-[#AE8F65]/20 pt-3">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Response Quality</span>
                                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                                  <div className="p-1.5 border rounded-lg bg-background/60">
                                    <span className="block text-muted-foreground">Consistency</span>
                                    <span className="font-bold text-[#8C6D43]">{postSummary.qualityAssessment.consistency}%</span>
                                  </div>
                                  <div className="p-1.5 border rounded-lg bg-background/60">
                                    <span className="block text-muted-foreground">Specificity</span>
                                    <span className="font-bold text-[#8C6D43]">{postSummary.qualityAssessment.specificity}%</span>
                                  </div>
                                  <div className="p-1.5 border rounded-lg bg-background/60">
                                    <span className="block text-muted-foreground">Engagement</span>
                                    <span className="font-bold text-[#8C6D43]">{postSummary.qualityAssessment.engagement}%</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Language & Decision Recommendation */}
                            {postSummary.languageNote && (
                              <p className="text-[10px] italic text-muted-foreground pt-1 border-t border-[#AE8F65]/20">
                                💡 {postSummary.languageNote}
                              </p>
                            )}

                            {postSummary.recommendation && (
                              <div className="border border-[#AE8F65]/30 rounded-xl p-3 bg-background/60 space-y-1">
                                <div className="flex items-center justify-between font-bold text-xs">
                                  <span className="text-[#8C6D43]">AI Suggested Recommendation</span>
                                  <span className="text-emerald-600 font-bold">{postSummary.recommendation.score}/100</span>
                                </div>
                                <span className="font-extrabold text-[11px] text-emerald-600 block">
                                  {postSummary.recommendation.decision}
                                </span>
                                <p className="text-[10px] text-muted-foreground leading-normal">
                                  {postSummary.recommendation.justification}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Section 3: Live Flag Checklist */}
                      {isAiAssisted && screeningFlags.length > 0 && !postSummary && (
                        <Card className="border-border/60 shadow-xs">
                          <CardHeader className="p-4 pb-2 border-b">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Live Screening Flags
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 space-y-2">
                            {screeningFlags.map((flag: any, idx: number) => {
                              const status = flag.status || "PENDING"
                              return (
                                <div key={idx} className="flex gap-2 items-start border-b pb-2 last:border-0 last:pb-0">
                                  {status === "RESOLVED" ? (
                                    <CheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                  ) : status === "PARTIALLY_RESOLVED" ? (
                                    <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <AlertOctagon className="size-4 text-rose-500 shrink-0 mt-0.5" />
                                  )}
                                  <div className="space-y-0.5">
                                    <span className="font-semibold text-xs text-foreground block leading-tight">{flag.flag}</span>
                                    <span className="text-[10px] text-muted-foreground block leading-normal">
                                      {flag.resolutionNotes || "Awaiting AI evaluation..."}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    /* Chat Guidelines & Tips for Adopter */
                    <Card className="border-border/60 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Interview Guidelines
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3 text-xs text-muted-foreground leading-relaxed">
                        <p>
                          • <strong>Language Flexibility</strong>: Feel free to respond in English, Filipino, Cebuano, or any language you prefer.
                        </p>
                        <p>
                          • <strong>Be Honest & Detailed</strong>: Sharing specific details about your home schedule, experience, and plans helps reviewers assess the best fit for {app.pet.name}.
                        </p>
                        <p>
                          • <strong>Reviewer Supervision</strong>: Shelter staff and pet owners observe the interview transcript and make the final adoption decision.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Fixed Sticky Footer for Reviewer Actions & Decisions */}
                {isReviewer && isApplicationActive && (
                  <div className="p-4 border-t bg-background shrink-0 space-y-3 shadow-lg z-10 border-border/60">
                    {/* Interject Custom Question (AI-assisted mode) */}
                    {isAiAssisted && isChatActive && !isInterviewCompleted && (
                      <div className="space-y-2 border-b pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                          Interject Custom Question
                        </span>
                        <div className="space-y-2">
                          <input
                            type="text"
                            className="w-full text-xs border rounded-xl px-3 py-2 bg-background text-foreground focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Type custom question for applicant..."
                            value={interjectText}
                            onChange={(e) => setInterjectText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleInterject()
                            }}
                            disabled={isInterjecting}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 h-8 text-xs font-semibold rounded-xl"
                              onClick={handleInterject}
                              disabled={!interjectText.trim() || isInterjecting}
                            >
                              {isInterjecting ? "Queueing..." : "Queue Question"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium rounded-xl border-rose-200"
                              onClick={handleEndInterviewEarly}
                            >
                              Finish Interview Early
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TeddyAI Assistant Suggestion (Manual mode) */}
                    {!isAiAssisted && isChatActive && (
                      <div className="space-y-2 border-b pb-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs w-full bg-background border-[#AE8F65]/30 text-[#8C6D43] hover:bg-[#AE8F65]/15 font-semibold rounded-xl"
                          onClick={handleSuggestQuestion}
                          disabled={isNudging}
                        >
                          {isNudging ? "Analyzing chat context..." : "Ask AI for Suggested Question"}
                        </Button>
                        {suggestedQuestion && (() => {
                          const cleanQuestion = suggestedQuestion.replace(/^["'\s]+|["'\s]+$/g, "")
                          return (
                            <div className="p-2.5 border border-[#AE8F65]/30 bg-background rounded-xl text-xs leading-relaxed text-foreground space-y-2">
                              <p className="font-medium text-foreground/90 text-[11px] leading-normal">{cleanQuestion}</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] w-full border-[#AE8F65]/40 text-[#8C6D43] hover:bg-[#AE8F65]/15 font-semibold cursor-pointer rounded-lg"
                                onClick={() => {
                                  setInputText(cleanQuestion)
                                  toast.success("Inserted into message input!")
                                }}
                              >
                                Use in Chat
                              </Button>
                            </div>
                          )
                        })()}
                      </div>
                    )}

                    {/* Reviewer Final Decision Buttons */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Reviewer Final Decision
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-9 text-xs font-semibold rounded-xl"
                          onClick={() => { setDecisionType("REJECTED"); setIsDecisionOpen(true); }}
                        >
                          <ThumbsDown className="size-3.5 mr-1.5" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                          onClick={() => { setDecisionType("APPROVED"); setIsDecisionOpen(true); }}
                        >
                          <ThumbsUp className="size-3.5 mr-1.5" />
                          Approve & Meet
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Pinned Messages Ribbon */}
        {messages.some(m => m.isPinned) && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex flex-col gap-1 text-xs text-amber-800 dark:text-amber-400 shrink-0">
            <span className="font-semibold flex items-center gap-1.5"><Pin className="size-3 text-amber-600" /> Pinned Review Context:</span>
            <div className="space-y-1.5">
              {messages.filter(m => m.isPinned).map(m => (
                <div key={m.id} className="flex justify-between items-start gap-4 p-1.5 bg-background/50 rounded border border-amber-500/10">
                  <p className="line-clamp-2 italic flex-1">"{m.content}" - <strong>{m.senderName}</strong></p>
                  {isReviewer && (
                    <Button variant="ghost" size="icon" className="size-4 text-muted-foreground hover:text-amber-600" onClick={() => handleTogglePin(m.id)}>
                      <XIcon className="size-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Message History Only */}
        <div ref={messagesContainerRef} className="flex-1 h-0 min-h-0 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground h-full gap-2">
              <MessageSquare className="size-10 opacity-30 animate-pulse" />
              <p className="text-sm">Connecting chat room...</p>
            </div>
          ) : (
            messages.map((message) => {
              const isSystem = message.senderRole === "SYSTEM"
              const isAi = message.senderRole === "AI"
              const isSelf = message.senderId === currentUser.id
              const avatarUrl = isSelf ? currentUser.avatar : message.senderAvatar
              const isRightAligned = isAiAssisted
                ? message.senderRole === "ADOPTER" || isSelf
                : isSelf

              if (isSystem) {
                return (
                  <div key={message.id} className="flex justify-center my-4">
                    <div className="bg-muted/30 border border-border/60 text-muted-foreground text-xs px-6 py-4 rounded-2xl max-w-xl text-center leading-relaxed shadow-xs">
                      {message.content.split("\n").map((line, idx) => (
                        <span key={idx} className="block mt-0.5">{line}</span>
                      ))}
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isRightAligned ? "ml-auto flex-row-reverse" : "mr-auto flex-row"}`}
                >
                  <Avatar className="size-8 border shrink-0">
                    <AvatarImage src={avatarUrl ?? undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                      {isAi ? (
                        <Image src="/logo.png" alt="TeddyAI" width={20} height={20} className="object-contain" />
                      ) : (
                        (message.senderName || "U").charAt(0).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`space-y-1.5 flex flex-col ${isRightAligned ? "items-end text-right" : "items-start text-left"}`}>
                    <div className={`flex items-center gap-2 text-[11px] text-muted-foreground ${isRightAligned ? "justify-end" : "justify-start"}`}>
                      <span className="font-semibold text-foreground">{isAi ? "TeddyAI" : message.senderName}</span>
                      <span>•</span>
                      <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div
                      className={`w-fit max-w-full p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                        isRightAligned
                          ? "bg-[#09090B] dark:bg-zinc-900 text-white rounded-tr-xs"
                          : "bg-card border border-border/70 text-foreground rounded-tl-xs"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Bottom Message Input Form */}
        <div className="p-4 border-t bg-background shrink-0">
          {isTypingUnlocked ? (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Textarea
                placeholder="Type your message here..."
                className="flex-1 min-h-[44px] max-h-[100px] py-3 text-sm focus-visible:ring-1 focus-visible:ring-primary border-muted resize-none scrollbar-thin text-foreground bg-background"
                value={inputText}
                disabled={isSending}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button type="submit" size="icon" className="shrink-0 size-10 bg-primary rounded-xl" disabled={!inputText.trim() || isSending}>
                <Send className="size-4 text-primary-foreground" />
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-center rounded-lg border border-dashed bg-muted/10 text-muted-foreground">
              <Clock className="size-4 mb-1 text-muted-foreground animate-spin" />
              <p className="text-xs">
                {!isApplicationActive
                  ? "Discussion closed. Application process has been completed."
                  : isReviewerBlockedDuringAi
                    ? "TeddyAI Interview in Progress. Only the applicant can respond to TeddyAI. Use 'Interject Custom Question' in the side drawer to queue a question for the AI."
                    : "Chat Locked. The reviewer is reviewing the transcript to make a decision."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FINAL ACTION DECISION DIALOG MODAL */}
      <Dialog open={isDecisionOpen} onOpenChange={setIsDecisionOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-1.5">
              {decisionType === "APPROVED" ? (
                <>
                  <ThumbsUp className="size-5 text-emerald-600" />
                  Approve Application & Schedule Meet & Greet
                </>
              ) : (
                <>
                  <ThumbsDown className="size-5 text-rose-500" />
                  Reject Adoption Application
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground leading-normal">
              {decisionType === "APPROVED"
                ? "This will approve the application, transition status, reserve the pet listing, and notify the adopter to schedule their Meet & Greet session."
                : "This will reject the application. Please provide the reason explaining this decision. Adopter will be notified immediately."}
            </p>
            <div className="space-y-1.5">
              <label htmlFor="decision-notes" className="text-xs font-semibold text-foreground">
                {decisionType === "APPROVED" ? "Approval Notes" : "Reason for Rejection"}
              </label>
              <textarea
                id="decision-notes"
                className="w-full min-h-[100px] text-sm p-3 border rounded-lg focus:ring-1 focus:ring-primary outline-none text-foreground bg-background"
                placeholder={decisionType === "APPROVED" ? "Type meeting schedules or guidelines..." : "Explain why the application is not approved..."}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                disabled={isDecisionSubmitting}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="outline" className="flex-1 order-last sm:order-first" onClick={() => setIsDecisionOpen(false)} disabled={isDecisionSubmitting}>
              Cancel
            </Button>
            <Button
              variant={decisionType === "APPROVED" ? "default" : "destructive"}
              className={`flex-1 ${decisionType === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700 hover:text-white text-white font-semibold" : ""}`}
              onClick={handleDecisionSubmit}
              disabled={isDecisionSubmitting || (decisionType === "REJECTED" && !decisionNotes.trim())}
            >
              {isDecisionSubmitting ? "Submitting..." : decisionType === "APPROVED" ? "Yes, Approve & Move to M&G" : "Confirm Rejection"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FINISH INTERVIEW EARLY CONFIRMATION MODAL */}
      <ConfirmationDialog
        isOpen={isEndEarlyOpen}
        onClose={() => setIsEndEarlyOpen(false)}
        onConfirm={handleEndInterviewEarlyConfirm}
        title="Finish Interview Early?"
        description={`Are you sure you want to end the TeddyAI interview for ${app.pet.name} early? This will lock the chat and compile the post-interview summary for your review.`}
        confirmText="Finish Interview Early"
        cancelText="Cancel"
        variant="warning"
        isLoading={isEndingEarly}
      />
    </div>
  )
}

// Small cross-icon mapping for inline closure of ribbon
function XIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
