import { UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function ShelterStaffTable() {
  const emptyStaff = true

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="size-5 text-muted-foreground" />
          <h3 className="text-base font-medium">Shelter Staff</h3>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled>
            Add Staff
          </Button>
          <Button type="button" disabled variant="outline">
            Invite Staff
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {emptyStaff ? (
            <TableRow>
              <TableCell colSpan={7}>
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <p className="font-medium">No staff members assigned yet.</p>
                  <p className="text-sm text-muted-foreground">
                    This table is ready for future Shelter Staff management.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  )
}

