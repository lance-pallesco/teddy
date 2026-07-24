"use client"

import { useState, useEffect, useRef } from "react"
import { PawPrintBg } from "@/components/landing/paw-print-bg"
import { ScrollReveal } from "@/components/landing/scroll-reveal"
import { Building2, ShieldCheck, Heart, Award } from "lucide-react"

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let startTimestamp: number | null = null
          const duration = 2000 // 2 seconds

          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp
            const progress = Math.min((timestamp - startTimestamp) / duration, 1)
            // Ease out quadratic curve
            const currentCount = Math.floor(progress * (2 - progress) * target)
            setCount(currentCount)

            if (progress < 1) {
              window.requestAnimationFrame(step)
            } else {
              setCount(target)
            }
          }

          window.requestAnimationFrame(step)
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [target, hasAnimated])

  return (
    <div ref={ref} className="text-3xl sm:text-4xl font-black text-[#3D3C3A] dark:text-[#F4EFE6] tracking-tight">
      {count}
      {suffix}
    </div>
  )
}

export function LandingStats() {
  const stats = [
    { target: 500, suffix: "+", label: "Pets Rehomed", desc: "Successfully matched with loving adopters", icon: Heart },
    { target: 98, suffix: "%", label: "Match Accuracy", desc: "AI compatibility score alignment", icon: Award },
    { target: 30, suffix: "+", label: "Partner Shelters", desc: "Licensed animal welfare organizations", icon: Building2 },
    { target: 100, suffix: "%", label: "Paperless Handovers", desc: "Digital agreements & document review", icon: ShieldCheck },
  ]

  const partnerShelters = [
    { name: "Safe Haven Pet Center", city: "Quezon City, Metro Manila" },
    { name: "Happy Tails Shelter", city: "Makati City, Metro Manila" },
    { name: "Compassion Pet Rescue", city: "Pasig City, Metro Manila" },
    { name: "Pawsitive Haven", city: "Taguig City, Metro Manila" },
  ]

  return (
    <section id="shelters" className="relative bg-[#FAF7F2] py-20 dark:bg-[#181715] overflow-hidden">
      <PawPrintBg className="top-8 left-12 size-40 rotate-[10deg]" opacity="opacity-15" />
      <PawPrintBg className="bottom-8 right-8 size-48 rotate-[-20deg]" opacity="opacity-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* STATS COUNTER GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const IconComp = stat.icon
            return (
              <ScrollReveal key={idx} delay={idx * 150} direction="up">
                <div className="rounded-2xl border border-[#AE8F65]/20 bg-white/90 p-6 text-center shadow-md backdrop-blur-md dark:bg-zinc-900/90 space-y-2 transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="mx-auto size-10 rounded-xl bg-[#AE8F65]/15 flex items-center justify-center text-[#8C6D43] mb-3">
                    <IconComp className="size-5" />
                  </div>
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8C6D43]">
                    {stat.label}
                  </div>
                  <p className="text-[11px] text-[#5A5854] dark:text-[#C5BEB5] leading-normal">
                    {stat.desc}
                  </p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        {/* PARTNER SHELTERS SHOWCASE */}
        <ScrollReveal direction="up">
          <div className="rounded-3xl border border-[#AE8F65]/30 bg-gradient-to-r from-[#FAF7F2] via-[#F4EFE6] to-[#FAF7F2] p-8 sm:p-12 dark:from-[#201F1E] dark:to-[#201F1E] text-center space-y-8">
            <div className="max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C6D43]">
                Trusted Animal Welfare Network
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#3D3C3A] dark:text-[#F4EFE6]">
                Partnering with Verified Rescuers & Shelters
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5854] dark:text-[#C5BEB5]">
                We work hand-in-hand with animal shelters across the Philippines to make pet adoption safe, fast, and transparent.
              </p>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {partnerShelters.map((shelter, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#AE8F65]/20 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:bg-zinc-900/80 flex items-center gap-3 text-left"
              >
                <div className="size-9 rounded-xl bg-[#AE8F65]/15 flex items-center justify-center text-[#8C6D43] font-bold text-xs shrink-0">
                  <Building2 className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-[#3D3C3A] dark:text-[#F4EFE6] truncate">
                    {shelter.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground truncate">{shelter.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
      </div>
    </section>
  )
}
