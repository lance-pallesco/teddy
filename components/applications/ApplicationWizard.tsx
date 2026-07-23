"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"

import { WizardShell } from "@/components/shared/wizard/WizardShell"
import type { WizardStep } from "@/components/shared/wizard/types"

import { Step1VerifyDetails } from "./steps/Step1VerifyDetails"
import { Step2LivingEnvironment } from "./steps/Step2LivingEnvironment"
import { Step3HouseholdLifestyle } from "./steps/Step3HouseholdLifestyle"
import { Step4PetExperience } from "./steps/Step4PetExperience"
import { Step5AdoptionCommitment } from "./steps/Step5AdoptionCommitment"
import { Step6Documents } from "./steps/Step6Documents"
import { Step7SummaryAgreements } from "./steps/Step7SummaryAgreements"

import {
  saveApplicationStepAction,
  submitApplicationAction,
  uploadSignatureAction,
} from "@/app/(dashboard)/applications/actions/application.action"

import {
  Step2Schema,
  Step3Schema,
  Step4Schema,
  Step5Schema,
  Step6Schema,
  Step7Schema,
} from "@/lib/validators/application.schema"

import type { AdoptionApplication, ApplicationDocumentType, GovernmentIDType } from "@prisma/client"
import type { PetDetail } from "@/lib/services/pet.service"

interface UploadedDoc {
  id: string
  type: ApplicationDocumentType
  idType: GovernmentIDType
  name: string
  url: string
}

interface ApplicationWizardProps {
  pet: PetDetail
  application: AdoptionApplication & {
    documents: UploadedDoc[]
  }
  userProfile: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    occupation: string | null
    dateOfBirth: Date | null
  }
}

const STEP_PATHS = {
  2: "livingEnvironment",
  3: "householdLifestyle",
  4: "petExperience",
  5: "adoptionCommitment",
  7: "agreements",
} as const

const STEP_SCHEMAS: Record<number, any> = {
  2: Step2Schema,
  3: Step3Schema,
  4: Step4Schema,
  5: Step5Schema,
  6: Step6Schema,
  7: Step7Schema,
}

