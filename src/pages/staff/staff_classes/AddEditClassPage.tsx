// src/pages/staff/staff_classes/AddEditClassPage.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Label from "@/components/ui/Label";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  Save,
  Loader2,
  RefreshCw,
  BookOpen,
  CalendarClock,
  MapPin,
  Users
} from "lucide-react";

// Components
import ClassEnrollmentSection from "@/pages/staff/staff_classes/components/ClassEnrollmentSection";
import ScheduleSection, {
  type ScheduleRow,
} from "@/pages/staff/staff_classes/components/ScheduleSection";

// Hooks
import { useToast } from "@/pages/staff/staff_classes/shared/useToast";
import { useLookupOptions } from "@/pages/staff/staff_classes/shared/useLookupOptions";
import { useSchedules } from "@/pages/staff/staff_classes/shared/useSchedules";

// APIs
import {
  getCourseOptions,
  getCourseDetail,
  getCourseSchedule,
  getRoomOptions,
  getAvailableTeachersForClass,
  searchWaitingStudents,
  autoPickWaitingStudents,
  createClassComposite,
  // assignStudentsToClass // [REMOVED]: Không cần gọi rời nữa
} from "@/pages/staff/staff_classes/data/classPlacement.api";

// API Syllabus
import { getSyllabiByCourse, getSyllabusItems } from "@/api/syllabus.api";

// Types
import {
  DAY_MAP,
  type DayOfWeek,
  type CourseOption,
  type CourseScheduleRow,
  type TeacherOption,
  type CreateClassCompositeRequestDTO,
  type ClassMeetingScheduleDTO,
  type ClassScheduleInput,
  type WaitingStudentItem // [ADDED]: Import type mới
} from "@/pages/staff/staff_classes/data/classPlacement.types";

import { getCurrentUserId } from "@/lib/utils";

// -------------------------------
// Page-local model
// -------------------------------
interface ClassModel {
  id?: string;
  courseId: string;
  courseName: string;
  teacher: string;
  teacherId?: string;
  schedules: ScheduleRow[];
  room: string;
  currentStudents: number;
  maxStudents: number;
  status: "active" | "inactive" | "full";
  startDate: string;
  endDate: string;
  sessions?: number;
  completedSessions?: number;
}

interface SyllabusItemModel {
  id: string;
  sessionNumber: number;
  topicName?: string;
}

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Full", value: "full" },
];

