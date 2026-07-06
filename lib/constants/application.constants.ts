import {
  GovernmentIDType,
  AdoptionStatus,
  ApplicationDocumentType,
} from "@prisma/client"

export enum HousingType {
  HOUSE = "HOUSE",
  APARTMENT = "APARTMENT",
  CONDO = "CONDO",
  TOWNHOUSE = "TOWNHOUSE",
  OTHER = "OTHER",
}

export enum OwnershipStatus {
  OWN = "OWN",
  RENT = "RENT",
  OTHER = "OTHER",
}

export enum LandlordAllowsPets {
  YES = "YES",
  NO = "NO",
  NOT_APPLICABLE = "NOT_APPLICABLE",
}

export enum PropertySize {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
  EXTRA_LARGE = "EXTRA_LARGE",
}

export enum PetAloneTime {
  LESS_THAN_4_HOURS = "LESS_THAN_4_HOURS",
  BETWEEN_4_AND_8_HOURS = "BETWEEN_4_AND_8_HOURS",
  MORE_THAN_8_HOURS = "MORE_THAN_8_HOURS",
  NEVER_ALONE = "NEVER_ALONE",
}

export enum CareWhenAway {
  FAMILY_MEMBER = "FAMILY_MEMBER",
  FRIEND = "FRIEND",
  PET_SITTER = "PET_SITTER",
  BOARDING_FACILITY = "BOARDING_FACILITY",
  OTHER = "OTHER",
}

export enum PetPrimaryLocation {
  INDOORS = "INDOORS",
  OUTDOORS = "OUTDOORS",
  BOTH = "BOTH",
}

export enum PetSleepLocation {
  CRATE_OR_BED = "CRATE_OR_BED",
  INDOORS = "INDOORS",
  OUTDOORS = "OUTDOORS",
  GARAGE = "GARAGE",
  OTHER = "OTHER",
}

export enum PrimaryCaregiver {
  MYSELF = "MYSELF",
  SPOUSE = "SPOUSE",
  PARENT = "PARENT",
  SHARED_RESPONSIBILITY = "SHARED_RESPONSIBILITY",
  OTHER = "OTHER",
}

export enum ExperienceWithSpecies {
  FIRST_TIME = "FIRST_TIME",
  SOME_EXPERIENCE = "SOME_EXPERIENCE",
  VERY_EXPERIENCED = "VERY_EXPERIENCED",
}

export enum HeardAboutPetFrom {
  PLATFORM_BROWSE = "PLATFORM_BROWSE",
  SHELTER_VISIT = "SHELTER_VISIT",
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  FRIEND_OR_FAMILY_REFERRAL = "FRIEND_OR_FAMILY_REFERRAL",
  VETERINARIAN = "VETERINARIAN",
  OTHER = "OTHER",
}

export const HOUSING_TYPE_LABELS: Record<HousingType, string> = {
  HOUSE: "House",
  APARTMENT: "Apartment",
  CONDO: "Condo",
  TOWNHOUSE: "Townhouse",
  OTHER: "Other",
}

export const OWNERSHIP_STATUS_LABELS: Record<OwnershipStatus, string> = {
  OWN: "Own",
  RENT: "Rent",
  OTHER: "Other",
}

export const LANDLORD_ALLOWS_PETS_LABELS: Record<LandlordAllowsPets, string> = {
  YES: "Yes",
  NO: "No",
  NOT_APPLICABLE: "Not applicable / Not yet asked",
}

export const PROPERTY_SIZE_LABELS: Record<PropertySize, string> = {
  SMALL: "Small (Studio/1-2 rooms)",
  MEDIUM: "Medium (3-4 rooms)",
  LARGE: "Large (5+ rooms)",
  EXTRA_LARGE: "Extra Large",
}

export const PET_ALONE_TIME_LABELS: Record<PetAloneTime, string> = {
  LESS_THAN_4_HOURS: "Under 4 hours",
  BETWEEN_4_AND_8_HOURS: "4-8 hours",
  MORE_THAN_8_HOURS: "More than 8 hours",
  NEVER_ALONE: "Never alone",
}

export const CARE_WHEN_AWAY_LABELS: Record<CareWhenAway, string> = {
  FAMILY_MEMBER: "Family member",
  FRIEND: "Friend",
  PET_SITTER: "Pet sitter",
  BOARDING_FACILITY: "Boarding / Kennel",
  OTHER: "Other",
}

export const PET_PRIMARY_LOCATION_LABELS: Record<PetPrimaryLocation, string> = {
  INDOORS: "Indoors",
  OUTDOORS: "Outdoors",
  BOTH: "Both (Indoors & Outdoors)",
}

export const PET_SLEEP_LOCATION_LABELS: Record<PetSleepLocation, string> = {
  CRATE_OR_BED: "Crate or bed",
  INDOORS: "Indoors free roam",
  OUTDOORS: "Outdoors",
  GARAGE: "Garage",
  OTHER: "Other",
}

export const PRIMARY_CAREGIVER_LABELS: Record<PrimaryCaregiver, string> = {
  MYSELF: "Myself",
  SPOUSE: "Spouse",
  PARENT: "Parent",
  SHARED_RESPONSIBILITY: "Shared",
  OTHER: "Other",
}

export const EXPERIENCE_WITH_SPECIES_LABELS: Record<ExperienceWithSpecies, string> = {
  FIRST_TIME: "First time",
  SOME_EXPERIENCE: "Some experience",
  VERY_EXPERIENCED: "Very experienced",
}

export const HEARD_ABOUT_PET_FROM_LABELS: Record<HeardAboutPetFrom, string> = {
  PLATFORM_BROWSE: "Platform browse",
  SHELTER_VISIT: "Shelter visit",
  SOCIAL_MEDIA: "Social media",
  FRIEND_OR_FAMILY_REFERRAL: "Friend or family referral",
  VETERINARIAN: "Veterinarian",
  OTHER: "Other",
}

export const GOVERNMENT_ID_TYPE_LABELS: Record<GovernmentIDType, string> = {
  DRIVER_LICENSE: "Driver's License",
  PASSPORT: "Passport",
  NATIONAL_ID: "National ID",
  TAX_ID: "TIN",
  SOCIAL_SECURITY_NUMBER: "SSS",
}

export const ADOPTION_STATUS_LABELS: Record<AdoptionStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending Review",
  UNDER_REVIEW: "Under Review",
  INTERVIEW_IN_PROGRESS: "Interview In Progress",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
}

export const DOCUMENT_TYPE_LABELS: Record<ApplicationDocumentType, string> = {
  GOVERNMENT_ID: "Government Issued ID",
  PROOF_OF_ADDRESS: "Proof of Address",
  SIGNATURE: "Digital Signature",
  OTHER: "Other Document",
}
