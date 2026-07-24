import { getCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingPetCarousel } from "@/components/landing/landing-pet-carousel"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingStats } from "@/components/landing/landing-stats"
import { LandingFooter } from "@/components/landing/landing-footer"

export default async function Home() {
  const user = await getCurrentUser()

  // Fetch real available pets for landing page carousel showcase
  let availablePets: any[] = []
  try {
    const petsData = await prisma.pet.findMany({
      where: {
        status: "AVAILABLE",
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        petImages: {
          orderBy: { isPrimary: "desc" },
        },
        shelter: {
          select: {
            id: true,
            name: true,
            logo: true,
            address: true,
            city: true,
            province: true,
          },
        },
        postedBy: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    availablePets = petsData.map((p) => ({
      id: p.id,
      name: p.name,
      species: p.species,
      breed: p.breed,
      gender: p.gender,
      size: p.size,
      birthDate: p.birthDate ? p.birthDate.toISOString() : null,
      status: p.status,
      isVaccinated: p.isVaccinated,
      isNeutered: p.isNeutered,
      isHouseTrained: p.isHouseTrained,
      goodWithKids: p.goodWithKids,
      tags: p.tags,
      petImages: p.petImages.map((img) => ({
        url: img.url,
        isPrimary: img.isPrimary,
      })),
      shelter: p.shelter,
      postedBy: p.postedBy,
    }))
  } catch (err) {
    // Fallback if DB fetch fails
    availablePets = []
  }

  const currentUserData = user
    ? {
        id: user.id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    : null

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] font-sans dark:bg-[#181715] selection:bg-[#AE8F65]/20 selection:text-[#8C6D43]">
      <LandingNavbar currentUser={currentUserData} />
      <main className="flex-1">
        <LandingHero />
        <LandingPetCarousel pets={availablePets} />
        <LandingFeatures />
        <LandingStats />
      </main>
      <LandingFooter />
    </div>
  )
}
