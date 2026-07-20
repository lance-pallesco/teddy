import { redirect } from "next/navigation"

type ShelterStaffIndexPageProps = {
  params: Promise<{ id: string }>
}

export default async function ShelterStaffIndexPage({ params }: ShelterStaffIndexPageProps) {
  const { id } = await params
  redirect(`/shelters/${id}`)
}
