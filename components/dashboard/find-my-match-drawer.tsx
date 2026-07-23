"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Heart,
  Check,
  PawPrint,
  MessageSquareCode,
  ShieldAlert,
  Loader2Icon,
  BotIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  findMyMatchesAction,
  type MatchAnswers,
  type MatchResult,
} from "@/lib/actions/match.action"
import { cn } from "@/lib/utils"

interface FindMyMatchDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FindMyMatchDrawer({ open, onOpenChange }: FindMyMatchDrawerProps) {
  const [step, setStep] = useState<number>(0) // 0: Start, 1: Species, 2: Environment, 3: Schedule, 4: Activity, 5: Experience, 6: Loading, 7: Results
  const [isPending, startTransition] = useTransition()
  const [answers, setAnswers] = useState<Partial<MatchAnswers>>({})
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const stepsTotal = 5

  const startQuiz = () => {
    setAnswers({})
    setErrorMessage(null)
    setStep(1)
  }

  const handleSelect = (key: keyof MatchAnswers, value: any) => {
    const updatedAnswers = { ...answers, [key]: value }
    setAnswers(updatedAnswers)
    setTimeout(() => {
      advance(1, updatedAnswers)
    }, 200)
  }

  const advance = (dir: number, currentAnswers = answers) => {
    const next = step + dir
    if (next > stepsTotal) {
      setStep(6) // Loading state
      runMatching(currentAnswers as MatchAnswers)
    } else {
      setStep(next)
    }
  }

  const runMatching = (currentAnswers: MatchAnswers) => {
    setErrorMessage(null)
    startTransition(async () => {
      const result = await findMyMatchesAction(currentAnswers)
      if (result.success && result.data) {
        setMatches(result.data)
        setStep(7) // Results state
      } else {
        setErrorMessage(result.error || "Could not calculate matches. Please try again.")
        setStep(7)
      }
    })
  }

