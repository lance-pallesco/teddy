"use client"

import { useState } from "react"
import { Sparkles, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FindMyMatchDrawer } from "@/components/dashboard/find-my-match-drawer"
import { cn } from "@/lib/utils"

export function FindMyMatchCard({ className }: { className?: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <div className={cn(
        "rounded-2xl border border-[#AE8F65]/20 bg-[#AE8F65]/5 p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between gap-4",
        className
      )}>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="bg-[#AE8F65]/10 border-[#AE8F65]/30 text-[#AE8F65] text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5">
              <Sparkles className="size-3 mr-1 inline" /> AI Matchmaker
            </Badge>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-foreground tracking-tight">
              Find Your Companion Match
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Let Teddy AI evaluate your home layout, schedule, and energy level to match you with compatible rescue pets.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="w-full bg-[#AE8F65] hover:bg-[#9A7D58] text-white shadow-xs rounded-xl font-bold text-xs h-9 cursor-pointer mt-auto"
        >
          Start AI Matcher
          <ArrowRight className="size-3.5 ml-1.5" />
        </Button>
      </div>

      <FindMyMatchDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  )
}
