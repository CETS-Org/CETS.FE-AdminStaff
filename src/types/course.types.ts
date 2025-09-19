export type Course = {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "active" | "inactive";
  enrolledStudents: number;
  maxStudents: number;
  startDate: string;
  endDate: string;
  instructor?: string;
  category?: string;
  rating?: number;
  featured?: boolean;
};

export type Class = {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  teacher: string;
  schedule: string;
  room: string;
  currentStudents: number;
  maxStudents: number;
  status: "active" | "inactive" | "full";
  startDate: string;
  endDate: string;
};

export type FilterOption = {
  label: string;
  value: string;
};

export type ViewMode = "table" | "card";

export type BulkAction<T> = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedItems: T[]) => void;
  variant?: "primary" | "secondary" | "danger";
};

export type TableAction<T> = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
};
