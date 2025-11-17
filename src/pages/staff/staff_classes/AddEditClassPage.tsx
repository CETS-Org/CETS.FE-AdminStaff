// src/pages/staff/staff_classes/AddEditClassPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Label from "@/components/ui/Label";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ArrowLeft, Save, Calendar, Users, BookOpen, Loader2 } from "lucide-react";

// Enrollment (dùng StudentInfo)
import ClassEnrollmentSection from "@/pages/staff/staff_classes/components/ClassEnrollmentSection";
// Domain types
import type { StudentInfo } from "@/types/student.type";
// Reusable schedule UI
import ScheduleSection, { type ScheduleRow } from "@/pages/staff/staff_classes/components/ScheduleSection";

// ✅ Hooks theo yêu cầu
import { useToast } from "@/pages/staff/staff_classes/shared/useToast";
import { useLookupOptions } from "@/pages/staff/staff_classes/shared/useLookupOptions";
// ✅ Hook schedules theo yêu cầu
import { useSchedules } from "@/pages/staff/staff_classes/shared/useSchedules";

// -------------------------------
// Page-local model
// -------------------------------
interface ClassModel {
  id?: string;
  name: string;
  courseId: string;
  courseName: string;
  teacher: string;
  teacherId?: string;
  schedules: ScheduleRow[];
  room: string;
  currentStudents: number;
  maxStudents: number;
  status: "active" | "inactive" | "full";
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  description?: string;
  sessions?: number;
  completedSessions?: number;
}

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Full", value: "full" },
];

const teacherOptions = [
  "Dr. Sarah Johnson",
  "Prof. Michael Chen",
  "Ms. Emily Davis",
  "Mr. David Wilson",
  "Dr. Lisa Brown",
  "Prof. James Taylor",
];

const roomOptions = [
  "Room A101",
  "Room A102",
  "Room B201",
  "Room B202",
  "Room C301",
  "Room C302",
  "Laboratory 1",
  "Laboratory 2",
  "Conference Room",
];

const mockCourses = [
  { id: "ENGO01", name: "English Conversation" },
  { id: "ENGO02", name: "Business English" },
  { id: "REACT01", name: "React Fundamentals" },
  { id: "VUE01", name: "Vue.js Advanced" },
];

// -------------------------------
// MOCK StudentInfo (thay bằng API thật)
// -------------------------------
const mockStudentInfos: StudentInfo[] = [
  {
    accountId: "A001",
    studentCode: "STU-0001",
    studentNumber: 1,
    guardianName: "Le Thi B",
    guardianPhone: "0988776655",
    school: "Le Quy Don HS",
    academicNote: null,
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: null,
    updatedBy: null,
    isDeleted: false,
  },
  {
    accountId: "A002",
    studentCode: "STU-0002",
    studentNumber: 2,
    guardianName: "Nguyen Van C",
    guardianPhone: "0911222333",
    school: "Nguyen Trai HS",
    academicNote: null,
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: null,
    updatedBy: null,
    isDeleted: false,
  },
  {
    accountId: "A003",
    studentCode: "STU-0003",
    studentNumber: 3,
    guardianName: "Pham Thi D",
    guardianPhone: "0908888777",
    school: "Tran Phu HS",
    academicNote: null,
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: null,
    updatedBy: null,
    isDeleted: false,
  },
  {
    accountId: "A004",
    studentCode: "STU-0004",
    studentNumber: 4,
    guardianName: "Do Van E",
    guardianPhone: "0905555666",
    school: "Chu Van An HS",
    academicNote: null,
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: null,
    updatedBy: null,
    isDeleted: false,
  },
];

// Async search (mock)
async function fetchStudentInfoApi(
  query: string,
  page = 1
): Promise<{ items: StudentInfo[]; hasMore: boolean }> {
  const pageSize = 8;
  const q = query.trim().toLowerCase();
  const filtered = mockStudentInfos.filter((s) => {
    if (!q) return true;
    return (
      s.studentCode.toLowerCase().includes(q) ||
      (s.school ?? "").toLowerCase().includes(q) ||
      (s.guardianName ?? "").toLowerCase().includes(q) ||
      (s.guardianPhone ?? "").toLowerCase().includes(q)
    );
  });
  const start = (page - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);
  await new Promise((r) => setTimeout(r, 250));
  return { items: slice, hasMore: start + pageSize < filtered.length };
}

