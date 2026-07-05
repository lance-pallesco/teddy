"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Bot, FileText, HeartPulse, Calendar, AlertCircle, Check } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { INITIAL_NOTIFICATIONS, MockNotification } from "@/lib/notifications/mock-data"
import { cn } from "@/lib/utils"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<MockNotification[]>(INITIAL_NOTIFICATIONS)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => n.isUnread).length

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })))
  }

  const getIcon = (type: MockNotification["type"]) => {
    switch (type) {
      case "AI":
        return <Bot className="size-4 text-purple-500" />
      case "APPLICATION":
        return <FileText className="size-4 text-blue-500" />
      case "MEDICAL":
        return <HeartPulse className="size-4 text-rose-500" />
      case "INTERVIEW":
        return <Calendar className="size-4 text-indigo-500" />
      default:
        return <AlertCircle className="size-4 text-amber-500" />
    }
  }

  const getIconBg = (type: MockNotification["type"]) => {
    switch (type) {
      case "AI":
        return "bg-purple-500/10 border-purple-500/20"
      case "APPLICATION":
        return "bg-blue-500/10 border-blue-500/20"
      case "MEDICAL":
        return "bg-rose-500/10 border-rose-500/20"
      case "INTERVIEW":
        return "bg-indigo-500/10 border-indigo-500/20"
      default:
        return "bg-amber-500/10 border-amber-500/20"
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-muted/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="View notifications"
        >
          <Bell className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-extrabold text-destructive-foreground animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[360px] p-0 overflow-hidden shadow-xl border-border bg-popover text-popover-foreground rounded-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="danger" className="text-[10px] px-1.5 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 text-xs font-medium text-primary hover:text-primary-foreground hover:bg-primary px-2"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[300px] overflow-y-auto divide-y divide-border scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Bell className="size-8 opacity-30 mb-2" />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                className={cn(
                  "flex gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors relative group",
                  notification.isUnread && "bg-muted/15"
                )}
              >
                {/* Type Icon */}
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                    getIconBg(notification.type)
                  )}
                >
                  {getIcon(notification.type)}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-xs font-medium truncate",
                        notification.isUnread ? "text-foreground font-semibold" : "text-foreground/80"
                      )}
                    >
                      {notification.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                    {notification.description}
                  </p>
                </div>

                {/* Unread indicator dot */}
                {notification.isUnread && (
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 flex h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-muted/20 text-center">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-transparent rounded-none py-3"
            onClick={() => setIsOpen(false)}
          >
            <Link href="/notifications">See all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
