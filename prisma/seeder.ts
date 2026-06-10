import { Role, Gender, PetSpecies, PetSize, PetStatus, PetGender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { copyFile, mkdir } from "fs/promises";
import path from "path";

const UPLOADS_PETS_DIR = path.join(process.cwd(), "public/uploads/pets");
const UPLOADS_SHELTERS_DIR = path.join(process.cwd(), "public/uploads/shelters");
const UPLOADS_USERS_DIR = path.join(process.cwd(), "public/uploads/users");

async function ensureUploadDirectories() {
    await mkdir(UPLOADS_PETS_DIR, { recursive: true });
    await mkdir(UPLOADS_SHELTERS_DIR, { recursive: true });
    await mkdir(UPLOADS_USERS_DIR, { recursive: true });
}

async function generateAndCopyImage(
    sourcePlaceholderPath: string,
    targetDir: string,
    publicPrefix: string
): Promise<string> {
    const extension = path.extname(sourcePlaceholderPath) || ".jpg";
    const newFileName = `${randomUUID()}${extension}`;
    const targetPath = path.join(targetDir, newFileName);

    try {
        await copyFile(sourcePlaceholderPath, targetPath);
        return `${publicPrefix}/${newFileName}`;
    } catch (error) {
        console.warn(`Placeholder copy failed. Falling back to mock URL path. Make sure "${sourcePlaceholderPath}" exists.`);
        return `${publicPrefix}/${newFileName}`;
    }
}

async function main() {
    console.log("Setting up upload directories...");
    await ensureUploadDirectories();

    console.log("Clean up existing data...");
    await prisma.user.deleteMany({});
    await prisma.shelter.deleteMany({});
    await prisma.pet.deleteMany({});
    await prisma.petImage.deleteMany({});

    console.log("Database cleaned. Started seeding...");

    // ==========================================
    // 1. CREATE SHELTERS
    // ==========================================

    const placeholderShelterLogos = [
        'public/placeholders/safe-haven-logo.jpg',
        'public/placeholders/forever-homes-logo.jpg',
        'public/placeholders/paws-claws-logo.jpg',
    ];
    const safeHaven = await prisma.shelter.create({
        data: {
            name: "Safe Haven Pet Center",
            slug: "safe-haven-pet-center",
            description: "Dedicated to the rescue, rehabilitation, and rehoming of stray and abandoned dogs and cats in metropolitan areas. A loving shelter providing care and finding forever homes for pets in need.",
            logo: await generateAndCopyImage(placeholderShelterLogos[0], UPLOADS_SHELTERS_DIR, "/uploads/shelters"),
            address: "123 Main St, Cityville",
            barangay: "Maligaya",
            city: "Quezon City",
            province: "Metro Manila",
            postalCode: "1100",
            phone: "09171234567",
            email: "info@safehavenpetcenter.com",
            isActive: true,
        }
    });

    const foreverHomes = await prisma.shelter.create({
        data: {
            name: "Forever Homes Rescue Center",
            slug: "forever-homes-rescue-center",
            description: "A cage-free environment focused on companion animals, offering medical support and community education campaigns.",
            logo: await generateAndCopyImage(placeholderShelterLogos[1], UPLOADS_SHELTERS_DIR, "/uploads/shelters"),
            address: "456 Kindness Blvd",
            barangay: "Lahug",
            city: "Cebu City",
            province: "Cebu",
            postalCode: "6000",
            phone: "+639189876543",
            email: "contact@foreverhomes.ph",
            isActive: true
        }
    });

    const pawsClawsRescue = await prisma.shelter.create({
        data: {
            name: "Paws & Claws Rescue Shelter",
            slug: "paws-and-claws-rescue-shelter",
            description: "Providing safe refuge for distressed animals, farm rescues, and neglected birds in Southern Mindanao.",
            logo: await generateAndCopyImage(placeholderShelterLogos[2], UPLOADS_SHELTERS_DIR, "/uploads/shelters"),
            address: "789 Horizon Way",
            barangay: "Buhangin",
            city: "Davao City",
            province: "Davao del Sur",
            postalCode: "8000",
            phone: "+639194567890",
            email: "hello@pawsclawsrescue.com",
            isActive: true
        }
    });

    console.log("Shelters created.");

    // ==========================================
    // 2. CREATE USERS
    // ==========================================

    const placeholderUserAvatars = [
        'public/placeholders/avatar-admin.png',
        'public/placeholders/shelter-staff1-avatar.jpg',
        'public/placeholders/shelter-staff2-avatar.jpg',
        'public/placeholders/shelter-staff3-avatar.jpg',
        'public/placeholders/pet-owner1-avatar.jpg',
        'public/placeholders/pet-owner2-avatar.jpg',
        'public/placeholders/adopter1-avatar.jpg',
        'public/placeholders/adopter2-avatar.jpg',
    ];

    const adminUser = await prisma.user.create({
        data: {
            firstName: "Lance Christian",
            lastName: "Pallesco",
            phone: "09171234567",
            email: "lc.pallesco@teddy.com",
            address: "123 Main St, Adminville, Metro Manila",
            avatar: await generateAndCopyImage(placeholderUserAvatars[0], UPLOADS_USERS_DIR, "/uploads/users"),
            role: Role.ADMIN,
            gender: Gender.MALE,
            isActive: true,
            password: await bcrypt.hash("Pa$$w0rd", 10),
        }
    });

    const shelterStaff1 = await prisma.user.create({
        data: {
            firstName: "Katherine Joy",
            lastName: "Matienzo",
            phone: "09181234567",
            email: "km.matienzo@teddy.com",
            address: "456 Kindness Blvd, Cebu City, Cebu",
            avatar: await generateAndCopyImage(placeholderUserAvatars[1], UPLOADS_USERS_DIR, "/uploads/users"),
            role: Role.SHELTER_STAFF,
            gender: Gender.FEMALE,
            isActive: true,
            password: await bcrypt.hash("Pa$$w0rd", 10),
            shelterId: safeHaven.id,
        }
    });

    const shelterStaff2 = await prisma.user.create({
        data: {
            firstName: "Mark Angelo",
            lastName: "Caretaker",
            phone: "09191234567",
            email: "mc.caretaker@teddy.com",
            address: "789 Horizon Way, Davao City, Davao del Sur",
            avatar: await generateAndCopyImage(placeholderUserAvatars[2], UPLOADS_USERS_DIR, "/uploads/users"),
            role: Role.SHELTER_STAFF,
            gender: Gender.MALE,
            isActive: true,
            password: await bcrypt.hash("Pa$$w0rd", 10),
            shelterId: foreverHomes.id,
        }
    });

    const shelterStaff3 = await prisma.user.create({
        data: {
            firstName: "Jonathan Agustin",
            lastName: "Garcia",
            phone: "09201234567",
            email: "ja.garcia@teddy.com",
            address: "123 Main St, Cebu City, Cebu",
            avatar: await generateAndCopyImage(placeholderUserAvatars[3], UPLOADS_USERS_DIR, "/uploads/users"),
            role: Role.SHELTER_STAFF,
            gender: Gender.FEMALE,
            isActive: true,
            password: await bcrypt.hash("Pa$$w0rd", 10),
            shelterId: pawsClawsRescue.id,
        }
    });

    const petOwner1 = await prisma.user.create({
        data: {
            firstName: "Emily Rose",
            lastName: "Santos",
            phone: "09211234567",
            email: "er.santos@teddy.com",
            address: "456 Kindness Blvd, Cebu City, Cebu",
            avatar: await generateAndCopyImage(placeholderUserAvatars[4], UPLOADS_USERS_DIR, "/uploads/users"),
            role: Role.PET_OWNER,
            gender: Gender.FEMALE,
            isActive: true,
            password: await bcrypt.hash("Pa$$w0rd", 10),
        }
    });

    const petOwner2 = await prisma.user.create({
        data: {
            firstName: "Michael David",
            lastName: "Lopez",
            phone: "09221234567",
            email: "md.lopez@teddy.com",
            address: "789 Horizon Way, Davao City, Davao del Sur",
            avatar: await generateAndCopyImage(placeholderUserAvatars[5], UPLOADS_USERS_DIR, "/uploads/users"),
            role: Role.PET_OWNER,
            gender: Gender.MALE,
            isActive: true,
            password: await bcrypt.hash("Pa$$w0rd", 10),
        }
    });

    const adopter1 = await prisma.user.create({
        data: {
            firstName: "Sophia Grace",
            lastName: "Reyes",
            phone: "09231234567",
            email: "sr.reyes@teddy.com",
            address: "123 Main St, Adopterville, Metro Manila",
            avatar: await generateAndCopyImage(placeholderUserAvatars[6], UPLOADS_USERS_DIR, "/uploads/users"),
            role: Role.ADOPTER,
            gender: Gender.FEMALE,
            isActive: true,
            password: await bcrypt.hash("Pa$$w0rd", 10),
        }
    });

    const adopter2 = await prisma.user.create({
        data: {
            firstName: "David James",
            lastName: "Cruz",
            phone: "09241234567",
            email: "dc.cruz@teddy.com",
            address: "456 Kindness Blvd, Adopterville, Metro Manila",
            avatar: await generateAndCopyImage(placeholderUserAvatars[7], UPLOADS_USERS_DIR, "/uploads/users"),
            role: Role.ADOPTER,
            gender: Gender.MALE,
            isActive: true,
            password: await bcrypt.hash("Pa$$w0rd", 10),
        }
    });

    console.log("Users created...");

    // ==========================================
    // 3. CREATE PETS
    // ==========================================

    const placeholderPetImages = [
        'public/placeholders/buddy1.jpg',
        'public/placeholders/buddy2.jpg',
        'public/placeholders/buddy3.jpg',
        'public/placeholders/charlie1.jpg',
        'public/placeholders/charlie2.jpg',
        'public/placeholders/charlie3.jpg',
        'public/placeholders/max1.jpg',
        'public/placeholders/max2.jpg',
        'public/placeholders/max3.jpg',
        'public/placeholders/barnaby1.jpg',
        'public/placeholders/barnaby2.jpg',
        'public/placeholders/barnaby3.jpg',
        'public/placeholders/buster1.jpg',
        'public/placeholders/buster2.jpg',
        'public/placeholders/buster3.jpg',
        'public/placeholders/cleo1.jpg',
        'public/placeholders/cleo2.jpg',
        'public/placeholders/cleo3.jpg',
        'public/placeholders/kiwi1.jpg',
        'public/placeholders/kiwi2.jpg',
        'public/placeholders/kiwi3.jpg',
    ];

    const petBuddy = await prisma.pet.create({
        data: {
            name: "Buddy",
            description: "Buddy is a vibrant and extremely loving Golden Retriever mix. She loves running around in grassy areas, walking alongside staff, and laying in quiet corners when tuckered out.",
            species: PetSpecies.DOG,
            breed: "Golden Retriever Mix",
            gender: PetGender.MALE,
            size: PetSize.LARGE,
            birthDate: new Date("2018-06-15"),
            isAgeEstimated: true,
            color: "Golden Cream",
            weightKg: 23.4,
            tags: ["Playful", "Loyal", "Affectionate"],
            isVaccinated: true,
            isNeutered: true,
            isHouseTrained: true,
            goodWithKids: true,
            goodWithDogs: true,
            goodWithCats: false,
            specialNeeds: true,
            specialNeedsNote: "Requires a daily joint supplement and has mild separation anxiety that is managed with training and enrichment.",
            adoptedById: null,
            adoptedAt: null,
            status: PetStatus.AVAILABLE,
            shelterId: safeHaven.id,
            postedById: shelterStaff1.id,
        }
    })

    await prisma.petImage.createMany({
        data: [
            { petId: petBuddy.id, url: await generateAndCopyImage(placeholderPetImages[0], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: true },
            { petId: petBuddy.id, url: await generateAndCopyImage(placeholderPetImages[1], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
            { petId: petBuddy.id, url: await generateAndCopyImage(placeholderPetImages[2], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
        ]    
    })

    const petCharlie = await prisma.pet.create({
        data: {
            name: "Charlie",
            description: "Charlie is a sweet, quiet tabby cat who loves chin scratches and basking in sunbeams. Highly independent but welcomes affection on his own terms.",
            species: PetSpecies.CAT,
            breed: "Domestic Shorthair",
            gender: PetGender.FEMALE,
            size: PetSize.SMALL,
            birthDate: new Date("2026-04-01"),
            isAgeEstimated: false,
            color: "Grey Tabby",
            weightKg: 4.5,
            tags: ["Calm", "Independent", "Affectionate"],
            isVaccinated: true,
            isNeutered: true,
            isHouseTrained: true,
            goodWithKids: true,
            goodWithDogs: false,
            goodWithCats: true,
            specialNeeds: false,
            specialNeedsNote: null,
            adoptedById: null,
            adoptedAt: null,
            status: PetStatus.AVAILABLE,
            shelterId: foreverHomes.id,
            postedById: shelterStaff2.id,
        }
    });

    await prisma.petImage.createMany({
        data: [
            { petId: petCharlie.id, url: await generateAndCopyImage(placeholderPetImages[3], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: true },
            { petId: petCharlie.id, url: await generateAndCopyImage(placeholderPetImages[4], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
            { petId: petCharlie.id, url: await generateAndCopyImage(placeholderPetImages[5], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
        ]
    });

    const petMax = await prisma.pet.create({
        data: {
            name: "Max",
            description: "Max is an incredibly smart, loyal German Shepherd. He loves mental stimulation and knows basic commands like sit, stay, and shake.",
            species: PetSpecies.DOG,
            breed: "German Shepherd",
            gender: PetGender.MALE,
            size: PetSize.LARGE,
            birthDate: new Date("2022-01-15"),
            isAgeEstimated: false,
            color: "Black & Tan",
            weightKg: 31.2,
            tags: ["Energetic", "Friendly", "Social", "Playful"],
            isVaccinated: true,
            isNeutered: true,
            isHouseTrained: true,
            goodWithKids: true,
            goodWithDogs: true,
            goodWithCats: false,
            specialNeeds: false,
            specialNeedsNote: null,
            adoptedById: null,
            adoptedAt: null,
            status: PetStatus.AVAILABLE,
            shelterId: pawsClawsRescue.id,
            postedById: shelterStaff3.id,
        }
    });

    await prisma.petImage.createMany({
        data: [
            { petId: petMax.id, url: await generateAndCopyImage(placeholderPetImages[6], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: true },
            { petId: petMax.id, url: await generateAndCopyImage(placeholderPetImages[7], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
            { petId: petMax.id, url: await generateAndCopyImage(placeholderPetImages[8], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
        ]
    });
    
    const petBarnaby = await prisma.pet.create({
        data: {
            name: "Barnaby",
            description: "Barnaby is a fluffy, extremely soft Angora rabbit. He is a bit shy at first but warms up quickly when offered fresh cilantro or carrots.",
            species: PetSpecies.RABBIT,
            breed: "Angora",
            gender: PetGender.MALE,
            size: PetSize.SMALL,
            birthDate: new Date("2025-02-28"),
            isAgeEstimated: true,
            color: "White/Grey",
            weightKg: 1.8,
            tags: ["Shy", "Calm", "Independent"],
            isVaccinated: false,
            isNeutered: false,
            isHouseTrained: false,
            goodWithKids: true,
            goodWithDogs: false,
            goodWithCats: false,
            specialNeeds: false,
            specialNeedsNote: null,
            adoptedById: null,
            adoptedAt: null,
            status: PetStatus.AVAILABLE,
            shelterId: safeHaven.id,
            postedById: shelterStaff1.id,
        }
    });

    await prisma.petImage.createMany({
        data: [
            { petId: petBarnaby.id, url: await generateAndCopyImage(placeholderPetImages[9], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: true },
            { petId: petBarnaby.id, url: await generateAndCopyImage(placeholderPetImages[10], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
            { petId: petBarnaby.id, url: await generateAndCopyImage(placeholderPetImages[11], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
        ]
    });

    const petBuster = await prisma.pet.create({
        data: {
            name: "Buster",
            description: "Buster is a lively Pug who gets along with absolutely everyone! He loves playing with squishy toys and snores loudly when asleep. Needs to be rehomed because of my apartment's new pet restrictions.",
            species: PetSpecies.DOG,
            breed: "Pug",
            gender: PetGender.MALE,
            size: PetSize.SMALL,
            birthDate: new Date("2023-11-01"),
            isAgeEstimated: false,
            color: "Fawn",
            weightKg: 8.2,
            tags: ["Playful", "Social", "Friendly"],
            isVaccinated: true,
            isNeutered: true,
            isHouseTrained: true,
            goodWithKids: true,
            goodWithDogs: true,
            goodWithCats: true,
            specialNeeds: false,
            specialNeedsNote: null,
            adoptedById: null,
            adoptedAt: null,
            status: PetStatus.AVAILABLE,
            shelterId: foreverHomes.id,
            postedById: shelterStaff2.id,
        }
    });

    await prisma.petImage.createMany({
        data: [
            { petId: petBuster.id, url: await generateAndCopyImage(placeholderPetImages[12], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: true },
            { petId: petBuster.id, url: await generateAndCopyImage(placeholderPetImages[13], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
            { petId: petBuster.id, url: await generateAndCopyImage(placeholderPetImages[14], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
        ]
    });

    const petCleo = await prisma.pet.create({
        data: {
            name: "Cleo",
            description: "Cleo is a beautiful calico cat with striking eyes. She is initially very shy around new people but becomes incredibly affectionate once she trusts you. Looking for a quiet, loving indoor home.",
            species: PetSpecies.CAT,
            breed: "Calico",
            gender: PetGender.FEMALE,
            size: PetSize.MEDIUM,
            birthDate: new Date("2022-07-20"),
            isAgeEstimated: true,
            color: "Calico Tri-color",
            weightKg: 4.1,
            tags: ["Shy", "Calm", "Affectionate"],
            isVaccinated: true,
            isNeutered: true,
            isHouseTrained: true,
            goodWithKids: false,
            goodWithDogs: false,
            goodWithCats: true,
            status: PetStatus.AVAILABLE,
            shelterId: null,
            postedById: petOwner1.id,
        }
    });

    await prisma.petImage.createMany({
        data: [
            { petId: petCleo.id, url: await generateAndCopyImage(placeholderPetImages[15], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: true },
            { petId: petCleo.id, url: await generateAndCopyImage(placeholderPetImages[16], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
            { petId: petCleo.id, url: await generateAndCopyImage(placeholderPetImages[17], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
        ]
    });

    const petKiwi = await prisma.pet.create({
        data: {
            name: "Kiwi",
            description: "Kiwi is an active, vocal parakeet. He loves to whistle along to music. He is currently on a short medical hold to ensure a minor wing scratch heals perfectly before release.",
            species: PetSpecies.BIRD,
            breed: "Budgerigar / Parakeet",
            gender: PetGender.MALE,
            size: PetSize.SMALL,
            birthDate: new Date("2025-05-15"),
            isAgeEstimated: true,
            color: "Bright Green",
            weightKg: 0.04,
            tags: ["Friendly", "Social"],
            isVaccinated: false,
            isNeutered: false,
            isHouseTrained: false,
            goodWithKids: true,
            goodWithDogs: false,
            goodWithCats: false,
            specialNeeds: true,
            specialNeedsNote: "Needs daily cage rest and wing checkups by a vet until June 10, 2026.",
            status: PetStatus.AVAILABLE,
            shelterId: null,
            postedById: petOwner2.id,
        }
    });

    await prisma.petImage.createMany({
        data: [
            { petId: petKiwi.id, url: await generateAndCopyImage(placeholderPetImages[18], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: true },
            { petId: petKiwi.id, url: await generateAndCopyImage(placeholderPetImages[19], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
            { petId: petKiwi.id, url: await generateAndCopyImage(placeholderPetImages[20], UPLOADS_PETS_DIR, "/uploads/pets"), isPrimary: false },
        ]
    });

    console.log("Pets created...");
    console.log("Seeding completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });