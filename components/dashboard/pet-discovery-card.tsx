"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Sparkles, PawPrint, MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FindMyMatchDrawer } from "@/components/dashboard/find-my-match-drawer"

export type MiniPet = {
  id: string
  name: string
  breed: string | null
  species: string
  gender?: string | null
  ageLabel?: string | null
  sizeLabel?: string | null
  location?: string | null
  imageUrl: string | null
}

export function PetDiscoveryCard({ pets }: { pets: MiniPet[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Multiply items for seamless infinite marquee track when pets are present
  const track = pets.length > 0
    ? (pets.length < 4 ? [...pets, ...pets, ...pets, ...pets] : [...pets, ...pets])
    : []

  // Dynamic marquee speed based on total item count
  const animationDuration = Math.max(track.length * 6, 24)

  const handleManualScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return
    const scrollAmount = 360
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <>
      <Card className="border border-border shadow-xs bg-white overflow-hidden">
        <CardContent className="p-0">
          {/* Header Section */}
          <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground tracking-tight">
                  Discover Your Next Companion
                </h3>
                <Badge variant="outline" className="bg-[#AE8F65]/10 border-[#AE8F65]/30 text-[#AE8F65] text-[10px] font-bold px-2 py-0.5">
                  {pets.length} {pets.length === 1 ? "Pet Available" : "Pets Available"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                Browse available rescue pets from local shelters or let our AI match you based on your lifestyle and home environment.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
              {pets.length > 0 && (
                <div className="hidden sm:flex items-center gap-1 mr-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleManualScroll("left")}
                    className="size-8 rounded-lg border-border text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Scroll left"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleManualScroll("right")}
                    className="size-8 rounded-lg border-border text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Scroll right"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}

              <Button
                asChild
                size="sm"
                variant="outline"
                className="text-xs h-9 rounded-xl border-border font-semibold px-3.5"
              >
                <Link href="/pets">
                  <Search className="size-3.5 mr-1.5" />
                  Browse Pet Listings
                </Link>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setDrawerOpen(true)}
                className="text-xs h-9 rounded-xl bg-[#AE8F65] hover:bg-[#9A7D58] text-white font-semibold px-3.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="size-3.5 mr-1.5" />
                Find My Match
              </Button>
            </div>
          </div>

          {/* Cards Carousel Area */}
          {pets.length > 0 ? (
            <div
              className="bg-slate-50/60 py-5 overflow-x-auto scrollbar-none"
              ref={scrollContainerRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div
                className="flex gap-4 px-5"
                style={{
                  width: "max-content",
                  animation: `pet-carousel-scroll ${animationDuration}s linear infinite`,
                  animationPlayState: isPaused ? "paused" : "running",
                }}
              >
                {track.map((pet, idx) => {
                  const isUnoptimized = pet.imageUrl?.startsWith("/uploads/") ?? false

                  return (
                    <Link
                      key={`${pet.id}-${idx}`}
                      href={`/pets/${pet.id}`}
                      className="group flex flex-row items-center w-[330px] sm:w-[360px] h-[155px] sm:h-[165px] shrink-0 rounded-2xl border border-border/80 bg-white hover:border-[#AE8F65]/60 hover:shadow-md transition-all duration-300 overflow-hidden relative"
                    >
                      {/* Left Side: Larger Pet Picture */}
                      <div className="relative w-[130px] sm:w-[145px] h-full shrink-0 bg-muted/80 overflow-hidden">
                        {pet.imageUrl ? (
                          <Image
                            src={pet.imageUrl}
                            alt={pet.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="150px"
                            unoptimized={isUnoptimized}
                          />
                        ) : (
                          <div className="flex flex-col size-full items-center justify-center text-muted-foreground bg-amber-500/5">
                            <PawPrint className="size-8 text-[#AE8F65]/40 mb-1" />
                            <span className="text-[10px] font-semibold text-muted-foreground/70">No Image</span>
                          </div>
                        )}

                        {/* Species Tag Badge */}
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className="bg-black/60 backdrop-blur-md text-white text-[9px] font-semibold uppercase px-2 py-0.5 border-none shadow-xs">
                            {pet.species}
                          </Badge>
                        </div>
                      </div>

                      {/* Right Side: Pet Details & Quick Action */}
                      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between h-full min-w-0 bg-white">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-sm sm:text-base text-foreground truncate group-hover:text-[#AE8F65] transition-colors">
                              {pet.name}
                            </h4>
                          </div>

                          <p className="text-xs text-muted-foreground truncate font-medium">
                            {pet.breed || pet.species}
                          </p>

                          {/* Detail Traits Badges */}
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {pet.ageLabel && (
                              <Badge variant="secondary" className="text-[10px] font-semibold py-0.5 px-2 bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                                {pet.ageLabel}
                              </Badge>
                            )}
                            {pet.gender && (
                              <Badge variant="outline" className="text-[10px] font-medium py-0.5 px-1.5 border-border/80 text-muted-foreground capitalize">
                                {pet.gender.toLowerCase()}
                              </Badge>
                            )}
                            {pet.sizeLabel && (
                              <Badge variant="outline" className="text-[10px] font-medium py-0.5 px-1.5 border-border/80 text-muted-foreground capitalize">
                                {pet.sizeLabel}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Bottom Row: Location & Action */}
                        <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2 mt-auto">
                          {pet.location ? (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate min-w-0">
                              <MapPin className="size-3 text-[#AE8F65] shrink-0" />
                              <span className="truncate">{pet.location}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/60 italic">Ready to adopt</span>
                          )}

                          <div className="flex items-center gap-1 text-xs font-bold text-[#AE8F65] shrink-0 group-hover:translate-x-0.5 transition-transform">
                            <span>Meet</span>
                            <ArrowRight className="size-3.5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="border-t border-border/50 bg-slate-50/50 py-12 text-center">
              <PawPrint className="size-10 text-muted-foreground/30 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-foreground">No Companion Pets Listed Yet</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Check back soon or try using our AI Matchmaker to discover pets waiting for adoption!
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => setDrawerOpen(true)}
                className="mt-4 text-xs rounded-xl bg-[#AE8F65] hover:bg-[#9A7D58] text-white font-semibold cursor-pointer"
              >
                <Sparkles className="size-3.5 mr-1.5" />
                Find My Match
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <FindMyMatchDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  )
}

