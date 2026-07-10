import Image from "next/image"
import { prisma } from "@/lib/prisma"

type TeddyBannerProps = {
  userId: string
}

export async function TeddyBanner({ userId }: TeddyBannerProps) {
  // Get date details
  const now = new Date()
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ]
  const dateString = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`

  // Get current hour for greeting
  const hour = now.getHours()
  let greeting = "Good morning"
  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon"
  } else if (hour >= 17 || hour < 5) {
    greeting = "Good evening"
  }

  // Fetch adopter name
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true },
  })
  const firstName = user?.firstName ?? "Friend"

  // Fetch draft application
  const draft = await prisma.adoptionApplication.findFirst({
    where: { applicantId: userId, status: "DRAFT", deletedAt: null },
    include: { pet: true },
    orderBy: { updatedAt: "desc" },
  })

  // Fetch active application
  const activeApp = await prisma.adoptionApplication.findFirst({
    where: {
      applicantId: userId,
      deletedAt: null,
      status: { in: ["PENDING", "UNDER_REVIEW", "INTERVIEW_IN_PROGRESS"] },
    },
    include: { pet: true },
    orderBy: { updatedAt: "desc" },
  })

  // Fetch approved application
  const approvedApp = await prisma.adoptionApplication.findFirst({
    where: { applicantId: userId, status: "APPROVED", deletedAt: null },
    include: { pet: true },
    orderBy: { updatedAt: "desc" },
  })

  let teddyMessage = "Welcome back! Ready to find a new companion today? Browse our available pets and spread some love!"

  if (draft) {
    teddyMessage = `You started an application for ${draft.pet.name} but didn't finish. Resume to complete your submission!`
  } else if (activeApp) {
    if (activeApp.status === "INTERVIEW_IN_PROGRESS") {
      teddyMessage = `Exciting! Your application for ${activeApp.pet.name} is in the interview stage. Enter the chat room to chat with shelter staff!`
    } else {
      const statusText = activeApp.status.toLowerCase().replace(/_/g, " ")
      teddyMessage = `Your application for ${activeApp.pet.name} is currently ${statusText}. We'll notify you as soon as there's an update!`
    }
  } else if (approvedApp) {
    teddyMessage = `Great news! Your adoption application for ${approvedApp.pet.name} was approved! Time to prepare for your new family member!`
  }
  
  return (
    <div className="w-full space-y-4">
      {/* Date & Greeting outside at the top - Responsively positioned to clear the mascot */}
      <div className="pl-0 md:pl-[264px] text-center md:text-left transition-all">
        <span className="text-[10px] md:text-xs tracking-widest text-[#8B7E74] dark:text-[#A89F96]">
          {dateString}
        </span>
        <h2 className="text-2xl md:text-3xl l text-[#3D3C3A] dark:text-[#F0EDE8] mt-0.5">
          {greeting}, {firstName}!
        </h2>
      </div>

      {/* Banner Card itself */}
      <div className="relative overflow-visible rounded-2xl border border-[#EADBC8] dark:border-[#3D3630] bg-gradient-to-br from-[#FAF6F0] via-[#F5EBE0] to-[#FAF6F0] dark:from-[#2A2420] dark:via-[#332C26] dark:to-[#2A2420] p-2 md:py-2 md:px-5 shadow-xs transition-shadow hover:shadow-md mt-4 md:mt-6">
        {/* Decorative background shapes isolated to prevent bleeding outside card boundary */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#EADBC8]/15 dark:bg-[#8B7E74]/10 blur-xl" />
          <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-[#EADBC8]/15 dark:bg-[#8B7E74]/10 blur-xl" />
        </div>

        {/* Mobile Mascot: Relative column placement */}
        <div className="relative shrink-0 select-none h-28 w-28 -mt-14 mb-1 flex md:hidden items-center justify-center mx-auto">
          <Image
            src="/teddy.gif"
            alt="Teddy Mascot"
            width={120}
            height={120}
            className="object-contain drop-shadow-xl"
            unoptimized
          />
        </div>

        {/* Desktop Mascot: Absolute floating placement to decouple height (Extra Large) */}
        <div className="absolute left-6 -top-28 select-none hidden md:flex h-56 w-56 items-center justify-center z-20">
          <Image
            src="/teddy.gif"
            alt="Teddy Mascot"
            width={320}
            height={320}
            className="object-contain drop-shadow-2xl"
            unoptimized
          />
        </div>

        <div className="relative flex flex-col md:flex-row items-center z-10">
          {/* Content Column: Offset to the right on desktop to clear the absolute mascot */}
          <div className="flex-1 w-full text-center md:text-left md:pl-[244px]">
            {/* Speech Bubble Container */}
            <div className="relative w-full md:max-w-md bg-white dark:bg-[#1E1A16] border border-[#EADBC8]/60 dark:border-[#4A4038]/60 rounded-2xl p-3 md:p-3.5 shadow-xs text-left">
              <div className="absolute hidden md:block top-1/2 -translate-y-1/2 -left-[6px] w-3 h-3 bg-white dark:bg-[#1E1A16] border-l border-b border-[#EADBC8]/60 dark:border-[#4A4038]/60 rotate-45" />
              <div className="absolute block md:hidden left-1/2 -translate-x-1/2 -top-[6px] w-3 h-3 bg-white dark:bg-[#1E1A16] border-t border-l border-[#EADBC8]/60 dark:border-[#4A4038]/60 rotate-45" />

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B7E74] dark:bg-[#C4B8AC] animate-pulse" />
                  <span className="text-[10px] font-black tracking-wider text-[#8B7E74] dark:text-[#C4B8AC]">TEDDY</span>
                </div>
                <p className="text-xs md:text-sm text-[#5C554E] dark:text-[#BDB3A8] leading-relaxed">
                  {teddyMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
