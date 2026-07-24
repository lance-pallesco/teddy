"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { MessageSquare, ArrowRight, PawPrint, Clock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface MessageConversationItem {
  id: string
  status: string
  chatStatus?: string | null
  chatMode?: string | null
  createdAt: Date | string
  pet: {
    name: string
    species: string
    breed?: string | null
    petImages?: { url: string }[]
  }
  applicant?: {
    firstName: string
    lastName: string
    avatar?: string | null
  } | null
  lastMessage?: {
    content: string
    senderName: string
    createdAt: Date | string
  } | null
}

interface MessagesHubViewProps {
  conversations: MessageConversationItem[]
  userRole: string
}

export function MessagesHubView({ conversations, userRole }: MessagesHubViewProps) {
  const isAdopter = userRole === "ADOPTER"

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages & Interviews</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {isAdopter
            ? "Direct chat rooms and TeddyAI interview sessions for your pet applications."
            : "Review adoption interviews and communicate directly with applicants."}
        </p>
      </div>

      {conversations.length === 0 ? (
        <Card className="border-dashed border-2 p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground max-w-md mx-auto">
            <div className="size-14 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="size-7 text-muted-foreground/60" />
            </div>
            <h3 className="text-base font-bold text-foreground">No Active Messages Yet</h3>
            <p className="text-xs leading-relaxed">
              {isAdopter
                ? "Once you submit an adoption application and it progresses to the interview stage, your chat room will appear here."
                : "Applications progressing to the interview stage will be listed here for active reviewer co-piloting."}
            </p>
            {isAdopter && (
              <Button asChild className="mt-2 text-xs font-semibold rounded-xl">
                <Link href="/pets">Browse Pets Available for Adoption</Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {conversations.map((item) => {
            const petImage = item.pet.petImages?.[0]?.url ?? null
            const isActive = item.chatStatus === "ACTIVE"
            const isAi = item.chatMode === "AI_ASSISTED"

            return (
              <Card key={item.id} className="overflow-hidden border-border/60 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between">
                <CardHeader className="p-4 pb-3 flex-row items-center gap-3 space-y-0 border-b bg-muted/20">
                  <div className="relative size-12 rounded-xl border bg-muted overflow-hidden shrink-0 shadow-xs">
                    {petImage ? (
                      <Image
                        src={petImage}
                        alt={item.pet.name}
                        fill
                        className="object-cover"
                        unoptimized={petImage.startsWith("/uploads/")}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <PawPrint className="size-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-foreground truncate">{item.pet.name}</h3>
                      <Badge variant={isActive ? "success" : "secondary"} className="text-[10px] h-5 px-2 font-medium shrink-0">
                        {isActive ? "Active Chat" : "Interview Complete"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {isAdopter ? (
                        <span className="flex items-center gap-1">
                          {isAi && <Sparkles className="size-3 text-primary shrink-0" />}
                          {isAi ? "TeddyAI Co-Pilot Interview" : "Direct Owner/Shelter Chat"}
                        </span>
                      ) : (
                        <span>Applicant: <strong>{item.applicant ? `${item.applicant.firstName} ${item.applicant.lastName}` : "Adopter"}</strong></span>
                      )}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Latest Activity
                    </span>
                    {item.lastMessage ? (
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs leading-normal text-foreground line-clamp-2 min-h-[48px] flex items-center">
                        <p className="line-clamp-2 leading-relaxed">
                          <strong className="text-foreground">{item.lastMessage.senderName}: </strong>
                          <span className="text-muted-foreground">
                            {item.lastMessage.content.replace(/\s+/g, " ").trim()}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No messages sent yet.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t mt-auto gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3 text-muted-foreground" />
                      <span>{item.lastMessage ? new Date(item.lastMessage.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently updated"}</span>
                    </div>

                    <Button asChild size="sm" className="h-8 text-xs font-semibold rounded-xl cursor-pointer">
                      <Link href={`/applications/${item.id}/chat`}>
                        <span>Open Chat Room</span>
                        <ArrowRight className="size-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
