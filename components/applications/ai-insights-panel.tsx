"use client"

import { useState, useEffect, useTransition } from "react"
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Loader2,
  HelpCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { generateApplicationAIInsightAction } from "@/app/(dashboard)/applications/actions/ai.action"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AIInsight {
  id: string
  applicationId: string
  model: string
  promptVersion: string
  summary: string
  strengths: string[]
  semiFlags: { title: string; severity: string; reason: string; recommendation?: string }[]
  redFlags: { title: string; severity: string; reason: string; recommendation?: string }[]
  recommendedQuestions: string[]
  suitabilityScore: number
  rawResponse: string
  createdAt: string | Date
}

interface AIInsightsPanelProps {
  applicationId: string
  initialInsight: AIInsight | null
}

const LOADING_STEPS = [
  "Analyzing applicant information...",
  "Reviewing household compatibility...",
  "Evaluating pet suitability...",
  "Generating reviewer recommendations...",
  "Preparing AI insights...",
]

export function AIInsightsPanel({
  applicationId,
  initialInsight,
}: AIInsightsPanelProps) {
  const router = useRouter()
  const [insight, setInsight] = useState<AIInsight | null>(initialInsight)
  const [isPending, startTransition] = useTransition()
  const [loadingStepIndex, setLoadingStepIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  // Track acknowledged flags by their index or title
  const [acknowledgedFlags, setAcknowledgedFlags] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPending) {
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev))
      }, 2000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPending])

  const handleAcknowledge = (title: string, checked: boolean) => {
    setAcknowledgedFlags((prev) => ({
      ...prev,
      [title]: checked,
    }))
  }

  const handleGenerate = () => {
    setError(null)
    setLoadingStepIndex(0)
    startTransition(async () => {
      const response = await generateApplicationAIInsightAction(applicationId)
      if (response.success) {
        setInsight(response.data as AIInsight)
        setAcknowledgedFlags({})
        toast.success("AI Insights updated successfully")
        router.refresh()
      } else {
        setError(response.error)
        toast.error("AI review temporarily unavailable")
      }
    })
  }

  // Determine score color/category
  const score = insight?.suitabilityScore ?? 0
  let scoreLabel = "Match Level"
  let scoreColor = "bg-emerald-500"
  let scoreBg = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
  
  if (score >= 80) {
    scoreLabel = "Excellent Match"
    scoreColor = "bg-emerald-500"
    scoreBg = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
  } else if (score >= 60) {
    scoreLabel = "Good Match"
    scoreColor = "bg-indigo-500"
    scoreBg = "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
  } else if (score >= 40) {
    scoreLabel = "Fair Match"
    scoreColor = "bg-amber-500"
    scoreBg = "bg-amber-500/10 text-amber-700 dark:text-amber-400"
  } else {
    scoreLabel = "Poor Match"
    scoreColor = "bg-rose-500"
    scoreBg = "bg-rose-500/10 text-rose-700 dark:text-rose-400"
  }

  // Parse JSON columns if necessary
  const strengths: string[] = Array.isArray(insight?.strengths) ? (insight.strengths as string[]) : []
  const semiFlags = Array.isArray(insight?.semiFlags) ? insight.semiFlags : []
  const redFlags = Array.isArray(insight?.redFlags) ? insight.redFlags : []
  const questions: string[] = Array.isArray(insight?.recommendedQuestions) ? (insight.recommendedQuestions as string[]) : []

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      {isPending && (
        <Card className="border-primary/20 bg-muted/40 p-12 text-center animate-pulse flex flex-col items-center justify-center min-h-[300px] gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <div className="space-y-2">
            <h4 className="font-semibold text-lg text-foreground">Generating Teddy AI Insights...</h4>
            <p className="text-sm text-muted-foreground transition-all duration-300">
              {LOADING_STEPS[loadingStepIndex]}
            </p>
          </div>
        </Card>
      )}

      {/* Error state */}
      {error && !isPending && (
        <Card className="border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
          <div className="flex gap-3 items-start">
            <AlertOctagon className="size-6 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-rose-800 dark:text-rose-400">Teddy AI is temporarily unavailable</h4>
              <p className="text-sm text-rose-700/90 dark:text-rose-300/80">
                {error}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleGenerate} className="ml-9">
            <RefreshCw className="size-4 mr-2" />
            Try Again
          </Button>
        </Card>
      )}

      {/* Initial Action Card if no Insight generated yet */}
      {!insight && !isPending && !error && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Sparkles className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Ask Teddy AI Co-Pilot</CardTitle>
                <CardDescription>Get instant evaluation, compatibility support, and screening questions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Teddy AI will read the complete application context (applicant lifestyle, current pets, pet behavior profile, housing parameters) to build reviewer insights. 
              <strong> Final approval decisions remain strictly with the human reviewer.</strong>
            </p>
            <Button onClick={handleGenerate} className="w-full sm:w-auto">
              <Sparkles className="size-4 mr-2" />
              Ask Teddy AI
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Insights Panel */}
      {insight && !isPending && (
        <Card className="border-primary/15 overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    Teddy AI Insights
                  </CardTitle>
                  <CardDescription>
                    AI-generated recommendations to assist reviewers. Final decisions remain with the reviewer.
                  </CardDescription>
                </div>
              </div>
              {/* <Button variant="outline" size="sm" onClick={handleGenerate} className="h-8">
                <RefreshCw className="size-3.5 mr-1.5" />
                Regenerate
              </Button> */}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Score & AI Recommendation Row */}
            <div className="grid gap-6 md:grid-cols-[200px_1fr] items-center border-b pb-6">
              {/* Score block */}
              <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-muted/10 text-center space-y-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Suitability Score</span>
                <span className="text-4xl font-extrabold text-foreground">{score} <span className="text-lg text-muted-foreground">/100</span></span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${scoreBg}`}>
                  {scoreLabel}
                </span>
              </div>
              {/* Recommendation details */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Suggested Next Step</span>
                  <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                    {insight.rawResponse ? (
                      (() => {
                        let parsedLabel = "Proceed"
                        try {
                          const parsedObj = JSON.parse(insight.rawResponse)
                          parsedLabel = parsedObj.recommendation?.label ?? "Proceed"
                        } catch {
                          // Ignore
                        }
                        return parsedLabel
                      })()
                    ) : "Proceed to Interview"}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.rawResponse ? (
                      (() => {
                        let parsedReason = ""
                        try {
                          const parsedObj = JSON.parse(insight.rawResponse)
                          parsedReason = parsedObj.recommendation?.reason ?? ""
                        } catch {
                          // Ignore
                        }
                        return parsedReason
                      })()
                    ) : ""}
                  </p>
                </div>
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div className={`${scoreColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${score}%` }}></div>
                  </div>
                  <span className="text-[11px] text-muted-foreground block italic">
                    Disclaimer: This score is AI-generated and is intended only as reviewer guidance.
                  </span>
                </div>
              </div>
            </div>

            {/* Application Summary */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Application Summary</h4>
              <p className="text-sm text-foreground/90 leading-relaxed bg-muted/10 border p-4 rounded-lg">
                {insight.summary}
              </p>
            </div>

            {/* Red Flags (High Priority Alerts) */}
            {redFlags.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Critical Risks (Red Flags)</h4>
                <div className="space-y-3">
                  {redFlags.map((flag, idx) => (
                    <div key={idx} className="flex gap-3 rounded-lg border border-rose-200/50 bg-rose-500/5 p-4 dark:border-rose-950/30">
                      <AlertOctagon className="size-5 shrink-0 text-rose-600 dark:text-rose-500 mt-0.5" />
                      <div className="space-y-1.5">
                        <h5 className="font-bold text-rose-950 dark:text-rose-400 text-sm">{flag.title}</h5>
                        <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">{flag.reason}</p>
                        {flag.recommendation && (
                          <p className="text-xs text-rose-950 dark:text-rose-200">
                            <strong>Recommended Action:</strong> {flag.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Semi Flags (Medium Priority Alerts) */}
            {semiFlags.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">Concerns (Semi Flags)</h4>
                <div className="space-y-3">
                  {semiFlags.map((flag, idx) => {
                    const isAck = !!acknowledgedFlags[flag.title]
                    return (
                      <div key={idx} className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors ${
                        isAck 
                          ? "border-muted bg-muted/20 opacity-70" 
                          : "border-amber-200/50 bg-amber-500/5 dark:border-amber-950/30"
                      }`}>
                        <div className="flex gap-3">
                          <AlertTriangle className={`size-5 shrink-0 mt-0.5 ${isAck ? "text-muted-foreground" : "text-amber-600 dark:text-amber-500"}`} />
                          <div className="space-y-1.5 flex-1">
                            <h5 className={`font-bold text-sm ${isAck ? "text-muted-foreground line-through" : "text-amber-950 dark:text-amber-400"}`}>{flag.title}</h5>
                            <p className={`text-xs leading-relaxed ${isAck ? "text-muted-foreground" : "text-amber-800 dark:text-amber-300"}`}>{flag.reason}</p>
                            {flag.recommendation && (
                              <p className={`text-xs ${isAck ? "text-muted-foreground" : "text-amber-950 dark:text-amber-200"}`}>
                                <strong>Recommendation:</strong> {flag.recommendation}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Human override Decision */}
                        <div className="flex items-center gap-2 pl-8 pt-1 border-t border-muted-foreground/10">
                          <Checkbox 
                            id={`ack-${idx}`} 
                            checked={isAck}
                            onCheckedChange={(checked) => handleAcknowledge(flag.title, !!checked)}
                            disabled={isPending}
                          />
                          <label 
                            htmlFor={`ack-${idx}`}
                            className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
                          >
                            I acknowledge this recommendation
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Applicant Strengths</h4>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {strengths.map((str, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-foreground/80 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Questions */}
            {questions.length > 0 && (
              <div className="space-y-3 border-t pt-5">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <HelpCircle className="size-4 text-primary" />
                  <h4 className="text-sm font-bold uppercase tracking-wider">Recommended Interview Questions</h4>
                </div>
                <div className="space-y-2 pl-5 list-decimal text-sm text-foreground/90">
                  {questions.map((q, idx) => (
                    <div key={idx} className="flex gap-2 bg-muted/10 p-3 rounded-lg border">
                      <span className="font-semibold text-primary">{idx + 1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      )}
    </div>
  )
}
