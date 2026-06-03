import type { PetAgeUnit } from "@/lib/constants/pet"

export function estimatedAgeToBirthDate(age: number, unit: PetAgeUnit): Date {
  const birthDate = new Date()

  if (unit === "YEARS") {
    birthDate.setFullYear(birthDate.getFullYear() - age)
    return birthDate
  }

  birthDate.setMonth(birthDate.getMonth() - age)
  return birthDate
}

export function formatEstimatedAge(age: number, unit: PetAgeUnit): string {
  if (unit === "YEARS") {
    return age === 1 ? "1 year" : `${age} years`
  }

  return age === 1 ? "1 month" : `${age} months`
}

export function formatBirthDateAsAge(
  birthDate: Date | null,
  isAgeEstimated = false
): string {
  if (!birthDate) {
    return "Age unknown"
  }

  const now = new Date()
  let months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth())

  if (now.getDate() < birthDate.getDate()) {
    months -= 1
  }

  months = Math.max(0, months)

  if (months < 12) {
    const value = Math.max(1, months)
    return value === 1 ? "1 month" : `${value} months`
  }

  const years = Math.floor(months / 12)
  const label = years === 1 ? "1 year" : `${years} years`

  return isAgeEstimated ? `${label} (est.)` : label
}
