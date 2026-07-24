"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, HousePlus, LogIn, UserPlus } from "lucide-react"

interface LandingNavbarProps {
  currentUser?: {
    id: string
    role: string
    firstName: string
    lastName: string
  } | null
}

export function LandingNavbar({ currentUser }: LandingNavbarProps) {
  const dashboardHref =
    currentUser?.role === "SHELTER_STAFF"
      ? "/shelter"
      : currentUser?.role === "ADMIN"
        ? "/admin"
        : "/pets"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#AE8F65]/20 bg-[#FAF7F2]/90 backdrop-blur-md dark:bg-[#181715]/90">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative size-10 overflow-hidden rounded-xl bg-gradient-to-br from-[#AE8F65] to-[#8C6D43] p-1.5 shadow-md shadow-[#AE8F65]/20 group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.png"
              alt="Teddy AI Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-[#3D3C3A] dark:text-[#F4EFE6]">
              Teddy
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#AE8F65]">
              AI Pet Rehoming
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-semibold text-[#5A5854] hover:text-[#AE8F65] transition-colors dark:text-[#C5BEB5] dark:hover:text-[#AE8F65]"
          >
            Features
          </a>
          <a
            href="#featured-pets"
            className="text-sm font-semibold text-[#5A5854] hover:text-[#AE8F65] transition-colors dark:text-[#C5BEB5] dark:hover:text-[#AE8F65]"
          >
            Featured Pets
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-semibold text-[#5A5854] hover:text-[#AE8F65] transition-colors dark:text-[#C5BEB5] dark:hover:text-[#AE8F65]"
          >
            How it Works
          </a>
          <a
            href="#shelters"
            className="text-sm font-semibold text-[#5A5854] hover:text-[#AE8F65] transition-colors dark:text-[#C5BEB5] dark:hover:text-[#AE8F65]"
          >
            Shelter Partners
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <Button
              asChild
              className="group h-10 rounded-xl bg-gradient-to-r from-[#AE8F65] to-[#9A7D58] px-5 font-bold text-white shadow-md shadow-[#AE8F65]/25 hover:shadow-xl hover:shadow-[#AE8F65]/35 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer"
            >
              <Link href={dashboardHref} className="flex items-center gap-2">
                <HousePlus className="size-4 transition-transform duration-300 group-hover:rotate-6" />
                <span>Go to Dashboard</span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="group h-10 rounded-xl font-semibold text-[#3D3C3A] hover:bg-[#AE8F65]/15 hover:text-[#8C6D43] hover:-translate-y-0.5 transition-all duration-300 ease-out dark:text-[#F4EFE6]"
              >
                <Link href="/login" className="flex items-center gap-1.5">
                  <LogIn className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                  <span>Log In</span>
                </Link>
              </Button>
              <Button
                asChild
                className="group h-10 rounded-xl bg-gradient-to-r from-[#AE8F65] to-[#9A7D58] px-5 font-bold text-white shadow-md shadow-[#AE8F65]/25 hover:shadow-xl hover:shadow-[#AE8F65]/35 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer"
              >
                <Link href="/register" className="flex items-center gap-1.5">
                  <UserPlus className="size-4 transition-transform duration-300 group-hover:scale-110" />
                  <span>Get Started</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
