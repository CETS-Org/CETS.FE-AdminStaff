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

// Course Detail Types
export type CourseDetailData = {
  id: string;
  courseCode: string;
  name: string;
  level: string;
  format: string;
  duration: string;
  teachers: TeacherDetailInfo[];
  status: "active" | "inactive";
  description: string;
  objectives?: string[];
  image: string;
  price?: number;
  currentStudents?: number;
  rating?: number;
  category?: string;
  totalStudents?: number;
  createdAt?: string;
  updatedAt?: string | null;
  createdBy?: string;
  updatedBy?: string | null;
};

export type TeacherDetailInfo = {
  id: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  yearsExperience?: number;
};

export type CourseSkillDetail = {
  id: string;
  skillName: string;
};

export type CourseBenefitDetail = {
  id: string;
  benefitName: string;
};

export type CourseRequirementDetail = {
  id: string;
  requirementName: string;
};

export type CourseDateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

export type SyllabusItem = {
  id: string;
  sessionNumber: number;
  topicTitle: string;
  totalSlots: number;
  required: boolean;
  objectives: string;
  contentSummary: string;
  preReadingUrl: string | null;
};

export type CourseSyllabus = {
  syllabusID: string;
  courseID: string;
  title: string;
  description: string | null;
  items: SyllabusItem[];
};

// Create Course Request Types
export type CreateCourseScheduleDetail = {
  timeSlotID: string;
  dayOfWeek: number;
};

export type CreateCourseSyllabusItemDetail = {
  sessionNumber: number;
  topicTitle: string;
  totalSlots?: number | null;
  required: boolean;
  objectives?: string | null;
  contentSummary?: string | null;
  preReadingUrl?: string | null;
};

export type CreateCourseSyllabusDetail = {
  title: string;
  description?: string | null;
  items?: CreateCourseSyllabusItemDetail[];
};

export type CreateCourseRequest = {
  courseCode: string;
  courseName: string;
  courseLevelID: string;
  courseFormatID: string;
  courseImageUrl?: string;
  courseObjective?: string[];
  categoryID: string;
  description?: string;
  standardPrice: number;
  benefitIDs?: string[];
  requirementIDs?: string[];
  skillIDs?: string[];
  schedules?: CreateCourseScheduleDetail[];
  syllabi?: CreateCourseSyllabusDetail[];
};