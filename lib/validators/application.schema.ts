import { z } from "zod"
import {
  PetSpecies,
  GovernmentIDType,
} from "@prisma/client"
import {
  HousingType,
  OwnershipStatus,
  LandlordAllowsPets,
  PropertySize,
  PetAloneTime,
  CareWhenAway,
  PetPrimaryLocation,
  PetSleepLocation,
  PrimaryCaregiver,
  ExperienceWithSpecies,
  HeardAboutPetFrom,
} from "@/lib/constants/application.constants"

// Step 2: Living Environment
export const Step2Schema = z
  .object({
    housingType: z.nativeEnum(HousingType, {
      message: "Housing type is required",
    }),
    ownershipStatus: z.nativeEnum(OwnershipStatus, {
      message: "Ownership status is required",
    }),
    landlordAllowsPets: z.union([z.nativeEnum(LandlordAllowsPets), z.literal("")]).optional(),
    propertySize: z.nativeEnum(PropertySize, {
      message: "Property size is required",
    }),
    isPetFriendly: z.enum(["YES", "NO", "NOT_SURE"], {
      message: "Select if property is pet friendly",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.ownershipStatus === "RENT") {
      if (!data.landlordAllowsPets) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Landlord approval status is required when renting",
          path: ["landlordAllowsPets"],
        })
      }
    }
  })

// Step 3: Household & Lifestyle
export const Step3Schema = z
  .object({
    numberOfAdults: z
      .number({ message: "Number of adults is required" })
      .int("Must be a whole number")
      .min(1, "Must have at least 1 adult"),
    numberOfChildren: z
      .number({ message: "Number of children is required" })
      .int("Must be a whole number")
      .min(0, "Cannot be negative"),
    childrenAges: z.string().optional().or(z.literal("")),
    householdHasAllergies: z.boolean({
      message: "Please specify if anyone has pet allergies",
    }),
    allergyDetails: z.string().optional().or(z.literal("")),
    hoursAloneDaily: z.nativeEnum(PetAloneTime, {
      message: "Select hours alone",
    }),
    careWhenAway: z.nativeEnum(CareWhenAway, {
      message: "Select care plan when away",
    }),
    petPrimaryLocation: z.nativeEnum(PetPrimaryLocation, {
      message: "Select primary location",
    }),
    petSleepLocation: z.nativeEnum(PetSleepLocation, {
      message: "Select sleep location",
    }),
    petSleepLocationDetails: z.string().optional().or(z.literal("")),
    primaryCaregiver: z.nativeEnum(PrimaryCaregiver, {
      message: "Select primary caregiver",
    }),
    primaryCaregiverDetails: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.numberOfChildren > 0 && !data.childrenAges?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the ages of the children",
        path: ["childrenAges"],
      })
    }
    if (data.householdHasAllergies && !data.allergyDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please describe allergy details",
        path: ["allergyDetails"],
      })
    }
    if (data.petSleepLocation === "OTHER" && !data.petSleepLocationDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please describe other sleep location",
        path: ["petSleepLocationDetails"],
      })
    }
    if (data.primaryCaregiver === "OTHER" && !data.primaryCaregiverDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please describe other primary caregiver",
        path: ["primaryCaregiverDetails"],
      })
    }
  })

