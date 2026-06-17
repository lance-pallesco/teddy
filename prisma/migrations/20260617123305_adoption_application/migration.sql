-- CreateEnum
CREATE TYPE "AdoptionStatus" AS ENUM ('DRAFT', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AdoptionStep" AS ENUM ('VERIFY_PERSONAL_DETAILS', 'LIVING_ENVIRONMENT', 'HOUSEHOLD_LIFESTYLE', 'PET_EXPERIENCE', 'ADOPTION_COMMITMENT', 'AGREEMENTS');

-- CreateEnum
CREATE TYPE "HousingType" AS ENUM ('HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'OTHER');

-- CreateEnum
CREATE TYPE "OwnershipStatus" AS ENUM ('OWN', 'RENT', 'OTHER');

-- CreateEnum
CREATE TYPE "LandlordAllowsPets" AS ENUM ('YES', 'NO', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "PropertySize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE');

-- CreateEnum
CREATE TYPE "PetAloneTime" AS ENUM ('LESS_THAN_4_HOURS', 'BETWEEN_4_AND_8_HOURS', 'MORE_THAN_8_HOURS', 'NEVER_ALONE');

-- CreateEnum
CREATE TYPE "PrimaryCaregiver" AS ENUM ('MYSELF', 'SPOUSE', 'PARENT', 'SHARED_RESPONSIBILITY', 'OTHER');

-- CreateEnum
CREATE TYPE "CareWhenAway" AS ENUM ('FAMILY_MEMBER', 'FRIEND', 'PET_SITTER', 'BOARDING_FACILITY', 'OTHER');

-- CreateEnum
CREATE TYPE "PetPrimaryLocation" AS ENUM ('INDOORS', 'OUTDOORS', 'BOTH');

-- CreateEnum
CREATE TYPE "PetSleepLocation" AS ENUM ('CRATE_OR_BED', 'INDOORS', 'OUTDOORS', 'GARAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ExperienceWithSpecies" AS ENUM ('FIRST_TIME', 'SOME_EXPERIENCE', 'VERY_EXPERIENCED');

-- CreateEnum
CREATE TYPE "HeardAboutPetFrom" AS ENUM ('PLATFORM_BROWSE', 'SHELTER_VISIT', 'SOCIAL_MEDIA', 'FRIEND_OR_FAMILY_REFERRAL', 'VETERINARIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationDocumentType" AS ENUM ('GOVERNMENT_ID', 'PROOF_OF_ADDRESS', 'SIGNATURE', 'OTHER');

-- CreateEnum
CREATE TYPE "GovernmentIDType" AS ENUM ('DRIVER_LICENSE', 'PASSPORT', 'NATIONAL_ID', 'TAX_ID', 'SOCIAL_SECURITY_NUMBER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "occupation" TEXT;

-- CreateTable
CREATE TABLE "AdoptionApplication" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "livingEnvironment" JSONB,
    "householdLifestyle" JSONB,
    "petExperience" JSONB,
    "adoptionCommitment" JSONB,
    "agreements" JSONB,
    "signatureUrl" TEXT,
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "status" "AdoptionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdoptionApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationDocument" (
    "id" TEXT NOT NULL,
    "type" "ApplicationDocumentType" NOT NULL,
    "idType" "GovernmentIDType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdoptionApplication_petId_idx" ON "AdoptionApplication"("petId");

-- CreateIndex
CREATE INDEX "AdoptionApplication_applicantId_idx" ON "AdoptionApplication"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicationDocument_applicationId_idx" ON "ApplicationDocument"("applicationId");

-- AddForeignKey
ALTER TABLE "AdoptionApplication" ADD CONSTRAINT "AdoptionApplication_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdoptionApplication" ADD CONSTRAINT "AdoptionApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdoptionApplication" ADD CONSTRAINT "AdoptionApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDocument" ADD CONSTRAINT "ApplicationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdoptionApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