// Auto add (mock)
async function autoFillStudentInfo(): Promise<string[]> {
  return mockStudentInfos.map((s) => s.accountId);
}

// -------------------------------
// Helper: lọc giáo viên theo lịch (mock; thay bằng API availability sau)
// -------------------------------
function filterTeachersBySchedule(
  schedules: ScheduleRow[],
  all: string[]
): string[] {
  if (!schedules.length) return [];
  // Ví dụ: nếu có >= 3 buổi/tuần thì loại 2 giáo viên cuối (để thấy UI thay đổi)
  return schedules.length >= 3 ? all.slice(0, Math.max(0, all.length - 2)) : all;
}

export default function AddEditClassPage() {
  const params = useParams<{ courseId?: string; classId?: string; id?: string }>();
  const navigate = useNavigate();

  const { showSuccessMessage, showErrorMessage } = useToast();
  const lookupOptions = useLookupOptions(false);

  // Lấy timeslotOptions từ lookup, có fallback
  const timeslotOptions =
    (lookupOptions as any)?.timeslotOptions?.length
      ? (lookupOptions as any).timeslotOptions
      : [
          { value: "TS-0800-0900", label: "08:00–09:00" },
          { value: "TS-0900-1000", label: "09:00–10:00" },
          { value: "TS-1800-1930", label: "18:00–19:30" },
        ];

  // Route patterns
  const classId = params.id || params.classId;
  const courseId = params.courseId;
  const isStandaloneRoute = !courseId;
  const isEdit = !!classId;

  const [formData, setFormData] = useState<ClassModel>({
    name: "",
    courseId: courseId || "",
    courseName: "",
    teacher: "",
    schedules: [],
    room: "",
    currentStudents: 0,
    maxStudents: 20,
    status: "active",
    startDate: "",
    endDate: "",
    description: "",
    sessions: 48,
    completedSessions: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // ✅ useSchedules hook
  const {
    value: scheduleRows,
    load: loadSchedules,
    add: addSchedule,
    remove: removeSchedule,
    update: updateSchedule,
    checkDuplicate,
  } = useSchedules([], {
    timeslotOptions,
    onError: showErrorMessage,
  });

  // Chỉ cho phép chọn teacher khi đã có ít nhất 1 schedule
  const canPickTeacher = scheduleRows.length > 0;

  // Danh sách teacher khả dụng theo lịch (mock)
  const availableTeacherOptions = useMemo(() => {
    const list = filterTeachersBySchedule(scheduleRows, teacherOptions);
    return list.map((t) => ({ label: t, value: t }));
  }, [scheduleRows]);

  // Nếu xoá hết lịch, clear teacher để buộc chọn lại
  useEffect(() => {
    if (!canPickTeacher && formData.teacher) {
      setFormData((prev) => ({ ...prev, teacher: "" }));
    }
  }, [canPickTeacher]); // eslint-disable-line react-hooks/exhaustive-deps

  // sync current students
  useEffect(() => {
    setFormData((prev) => ({ ...prev, currentStudents: selectedStudentIds.length }));
  }, [selectedStudentIds]);

  // sync schedules -> formData
  useEffect(() => {
    setFormData((prev) => ({ ...prev, schedules: scheduleRows }));
  }, [scheduleRows]);

  useEffect(() => {
    if (isEdit && classId) {
      loadClassData(classId);
    } else if (courseId) {
      loadCourseInfo(courseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, classId, courseId]);

  const loadClassData = async (id: string) => {
    try {
      setIsLoading(true);
      const mockClassData: ClassModel = {
        id,
        name: "English Advanced - Morning Class",
        courseId: courseId || "ENGO01",
        courseName: "English Conversation",
        teacher: "Dr. Sarah Johnson",
        teacherId: "T001",
        schedules: [
          { dayOfWeek: 1, timeSlotID: "TS-0800-0900" },
          { dayOfWeek: 3, timeSlotID: "TS-0800-0900" },
          { dayOfWeek: 5, timeSlotID: "TS-0800-0900" },
        ],
        room: "Room A101",
        currentStudents: 2,
        maxStudents: 20,
        status: "active",
        startDate: "2024-01-15",
        endDate: "2024-04-15",
        description:
          "Advanced English conversation class focusing on business communication and professional development.",
        sessions: 48,
        completedSessions: 12,
      };

      setFormData(mockClassData);
      loadSchedules(mockClassData.schedules); // ⬅️ đẩy vào hook
      setSelectedStudentIds(["A001", "A003"]);
    } catch (err) {
      console.error(err);
      showErrorMessage("Failed to load class data.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCourseInfo = async (id: string) => {
    const course = mockCourses.find((c) => c.id === id);
    if (course) {
      setFormData((prev) => ({ ...prev, courseId: id, courseName: course.name }));
    }
  };

  const handleInputChange = (field: keyof ClassModel, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value as any }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isStandaloneRoute && !formData.courseId) newErrors.courseId = "Course is required";
    if (!formData.name.trim()) newErrors.name = "Class name is required";
    if (!formData.room.trim()) newErrors.room = "Room is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (formData.maxStudents <= 0) newErrors.maxStudents = "Max students must be greater than 0";
    if (selectedStudentIds.length > formData.maxStudents)
      newErrors.maxStudents = "Current students exceed Max Students";

    // schedules validation
    if (!formData.schedules || formData.schedules.length === 0) {
      newErrors.schedules = "At least one schedule is required";
    } else {
      const dup = checkDuplicate(formData.schedules);
      if (dup.hasDup) newErrors.schedules = "Duplicate schedules (same day & time slot) are not allowed.";
      const invalid = formData.schedules.some(
        (s) =>
          !s.timeSlotID ||
          s.timeSlotID.trim() === "" ||
          s.dayOfWeek === undefined ||
          s.dayOfWeek === null
      );
      if (!newErrors.schedules && invalid) newErrors.schedules = "Please select day and time for all rows.";
    }

    // ✅ Chỉ yêu cầu Teacher SAU khi đã có lịch
    if (formData.schedules.length > 0 && !formData.teacher.trim()) {
      newErrors.teacher = "Teacher is required after selecting schedules";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const payload = {
        ...formData,
        schedules: formData.schedules.map((s) => ({
          dayOfWeek: Number(s.dayOfWeek),
          timeSlotID: s.timeSlotID,
        })),
        studentAccountIds: selectedStudentIds,
      };

      console.log("Saving class:", payload);
      await new Promise((r) => setTimeout(r, 900)); // mock
      showSuccessMessage(isEdit ? "Class updated successfully!" : "Class created successfully!");

      if (isStandaloneRoute) navigate(`/staff/classes`);
      else navigate(`/staff/courses/${formData.courseId}`);
    } catch (err) {
      console.error(err);
      showErrorMessage("Failed to save class. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isStandaloneRoute) navigate("/staff/classes");
    else navigate(`/staff/courses`);
  };

  const breadcrumbItems = isStandaloneRoute
    ? [{ label: "Classes", to: "/staff/classes" }, { label: isEdit ? "Edit Class" : "Add Class" }]
    : [
        { label: "Courses", to: "/staff/courses" },
        { label: formData.courseName || "Course", to: `/staff/courses/${courseId}` },
        { label: isEdit ? "Edit Class" : "Add Class" },
      ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-16">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
          <PageHeader
            title={isEdit ? "Edit Class" : "Add New Class"}
            description={isEdit ? "Update class information and content" : "Create a class with detailed information"}
            controls={[
              {
                type: "button",
                label: "Back to Classes",
                variant: "secondary",
                icon: <ArrowLeft className="w-4 h-4" />,
                onClick: handleCancel,
              },
            ]}
          />
        </div>

        {/* Form */}
        <div className={`grid grid-cols-1 gap-6 ${isEdit ? "lg:grid-cols-3" : "max-w-4xl mx-auto"}`}>
          {/* Main Form */}
          <div className={`space-y-6 ${isEdit ? "lg:col-span-2" : ""}`}>
            {/* Basic Information */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Basic Information</h2>
              </div>

              <div className="space-y-4">
                {isStandaloneRoute && !isEdit ? (
                  <div>
                    <Label required>Course</Label>
                    <Select
                      value={formData.courseId}
                      onChange={(e) => {
                        const selectedCourse = mockCourses.find((c) => c.id === e.target.value);
                        handleInputChange("courseId", e.target.value);
                        if (selectedCourse) handleInputChange("courseName", selectedCourse.name);
                      }}
                      options={[
                        { label: "Select a course", value: "" },
                        ...mockCourses.map((course) => ({ label: course.name, value: course.id })),
                      ]}
                      error={errors.courseId}
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Course</Label>
                    <Input value={formData.courseName} disabled className="bg-gray-50" />
                  </div>
                )}

                <div>
                  <Label required>Class Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter class name"
                    error={errors.name}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter class description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </Card>

            {/* Schedule & Location */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold">Schedule & Location</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ⬇️ Schedules trước */}
                <div className="md:col-span-2">
                  <Label required>Schedules</Label>
                  <ScheduleSection
                    value={scheduleRows}
                    timeslotOptions={timeslotOptions}
                    onAdd={() => addSchedule(showErrorMessage)}
                    onRemove={removeSchedule}
                    onChange={updateSchedule}
                    checkDuplicate={checkDuplicate}
                    dayLabel={(d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]}
                  />
                  {errors.schedules && <p className="mt-2 text-sm text-red-600">{errors.schedules}</p>}
                </div>

                {/* Room */}
                <div>
                  <Label required>Room</Label>
                  <Select
                    value={formData.room}
                    onChange={(e) => handleInputChange("room", e.target.value)}
                    options={[{ label: "Select a room", value: "" }, ...roomOptions.map((r) => ({ label: r, value: r }))]}
                    error={errors.room}
                  />
                </div>

                {/* Teacher — disabled cho đến khi có schedule */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label required>Teacher</Label>
                    {!canPickTeacher && <span className="text-xs text-amber-600">Select schedules first</span>}
                  </div>
                  <Select
                    value={formData.teacher}
                    onChange={(e) => handleInputChange("teacher", e.target.value)}
                    options={[{ label: "Select a teacher", value: "" }, ...availableTeacherOptions]}
                    error={errors.teacher}
                    disabled={!canPickTeacher}
                  />
                </div>

                <div>
                  <Label required>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    error={errors.startDate}
                  />
                </div>

                <div>
                  <Label required>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    error={errors.endDate}
                  />
                </div>
              </div>
            </Card>

            {/* Capacity, Status & Enrollment */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold"> Enrollment</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label required>Max Students</Label>
                  <Input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => {
                      const v = Math.max(1, parseInt(e.target.value || "1", 10));
                      handleInputChange("maxStudents", v);
                      setSelectedStudentIds((prev) => prev.slice(0, v));
                    }}
                    min="1"
                    error={errors.maxStudents}
                  />
                </div>

                <div>
                  <Label>Current Students</Label>
                  <Input type="number" value={selectedStudentIds.length} disabled className="bg-gray-50" />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    options={statusOptions}
                  />
                </div>
              </div>

              <ClassEnrollmentSection
                selectedIds={selectedStudentIds}
                maxStudents={formData.maxStudents}
                onChangeSelected={setSelectedStudentIds}
                fetchStudents={fetchStudentInfoApi}
                onAutoFill={autoFillStudentInfo}
                labels={{
                  manualTitle: "Reservation List ",
                  enrolledTitle: "Enrolled Students",
                  addSelected: "Add Student",
                  clearSelection: "Clear Selection",
                  autoAdd: "Auto",
                  clearAll: "Clear All",
                  searchPlaceholder: "Search by Student Code",
                  inClassTag: "In class",
                  emptyEnrolled: "No students yet.",
                }}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {isEdit && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Class Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enrollment</span>
                    <span className="font-medium">
                      {selectedStudentIds.length}/{formData.maxStudents}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {formData.completedSessions}/{formData.sessions} sessions
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        formData.status === "active"
                          ? "bg-green-100 text-green-700"
                          : formData.status === "full"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {isEdit ? "Last updated: Today" : "All fields marked with * are required"}
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleCancel} variant="secondary" disabled={isLoading} className="min-w-[120px]">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="min-w-[160px] bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {isEdit ? "Update Class" : "Create Class"}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
