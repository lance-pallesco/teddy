"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PawPrintBg } from "@/components/landing/paw-print-bg"
import { Heart, ArrowRight, ShieldCheck, Mail } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="relative bg-[#3D3C3A] text-white pt-16 pb-12 overflow-hidden dark:bg-[#121110]">
      <PawPrintBg className="top-10 right-10 size-56 rotate-[25deg]" opacity="opacity-10" />
      <PawPrintBg className="bottom-6 left-8 size-48 rotate-[-15deg]" opacity="opacity-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* CALL TO ACTION BANNER */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#AE8F65] via-[#9A7D58] to-[#7A613F] p-8 sm:p-12 text-white shadow-2xl shadow-[#AE8F65]/20 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm">
              Ready to Welcome Your Paw-fect Companion?
            </h2>
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              Join hundreds of happy pet owners and verified shelters using Teddy for intelligent AI pet adoption.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <Button
              asChild
              size="lg"
              className="group h-12 rounded-xl bg-white text-[#3D3C3A] font-bold text-sm hover:bg-white hover:text-black shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.04] active:scale-[0.97] transition-all duration-300 ease-out cursor-pointer px-6"
            >
              <Link href="/register" className="flex items-center justify-center gap-2">
                <Heart className="size-4 text-rose-500 fill-rose-500 transition-transform duration-300 group-hover:scale-125" />
                <span>Get Started Now</span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* FOOTER LINKS & BRANDING */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-8 border-t border-white/10">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative size-10 overflow-hidden rounded-xl bg-gradient-to-br from-[#AE8F65] to-[#8C6D43] p-1.5">
                <Image
                  src="/logo.png"
                  alt="Teddy AI Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white">Teddy</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AE8F65]">
                  AI Pet Rehoming Platform
                </span>
              </div>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Teddy is an AI-powered pet rehoming ecosystem connecting shelters, rescuers, and adopters with structured compatibility screening and paperless adoption handovers.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#AE8F65]">Navigation</h4>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#featured-pets" className="hover:text-white transition-colors">
                  Featured Pets
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#shelters" className="hover:text-white transition-colors">
                  Shelter Partners
                </a>
              </li>
            </ul>
          </div>

          {/* User Portal Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#AE8F65]">Portals</h4>
            <div className="flex flex-col gap-2 text-xs text-zinc-300">
              <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>Adopter & Shelter Login</span>
              </Link>
              <Link href="/register" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>Adopter Registration</span>
              </Link>
              <Link href="/register?role=shelter" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>Partner Shelter Registration</span>
              </Link>
            </div>
          </div>
        </div>

        {/* COPYRIGHT & DEVELOPER WATERMARK */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-3">
          <p>© {new Date().getFullYear()} Teddy AI Pet Rehoming Platform. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
            <span>Developed by: </span>
            <span className="font-bold text-[#D4B896] hover:text-white transition-colors cursor-pointer">
              Lance Christian Pallesco
            </span>
          </div>
          <div className="flex items-center gap-4 text-zinc-500">
            <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
