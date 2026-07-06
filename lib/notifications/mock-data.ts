export interface MockNotification {
  id: string
  title: string
  description: string
  type: 'APPLICATION' | 'AI' | 'MEDICAL' | 'SYSTEM' | 'INTERVIEW'
  timestamp: string
  isUnread: boolean
  petName?: string
  applicantName?: string
  link?: string
}

export const INITIAL_NOTIFICATIONS: MockNotification[] = [
  {
    id: "1",
    title: "Adoption Application Update",
    description: "Your application for Luna was reviewed by Happy Paws Shelter.",
    type: "APPLICATION",
    timestamp: "2 hours ago",
    isUnread: true,
    petName: "Luna",
    link: "/applications"
  },
  {
    id: "2",
    title: "Interview Scheduled",
    description: "Interview scheduled with Jane Smith for Max tomorrow at 10:00 AM.",
    type: "INTERVIEW",
    timestamp: "4 hours ago",
    isUnread: true,
    applicantName: "Jane Smith",
    petName: "Max",
    link: "/applications"
  },
  {
    id: "3",
    title: "TEDDY AI Analysis Complete",
    description: "TEDDY AI has completed the application review for John Doe.",
    type: "AI",
    timestamp: "1 day ago",
    isUnread: false,
    applicantName: "John Doe",
    link: "/applications"
  },
  {
    id: "4",
    title: "Medical Alert",
    description: "Vaccination booster is due for Rocky on 2026-07-20.",
    type: "MEDICAL",
    timestamp: "3 days ago",
    isUnread: true,
    petName: "Rocky",
    link: "/medical/records"
  },
  {
    id: "5",
    title: "New Application Received",
    description: "New adoption application received for Bella from applicant Sarah Conner.",
    type: "SYSTEM",
    timestamp: "5 days ago",
    isUnread: false,
    petName: "Bella",
    applicantName: "Sarah Conner",
    link: "/applications"
  }
]
