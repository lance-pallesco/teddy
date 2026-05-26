import Link from "next/link"
import Image from "next/image"
import { PlusIcon } from "lucide-react"

import { ShelterTableActions } from "@/components/shelters/shelter-table-actions"
import { Button } from "@/components/ui/button"
import { listShelters } from "@/lib/services/shelter.service"

export default async function SheltersPage() {
  const shelters = await listShelters()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shelter Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage shelter records and prepare them for future staff assignment.
          </p>
        </div>
        <Button asChild>
          <Link href="/shelters/new">
            <PlusIcon />
            Add Shelter
          </Link>
        </Button>
      </div>

      <section className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium"></th>
                <th className="px-4 py-3 font-medium">Shelter Name</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Province</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date Created</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shelters.length ? (
                shelters.map((shelter) => (
                  <tr key={shelter.id} className="border-t">
                    <td className="px-4 py-3">
                      {shelter.logo ? (
                        <div className="relative size-10 overflow-hidden rounded-md border">
                          <Image
                            src={shelter.logo}
                            alt={`${shelter.name} logo`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                          NA
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/shelters/${shelter.id}`}
                        className="hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {shelter.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{shelter.city}</td>
                    <td className="px-4 py-3">{shelter.province}</td>
                    <td className="px-4 py-3">
                      <div>{shelter.phone}</div>
                      <div className="text-xs text-muted-foreground">{shelter.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700">
                        {shelter.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(shelter.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <ShelterTableActions shelterId={shelter.id} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="font-medium">No shelters yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create your first shelter to start building the network.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
