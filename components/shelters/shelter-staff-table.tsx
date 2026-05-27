import Link from "next/link"
import { PlusIcon, UsersIcon } from "lucide-react"

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
import type { ShelterStaffListItem } from "@/lib/services/user.service"

type ShelterStaffTableProps = {
  shelterId?: string
  staffMembers: ShelterStaffListItem[]
  showShelterColumn?: boolean
}

export function ShelterStaffTable({
  shelterId,
  staffMembers,
  showShelterColumn = false,
}: ShelterStaffTableProps) {
  const emptyStaff = staffMembers.length === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="size-5 text-muted-foreground" />
          <h3 className="text-base font-medium">Shelter Staff</h3>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link href={shelterId ? `/shelters/${shelterId}/staff/new` : "/shelters/staff/new"}>
              <PlusIcon />
              Add Staff
            </Link>
          </Button>
          {/* <Button type="button" disabled variant="outline">
            Invite Staff
          </Button> */}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            {showShelterColumn ? <TableHead>Shelter</TableHead> : null}
            <TableHead>Phone</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {emptyStaff ? (
            <TableRow>
              <TableCell colSpan={showShelterColumn ? 7 : 6}>
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <p className="font-medium">No staff members assigned yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Add a staff account to start shelter operations.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            staffMembers.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>
                  <div className="flex size-9 items-center justify-center rounded-full border bg-muted text-xs font-semibold text-muted-foreground">
                    {`${staff.firstName[0] ?? ""}${staff.lastName[0] ?? ""}`.toUpperCase()}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {staff.firstName} {staff.lastName}
                </TableCell>
                <TableCell>{staff.email}</TableCell>
                {showShelterColumn ? (
                  <TableCell>
                    {staff.shelterId ? (
                      <Link
                        href={`/shelters/${staff.shelterId}`}
                        className="hover:underline hover:underline-offset-4"
                      >
                        {staff.shelterName ?? "Unknown Shelter"}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                ) : null}
                <TableCell>{staff.phone}</TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(staff.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge variant={staff.isActive ? "success" : "warning"}>
                    {staff.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