export function ApplicationWizard({
  pet,
  application,
  userProfile,
}: ApplicationWizardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [currentStep, setCurrentStep] = useState(application.currentStep)
  const [documents, setDocuments] = useState<UploadedDoc[]>(application.documents)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(application.signatureUrl)

  const steps: WizardStep[] = [
    {
      id: 1,
      title: "Verify Details",
      description: "Confirm your identity and profile",
      component: <Step1VerifyDetails user={userProfile} />,
      schema: Step2Schema, // dummy/placeholder
    },
    {
      id: 2,
      title: "Living Environment",
      description: "Home type, ownership & rules",
      component: <Step2LivingEnvironment />,
      schema: Step2Schema,
    },
    {
      id: 3,
      title: "Household & Lifestyle",
      description: "Members, schedules & sleep plans",
      component: <Step3HouseholdLifestyle />,
      schema: Step3Schema,
    },
    {
      id: 4,
      title: "Pet Experience",
      description: "Past ownership & current pets",
      component: <Step4PetExperience petSpecies={pet.species} />,
      schema: Step4Schema,
    },
    {
      id: 5,
      title: "Adoption Commitment",
      description: "Plans, routines & veterinary budget",
      component: <Step5AdoptionCommitment petName={pet.name} />,
      schema: Step5Schema,
    },
    {
      id: 6,
      title: "Documents",
      description: "Attach Government ID & Proof of Address",
      component: (
        <Step6Documents
          applicationId={application.id}
          documents={documents}
          onDocumentAdded={(doc) => setDocuments((prev) => [...prev, doc])}
          onDocumentRemoved={(id) => setDocuments((prev) => prev.filter((d) => d.id !== id))}
        />
      ),
      schema: Step6Schema,
    },
    {
      id: 7,
      title: "Summary & Agreements",
      description: "Final certifications & digital signature",
      component: (
        <Step7SummaryAgreements
          applicationId={application.id}
          petName={pet.name}
          user={userProfile}
          documents={documents}
          signatureUrl={signatureUrl}
          onSignatureSaved={(url) => setSignatureUrl(url)}
        />
      ),
      schema: Step7Schema,
    },
  ]

  // Parse JSON columns from draft
  const defaultValues = {
    livingEnvironment: (application.livingEnvironment as any) || {
      housingType: undefined,
      ownershipStatus: undefined,
      landlordAllowsPets: undefined,
      propertySize: undefined,
      isPetFriendly: undefined,
    },
    householdLifestyle: (application.householdLifestyle as any) || {
      numberOfAdults: 1,
      numberOfChildren: 0,
      childrenAges: "",
      householdHasAllergies: false,
      allergyDetails: "",
      hoursAloneDaily: undefined,
      careWhenAway: undefined,
      petPrimaryLocation: undefined,
      petSleepLocation: undefined,
      petSleepLocationDetails: "",
      primaryCaregiver: undefined,
      primaryCaregiverDetails: "",
    },
    petExperience: (application.petExperience as any) || {
      hasCurrentPets: false,
      currentPets: [],
      currentPetsVaccinated: undefined,
      ownedPetsPast5Years: false,
      pastPetHistory: "",
      hasSurrenderedPets: false,
      surrenderPetsDetails: "",
      experienceWithSpecies: undefined,
      heardAboutPetFrom: undefined,
    },
    adoptionCommitment: (application.adoptionCommitment as any) || {
      whyThisPet: "",
      typicalDayForPet: "",
      financiallyPrepared: "",
      timeCommitment: "",
      commitToVetCare: undefined,
      additionalInfo: "",
    },
    agreements: (application.agreements as any) || {
      certifyTruthful: false,
      certifyNoAbuseNeglect: false,
      agreeToHomeVisit: false,
      certifyNoAbandonment: false,
      certifyComplyWithLaws: false,
      certifyResponsible: false,
    },
    // Validation flags
    governmentIdUploaded: documents.some((d) => d.type === "GOVERNMENT_ID"),
    proofOfAddressUploaded: documents.some((d) => d.type === "PROOF_OF_ADDRESS"),
    signatureSigned: !!signatureUrl,
    signatureBase64: "",
  }

  const methods = useForm<any>({
    resolver: zodResolver(
      z.object({
        livingEnvironment: Step2Schema,
        householdLifestyle: Step3Schema,
        petExperience: Step4Schema,
        adoptionCommitment: Step5Schema,
        agreements: Step7Schema.omit({ signatureSigned: true }),
        signatureSigned: z.boolean().refine((val) => val === true, {
          message: "Digital signature is required",
        }),
      })
    ),
    defaultValues,
    mode: "onBlur",
  })

  // Age calculation logic for Step 1 Block
  let userAge = 0
  if (userProfile.dateOfBirth) {
    const dob = new Date(userProfile.dateOfBirth)
    const today = new Date()
    userAge = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      userAge--
    }
  }
  const isAgeBlocked = !userProfile.dateOfBirth || userAge < 18

  const handleNext = async () => {
    // Step 1 check
    if (currentStep === 1) {
      if (isAgeBlocked) {
        toast.error("You must update your profile to meet the age criteria before applying.")
        return
      }
      setCurrentStep(2)
      return
    }

    // Step 7 check
    if (currentStep === 7) {
      await handleSubmit()
      return
    }

    // Form validations for other steps
    const stepPath = STEP_PATHS[currentStep as keyof typeof STEP_PATHS]
    const schema = STEP_SCHEMAS[currentStep]

    if (stepPath && schema) {
      const stepData = methods.getValues(stepPath)
      const parsed = schema.safeParse(stepData)
      if (!parsed.success) {
        // Trigger visual UI validation highlights
        await methods.trigger(stepPath)
        toast.error("Please complete all required fields on this step.")
        return
      }

      // Save draft step content to DB
      setIsSavingDraft(true)
      const res = await saveApplicationStepAction({
        applicationId: application.id,
        step: currentStep,
        data: parsed.data,
      })
      setIsSavingDraft(false)

      if (!res.success) {
        toast.error(res.error ?? "Failed to save progress.")
        return
      }
    } else if (currentStep === 6) {
      // Step 6 Documents check
      const govId = documents.some((d) => d.type === "GOVERNMENT_ID")
      const proof = documents.some((d) => d.type === "PROOF_OF_ADDRESS")

      if (!govId || !proof) {
        toast.error("Please upload both your Government ID and Proof of Address.")
        return
      }

      // Update progress step on DB
      setIsSavingDraft(true)
      await saveApplicationStepAction({
        applicationId: application.id,
        step: 6,
        data: null,
      })
      setIsSavingDraft(false)
    }

    setCurrentStep((prev) => prev + 1)
  }

  const handleStepChange = async (targetStep: number) => {
    // Prevent skipping ahead without validating
    if (targetStep > currentStep) {
      return
    }

    // Save current step if we are moving backward
    const stepPath = STEP_PATHS[currentStep as keyof typeof STEP_PATHS]
    if (stepPath && currentStep >= 2 && currentStep <= 5) {
      const stepData = methods.getValues(stepPath)
      const schema = STEP_SCHEMAS[currentStep]
      if (schema && schema.safeParse(stepData).success) {
        await saveApplicationStepAction({
          applicationId: application.id,
          step: currentStep,
          data: stepData,
        })
      }
    }

    setCurrentStep(targetStep)
  }

  const handleSaveDraftLink = async () => {
    const stepPath = STEP_PATHS[currentStep as keyof typeof STEP_PATHS]

    if (stepPath) {
      const stepData = methods.getValues(stepPath)

      setIsSavingDraft(true)
      const res = await saveApplicationStepAction({
        applicationId: application.id,
        step: currentStep,
        data: stepData,
      })
      setIsSavingDraft(false)

      if (res.success) {
        toast.success("Progress saved as draft successfully!")
      } else {
        toast.error(res.error ?? "Failed to save draft.")
      }
    } else if (currentStep === 6) {
      toast.success("Progress saved as draft successfully!")
    }
  }

  const handleSubmit = async () => {
    // Validate Step 7 agreements
    const agreements = methods.getValues("agreements")
    const sigBase64 = methods.getValues("signatureBase64")
    const hasSignature = !!signatureUrl || !!sigBase64

    const parsed = Step7Schema.safeParse({
      ...agreements,
      signatureSigned: hasSignature,
    })

    if (!parsed.success) {
      await methods.trigger("agreements")
      await methods.trigger("signatureSigned")
      toast.error("Please accept all certifications and sign below to submit.")
      return
    }

    // Save Step 7 agreements draft first
    setIsSavingDraft(true)
    const resDraft = await saveApplicationStepAction({
      applicationId: application.id,
      step: 7,
      data: agreements,
    })

    if (!resDraft.success) {
      setIsSavingDraft(false)
      toast.error(resDraft.error ?? "Failed to save certifications.")
      return
    }

    // If there is a new signatureBase64, upload it first!
    if (sigBase64) {
      try {
        const formData = new FormData()
        formData.append("applicationId", application.id)
        formData.append("signatureBase64", sigBase64)

        const resSig = await uploadSignatureAction(formData)
        if (!resSig.success || !resSig.url) {
          setIsSavingDraft(false)
          toast.error(resSig.error ?? "Failed to save digital signature.")
          return
        }
        setSignatureUrl(resSig.url)
      } catch (err) {
        console.error(err)
        setIsSavingDraft(false)
        toast.error("Failed to save digital signature.")
        return
      }
    }

    setIsSavingDraft(false)

    // Trigger final application submit Server Action
    startTransition(async () => {
      const res = await submitApplicationAction(application.id)
      if (res.success) {
        toast.success("Application submitted successfully!")
        router.push("/applications")
        router.refresh()
      } else {
        toast.error(res.error ?? "Something went wrong. Please try again.")
      }
    })
  }

  const activeStep = steps.find((s) => s.id === currentStep)
  const activeStepContent = activeStep?.component ?? null

  return (
    <FormProvider {...methods}>
      <WizardShell
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        isSavingDraft={isSavingDraft}
        onSaveDraft={handleSaveDraftLink}
        onNext={handleNext}
        disableNext={currentStep === 1 && isAgeBlocked}
      >
        {activeStepContent}
      </WizardShell>
    </FormProvider>
  )
}
