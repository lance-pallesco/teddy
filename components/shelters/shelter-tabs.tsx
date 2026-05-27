"use client"

import { useMemo } from "react"

import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ShelterFormRecord } from "@/lib/services/shelter.service"
import { ShelterStaffTable } from "@/components/shelters/shelter-staff-table"
import { ShelterPetsGrid } from "@/components/shelters/shelter-pets-grid"
import type { ShelterStaffListItem } from "@/lib/services/user.service"

type ShelterTabsProps = {
  shelter: ShelterFormRecord
  staffMembers: ShelterStaffListItem[]
}

export function ShelterTabs({ shelter, staffMembers }: ShelterTabsProps) {
  const tabDefault = useMemo(() => "overview", [])

  return (
    <Tabs defaultValue={tabDefault}>
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="staff">Staff</TabsTrigger>
        <TabsTrigger value="pets">Pets</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-base font-medium">Shelter Summary</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {shelter.description}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                <ShieldCheckIcon className="size-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Ready for future staff + pet integration.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Email</p>
                <p className="mt-1 text-sm">{shelter.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Phone</p>
                <p className="mt-1 text-sm">{shelter.phone}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowRightIcon className="size-4" />
              <p>Use the Staff and Pets tabs to manage future module data.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="staff">
        <ShelterStaffTable shelterId={shelter.id} staffMembers={staffMembers} />
      </TabsContent>

      <TabsContent value="pets">
        <ShelterPetsGrid />
      </TabsContent>
    </Tabs>
  )
}