export default function AddEditClassPage() {
  const params = useParams<{ courseId?: string; classId?: string; id?: string }>();
  const navigate = useNavigate();
  const { showSuccessMessage, showErrorMessage } = useToast();
  
  // Lookup options
  const lookupOptions = useLookupOptions(false);
  const timeslotOptions = (lookupOptions as any)?.timeslotOptions || [
     { value: "TS-0800-0900", label: "08:00–09:00" },
     { value: "TS-1800-1930", label: "18:00–19:30" },
  ];

  // Logic Route
  const classId = params.id || params.classId;
  const initialCourseIdFromRoute = params.courseId;
  const isStandaloneRoute = !initialCourseIdFromRoute;
  const isEdit = !!classId;

  // Form State
  const [formData, setFormData] = useState<ClassModel>({
    courseId: initialCourseIdFromRoute || "",
    courseName: "",
    teacher: "",
    teacherId: undefined,
    schedules: [],
    room: "",
    currentStudents: 0,
    maxStudents: 20,
    status: "active",
    startDate: "",
    endDate: "",
    sessions: 0,
    completedSessions: 0,
  });

  // State lưu Syllabus
  const [currentSyllabusId, setCurrentSyllabusId] = useState<string>("");
  const [syllabusItems, setSyllabusItems] = useState<SyllabusItemModel[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // [MODIFIED]: State để quản lý Selection
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  // [NEW]: State Map để lưu full object học sinh (dùng để map ngược từ ID -> Object khi submit)
  const [studentLookup, setStudentLookup] = useState<Map<string, WaitingStudentItem>>(new Map());

  // Data States
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [roomOptions, setRoomOptions] = useState<any[]>([]); 
  const [availableTeachers, setAvailableTeachers] = useState<TeacherOption[]>([]);
  
  // Loading States
  const [isLoadingCourseOptions, setIsLoadingCourseOptions] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  // Hook Schedule Management
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

  const canPickTeacher = scheduleRows.length > 0;

  // --- HELPER: Update Student Lookup ---
  // Hàm này giúp lưu trữ thông tin học sinh vào bộ nhớ tạm để dùng khi Submit
  const updateStudentLookup = useCallback((items: WaitingStudentItem[]) => {
    setStudentLookup(prev => {
        const newMap = new Map(prev);
        items.forEach(item => {
            if (item.studentId) {
                newMap.set(item.studentId, item);
            }
        });
        return newMap;
    });
  }, []);

  // --- HELPER: CALCULATE END DATE ---
  const calculateClassEndDate = (
    startStr: string, 
    totalSessions: number, 
    schedules: ScheduleRow[]
  ): string => {
    if (!startStr || totalSessions <= 0 || schedules.length === 0) return "";

    const startDate = new Date(startStr);
    let currentDate = new Date(startDate);
    let sessionsCounted = 0;
    
    const validDays = new Set(schedules.map(s => DAY_MAP[s.dayOfWeek]));

    let safetyLoop = 0;
    const MAX_DAYS = 730; 
    
    while (sessionsCounted < totalSessions && safetyLoop < MAX_DAYS) {
        const currentDayOfWeek = currentDate.getDay();

        if (validDays.has(currentDayOfWeek)) {
            sessionsCounted++;
        }

        if (sessionsCounted === totalSessions) {
            return currentDate.toISOString().split('T')[0];
        }

        currentDate.setDate(currentDate.getDate() + 1);
        safetyLoop++;
    }

    return "";
  };

  // --- SYNC STATES ---
  useEffect(() => {
    setFormData((prev) => ({ ...prev, currentStudents: selectedStudentIds.length }));
  }, [selectedStudentIds]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, schedules: scheduleRows }));
  }, [scheduleRows]);

  // --- AUTO CALCULATE END DATE EFFECT ---
  useEffect(() => {
    if (formData.startDate && syllabusItems.length > 0 && scheduleRows.length > 0) {
        const projectedEndDate = calculateClassEndDate(
            formData.startDate, 
            syllabusItems.length, 
            scheduleRows
        );

        if (projectedEndDate && projectedEndDate !== formData.endDate) {
             setFormData(prev => ({
                 ...prev,
                 endDate: projectedEndDate,
                 sessions: syllabusItems.length 
             }));
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, syllabusItems, scheduleRows]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingCourseOptions(true);
        setIsLoadingRooms(true);

        const [courseRes, roomRes] = await Promise.all([
          getCourseOptions(),
          getRoomOptions()
        ]);

        setCourseOptions(courseRes.data);
        setRoomOptions(roomRes.data);
      } catch (err) {
        console.error(err);
        showErrorMessage("Failed to load initial data.");
      } finally {
        setIsLoadingCourseOptions(false);
        setIsLoadingRooms(false);
      }
    };
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LOAD CLASS DETAIL ---
  useEffect(() => {
    if (isEdit && classId) {
        // TODO: Get Detail Logic
    } else if (initialCourseIdFromRoute) {
      handleCourseChange(initialCourseIdFromRoute);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, classId, initialCourseIdFromRoute]);


  // ========================================================================
  // --- HANDLER: CHANGE COURSE ---
  // ========================================================================
  const handleCourseChange = async (courseId: string) => {
    setFormData((prev) => ({ ...prev, courseId, courseName: "", sessions: 0 }));
    setSelectedStudentIds([]); 
    setStudentLookup(new Map()); // Reset lookup
    setCurrentSyllabusId(""); 
    setSyllabusItems([]); 
    
    if (!courseId) {
      loadSchedules([]);
      return;
    }

    try {
      setIsLoading(true);

      const [detailRes, scheduleRes, syllabusRes] = await Promise.all([
        getCourseDetail(courseId),
        getCourseSchedule(courseId),
        getSyllabiByCourse(courseId) 
      ]);

      const detailData = detailRes.data;
      const scheduleData = scheduleRes.data;
      const syllabusList = syllabusRes.data;

      if (syllabusList && syllabusList.length > 0) {
        const activeSyllabus = syllabusList.find((s: any) => s.isActive) || syllabusList[0];
        setCurrentSyllabusId(activeSyllabus.syllabusID);

        try {
            const itemsRes = await getSyllabusItems(activeSyllabus.syllabusID);
            const items = itemsRes.data || [];
            items.sort((a: SyllabusItemModel, b: SyllabusItemModel) => a.sessionNumber - b.sessionNumber);
            setSyllabusItems(items);
        } catch (error) {
            console.error("Error fetching syllabus items:", error);
            showErrorMessage("Could not load syllabus content.");
        }

      } else {
        showErrorMessage("Warning: This course has no syllabus configured.");
      }

      const scheduleRowsFromCourse: ScheduleRow[] = (scheduleData || []).map(
        (r: CourseScheduleRow): ScheduleRow => ({
          dayOfWeek: r.dayOfWeek as DayOfWeek,
          timeSlotID: r.timeSlotID,
        })
      );

      setFormData((prev) => ({
        ...prev,
        courseId,
        courseName: (detailData as any).courseName ?? prev.courseName,
        maxStudents: (detailData as any).defaultMaxStudents ?? prev.maxStudents,
        sessions: (detailData as any).totalSessions ?? prev.sessions,
      }));

      loadSchedules(scheduleRowsFromCourse);
    } catch (err) {
      console.error(err);
      showErrorMessage("Failed to load course information.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLER: FIND TEACHERS ---
  const reloadAvailableTeachers = useCallback(async () => {
    if (!formData.courseId || !formData.startDate || !formData.endDate) {
      showErrorMessage("Please select course and dates first.");
      return;
    }
    if (scheduleRows.length === 0) {
      showErrorMessage("Please configure at least one schedule.");
      return;
    }

    try {
      setIsLoadingTeachers(true);
      setAvailableTeachers([]);

      const apiSchedules: ClassScheduleInput[] = scheduleRows.map((row) => ({
        timeSlotID: row.timeSlotID,
        dayOfWeek: DAY_MAP[row.dayOfWeek]
      }));

      const res = await getAvailableTeachersForClass({
        courseId: formData.courseId,
        schedules: apiSchedules, 
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      
      if (res && res.data) {
          setAvailableTeachers(res.data);
          if (res.data.length === 0) {
            showErrorMessage("No available teachers found.");
          }
      }
    } catch (err) {
      console.error(err);
      showErrorMessage("Failed to load available teachers.");
    } finally {
      setIsLoadingTeachers(false);
    }
  }, [formData.courseId, formData.startDate, formData.endDate, scheduleRows, showErrorMessage]);

  // --- INPUT HANDLERS ---
  const handleInputChange = (field: keyof ClassModel, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value as any }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleTeacherSelectChange = (value: string) => {
    const teacher = availableTeachers.find((x) => x.id === value);
    setFormData((prev) => ({
      ...prev,
      teacherId: value,
      teacher: teacher?.fullName ?? "",
    }));
  };

  // --- VALIDATION ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (isStandaloneRoute && !formData.courseId) newErrors.courseId = "Required";
    if (!formData.room) newErrors.room = "Required";
    if (!formData.startDate) newErrors.startDate = "Required";
    if (!formData.endDate) newErrors.endDate = "Required";
    if (formData.maxStudents <= 0) newErrors.maxStudents = "Must be > 0";
    if (scheduleRows.length === 0) newErrors.schedules = "Required";
    
    const dup = checkDuplicate(scheduleRows);
    if (dup.hasDup) newErrors.schedules = "Duplicate schedules detected.";

    if (scheduleRows.length > 0 && !formData.teacherId) newErrors.teacher = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- HELPER: GENERATE DATES ---
  const generateMeetingDates = (start: string, end: string, schedules: ScheduleRow[]) => {
    const dates: { date: string; slotId: string }[] = [];
    const currentDate = new Date(start);
    const endDate = new Date(end);
    
    const validDays = schedules.map(s => ({
        day: DAY_MAP[s.dayOfWeek],
        slotId: s.timeSlotID
    }));

    while (currentDate <= endDate) {
        const currentDayOfWeek = currentDate.getDay();
        const matched = validDays.find(s => s.day === currentDayOfWeek);
        if (matched) {
            dates.push({
                date: currentDate.toISOString().split('T')[0],
                slotId: matched.slotId
            });
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // ========================================================================
  // --- SAVE HANDLER ---
  // ========================================================================
  const handleSave = async () => {
    if (!validateForm()) return;

    if (!currentSyllabusId || syllabusItems.length === 0) {
      showErrorMessage("Cannot create class: Missing Syllabus Items.");
      return;
    }

    const CONST_STATUS_PLANED = "D5621E55-A2FB-4DAC-B0EE-B53F378405FF"; 
    // const CONST_ENROLL_STATUS = "148fdc3d-fecc-457d-a539-cc28fd5df900"; // [REMOVED]: Backend tự xử lý
    const CONST_COURSE_FORMAT = "2423c370-7205-463f-bea6-530ddc9aa544"; 
    const CURRENT_USER_ID = getCurrentUserId(); 

    try {
      setIsLoading(true);

      const scheduleString = scheduleRows.map(s => {
          const timeLabel = timeslotOptions.find((t: any) => t.value === s.timeSlotID)?.label || "";
          return `${s.dayOfWeek} (${timeLabel})`;
      }).join(", ");

      const meetingDates = generateMeetingDates(formData.startDate, formData.endDate, scheduleRows);
      
      if (meetingDates.length > syllabusItems.length) {
          console.warn(`Warning: Meetings (${meetingDates.length}) > Syllabus Items (${syllabusItems.length})`);
      }

      const schedulePayloads: ClassMeetingScheduleDTO[] = meetingDates.map((m, index) => {
          const matchedItem = syllabusItems[index] || syllabusItems[syllabusItems.length - 1];

          return {
              slotID: m.slotId,
              date: m.date,
              roomID: formData.room, 
              syllabusItemID: matchedItem ? matchedItem.id : currentSyllabusId, 
              scheduleDescription: scheduleString
          };
      });

      const autoClassName = `${formData.courseName} - (${formData.startDate})`;
      
      // [MODIFIED]: Chuẩn bị list objects học sinh từ danh sách ID đã chọn
      const enrollmentObjects = selectedStudentIds
        .map(id => studentLookup.get(id))
        .filter((item): item is WaitingStudentItem => !!item); // Lọc bỏ null/undefined

      // [MODIFIED]: Payload gộp
      const compositePayload: CreateClassCompositeRequestDTO = {
        className: autoClassName, 
        classStatusID: CONST_STATUS_PLANED,
        courseFormatID: CONST_COURSE_FORMAT,
        teacherAssignmentID: formData.teacherId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        capacity: formData.maxStudents,
        createdBy: CURRENT_USER_ID,
        schedules: schedulePayloads,
        enrollments: enrollmentObjects // Gửi kèm danh sách object học sinh
      };

      await createClassComposite(compositePayload);
      // Không cần gọi assignStudentsToClass nữa

      showSuccessMessage("Class created & students enrolled successfully!");
      
      if (isStandaloneRoute) navigate(`/staff/classes`);
      else navigate(`/staff/courses/${formData.courseId}`);

    } catch (err: any) {
      console.error(err);
      showErrorMessage(err.response?.data?.message || "Failed to create class.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
         {/* Header */}
         <div className="flex flex-col gap-2">
            <Breadcrumbs items={[{ label: "Classes", to: "/staff/classes" }, { label: isEdit ? "Edit Class" : "New Class" }]} />
            <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Class" : "Create New Class"}</h1>
            <p className="text-sm text-gray-500">Setup class schedule, location and enroll students.</p>
         </div>
         
         <div className="space-y-6">
                {/* CARD 1: GENERAL INFO */}
                <Card className="p-6 border-t-4 border-t-blue-500">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h2 className="font-semibold text-lg text-gray-800">General Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            {isStandaloneRoute && !isEdit ? (
                                <div>
                                    <Label required>Course</Label>
                                    <Select 
                                        value={formData.courseId} 
                                        onChange={e => handleCourseChange(e.target.value)}
                                        options={[
                                            { label: isLoadingCourseOptions ? "Loading..." : "Select a course...", value: "" },
                                            ...courseOptions.map(c => ({ label: `${c.courseCode} - ${c.courseName}`, value: c.id }))
                                        ]}
                                        disabled={isLoadingCourseOptions}
                                        error={errors.courseId}
                                    />
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-3 rounded border">
                                    <Label className="text-xs text-gray-500 uppercase">Selected Course</Label>
                                    <div className="font-medium text-gray-900">{formData.courseName || "Loading..."}</div>
                                </div>
                            )}
                        </div>
                        <div>
                            <Label>Status</Label>
                            <Select 
                                value={formData.status}
                                onChange={e => handleInputChange("status", e.target.value)}
                                options={statusOptions}
                            />
                        </div>
                    </div>
                </Card>

                {/* CARD 2: SCHEDULE & LOCATION */}
                <Card className="p-6 border-t-4 border-t-indigo-500">
                     <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                        <CalendarClock className="w-5 h-5 text-indigo-600" />
                        <h2 className="font-semibold text-lg text-gray-800">Schedule & Location</h2>
                    </div>
                     <div className="mb-6">
                        <ScheduleSection 
                            value={scheduleRows}
                            timeslotOptions={timeslotOptions}
                            onAdd={() => addSchedule(showErrorMessage)}
                            onRemove={removeSchedule}
                            onChange={updateSchedule}
                            checkDuplicate={checkDuplicate}
                        />
                        {errors.schedules && <p className="text-sm text-red-500 mt-1">{errors.schedules}</p>}
                     </div>
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label required>Start Date</Label>
                            <Input 
                                type="date" 
                                value={formData.startDate} 
                                onChange={e => handleInputChange("startDate", e.target.value)} 
                                error={errors.startDate} 
                            />
                        </div>
                        <div>
                            <Label>End Date (Auto)</Label>
                            <Input 
                                type="date" 
                                value={formData.endDate} 
                                readOnly={true}
                                className="bg-gray-100 cursor-not-allowed"
                                title="Calculated automatically based on syllabus & schedule"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">
                                Based on {syllabusItems.length > 0 ? syllabusItems.length : "0"} syllabus sessions.
                            </p>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <Label required className="mb-0">Room</Label>
                            </div>
                            <Select 
                                value={formData.room}
                                onChange={e => handleInputChange("room", e.target.value)}
                                options={[
                                    { label: isLoadingRooms ? "Loading rooms..." : "Select a room...", value: "" },
                                    ...roomOptions.filter(r => r.isActive).map(r => ({ label: `${r.roomCode} (Cap: ${r.capacity})`, value: r.id }))
                                ]}
                                disabled={isLoadingRooms}
                                error={errors.room}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <Label required className="mb-0">Teacher</Label>
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="h-6 px-2 text-xs"
                                    onClick={reloadAvailableTeachers} 
                                    disabled={isLoadingTeachers || !canPickTeacher}
                                >
                                    {isLoadingTeachers ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                                    Find Available
                                </Button>
                            </div>
                            <Select 
                                options={[
                                    { label: availableTeachers.length ? "Select a teacher..." : "No teachers found", value: "" },
                                    ...availableTeachers.map(t => ({ label: t.fullName, value: t.id }))
                                ]}
                                value={formData.teacherId || ""}
                                onChange={e => handleTeacherSelectChange(e.target.value)}
                                disabled={availableTeachers.length === 0}
                                error={errors.teacher}
                            />
                            {!canPickTeacher && <p className="text-[10px] text-amber-600 mt-1">Setup schedules & dates first to find teachers.</p>}
                        </div>
                     </div>
                </Card>

                {/* CARD 3: STUDENTS */}
                <Card className="p-6 border-t-4 border-t-purple-500">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-lg text-gray-800">Students & Capacity</h2>
                        </div>
                        <div className="text-sm text-gray-500">
                            Enrolled: <span className="font-bold text-gray-800">{selectedStudentIds.length}</span> / {formData.maxStudents}
                        </div>
                    </div>
                    <div className="mb-6 max-w-xs">
                         <Label>Max Class Capacity</Label>
                         <Input 
                           type="number" 
                           value={formData.maxStudents} 
                           onChange={e => handleInputChange("maxStudents", parseInt(e.target.value))} 
                           min={1}
                         />
                    </div>
                    <ClassEnrollmentSection 
                        key={formData.courseId} 
                        selectedIds={selectedStudentIds}
                        maxStudents={formData.maxStudents}
                        onChangeSelected={setSelectedStudentIds}
                        // [MODIFIED]: Fetch students và cập nhật luôn vào Map Lookup
                        fetchStudents={async (q, p) => {
                            if (!formData.courseId) return { items: [], hasMore: false };
                            const res = await searchWaitingStudents(formData.courseId, q, p || 1);
                            updateStudentLookup(res.data.items); // Lưu vào cache
                            return res.data; 
                        }}
                        // [MODIFIED]: Auto pick và cập nhật luôn vào Map Lookup
                        onAutoFill={async () => {
                            if (!formData.courseId) return [];
                            const res = await autoPickWaitingStudents(formData.courseId, formData.maxStudents);
                            updateStudentLookup(res.data); // Lưu vào cache
                            return res.data;
                        }}
                        labels={{ manualTitle: "Waiting List", emptyEnrolled: "No students yet" }}
                    />
                </Card>
         </div>

         {/* STICKY ACTIONS BAR */}
         <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-2xl border-t border-gray-200 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)} className="min-w-[100px]">Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading} className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {isEdit ? "Update Class" : "Create Class"}
            </Button>
         </div>
      </div>
    </div>
  );
}