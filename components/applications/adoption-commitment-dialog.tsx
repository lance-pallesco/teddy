"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  HeartHandshake,
  ShieldCheck,
  Home,
  Coins,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface AdoptionCommitmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  petId: string
  petName: string
  applyUrl?: string
}

const COMMITMENTS = [
  {
    id: "lifetime",
    icon: ShieldCheck,
    title: "10-15+ Year Lifetime Commitment",
    description: "Pets are lifelong family members. I am prepared to care for this pet through all life stages.",
  },
  {
    id: "financial",
    icon: Coins,
    title: "Financial Readiness",
    description: "I am financially prepared for food, supplies, routine vaccinations, and unexpected vet medical care.",
  },
  {
    id: "time",
    icon: Clock,
    title: "Daily Time & Care",
    description: "I have adequate daily time for feeding, exercise, training, grooming, and companionship.",
  },
  {
    id: "housing",
    icon: Home,
    title: "Household & Housing Approval",
    description: "All household members and landlord (if renting) agree to welcome this pet into our home.",
  },
  {
    id: "sincere",
    icon: HeartHandshake,
    title: "Genuine & Anti-Spam Agreement",
    description: "I am filing a genuine application and promise to communicate respectfully with the shelter staff or pet owner.",
  },
]

export function AdoptionCommitmentDialog({
  open,
  onOpenChange,
  petId,
  petName,
  applyUrl,
}: AdoptionCommitmentDialogProps) {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)

  const targetUrl = applyUrl || `/pets/${petId}/apply`

  const handleProceed = () => {
    onOpenChange(false)
    router.push(targetUrl)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl p-6 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-[#AE8F65]/10 border-[#AE8F65]/30 text-[#AE8F65] text-xs font-bold px-2.5 py-0.5">
              Adoption Pledge & Reminder
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Before applying to adopt {petName}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Adopting a pet is a meaningful commitment. Please review and confirm the key requirements below to ensure a smooth adoption process and prevent spam.
          </p>
        </DialogHeader>

        {/* Commitment Items Container */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
          {COMMITMENTS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-primary/10 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="size-8 rounded-lg bg-[#AE8F65]/10 text-[#AE8F65] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="size-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h5 className="text-xs font-bold text-foreground">{item.title}</h5>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Checkbox Acknowledgment */}
        <div className="pt-3 border-t space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Checkbox
              id="adoption-pledge-agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(!!checked)}
              className="mt-0.5 border-amber-500 data-[state=checked]:bg-[#AE8F65] data-[state=checked]:border-[#AE8F65] shrink-0"
            />
            <label
              htmlFor="adoption-pledge-agreement"
              className="block text-xs font-medium leading-normal text-foreground cursor-pointer select-none flex-1"
            >
              I confirm that I have read these commitments and am fully prepared to provide <strong>{petName}</strong> with a loving, permanent home.
            </label>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs h-9 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!agreed}
              onClick={handleProceed}
              className="rounded-xl text-xs font-bold h-9 px-5 bg-[#AE8F65] hover:bg-[#9A7D58] text-white shadow-xs cursor-pointer disabled:opacity-50"
            >
              Proceed to Application
              <ArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
