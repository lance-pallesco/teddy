-- CreateEnum
CREATE TYPE "PetSpecies" AS ENUM ('DOG', 'CAT', 'RABBIT', 'BIRD', 'OTHER');

-- CreateEnum
CREATE TYPE "PetSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE');

-- CreateEnum
CREATE TYPE "PetStatus" AS ENUM ('AVAILABLE', 'PENDING', 'ADOPTED', 'RESERVED', 'MEDICAL_HOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PetGender" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "species" "PetSpecies" NOT NULL,
    "breed" TEXT,
    "gender" "PetGender",
    "size" "PetSize" NOT NULL,
    "birthDate" TIMESTAMP(3),
    "isAgeEstimated" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "weightKg" DOUBLE PRECISION,
    "tags" TEXT[],
    "isVaccinated" BOOLEAN NOT NULL DEFAULT false,
    "isNeutered" BOOLEAN NOT NULL DEFAULT false,
    "isHouseTrained" BOOLEAN NOT NULL DEFAULT false,
    "goodWithKids" BOOLEAN NOT NULL DEFAULT false,
    "goodWithDogs" BOOLEAN NOT NULL DEFAULT false,
    "goodWithCats" BOOLEAN NOT NULL DEFAULT false,
    "specialNeeds" BOOLEAN NOT NULL DEFAULT false,
    "specialNeedsNote" TEXT,
    "shelterId" TEXT,
    "postedById" TEXT,
    "adoptedById" TEXT,
    "adoptedAt" TIMESTAMP(3),
    "status" "PetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetImage" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pet_species_idx" ON "Pet"("species");

-- CreateIndex
CREATE INDEX "Pet_size_idx" ON "Pet"("size");

-- CreateIndex
CREATE INDEX "Pet_gender_idx" ON "Pet"("gender");

-- CreateIndex
CREATE INDEX "Pet_status_idx" ON "Pet"("status");

-- CreateIndex
CREATE INDEX "Pet_shelterId_idx" ON "Pet"("shelterId");

-- CreateIndex
CREATE INDEX "PetImage_petId_idx" ON "PetImage"("petId");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "Shelter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_adoptedById_fkey" FOREIGN KEY ("adoptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetImage" ADD CONSTRAINT "PetImage_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
