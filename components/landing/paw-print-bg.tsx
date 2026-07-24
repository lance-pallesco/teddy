"use client"

import { cn } from "@/lib/utils"

interface PawPrintBgProps {
  className?: string
  opacity?: string
}

export function PawPrintBg({ className, opacity = "opacity-15" }: PawPrintBgProps) {
  return (
    <div className={cn("pointer-events-none absolute select-none overflow-hidden", opacity, className)}>
      <svg
        width="160"
        height="160"
        viewBox="0 0 100 100"
        fill="currentColor"
        className="text-[#AE8F65] dark:text-[#AE8F65]/40"
      >
        {/* Main Metacarpal Pad */}
        <path d="M50 48 C38 48 26 58 28 73 C30 85 40 92 50 92 C60 92 70 85 72 73 C74 58 62 48 50 48 Z" />
        {/* Top Left Toe Pad */}
        <ellipse cx="23" cy="38" rx="8" ry="12" transform="rotate(-30 23 38)" />
        {/* Top Middle-Left Toe Pad */}
        <ellipse cx="40" cy="22" rx="8.5" ry="13" transform="rotate(-10 40 22)" />
        {/* Top Middle-Right Toe Pad */}
        <ellipse cx="60" cy="22" rx="8.5" ry="13" transform="rotate(10 60 22)" />
        {/* Top Right Toe Pad */}
        <ellipse cx="77" cy="38" rx="8" ry="12" transform="rotate(30 77 38)" />
      </svg>
    </div>
  )
}
