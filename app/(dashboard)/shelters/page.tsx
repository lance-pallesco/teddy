import Link from "next/link"
import Image from "next/image"
import { PlusIcon } from "lucide-react"

import { ShelterTableActions } from "@/components/shelters/shelter-table-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listShelters } from "@/lib/services/shelter.service"

export default async function SheltersPage() {
  const shelters = await listShelters()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:px-16 md:py-6 w-full max-w-full min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl tracking-tighter">Shelters</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage shelter records and prepare them for future staff assignment.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full bg-[#AE8F65] text-white border-[#AE8F65] hover:bg-[#AE8F65] hover:text-white hover:border-[#9A7D58] text-base font-medium px-6 transition-transform duration-200 gap-2 shadow-sm shrink-0"
          asChild
        >
          <Link href="/shelters/new">
            <PlusIcon />
            <span className="text-base font-light">Add Shelter</span>
          </Link>
        </Button>
      </div>

      <div className="w-full min-w-0 rounded-xl border bg-white dark:bg-[#1E1A16] shadow-xs overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14"></TableHead>
              <TableHead className="min-w-[160px]">Shelter Name</TableHead>
              <TableHead className="min-w-[100px]">City</TableHead>
              <TableHead className="min-w-[100px]">Province</TableHead>
              <TableHead className="min-w-[160px]">Contact</TableHead>
              <TableHead className="min-w-[80px]">Status</TableHead>
              <TableHead className="min-w-[120px]">Created At</TableHead>
              <TableHead className="w-12 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shelters.length ? (
              shelters.map((shelter) => (
                <TableRow key={shelter.id}>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/shelters/${shelter.id}`}
                      className="hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {shelter.name}
                    </Link>
                  </TableCell>
                  <TableCell>{shelter.city}</TableCell>
                  <TableCell>{shelter.province}</TableCell>
                  <TableCell>
                    <div>{shelter.phone}</div>
                    <div className="text-xs text-muted-foreground">{shelter.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={shelter.isActive ? "success" : "warning"}>
                      {shelter.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(shelter.createdAt)}
                  </TableCell>
                  <TableCell>
                    <ShelterTableActions shelterId={shelter.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <p className="font-medium">No shelters yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first shelter to start building the network.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
