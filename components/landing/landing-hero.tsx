"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PawPrintBg } from "@/components/landing/paw-print-bg"
import {
  Sparkles,
  ShieldCheck,
  Heart,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Award,
  PawPrint,
} from "lucide-react"

function TypewriterHeadline() {
  const phrases = useMemo(
    () => [
      "Paw-fect Companion",
      "Forever Friend",
      "Loving Family",
      "Ideal Pet Match",
    ],
    []
  )

  const [phraseIndex, setPhraseIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const fullText = phrases[phraseIndex]

    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, 2200)
      return () => clearTimeout(pauseTimeout)
    }

    if (!isDeleting && currentText === fullText) {
      setIsPaused(true)
      return
    }

    if (isDeleting && currentText === "") {
      setIsDeleting(false)
      setPhraseIndex((prev) => (prev + 1) % phrases.length)
      return
    }

    const speed = isDeleting ? 40 : 75

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(fullText.slice(0, currentText.length + 1))
      } else {
        setCurrentText(fullText.slice(0, currentText.length - 1))
      }
    }, speed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, isPaused, phraseIndex, phrases])

  return (
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#3D3C3A] dark:text-[#F4EFE6] tracking-tight leading-[1.15]">
      <span className="block">Where Loving Homes</span>
      <span className="block">Meet Their</span>
      <span className="block bg-gradient-to-r from-[#AE8F65] via-[#9A7D58] to-[#7A613F] bg-clip-text text-transparent whitespace-nowrap min-h-[1.2em]">
        {currentText}
        <span className="inline-block text-[#AE8F65] font-light animate-pulse ml-0.5">|</span>
      </span>
    </h1>
  )
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F4EFE6] to-[#FAF7F2] py-20 lg:py-28 dark:from-[#181715] dark:via-[#201F1E] dark:to-[#181715]">
      {/* Background Paw Print Accents */}
      <PawPrintBg className="top-8 left-6 size-48 rotate-[-15deg]" opacity="opacity-20" />
      <PawPrintBg className="bottom-12 right-10 size-64 rotate-[25deg]" opacity="opacity-15" />
      <PawPrintBg className="top-1/3 right-1/4 size-36 rotate-[10deg]" opacity="opacity-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#AE8F65]/30 bg-[#AE8F65]/10 px-4 py-1.5 shadow-xs backdrop-blur-sm">
              <PawPrint className="size-4 text-[#8C6D43] animate-pulse fill-[#8C6D43]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A613F] dark:text-[#D4B896]">
                AI-Powered Pet Adoption & Rehoming Platform
              </span>
            </div>

            <TypewriterHeadline />

            <p className="text-base sm:text-lg text-[#5A5854] dark:text-[#C5BEB5] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Teddy revolutionizes pet adoption with intelligent AI compatibility screening, structured interview rooms, and paperless adoption handovers connecting verified shelters and loving adopters.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                asChild
                size="lg"
                className="group h-13 rounded-2xl bg-gradient-to-r from-[#AE8F65] via-[#9A7D58] to-[#866B47] px-8 text-base font-bold text-white shadow-xl shadow-[#AE8F65]/30 hover:shadow-2xl hover:shadow-[#AE8F65]/50 hover:-translate-y-1 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out cursor-pointer w-full sm:w-auto"
              >
                <Link href="/register" className="flex items-center justify-center gap-2">
                  <Heart className="size-5 fill-white transition-transform duration-300 group-hover:scale-125" />
                  <span>Adopt a Pet Today</span>
                  <ArrowRight className="size-5 ml-1 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="group h-13 rounded-2xl border-[#AE8F65]/40 bg-white/80 dark:bg-zinc-900/80 px-7 text-base font-bold text-[#3D3C3A] dark:text-[#F4EFE6] hover:bg-[#AE8F65]/15 hover:text-[#8C6D43] hover:border-[#AE8F65]/70 hover:-translate-y-1 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out shadow-sm hover:shadow-lg w-full sm:w-auto"
              >
                <Link href="/register?role=shelter" className="flex items-center justify-center gap-2">
                  <ShieldCheck className="size-5 text-[#8C6D43] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                  <span>Partner Shelter Sign-Up</span>
                </Link>
              </Button>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 border-t border-[#AE8F65]/20 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs font-semibold text-[#6C6963] dark:text-[#A8A39B]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>100% Free for Adopters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Verified Licensed Shelters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>98% AI Match Accuracy</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Glassmorphic Interactive Cards (Larga Cloud style) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Soft Semi-blend Ambient Radial Glow (Larga style) */}
              <div className="absolute -inset-10 rounded-full bg-gradient-to-tr from-[#AE8F65]/35 via-[#9A7D58]/20 to-transparent blur-3xl opacity-90 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-[#AE8F65]/20 blur-2xl pointer-events-none" />

              {/* Floating Satellite Pill Badge 1 */}
              <div className="absolute -top-5 right-2 z-20 animate-float-medium hidden sm:block">
                <Badge className="bg-white/95 dark:bg-zinc-900/95 text-[#7A613F] dark:text-[#D4B896] border border-[#AE8F65]/40 shadow-xl backdrop-blur-xl px-3 py-1.5 text-[11px] font-bold gap-1.5 rounded-full">
                  <Sparkles className="size-3.5 text-[#AE8F65] animate-pulse" />
                  <span>TeddyAI Compatibility 98%</span>
                </Badge>
              </div>

              {/* Floating Satellite Pill Badge 2 */}
              <div className="absolute -bottom-4 -left-2 z-20 animate-float-fast hidden sm:block">
                <Badge className="bg-emerald-600/90 text-white border border-emerald-400/40 shadow-xl backdrop-blur-xl px-3 py-1 text-[10px] font-bold rounded-full">
                  ✓ Verified Licensed Shelter
                </Badge>
              </div>

              {/* Main Card Showcase Stack */}
              <div className="relative space-y-4">
                {/* FLOATING CARD 1: TeddyAI Match Card */}
                <div className="animate-float-slow rounded-3xl border border-white/70 bg-white/80 p-6 shadow-2xl shadow-[#AE8F65]/20 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] dark:border-zinc-800/70 dark:bg-zinc-900/80">
                  <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 overflow-hidden rounded-full">
                        <Image
                          src="/placeholders/charlie1.jpg"
                          alt="Featured Pet - Charlie"
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#3D3C3A] dark:text-[#F4EFE6]">
                          Charlie
                        </h4>
                        <p className="text-xs text-muted-foreground">Safe Haven Pet Center</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-none font-bold text-xs px-2.5 py-1">
                      98% Match
                    </Badge>
                  </div>
                  <div className="pt-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#8C6D43] dark:text-[#D4B896] flex items-center gap-1">
                        <Sparkles className="size-3.5" /> TeddyAI Match Score
                      </span>
                      <span className="text-emerald-600 font-bold">Excellent Compatibility</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[98%] transition-all duration-500" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Living space (Apartment) and pet experience align with Charlie's care profile.
                    </p>
                  </div>
                </div>

                {/* FLOATING CARD 2: Real-Time AI Screening Assistant */}
                <div className="animate-float-medium rounded-2xl border border-white/70 bg-white/85 p-4 shadow-xl shadow-[#AE8F65]/15 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] dark:border-zinc-800/70 dark:bg-zinc-900/85 ml-4 sm:ml-8">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-[#AE8F65]/15 flex items-center justify-center text-[#8C6D43] shrink-0">
                      <MessageCircle className="size-5" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-[#3D3C3A] dark:text-[#F4EFE6]">
                          AI-Assisted Screening Room
                        </span>
                        <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Automated questions conducted • Live supervisor interjection enabled
                      </p>
                    </div>
                  </div>
                </div>

                {/* FLOATING CARD 3: Verified Shelter Network */}
                <div className="animate-float-fast rounded-2xl border border-[#AE8F65]/35 bg-gradient-to-r from-white/90 via-[#FAF7F2]/90 to-white/90 p-4 shadow-xl backdrop-blur-2xl dark:border-zinc-800/70 dark:from-zinc-900/90 dark:to-zinc-900/90 mr-4 sm:mr-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <Award className="size-5" />
                      </div>
                      <div>
                        <h5 className="font-black text-xs text-[#3D3C3A] dark:text-[#F4EFE6]">
                          Verified Shelter Network
                        </h5>
                        <p className="text-[10px] text-muted-foreground">
                          Licensed animal welfare shelters & rehomers
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold">
                      Verified
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
