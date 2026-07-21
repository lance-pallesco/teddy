"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Sparkles, ArrowRight, ArrowLeft, RotateCcw, Heart, Check, PawPrint, MessageSquareCode, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { findMyMatchesAction, type MatchAnswers, type MatchResult } from "@/app/(dashboard)/match/actions/match.action"
import { cn } from "@/lib/utils"

export function MatchWizard() {
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
    setAnswers((prev) => ({ ...prev, [key]: value }))
    // Automatically advance to next step after a tiny delay for natural pacing
    setTimeout(() => {
      advance(1)
    }, 250)
  }

  const advance = (dir: number) => {
    const next = step + dir
    if (next > stepsTotal) {
      setStep(6) // Loading state
      runMatching(answers as MatchAnswers)
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

  // --- Step 0: Welcome Screen ---
  if (step === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center space-y-8">
        <div className="size-20 rounded-2xl bg-gradient-to-tr from-[#AE8F65] to-amber-300 flex items-center justify-center mx-auto shadow-md">
          <Sparkles className="size-10 text-white" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Find Your Companion Match
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Answer a few quick questions about your home, schedule, and lifestyle. Teddy AI will analyze compatibility and introduce you to your perfect rescue partner!
          </p>
        </div>

        <div className="bg-[#AE8F65]/5 border border-[#AE8F65]/10 rounded-xl p-4 max-w-md mx-auto text-left flex items-start gap-3">
          <div className="text-xs space-y-1">
            <p className="font-bold text-gray-800">Powered by Teddy AI</p>
            <p className="text-muted-foreground leading-normal">
              Teddy AI reviews shelter listings semantically. It bypasses simple hard filters to match you with pets that truly fit your daily routine and lifestyle.
            </p>
          </div>
        </div>

        <Button
          onClick={startQuiz}
          size="lg"
          className="bg-[#AE8F65] text-white hover:bg-[#9A7D58] px-8 cursor-pointer rounded-xl font-bold shadow-xs text-sm"
        >
          Start Matching
          <ArrowRight className="size-4 ml-2" />
        </Button>
      </div>
    )
  }

  // --- Step 6: Loading screen ---
  if (step === 6) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="relative size-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-[#AE8F65]/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#AE8F65] border-r-[#AE8F65] animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-base text-gray-900">Consulting Teddy AI</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Analyzing your lifestyle preferences against our available shelter companions. Finding your matches...
          </p>
        </div>
      </div>
    )
  }

  // --- Step 7: Results screen ---
  if (step === 7) {
    const bestMatch = matches[0]
    const alternatives = matches.slice(1)

    return (
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              🐾 Your Matches
            </h1>
            <p className="text-xs text-muted-foreground">
              Based on your answers, Teddy AI recommends these companions from our shelter.
            </p>
          </div>
          <Button
            onClick={resetQuiz}
            variant="outline"
            size="sm"
            className="rounded-lg text-xs font-semibold cursor-pointer border-primary/20 shrink-0 self-start"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Start Over
          </Button>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex gap-2 items-center">
            <ShieldAlert className="size-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              🐾
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-foreground">No matches found</h4>
              <p className="text-xs text-muted-foreground leading-normal">
                Teddy AI couldn't find available pets matching your exact species or lifestyle preference. Try expanding your search species or updating answers!
              </p>
            </div>
            <Button onClick={resetQuiz} size="sm" className="bg-[#AE8F65] text-white hover:bg-[#9A7D58] cursor-pointer">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Recommendation Highlight */}
            {bestMatch && (
              <div className="space-y-4">
                <span className="block text-xs uppercase font-extrabold text-[#AE8F65] tracking-widest leading-none">
                  🌟 Top Companion Match
                </span>
                
                <Card className="overflow-hidden border border-[#AE8F65]/30 shadow-md hover:shadow-lg transition-all bg-gradient-to-b from-[#AE8F65]/5 via-white to-white rounded-2xl relative">
                  <div className="grid grid-cols-1 md:grid-cols-12">
                    
                    {/* Left: Thumbnail Image */}
                    <div className="md:col-span-4 relative h-64 md:h-full min-h-60 bg-muted">
                      {bestMatch.pet.primaryImageUrl ? (
                        <img
                          src={bestMatch.pet.primaryImageUrl}
                          alt={bestMatch.pet.name}
                          className="object-cover size-full absolute inset-0"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-muted/40 text-muted-foreground text-4xl">
                          🐾
                        </div>
                      )}
                      
                      {/* Compatibility Badge on top of image */}
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                        <Heart className="size-3.5 fill-white stroke-none" />
                        {bestMatch.score}% Match
                      </div>
                    </div>

                    {/* Right: Info details & AI Reasoning */}
                    <div className="md:col-span-8 p-6 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none">
                            {bestMatch.pet.speciesBreed} &bull; {bestMatch.pet.ageLabel}
                          </span>
                          <h2 className="text-2xl font-extrabold text-gray-900 leading-none">
                            {bestMatch.pet.name}
                          </h2>
                          {bestMatch.pet.attribution?.label && (
                            <p className="text-[10px] text-[#AE8F65] font-semibold leading-none">
                              {bestMatch.pet.attribution.label}
                            </p>
                          )}
                        </div>

                        {bestMatch.pet.description && (
                          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed italic">
                            "{bestMatch.pet.description}"
                          </p>
                        )}

                        {/* AI Match Reason quote card */}
                        <div className="bg-[#AE8F65]/5 border border-[#AE8F65]/10 rounded-xl p-4.5 space-y-2 relative">
                          <span className="text-[9px] uppercase font-black text-[#AE8F65] tracking-widest flex items-center gap-1.5">
                            <MessageSquareCode className="size-3.5 text-[#AE8F65]" />
                            Teddy AI Compatibility Analysis
                          </span>
                          <p className="text-xs text-gray-700 leading-relaxed text-left font-medium">
                            {bestMatch.reason}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button asChild className="bg-[#AE8F65] text-white hover:bg-[#9A7D58] rounded-xl flex-1 text-xs font-bold shadow-xs cursor-pointer">
                          <Link href={`/pets/${bestMatch.pet.id}/apply`}>
                            Apply to Adopt {bestMatch.pet.name}
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="border-primary/20 hover:bg-muted/30 rounded-xl flex-1 text-xs font-bold cursor-pointer">
                          <Link href={`/pets/${bestMatch.pet.id}`}>
                            View Pet Details
                          </Link>
                        </Button>
                      </div>

                    </div>

                  </div>
                </Card>
              </div>
            )}

            {/* Alternatives section */}
            {alternatives.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <span className="block text-xs uppercase font-extrabold text-muted-foreground tracking-widest leading-none">
                  ✨ Other Perfect Matches
                </span>
                
                <div className="grid gap-5 sm:grid-cols-2">
                  {alternatives.map((item) => (
                    <Card key={item.pet.id} className="overflow-hidden border border-primary/10 hover:shadow-md transition-all flex flex-col justify-between bg-white rounded-xl">
                      
                      {/* Image header */}
                      <div className="relative h-44 bg-muted overflow-hidden shrink-0">
                        {item.pet.primaryImageUrl ? (
                          <img
                            src={item.pet.primaryImageUrl}
                            alt={item.pet.name}
                            className="object-cover size-full"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-muted/40 text-muted-foreground text-2xl">
                            🐾
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
                          {item.score}% Match
                        </div>
                      </div>

                      {/* Contents */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="space-y-0.5">
                            <span className="block text-[9px] uppercase font-bold text-muted-foreground tracking-wider leading-none">
                              {item.pet.speciesBreed} &bull; {item.pet.ageLabel}
                            </span>
                            <h3 className="font-bold text-lg text-gray-900 leading-snug">
                              {item.pet.name}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                            {item.reason}
                          </p>
                        </div>

                        {/* Card actions */}
                        <div className="flex gap-2 pt-2">
                          <Button asChild size="sm" className="bg-[#AE8F65] text-white hover:bg-[#9A7D58] rounded-lg text-[10px] font-bold flex-1 cursor-pointer">
                            <Link href={`/pets/${item.pet.id}/apply`}>
                              Apply
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="border-primary/20 rounded-lg text-[10px] font-bold flex-1 cursor-pointer">
                            <Link href={`/pets/${item.pet.id}`}>
                              Details
                            </Link>
                          </Button>
                        </div>
                      </div>

                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // --- Steps 1 to 5: Questionnaire Wizard Questions ---
  return (
    <div className="max-w-xl mx-auto py-8 px-4 text-left space-y-6">
      
      {/* Step Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-extrabold text-[#AE8F65] tracking-widest">
            Step {step} of {stepsTotal}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">
            {Math.round((step / stepsTotal) * 100)}% Complete
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[#AE8F65] transition-all duration-300"
            style={{ width: `${(step / stepsTotal) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps content mapping */}
      {step === 1 && (
        <Card className="border border-primary/10 shadow-xs bg-white">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-lg font-bold text-gray-900">
              Which companions are you looking for?
            </CardTitle>
            <CardDescription className="text-xs">
              Select your preferred species. You can also match with any animal.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 pt-2">
            {[
              { value: "DOG", label: "Dogs Only", icon: "🐶" },
              { value: "CAT", label: "Cats Only", icon: "🐱" },
              { value: "RABBIT", label: "Rabbits / Rodents", icon: "🐰" },
              { value: "BIRD", label: "Birds", icon: "🦜" },
              { value: "ANY", label: "Surprise Me!", icon: "🔍" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect("species", opt.value)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border border-border bg-background text-left hover:border-primary/30 hover:bg-muted/10 hover:shadow-xs transition-all cursor-pointer font-bold text-xs text-foreground",
                  answers.species === opt.value && "border-[#AE8F65] bg-[#AE8F65]/5 ring-2 ring-[#AE8F65]/20"
                )}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border border-primary/10 shadow-xs bg-white">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-lg font-bold text-gray-900">
              Describe your living environment.
            </CardTitle>
            <CardDescription className="text-xs">
              This helps select pets suitable for your layout size.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-2">
            {[
              { value: "APARTMENT", label: "Apartment / Condo", desc: "Cozy spaces, close neighbours, typically no private yard.", icon: "🏢" },
              { value: "TOWNHOUSE", label: "Townhouse / Duplex", desc: "Moderate spacing, small private or shared outdoor area.", icon: "🏡" },
              { value: "HOUSE_YARD", label: "House with Yard", desc: "Spacious house with a dedicated fenced outdoor yard.", icon: "🌳" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect("environment", opt.value)}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border border-border bg-background text-left hover:border-primary/30 hover:bg-muted/10 hover:shadow-xs transition-all cursor-pointer text-foreground",
                  answers.environment === opt.value && "border-[#AE8F65] bg-[#AE8F65]/5 ring-2 ring-[#AE8F65]/20"
                )}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs">{opt.label}</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">{opt.desc}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border border-primary/10 shadow-xs bg-white">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-lg font-bold text-gray-900">
              How long will the pet be left alone daily?
            </CardTitle>
            <CardDescription className="text-xs">
              Matches companionship requirements and independence traits.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-2">
            {[
              { value: "HOME", label: "Mostly Home (0-4 hours)", desc: "Works from home, retired, or has a busy multi-person household.", icon: "🕒" },
              { value: "GONE_MODERATE", label: "Moderate (4-8 hours)", desc: "Standard school or work schedule. Gone during standard hours.", icon: "🏢" },
              { value: "GONE_LONG", label: "Frequently Gone (8+ hours)", desc: "Very active schedules, travel, or long office hours.", icon: "✈️" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect("schedule", opt.value)}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border border-border bg-background text-left hover:border-primary/30 hover:bg-muted/10 hover:shadow-xs transition-all cursor-pointer text-foreground",
                  answers.schedule === opt.value && "border-[#AE8F65] bg-[#AE8F65]/5 ring-2 ring-[#AE8F65]/20"
                )}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs">{opt.label}</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">{opt.desc}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border border-primary/10 shadow-xs bg-white">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-lg font-bold text-gray-900">
              What is your household activity level?
            </CardTitle>
            <CardDescription className="text-xs">
              Matches a pet's energy and exercise needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-2">
            {[
              { value: "LOW", label: "Relaxed / Calm", desc: "Short gentle walks, indoor play, and couch cuddling.", icon: "🛋️" },
              { value: "MODERATE", label: "Moderately Active", desc: "Daily walks, fetch play, and occasional outdoor trips.", icon: "🚶" },
              { value: "HIGH", label: "Highly Active / Athletic", desc: "Jogging, hiking, long runs, and outdoor training adventures.", icon: "🏃" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect("activity", opt.value)}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border border-border bg-background text-left hover:border-primary/30 hover:bg-muted/10 hover:shadow-xs transition-all cursor-pointer text-foreground",
                  answers.activity === opt.value && "border-[#AE8F65] bg-[#AE8F65]/5 ring-2 ring-[#AE8F65]/20"
                )}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs">{opt.label}</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">{opt.desc}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card className="border border-primary/10 shadow-xs bg-white">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-lg font-bold text-gray-900">
              What is your pet ownership experience?
            </CardTitle>
            <CardDescription className="text-xs">
              Helps select pets requiring differing training needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-2">
            {[
              { value: "NONE", label: "First-time Owner", desc: "Excited to welcome a pet for the very first time.", icon: "🥚" },
              { value: "SOME", label: "Some Experience", desc: "Has owned pets in the past, comfortable with basic training.", icon: "🎓" },
              { value: "EXPERT", label: "Experienced Owner", desc: "Owns current pets, knows behavioural cues and high needs.", icon: "👑" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect("experience", opt.value)}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border border-border bg-background text-left hover:border-primary/30 hover:bg-muted/10 hover:shadow-xs transition-all cursor-pointer text-foreground",
                  answers.experience === opt.value && "border-[#AE8F65] bg-[#AE8F65]/5 ring-2 ring-[#AE8F65]/20"
                )}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs">{opt.label}</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">{opt.desc}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Nav Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button
          onClick={() => advance(-1)}
          disabled={step <= 1}
          variant="outline"
          size="sm"
          className="rounded-lg text-xs font-semibold cursor-pointer border-primary/20"
        >
          <ArrowLeft className="size-3.5 mr-1" />
          Back
        </Button>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Teddy Match Wizard
        </span>
      </div>

    </div>
  )
}
