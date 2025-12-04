import type { Notification } from "@/components/ui/NotificationDialog";

export const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "admin-1",
    title: "Course Approved",
    message: "Your course 'React Advanced Patterns' has been approved and is now live!",
    type: "info",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isRead: false,
  },
  {
    id: "2",
    userId: "admin-1",
    title: "New Enrollment",
    message: "New student enrolled in your 'JavaScript Fundamentals' course.",
    type: "info",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: false,
  },
  {
    id: "3",
    userId: "admin-1",
    title: "Payment Received",
    message: "Payment received for course enrollment. Amount: $299.99",
    type: "info",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    isRead: false,
  },
  {
    id: "4",
    userId: "admin-1",
    title: "Profile Updated",
    message: "Your profile has been successfully updated with new certification information.",
    type: "info",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
  },
  {
    id: "5",
    userId: "admin-1",
    title: "Course Reminder",
    message: "Reminder: Course 'Web Development Bootcamp' starts tomorrow at 9:00 AM.",
    type: "warning",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    isRead: true,
  },
  {
    id: "6",
    userId: "admin-1",
    title: "New Message",
    message: "New message from student John Doe regarding assignment submission.",
    type: "chat",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    isRead: true,
  },
  {
    id: "7",
    userId: "admin-1",
    title: "Materials Updated",
    message: "Course materials for 'Database Design' have been updated. Please review the changes.",
    type: "info",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    isRead: true,
  },
  {
    id: "8",
    userId: "admin-1",
    title: "System Maintenance",
    message: "System maintenance scheduled for this weekend. Some features may be temporarily unavailable.",
    type: "system",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    isRead: true,
  }
];
