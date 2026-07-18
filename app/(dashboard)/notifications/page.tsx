"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Bell,
  Bot,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Trash2,
  Inbox,
  ArrowLeft,
  Check,
} from "lucide-react"
import type { Notification, NotificationType } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  getNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  deleteNotificationAction,
  clearAllNotificationsAction,
} from "@/app/(dashboard)/notifications/actions/notification.action"

function formatRelativeTime(dateInput: Date | string) {
  const date = new Date(dateInput)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  async function loadNotifications() {
    const res = await getNotificationsAction()
    if (res.success && res.data) {
      setNotifications(res.data as Notification[])
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    )
    const res = await markNotificationAsReadAction(id)
    if (res.success) {
      toast.success("Notification marked as read")
    } else {
      toast.error(res.error ?? "Failed to update notification")
      loadNotifications()
    }
  }

  const handleDelete = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    const res = await deleteNotificationAction(id)
    if (res.success) {
      toast.success("Notification deleted")
    } else {
      toast.error(res.error ?? "Failed to delete notification")
      loadNotifications()
    }
  }

  const handleMarkAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })))
    const res = await markAllNotificationsAsReadAction()
    if (res.success) {
      toast.success("All notifications marked as read")
    } else {
      toast.error(res.error ?? "Failed to update notifications")
      loadNotifications()
    }
  }

  const handleClearAll = async () => {
    setNotifications([])
    const res = await clearAllNotificationsAction()
    if (res.success) {
      toast.success("All notifications cleared")
    } else {
      toast.error(res.error ?? "Failed to clear notifications")
      loadNotifications()
    }
  }


  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "AI":
        return <Bot className="size-5 text-purple-500" />
      case "APPLICATION":
        return <FileText className="size-5 text-blue-500" />
      case "MEET_AND_GREET":
        return <Calendar className="size-5 text-indigo-500" />
      default:
        return <AlertCircle className="size-5 text-amber-500" />
    }
  }

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case "AI":
        return "bg-purple-500/10 border-purple-500/20"
      case "APPLICATION":
        return "bg-blue-500/10 border-blue-500/20"
      case "MEET_AND_GREET":
        return "bg-indigo-500/10 border-indigo-500/20"
      default:
        return "bg-amber-500/10 border-amber-500/20"
    }
  }

  // Filter notifications
  const unreadNotifications = notifications.filter((n) => n.isUnread)
  const applicationNotifications = notifications.filter(
    (n) => n.type === "APPLICATION" || n.type === "MEET_AND_GREET"
  )
  const systemAlertNotifications = notifications.filter(
    (n) => n.type === "SYSTEM" || n.type === "AI"
  )

  const renderNotificationList = (list: Notification[]) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed rounded-xl bg-muted/10">
          <div className="bg-muted/40 p-4 rounded-full text-muted-foreground mb-4">
            <Inbox className="size-8 opacity-60" />
          </div>
          <h4 className="font-semibold text-lg text-foreground mb-1">All caught up!</h4>
          <p className="text-sm text-muted-foreground max-w-xs">
            No notifications in this category. You will see alerts here when new events occur.
          </p>
        </div>
      )
    }

    return (
      <div className="divide-y divide-border border rounded-xl overflow-hidden bg-card shadow-sm">
        {list.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex gap-4 p-5 items-start hover:bg-muted/20 transition-colors relative group",
              notification.isUnread && "bg-muted/10"
            )}
          >
            {/* Unread indicator border */}
            {notification.isUnread && (
              <span className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />
            )}

            {/* Icon */}
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm",
                getIconBg(notification.type)
              )}
            >
              {getIcon(notification.type)}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <h4
                  className={cn(
                    "text-sm font-semibold truncate",
                    notification.isUnread ? "text-foreground" : "text-foreground/80"
                  )}
                >
                  {notification.title}
                </h4>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground/90">
                {notification.description}
              </p>

              {/* Action Link */}
              {notification.link && (
                <div className="pt-2">
                  <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2.5">
                    <Link href={notification.link}>View Details</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 ml-4">
              {notification.isUnread && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                  title="Mark as read"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <Check className="size-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                title="Delete"
                onClick={() => handleDelete(notification.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="size-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCircle className="size-4 mr-1.5" />
                Mark all as read
              </Button>
              <Button variant="destructive" size="sm" onClick={handleClearAll}>
                <Trash2 className="size-4 mr-1.5" />
                Clear all
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#3D3C3A] tracking-tight">Notification Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review updates, AI recommendations, system events, and meet & greet schedules.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full gap-1 rounded-lg border bg-[#8B7E74]/10 p-1 h-auto shadow-none">
          <TabsTrigger
            value="all"
            className="rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground focus-visible:outline-none cursor-pointer"
          >
            All Notifications
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0 font-normal">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground focus-visible:outline-none cursor-pointer"
          >
            Unread
            {unreadNotifications.length > 0 && (
              <Badge variant="danger" className="ml-1.5 text-[10px] px-1 py-0 font-normal bg-rose-500/10 text-rose-600 border-rose-500/20">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="applications"
            className="rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground focus-visible:outline-none cursor-pointer"
          >
            Applications & Meetings
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground focus-visible:outline-none cursor-pointer"
          >
            System & AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0 focus-visible:outline-none">
          {renderNotificationList(notifications)}
        </TabsContent>
        <TabsContent value="unread" className="mt-0 focus-visible:outline-none">
          {renderNotificationList(unreadNotifications)}
        </TabsContent>
        <TabsContent value="applications" className="mt-0 focus-visible:outline-none">
          {renderNotificationList(applicationNotifications)}
        </TabsContent>
        <TabsContent value="system" className="mt-0 focus-visible:outline-none">
          {renderNotificationList(systemAlertNotifications)}
        </TabsContent>
      </Tabs>

    </div>
  )
}
