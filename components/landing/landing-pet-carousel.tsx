"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PawPrintBg } from "@/components/landing/paw-print-bg"
import { ScrollReveal } from "@/components/landing/scroll-reveal"
import { ChevronLeft, ChevronRight, Heart, MapPin, Sparkles, ArrowRight } from "lucide-react"

interface PetItem {
  id: string
  name: string
  species: string
  breed: string
  gender: string
  size: string
  birthDate?: string | null
  status?: string
  petImages?: { url: string; isPrimary: boolean }[]
  shelter?: { name: string; logo?: string | null; address?: string | null; city?: string | null; province?: string | null } | null
  postedBy?: { firstName: string; lastName: string; avatar?: string | null; role?: string } | null
}

interface LandingPetCarouselProps {
  pets: PetItem[]
}

export function LandingPetCarousel({ pets }: LandingPetCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-scrolling loop effect (scrolls every 3.5s, wraps smoothly at end, pauses on hover)
  useEffect(() => {
    if (isHovered) return

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        // Wrap back to beginning if reached the end
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" })
        } else {
          scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" })
        }
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [isHovered])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  // Fallback demo pets if database has few records
  const displayPets: PetItem[] = pets.length > 0 ? pets : [
    {
      id: "demo-1",
      name: "Kiwi",
      species: "Bird",
      breed: "Budgerigar / Parakeet",
      gender: "Male",
      size: "Small",
      birthDate: null,
      status: "AVAILABLE",
      petImages: [{ url: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=600", isPrimary: true }],
      postedBy: { firstName: "Michael David", lastName: "Lopez", avatar: "/placeholders/adopter1-avatar.jpg", role: "Owner" },
      shelter: { name: "", address: "789 Horizon Way", city: "Davao City", province: "Davao del Sur" },
    },
    {
      id: "demo-2",
      name: "Cleo",
      species: "Cat",
      breed: "Calico",
      gender: "Female",
      size: "Medium",
      birthDate: null,
      status: "AVAILABLE",
      petImages: [{ url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600", isPrimary: true }],
      shelter: { name: "Happy Tails Shelter", logo: "/placeholders/happy-paws-center.jpg", address: "456 Ayala Ave", city: "Makati City", province: "Metro Manila" },
    },
    {
      id: "demo-3",
      name: "Buster",
      species: "Dog",
      breed: "Pug",
      gender: "Male",
      size: "Small",
      birthDate: null,
      status: "AVAILABLE",
      petImages: [{ url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=600", isPrimary: true }],
      shelter: { name: "Forever Homes Rescue Center", logo: "/placeholders/forever-homes-logo.png", address: "123 Mango Ave", city: "Cebu City", province: "Cebu" },
    },
    {
      id: "demo-4",
      name: "Barnaby",
      species: "Rabbit",
      breed: "Angora",
      gender: "Male",
      size: "Small",
      birthDate: null,
      status: "AVAILABLE",
      petImages: [{ url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600", isPrimary: true }],
      shelter: { name: "Safe Haven Pet Center", logo: "/placeholders/safe-haven-logo.jpg", address: "789 Horizon Way", city: "Quezon City", province: "Metro Manila" },
    },
  ]

  return (
    <section id="featured-pets" className="relative bg-[#FAF7F2] py-20 dark:bg-[#181715] overflow-hidden">
      <PawPrintBg className="top-10 left-10 size-40 rotate-[20deg]" opacity="opacity-10" />
      <PawPrintBg className="bottom-8 right-12 size-48 rotate-[-15deg]" opacity="opacity-15" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C6D43]">
                <Sparkles className="size-3.5" />
                <span>Available Companions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#3D3C3A] dark:text-[#F4EFE6] tracking-tight">
                Featured Pets Awaiting Loving Homes
              </h2>
              <p className="text-sm text-[#5A5854] dark:text-[#C5BEB5]">
                Meet adorable pets verified by our shelter partners and ready for adoption.
              </p>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-10 rounded-full border-[#AE8F65]/30 hover:bg-[#AE8F65]/15 cursor-pointer"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="size-5 text-[#3D3C3A] dark:text-[#F4EFE6]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-10 rounded-full border-[#AE8F65]/30 hover:bg-[#AE8F65]/15 cursor-pointer"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="size-5 text-[#3D3C3A] dark:text-[#F4EFE6]" />
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {displayPets.map((pet) => {
            const image = pet.petImages?.find((img) => img.isPrimary)?.url || pet.petImages?.[0]?.url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600"
            
            // Determine Rehomer Details
            const isShelter = Boolean(pet.shelter?.name)
            const rehomerName = isShelter
              ? pet.shelter?.name
              : pet.postedBy
              ? `${pet.postedBy.firstName} ${pet.postedBy.lastName}`
              : "Michael David Lopez"
            
            const rehomerRole = isShelter ? "Shelter" : "Owner"
            
            const rehomerAvatar = isShelter
              ? pet.shelter?.logo || "/placeholders/safe-haven-logo.jpg"
              : pet.postedBy?.avatar || "/placeholders/adopter1-avatar.jpg"

            // Compute Location string
            const addressParts = [
              pet.shelter?.address,
              pet.shelter?.city || "Metro Manila",
              pet.shelter?.province,
            ].filter(Boolean)
            const locationText = addressParts.length > 0 ? addressParts.join(", ") : "Quezon City, Metro Manila"

            const ageText = "1 year"

            return (
              <Card
                key={pet.id}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start rounded-2xl border border-black/5 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 dark:bg-zinc-900 overflow-hidden flex flex-col"
              >
                {/* Pet Image Frame */}
                <div className="relative h-56 w-full bg-muted overflow-hidden group">
                  <Image
                    src={image}
                    alt={pet.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Top-Left Pet Type Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-black/75 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border-none px-2.5 py-1 rounded-lg shadow-sm">
                      {pet.species}
                    </Badge>
                  </div>
                </div>

                {/* Card Content Details */}
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs">
                    {/* Line 1: Pet Name & Status Badge */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#3D3C3A] dark:text-[#F4EFE6] tracking-tight">
                        {pet.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
                        Available
                      </span>
                    </div>

                    {/* Line 2: Species • Breed */}
                    <p className="text-xs text-muted-foreground font-medium truncate">
                      {pet.species} • {pet.breed || "Mixed Breed"}
                    </p>

                    {/* Line 3: Age & Size */}
                    <p className="text-xs text-muted-foreground">
                      <span className="font-normal">Age:</span> <span className="font-medium text-[#3D3C3A] dark:text-[#F4EFE6]">{ageText}</span>
                      &nbsp;&nbsp;&nbsp;
                      <span className="font-normal">Size:</span> <span className="font-medium text-[#3D3C3A] dark:text-[#F4EFE6]">{pet.size}</span>
                    </p>

                    {/* Line 4: Rehomer Avatar & Name with Role */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative size-6 overflow-hidden rounded-full border border-[#AE8F65]/30 shrink-0">
                        <Image
                          src={rehomerAvatar}
                          alt={rehomerName || "Rehomer"}
                          width={24}
                          height={24}
                          className="object-cover size-full"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0 text-xs">
                        <span className="font-bold text-[#3D3C3A] dark:text-[#F4EFE6] truncate">
                          {rehomerName}
                        </span>
                        <span className="text-[11px] text-muted-foreground shrink-0 font-normal">
                          ({rehomerRole})
                        </span>
                      </div>
                    </div>

                    {/* Line 5: Location with Pin Icon */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate pt-0.5">
                      <MapPin className="size-3.5 text-[#AE8F65] shrink-0" />
                      <span className="truncate">{locationText}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    asChild
                    size="sm"
                    className="group w-full h-10 rounded-xl bg-[#AE8F65] hover:bg-[#9A7D58] text-white font-bold text-xs shadow-md shadow-[#AE8F65]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer mt-2"
                  >
                    <Link href={`/pets/${pet.id}`} className="flex items-center justify-center gap-1.5">
                      <Heart className="size-3.5 fill-white transition-transform duration-300 group-hover:scale-125" />
                      <span>Meet {pet.name}</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* View All Pets Banner Button */}
        <div className="mt-10 text-center">
          <Button
            asChild
            size="lg"
            className="group h-12 rounded-2xl bg-gradient-to-r from-[#AE8F65] via-[#9A7D58] to-[#866B47] px-8 text-sm font-bold text-white shadow-xl shadow-[#AE8F65]/25 hover:shadow-2xl hover:shadow-[#AE8F65]/40 hover:-translate-y-1 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out cursor-pointer"
          >
            <Link href="/register" className="flex items-center justify-center gap-2">
              <span>Browse All Available Pets for Adoption</span>
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
