import "server-only"
import { prisma } from "@/lib/prisma"

export async function buildApplicationContext(applicationId: string) {
  const application = await prisma.adoptionApplication.findUnique({
    where: { id: applicationId },
    include: {
      applicant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          gender: true,
          occupation: true,
          dateOfBirth: true,
        },
      },
      pet: {
        include: {
          shelter: {
            select: {
              name: true,
              city: true,
              province: true,
            },
          },
          postedBy: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      },
      documents: {
        select: {
          id: true,
          type: true,
          idType: true,
          name: true,
        },
      },
    },
  })

  if (!application) {
    throw new Error(`Adoption application with ID ${applicationId} not found`)
  }

  const { pet, applicant } = application

  // Format applicant age
  let ageString = "Information not provided."
  if (applicant.dateOfBirth) {
    const dob = new Date(applicant.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    ageString = `${age} years`
  }

  // Format pet age
  let petAgeString = "Information not provided."
  if (pet.birthDate) {
    const dob = new Date(pet.birthDate)
    const today = new Date()
    let ageYears = today.getFullYear() - dob.getFullYear()
    let ageMonths = today.getMonth() - dob.getMonth()
    if (ageMonths < 0) {
      ageYears--
      ageMonths += 12
    }
    if (ageYears > 0) {
      petAgeString = `${ageYears} year(s) ${ageMonths} month(s)`
    } else {
      petAgeString = `${ageMonths} month(s)`
    }
  }

  return {
    pet: {
      name: pet.name ?? "Information not provided.",
      species: pet.species ?? "Information not provided.",
      breed: pet.breed ?? "Information not provided.",
      age: petAgeString,
      sex: pet.gender ?? "Information not provided.",
      size: pet.size ?? "Information not provided.",
      temperament: pet.tags && pet.tags.length > 0 ? pet.tags : "Information not provided.",
      compatibility: {
        goodWithKids: pet.goodWithKids,
        goodWithDogs: pet.goodWithDogs,
        goodWithCats: pet.goodWithCats,
      },
      specialNeeds: pet.specialNeeds,
      specialNeedsNote: pet.specialNeedsNote ?? "Information not provided.",
      description: pet.description ?? "Information not provided.",
      shelter: pet.shelter ? {
        name: pet.shelter.name,
        location: `${pet.shelter.city}, ${pet.shelter.province}`,
      } : null,
      postedBy: pet.postedBy ? {
        name: `${pet.postedBy.firstName} ${pet.postedBy.lastName}`,
        role: pet.postedBy.role,
      } : null,
    },
    applicant: {
      name: `${applicant.firstName} ${applicant.lastName}`,
      email: applicant.email ?? "Information not provided.",
      phone: applicant.phone ?? "Information not provided.",
      address: applicant.address ?? "Information not provided.",
      gender: applicant.gender ?? "Information not provided.",
      occupation: applicant.occupation ?? "Information not provided.",
      age: ageString,
    },
    livingEnvironment: application.livingEnvironment ?? "Information not provided.",
    householdLifestyle: application.householdLifestyle ?? "Information not provided.",
    petExperience: application.petExperience ?? "Information not provided.",
    adoptionCommitment: application.adoptionCommitment ?? "Information not provided.",
    documents: application.documents && application.documents.length > 0
      ? application.documents.map(doc => ({ type: doc.type, idType: doc.idType, name: doc.name }))
      : "Information not provided.",
  }
}
