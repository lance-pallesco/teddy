"use client"

import { Card, CardContent } from "@/components/ui/card"
import { PawPrintBg } from "@/components/landing/paw-print-bg"
import { ScrollReveal } from "@/components/landing/scroll-reveal"
import {
  Sparkles,
  MessageCircle,
  MessageSquareText,
  FileCheck,
  Building2,
  ShieldCheck,
  Brain,
  Search,
} from "lucide-react"

export function LandingFeatures() {
  const steps = [
    {
      num: "01",
      title: "Discover & AI Match",
      desc: "Complete your adopter profile. TeddyAI evaluates your living space, schedule, and experience to match you with compatible pets.",
      icon: Search,
      badgeBg: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/25",
    },
    {
      num: "02",
      title: "Structured Interview Room",
      desc: "Engage in an AI-assisted or direct chat interview with shelter reviewers. TeddyAI addresses key care considerations in real-time.",
      icon: MessageSquareText,
      badgeBg: "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 fill-white dark:text-blue-400 border border-blue-500/25",
    },
    {
      num: "03",
      title: "Paperless Handover",
      desc: "Review and sign digital adoption agreements online, schedule pet pickup, and start your journey with your new family member.",
      icon: FileCheck,
      badgeBg: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/25",
    },
  ]

  const featureGrid = [
    {
      icon: Brain,
      title: "TeddyAI Compatibility Matching",
      desc: "Automated screening evaluates housing policies, pet experience, and daily schedules to calculate match percentages and identify potential concerns.",
      badge: "AI Powered",
      badgeBg: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/25",
    },
    {
      icon: MessageCircle,
      title: "Dual-Mode Interview Rooms",
      desc: "Shelters can choose automated AI screening interviews or direct real-time chat with live supervisor interjection capabilities.",
      badge: "Real-Time Chat",
      badgeBg: "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/25",
    },
    {
      icon: ShieldCheck,
      title: "Document Verification",
      desc: "Upload government IDs, proof of income, and landlord pet permission forms securely with automated document review.",
      badge: "Secure & Verified",
      badgeBg: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/25",
    },
    {
      icon: Building2,
      title: "Shelter & Rehoming Suite",
      desc: "Comprehensive dashboard for licensed animal shelters and independent rescuers to manage applications, schedule meetups, and approve adoptions.",
      badge: "Multi-Role Suite",
      badgeBg: "bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/25",
    },
  ]

  return (
    <section id="features" className="relative bg-gradient-to-b from-[#F4EFE6] via-[#FAF7F2] to-[#F4EFE6] py-24 dark:from-[#201F1E] dark:via-[#181715] dark:to-[#201F1E] overflow-hidden">
      <PawPrintBg className="top-12 right-8 size-48 rotate-[-20deg]" opacity="opacity-15" />
      <PawPrintBg className="bottom-16 left-6 size-56 rotate-[15deg]" opacity="opacity-15" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">
        {/* SECTION 1: 3-STEP ADOPTION JOURNEY */}
        <div className="space-y-12">
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C6D43]">
                <Sparkles className="size-3.5" />
                <span>Simple 3-Step Process</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#3D3C3A] dark:text-[#F4EFE6] tracking-tight">
                How Adoption Works on Teddy
              </h2>
              <p className="text-sm text-[#5A5854] dark:text-[#C5BEB5] leading-relaxed">
                We streamlined the pet adoption journey into a transparent, safe, and paperless experience.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => {
              const IconComp = step.icon
              return (
                <ScrollReveal key={idx} delay={idx * 150} direction="up">
                  <div className="group relative rounded-3xl border border-white/80 bg-white/90 p-7 shadow-xl shadow-[#AE8F65]/5 backdrop-blur-2xl dark:bg-zinc-900/90 dark:border-zinc-800/80 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#AE8F65]/20 hover:border-[#AE8F65]/40 cursor-pointer h-full">
                    <div className="flex items-center justify-between pb-4 border-b border-border/50">
                      <span className="text-3xl font-black text-[#AE8F65]/40 group-hover:text-[#AE8F65] transition-colors duration-300">
                        {step.num}
                      </span>
                      <div className={`size-13 rounded-2xl ${step.badgeBg} flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                        <IconComp className="size-6 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <div className="pt-5 space-y-2">
                      <h2 className="font-black text-lg text-[#3D3C3A] dark:text-[#F4EFE6] group-hover:text-[#8C6D43] transition-colors duration-300">
                        {step.title}
                      </h2>
                      <p className="text-xs text-[#5A5854] dark:text-[#C5BEB5] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>

        {/* SECTION 2: PLATFORM FEATURE GRID */}
        <div id="how-it-works" className="space-y-12 pt-8 border-t border-[#AE8F65]/20">
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C6D43]">
                <Sparkles className="size-3.5" />
                <span>Smart Platform Architecture</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#3D3C3A] dark:text-[#F4EFE6] tracking-tight">
                Designed for Shelters, Built for Adopters
              </h2>
              <p className="text-sm text-[#5A5854] dark:text-[#C5BEB5]">
                Everything you need to find, interview, and welcome your pet companion.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featureGrid.map((feat, idx) => {
              const IconComp = feat.icon
              return (
                <ScrollReveal key={idx} delay={idx * 150} direction="up">
                  <Card className="group rounded-3xl border border-white/80 bg-white/90 p-7 shadow-xl shadow-[#AE8F65]/5 backdrop-blur-2xl dark:bg-zinc-900/90 dark:border-zinc-800/80 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#AE8F65]/20 hover:border-[#AE8F65]/40 cursor-pointer h-full">
                    <CardContent className="p-0 space-y-5">
                      <div className="flex items-center justify-between">
                        <div className={`size-13 rounded-2xl ${feat.badgeBg} flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                          <IconComp className="size-6 transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full ${feat.badgeBg}`}>
                          {feat.badge}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-[#3D3C3A] dark:text-[#F4EFE6] group-hover:text-[#8C6D43] transition-colors duration-300">
                          {feat.title}
                        </h3>
                        <p className="text-xs text-[#5A5854] dark:text-[#C5BEB5] leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
