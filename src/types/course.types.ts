export type Course = {
  id: string;
  courseName: string;
  description?: string;
  duration: string;
  courseLevel: string;
  standardPrice: number;
  rating: number;
  studentsCount: number;
  courseImageUrl: string;
  categoryName: string;
  isActive: boolean;
  teacherDetails?: TeacherDetail[];
  courseSkills?: CourseSkill[];
  schedules?: CourseSchedule[];
};

export type TeacherDetail = {
  id: string;
  fullName: string;
  avatarUrl?: string;
};

export type CourseSkill = {
  id: string;
  skillName: string;
};

export type CourseSchedule = {
  id: string;
  timeSlotName: string;
  dayOfWeek: number;
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

export type CourseFormData = {
  id?: string;
  name: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "active" | "inactive";
  image?: string;
  price?: number;
  maxStudents?: number;
  syllabus?: string;
  courseCode?: string;
  courseLevelID?: string; // GUID
  courseFormatID?: string; // GUID
  categoryID?: string; // GUID
};
