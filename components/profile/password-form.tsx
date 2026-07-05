"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Eye, EyeOff, KeyRound } from "lucide-react"

import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/profile"
import { changePasswordAction } from "@/app/(dashboard)/profile/actions/profile.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

export function PasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  const newPasswordValue = watch("newPassword") || ""

  // Password strength logic
  const strengthPoints = calculatePasswordStrength(newPasswordValue)
  const strengthConfig = getStrengthConfig(strengthPoints)

  function calculatePasswordStrength(password: string): number {
    if (!password) return 0
    let score = 0
    // Length >= 8
    if (password.length >= 8) score++
    // Has uppercase
    if (/[A-Z]/.test(password)) score++
    // Has number
    if (/\d/.test(password)) score++
    // Length >= 12 or has special char
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password)
    if (password.length >= 12 || hasSpecialChar) score++

    return score
  }

  function getStrengthConfig(score: number) {
    switch (score) {
      case 1:
        return { label: "Weak", color: "bg-destructive", textColor: "text-destructive", bars: 1 }
      case 2:
        return { label: "Fair", color: "bg-orange-500", textColor: "text-orange-500", bars: 2 }
      case 3:
        return { label: "Good", color: "bg-amber-500", textColor: "text-amber-500", bars: 3 }
      case 4:
        return { label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-500", bars: 4 }
      default:
        return { label: "", color: "bg-muted", textColor: "text-muted-foreground", bars: 0 }
    }
  }

  function onSubmit(values: ChangePasswordInput) {
    startTransition(async () => {
      const response = await changePasswordAction(values)

      if (!response.success) {
        toast.error(response.message)
        return
      }

      toast.success("Password changed successfully")
      reset()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col gap-6">
        {/* Current Password */}
        <Field>
          <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              placeholder="Enter current password"
              disabled={isPending}
              aria-invalid={!!errors.currentPassword}
              className="pr-10"
              {...register("currentPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-8 text-muted-foreground hover:bg-transparent"
              onClick={() => setShowCurrent(!showCurrent)}
              disabled={isPending}
            >
              {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
          <FieldError errors={[errors.currentPassword]} />
        </Field>

        {/* New Password */}
        <Field>
          <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNew ? "text" : "password"}
              placeholder="Enter new password"
              disabled={isPending}
              aria-invalid={!!errors.newPassword}
              className="pr-10"
              {...register("newPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-8 text-muted-foreground hover:bg-transparent"
              onClick={() => setShowNew(!showNew)}
              disabled={isPending}
            >
              {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
          <FieldError errors={[errors.newPassword]} />

          {/* Strength Meter */}
          {newPasswordValue.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Password strength:</span>
                <span className={cn("font-medium", strengthConfig.textColor)}>
                  {strengthConfig.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 rounded-full transition-colors duration-300",
                      index <= strengthConfig.bars ? strengthConfig.color : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </Field>

        {/* Confirm New Password */}
        <Field>
          <FieldLabel htmlFor="confirmNewPassword">Confirm New Password</FieldLabel>
          <div className="relative">
            <Input
              id="confirmNewPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              disabled={isPending}
              aria-invalid={!!errors.confirmNewPassword}
              className="pr-10"
              {...register("confirmNewPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-8 text-muted-foreground hover:bg-transparent"
              onClick={() => setShowConfirm(!showConfirm)}
              disabled={isPending}
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
          <FieldError errors={[errors.confirmNewPassword]} />
        </Field>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isPending} className="min-w-36">
          {isPending ? (
            "Updating..."
          ) : (
            <>
              <KeyRound className="size-4 mr-2" />
              Change Password
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