// Step 4: Pet Experience & Current Pets
export const Step4Schema = z
  .object({
    hasCurrentPets: z.boolean({ message: "Specify if you have current pets" }),
    currentPets: z
      .array(
        z.object({
          species: z.nativeEnum(PetSpecies, {
            message: "Species is required",
          }),
          breed: z.string().trim().optional().or(z.literal("")),
          age: z.string().trim().min(1, "Age is required"),
          sex: z.enum(["MALE", "FEMALE", "UNKNOWN"], {
            message: "Sex is required",
          }),
        })
      )
      .optional()
      .or(z.literal(null)),
    currentPetsVaccinated: z.enum(["YES", "NO", "NOT_SURE"]).optional().or(z.literal("")),
    ownedPetsPast5Years: z.boolean({
      message: "Specify if you owned pets in past 5 years",
    }),
    pastPetHistory: z.string().optional().or(z.literal("")),
    hasSurrenderedPets: z.boolean({
      message: "Specify if you have surrendered a pet",
    }),
    surrenderPetsDetails: z.string().optional().or(z.literal("")),
    experienceWithSpecies: z.nativeEnum(ExperienceWithSpecies, {
      message: "Select experience level",
    }),
    heardAboutPetFrom: z.nativeEnum(HeardAboutPetFrom, {
      message: "Select how you heard about this pet",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.hasCurrentPets) {
      if (!data.currentPets || data.currentPets.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please add at least one pet description",
          path: ["currentPets"],
        })
      }
      if (!data.currentPetsVaccinated) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vaccination status is required",
          path: ["currentPetsVaccinated"],
        })
      }
    }
    if (data.ownedPetsPast5Years) {
      if (!data.pastPetHistory?.trim() || data.pastPetHistory.trim().length < 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please describe past pets (min 20 characters)",
          path: ["pastPetHistory"],
        })
      }
    }
    if (data.hasSurrenderedPets) {
      if (!data.surrenderPetsDetails?.trim() || data.surrenderPetsDetails.trim().length < 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please describe surrender details (min 20 characters)",
          path: ["surrenderPetsDetails"],
        })
      }
    }
  })

// Step 5: Adoption Commitment
export const Step5Schema = z.object({
  whyThisPet: z
    .string({ message: "Motivation is required" })
    .trim()
    .min(50, "Why you want to adopt this pet must be at least 50 characters")
    .max(2000, "Motivation description must be 2000 characters or fewer"),
  typicalDayForPet: z
    .string({ message: "Daily routine is required" })
    .trim()
    .min(1, "Typical day description is required"),
  financiallyPrepared: z
    .string({ message: "Financial preparation plan is required" })
    .trim()
    .min(1, "Describe how you are financially prepared"),
  timeCommitment: z
    .string({ message: "Adjustment plan is required" })
    .trim()
    .min(1, "Adjustment plan is required"),
  commitToVetCare: z.boolean({ message: "Vet care commitment is required" }),
  additionalInfo: z.string().optional().or(z.literal("")),
})

// Step 6: Documents presence check (checked via DB records)
export const Step6Schema = z.object({
  governmentIdUploaded: z.boolean().refine((val) => val === true, {
    message: "Government Issued ID is required",
  }),
  proofOfAddressUploaded: z.boolean().refine((val) => val === true, {
    message: "Proof of Address is required",
  }),
})

// Step 7: Summary & Agreements
export const Step7Schema = z.object({
  certifyTruthful: z.literal(true, {
    message: "You must certify that all information is truthful",
  }),
  certifyNoAbuseNeglect: z.literal(true, {
    message: "You must certify that you understand approval is not guaranteed",
  }),
  agreeToHomeVisit: z.literal(true, {
    message: "You must agree to home visit if requested",
  }),
  certifyNoAbandonment: z.literal(true, {
    message: "You must certify responsible care",
  }),
  certifyComplyWithLaws: z.literal(true, {
    message: "You must certify compliance with welfare laws",
  }),
  signatureSigned: z.boolean().refine((val) => val === true, {
    message: "Digital signature is required",
  }),
})

// Full Submission Schema
export const SubmitApplicationSchema = z.object({
  livingEnvironment: Step2Schema,
  householdLifestyle: Step3Schema,
  petExperience: Step4Schema,
  adoptionCommitment: Step5Schema,
  agreements: Step7Schema.omit({ signatureSigned: true }),
})

// Save Draft Schema
export const SaveDraftStepSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID"),
  step: z.number().int(),
  data: z.unknown(),
})

export type Step2Input = z.infer<typeof Step2Schema>
export type Step3Input = z.infer<typeof Step3Schema>
export type Step4Input = z.infer<typeof Step4Schema>
export type Step5Input = z.infer<typeof Step5Schema>
export type Step6Input = z.infer<typeof Step6Schema>
export type Step7Input = z.infer<typeof Step7Schema>
export type SaveDraftStepInput = z.infer<typeof SaveDraftStepSchema>