  const resetQuiz = () => {
    setAnswers({})
    setMatches([])
    setErrorMessage(null)
    setStep(0)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col h-full overflow-hidden bg-white"
      >
        <SheetHeader className="p-6 border-b bg-white shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-[#AE8F65]/10 text-[#AE8F65] border-[#AE8F65]/30 text-xs font-bold px-2.5 py-0.5">
              <Sparkles className="size-3 mr-1 inline" /> Teddy AI Matchmaker
            </Badge>
          </div>
          <SheetTitle className="text-xl font-bold text-foreground">
            Find Your Companion Match
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Answer a few quick questions to discover your ideal rescue pet based on lifestyle and housing compatibility.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="py-6 text-center space-y-6 max-w-md mx-auto">
              <div className="size-20 rounded-2xl bg-gradient-to-tr from-[#AE8F65] to-amber-400 flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="size-10 text-white" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                  Smart Lifestyle Matching
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Teddy AI evaluates available shelter animals semantically against your home setup, work schedule, and pet preferences.
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <BotIcon className="size-4 text-[#AE8F65]" /> Real-time Compatibility Scoring
                </div>
                <p className="text-muted-foreground leading-normal text-[11px]">
                  Bypasses hard filters to discover companion pets that fit your daily physical routines and living spaces.
                </p>
              </div>

              <Button
                onClick={startQuiz}
                size="lg"
                className="w-full bg-[#AE8F65] text-white hover:bg-[#9A7D58] cursor-pointer rounded-xl font-bold shadow-xs text-xs h-11"
              >
                Start Matcher Quiz <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 1 to 5: Questionnaire Flow */}
          {step >= 1 && step <= 5 && (
            <div className="space-y-6 max-w-lg mx-auto py-2">
              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold">
                  <span>Question {step} of {stepsTotal}</span>
                  <span>{Math.round((step / stepsTotal) * 100)}% Completed</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#AE8F65] transition-all duration-300 rounded-full"
                    style={{ width: `${(step / stepsTotal) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step 1: Species */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-foreground">
                    What type of pet companion are you looking for?
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "DOG", label: "Dog", icon: "🐶", desc: "Loyal, active & loving" },
                      { key: "CAT", label: "Cat", icon: "🐱", desc: "Independent & cozy" },
                      { key: "RABBIT", label: "Rabbit", icon: "🐰", desc: "Quiet & gentle" },
                      { key: "BIRD", label: "Bird", icon: "🦜", desc: "Social & cheerful" },
                      { key: "ANY", label: "Open to Any", icon: "✨", desc: "Match me with best fit" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelect("species", opt.key)}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all cursor-pointer hover:border-[#AE8F65] flex flex-col justify-between h-28",
                          answers.species === opt.key
                            ? "border-[#AE8F65] bg-[#AE8F65]/10 ring-2 ring-[#AE8F65]/20"
                            : "border-border bg-white"
                        )}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <div>
                          <p className="font-bold text-xs text-foreground">{opt.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Environment */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-foreground">
                    What best describes your living arrangement?
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { key: "APARTMENT", label: "Apartment / Condo", desc: "No private yard, shared building layout" },
                      { key: "TOWNHOUSE", label: "Townhouse / Small Home", desc: "Modest layout, patio or small yard" },
                      { key: "HOUSE_YARD", label: "House with Private Yard", desc: "Fenced yard with abundant space" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelect("environment", opt.key)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all cursor-pointer hover:border-[#AE8F65]",
                          answers.environment === opt.key
                            ? "border-[#AE8F65] bg-[#AE8F65]/10 ring-2 ring-[#AE8F65]/20"
                            : "border-border bg-white"
                        )}
                      >
                        <p className="font-bold text-xs text-foreground">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-foreground">
                    How much time is someone home during regular weekdays?
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { key: "HOME", label: "Work from Home / Mostly Present", desc: "Pet companion will rarely be alone for long hours" },
                      { key: "GONE_MODERATE", label: "Gone 4 to 8 Hours", desc: "Standard work shift or hybrid routine" },
                      { key: "GONE_LONG", label: "Gone 8+ Hours", desc: "Long daily working shifts outside home" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelect("schedule", opt.key)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all cursor-pointer hover:border-[#AE8F65]",
                          answers.schedule === opt.key
                            ? "border-[#AE8F65] bg-[#AE8F65]/10 ring-2 ring-[#AE8F65]/20"
                            : "border-border bg-white"
                        )}
                      >
                        <p className="font-bold text-xs text-foreground">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Activity Level */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-foreground">
                    What is your household's daily activity level?
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { key: "LOW", label: "Relaxed & Calm", desc: "Casual short walks, quiet couch companionship" },
                      { key: "MODERATE", label: "Moderately Active", desc: "Daily walks, backyard play, routine outdoor time" },
                      { key: "HIGH", label: "Highly Active / Outdoorsy", desc: "Long hikes, running, daily vigorous activity" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelect("activity", opt.key)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all cursor-pointer hover:border-[#AE8F65]",
                          answers.activity === opt.key
                            ? "border-[#AE8F65] bg-[#AE8F65]/10 ring-2 ring-[#AE8F65]/20"
                            : "border-border bg-white"
                        )}
                      >
                        <p className="font-bold text-xs text-foreground">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Pet Experience */}
              {step === 5 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-foreground">
                    What is your experience level caring for pets?
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { key: "NONE", label: "First-Time Owner", desc: "Looking for an easy-going, beginner-friendly pet" },
                      { key: "SOME", label: "Some Pet Experience", desc: "Familiar with routine pet care & training" },
                      { key: "EXPERT", label: "Experienced Owner", desc: "Comfortable with specialized training or medical care" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelect("experience", opt.key)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all cursor-pointer hover:border-[#AE8F65]",
                          answers.experience === opt.key
                            ? "border-[#AE8F65] bg-[#AE8F65]/10 ring-2 ring-[#AE8F65]/20"
                            : "border-border bg-white"
                        )}
                      >
                        <p className="font-bold text-xs text-foreground">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step navigation actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => advance(-1)}
                  className="text-xs h-9 px-3 cursor-pointer"
                >
                  <ArrowLeft className="size-3.5 mr-1" /> Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Loading Screen */}
          {step === 6 && (
            <div className="py-16 text-center space-y-6 max-w-sm mx-auto">
              <div className="relative size-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#AE8F65]/20 animate-ping" />
                <div className="size-16 rounded-full bg-gradient-to-tr from-[#AE8F65] to-amber-500 flex items-center justify-center shadow-md">
                  <Sparkles className="size-8 text-white animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">
                  Analyzing Pet Compatibility...
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Teddy AI is evaluating active rescue listings to match your schedule, activity level, and home setup.
                </p>
              </div>
            </div>
          )}

          {/* Step 7: Results Screen */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Your Top AI Recommendations
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Found {matches.length} compatible shelter companions
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetQuiz}
                  className="text-xs h-8 rounded-lg cursor-pointer"
                >
                  <RotateCcw className="size-3 mr-1" /> Retake Quiz
                </Button>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <ShieldAlert className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {matches.length === 0 && !errorMessage ? (
                <div className="py-12 text-center space-y-3 bg-white rounded-xl border p-6">
                  <PawPrint className="size-10 text-muted-foreground/40 mx-auto" />
                  <h4 className="text-sm font-bold text-foreground">No Exact Match Found</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Try relaxing your criteria or choosing "Open to Any" species to see more matches.
                  </p>
                  <Button
                    onClick={resetQuiz}
                    size="sm"
                    className="bg-[#AE8F65] text-white hover:bg-[#9A7D58] rounded-xl text-xs"
                  >
                    Adjust Quiz Answers
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((item, idx) => {
                    const pet = item.pet
                    const isTopMatch = idx === 0
                    return (
                      <div
                        key={pet.id}
                        className={cn(
                          "rounded-2xl border p-4 transition-all bg-white space-y-3",
                          isTopMatch
                            ? "border-amber-400 ring-2 ring-amber-400/20 shadow-md"
                            : "border-border shadow-xs"
                        )}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="relative size-16 sm:size-20 rounded-xl border overflow-hidden shrink-0 bg-muted">
                            {pet.primaryImageUrl ? (
                              <img
                                src={pet.primaryImageUrl}
                                alt={pet.name}
                                className="object-cover size-full"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-muted-foreground text-xl">
                                🐾
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-sm text-foreground truncate">
                                {pet.name}
                              </h4>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[11px] font-extrabold px-2 py-0.5 shrink-0",
                                  item.score >= 85
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                                    : "bg-amber-500/10 border-amber-500/30 text-amber-700"
                                )}
                              >
                                {item.score}% Match
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {pet.species} · {pet.breed || "Mixed Breed"} · {pet.size}
                            </p>
                            <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed italic pt-1">
                              "{item.reason}"
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 rounded-lg cursor-pointer"
                          >
                            <Link href={`/pets/${pet.id}`}>View Details</Link>
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            className="text-xs h-8 rounded-lg bg-[#AE8F65] hover:bg-[#9A7D58] text-white cursor-pointer font-bold"
                          >
                            <Link href={`/pets/${pet.id}/apply`}>Apply to Adopt</Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
