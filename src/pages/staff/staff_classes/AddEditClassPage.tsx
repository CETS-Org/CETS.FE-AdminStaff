import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

// UI Components
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Label from "@/components/ui/Label";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import StatusDialog from "@/pages/staff/staff_classes/components/StatusDialog"; 

// Icons
import {
  Save,
  Loader2,
  RefreshCw,
  BookOpen,
  CalendarClock,
  MapPin,
  Users,
  UserPlus,
  MailWarning,
  X,
  Search,
  Check,
  Wand2,
  Info,
  AlertTriangle,
  Calendar as CalendarIcon 
} from "lucide-react";

// Components
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
  createClassComposite,
  sendPostponedClassEmail,
  autoPickWaitingStudents,
  getClassDetailForEdit,
  updateClassComposite
} from "@/pages/staff/staff_classes/data/classPlacement.api";

import { getSyllabiByCourse, getSyllabusItems } from "@/api/syllabus.api";

// Types
import {
  DAY_MAP,
  type DayOfWeek,
  type CourseOption,
  type CourseScheduleRow,
  type TeacherOption,
  type CreateClassCompositeRequestDTO,
  type UpdateClassCompositeRequestDTO,
  type ClassMeetingScheduleDTO,
  type ClassScheduleInput,
  type WaitingStudentItem,
  type PostponedClassNotifyRequest,
  type PostponedStudentItem
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

// --- HELPER: Format Date to DD/MM/YYYY ---
const formatDateToVN = (dateStr: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// --- COMPONENT: Overlay Date Picker ---
const DatePickerOverlay = ({ value, onChange, error, disabled }: any) => {
    return (
      <div className="relative w-full group">
        <div className="relative">
          <Input
            type="text"
            value={formatDateToVN(value)} 
            placeholder="dd/mm/yyyy"
            readOnly 
            disabled={disabled}
            error={error}
            className="pr-10 text-gray-900 bg-white" 
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-blue-500 transition-colors">
             <CalendarIcon className="w-4 h-4" />
          </div>
        </div>
        <input
          type="date"
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          className={`absolute inset-0 w-full h-full opacity-0 z-10 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        />
      </div>
    );
};

export default function AddEditClassPage() {
  const params = useParams<{ courseId?: string; classId?: string; id?: string }>();
  const navigate = useNavigate();
  const { showSuccessMessage, showErrorMessage } = useToast();
  
  const lookupOptions = useLookupOptions(false);
  const timeslotOptions = (lookupOptions as any)?.timeslotOptions || [
     { value: "TS-0800-0900", label: "08:00–09:00" },
     { value: "TS-1800-1930", label: "18:00–19:30" },
  ];

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

  const [currentSyllabusId, setCurrentSyllabusId] = useState<string>("");
  const [syllabusItems, setSyllabusItems] = useState<SyllabusItemModel[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentLookup, setStudentLookup] = useState<Map<string, WaitingStudentItem>>(new Map());

  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [roomOptions, setRoomOptions] = useState<any[]>([]); 
  const [availableTeachers, setAvailableTeachers] = useState<TeacherOption[]>([]);
  
  const [isWaitingListOpen, setIsWaitingListOpen] = useState(false);
  const [isPostponeOpen, setIsPostponeOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({ open: false, type: "success", title: "", message: "" });

  const [waitingStudents, setWaitingStudents] = useState<WaitingStudentItem[]>([]);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [idsToNotify, setIdsToNotify] = useState<string[]>([]);

  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isAutoPicking, setIsAutoPicking] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  const [isLoadingCourseOptions, setIsLoadingCourseOptions] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

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

  const showStatusDialog = (type: "success" | "error", title: string, message: string) => {
      setStatusDialog({ open: true, type, title, message });
  };

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

  const calculateClassEndDate = (startStr: string, totalSessions: number, schedules: ScheduleRow[]): string => {
    if (!startStr || totalSessions <= 0 || schedules.length === 0) return "";
    const startDate = new Date(startStr);
    let currentDate = new Date(startDate);
    let sessionsCounted = 0;
    const validDays = new Set(schedules.map(s => DAY_MAP[s.dayOfWeek]));
    let safetyLoop = 0;
    while (sessionsCounted < totalSessions && safetyLoop < 730) {
        const currentDayOfWeek = currentDate.getDay();
        if (validDays.has(currentDayOfWeek)) sessionsCounted++;
        if (sessionsCounted === totalSessions) return currentDate.toISOString().split('T')[0];
        currentDate.setDate(currentDate.getDate() + 1);
        safetyLoop++;
    }
    return "";
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, currentStudents: selectedStudentIds.length }));
  }, [selectedStudentIds]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, schedules: scheduleRows }));
  }, [scheduleRows]);

  useEffect(() => {
    if (!isEdit && formData.startDate && syllabusItems.length > 0 && scheduleRows.length > 0) {
        const projectedEndDate = calculateClassEndDate(formData.startDate, syllabusItems.length, scheduleRows);
        if (projectedEndDate && projectedEndDate !== formData.endDate) {
             setFormData(prev => ({ ...prev, endDate: projectedEndDate, sessions: syllabusItems.length }));
        }
    }
  }, [formData.startDate, syllabusItems, scheduleRows, isEdit]);

  // INITIAL LOAD - Đã xóa getRoomOptions() khỏi đây
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingCourseOptions(true);
        // setIsLoadingRooms(true); // Đã xóa
        const courseRes = await getCourseOptions();
        // const roomRes = await getRoomOptions(); // Đã xóa
        setCourseOptions(courseRes.data);
        // setRoomOptions(roomRes.data); // Đã xóa
      } catch (err) {
        console.error(err);
        showErrorMessage("Failed to load initial data.");
      } finally {
        setIsLoadingCourseOptions(false);
        // setIsLoadingRooms(false); // Đã xóa
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadClassDetail = async () => {
      if (!isEdit || !classId) return;
      try {
        setIsLoading(true);
        const res = await getClassDetailForEdit(classId);
        const data = res.data;

        if (data.teacherAssignmentID && (data as any).teacherName) {
            setAvailableTeachers([{
                id: data.teacherAssignmentID,
                fullName: (data as any).teacherName,
            }]);
        }

        setFormData(prev => ({
            ...prev,
            courseId: data.courseId,
            courseName: data.className,
            teacherId: data.teacherAssignmentID,
            teacher: (data as any).teacherName || "",
            room: data.roomId || "",
            maxStudents: data.capacity,
            startDate: data.startDate,
            endDate: data.endDate,
            status: data.status as any,
        }));

        if (data.schedules && data.schedules.length > 0) {
            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            
            const uniqueScheduleMap = new Map<string, ScheduleRow>();

            data.schedules.forEach((s) => {
                const dateObj = new Date(s.date);
                const dayIndex = dateObj.getDay(); 
                const dayName = daysOfWeek[dayIndex] as DayOfWeek;
                const uniqueKey = `${dayName}-${s.slotID}`;

                if (!uniqueScheduleMap.has(uniqueKey)) {
                    uniqueScheduleMap.set(uniqueKey, {
                        dayOfWeek: dayName,
                        timeSlotID: s.slotID,
                        id: `sched-mapped-${uniqueKey}`
                    });
                }
            });
            const mappedSchedules = Array.from(uniqueScheduleMap.values());
            loadSchedules(mappedSchedules);
        }
        if (data.enrollments) {
            updateStudentLookup(data.enrollments);
            setSelectedStudentIds(data.enrollments.map(s => s.studentId));
        }

        await handleCourseChange(data.courseId);

      } catch (err) {
        console.error(err);
        showErrorMessage("Failed to load class details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isEdit) {
        loadClassDetail();
    } else if (initialCourseIdFromRoute) {
        handleCourseChange(initialCourseIdFromRoute);
    }
  }, [isEdit, classId, initialCourseIdFromRoute]);

  const handleCourseChange = async (courseId: string) => {
    if (!isEdit) {
        setFormData((prev) => ({ ...prev, courseId, courseName: "", sessions: 0 }));
        setSelectedStudentIds([]); 
        setStudentLookup(new Map());
    }
    setCurrentSyllabusId(""); 
    setSyllabusItems([]); 
    
    if (!courseId) { loadSchedules([]); return; }

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
        } catch (error) { console.error(error); }
      }

      if (!isEdit) {
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
      }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const reloadAvailableTeachers = useCallback(async () => {
    if (!formData.courseId || !formData.startDate || !formData.endDate) {
      showErrorMessage("Please select course and dates first."); return;
    }
    if (scheduleRows.length === 0) {
      showErrorMessage("Please configure at least one schedule."); return;
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
      if (res && res.data) setAvailableTeachers(res.data);
    } catch (err) { console.error(err); } finally { setIsLoadingTeachers(false); }
  }, [formData.courseId, formData.startDate, formData.endDate, scheduleRows, showErrorMessage]);

  // --- MỚI: Hàm reload rooms khi bấm nút ---
  const reloadRooms = async () => {
    try {
      setIsLoadingRooms(true);
      // Gọi API lấy danh sách phòng
      const res = await getRoomOptions();
      setRoomOptions(res.data);
    } catch (err) {
      console.error(err);
      showErrorMessage("Failed to load rooms.");
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleInputChange = (field: keyof ClassModel, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value as any }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleTeacherSelectChange = (value: string) => {
    const teacher = availableTeachers.find((x) => x.id === value);
    setFormData((prev) => ({ ...prev, teacherId: value, teacher: teacher?.fullName ?? "" }));
  };

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

  const generateMeetingDates = (start: string, end: string, schedules: ScheduleRow[]) => {
    const dates: { date: string; slotId: string }[] = [];
    const currentDate = new Date(start);
    const endDate = new Date(end);
    const validDays = schedules.map(s => ({ day: DAY_MAP[s.dayOfWeek], slotId: s.timeSlotID }));
    while (currentDate <= endDate) {
        const currentDayOfWeek = currentDate.getDay();
        const matched = validDays.find(s => s.day === currentDayOfWeek);
        if (matched) dates.push({ date: currentDate.toISOString().split('T')[0], slotId: matched.slotId });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!currentSyllabusId || syllabusItems.length === 0) {
      showErrorMessage("Cannot create class: Missing Syllabus Items.");
      return;
    }
    const CURRENT_USER_ID = getCurrentUserId(); 

    try {
      setIsLoading(true);

      if (isEdit && classId) {
          // UPDATE
          const enrollmentIdsForUpdate = selectedStudentIds
            .map(studentId => studentLookup.get(studentId)?.enrollmentId)
            .filter((id): id is string => !!id);
          const updatePayload: UpdateClassCompositeRequestDTO = {
              className: formData.courseName,
              teacherAssignmentID: formData.teacherId,
              startDate: formData.startDate,
              endDate: formData.endDate,
              capacity: formData.maxStudents,
              updatedBy: CURRENT_USER_ID,
              enrollmentIds: enrollmentIdsForUpdate
          };
          await updateClassComposite(classId, updatePayload);
          showStatusDialog("success", "Class Updated!", "Class updated successfully.");

      } else {
          // CREATE
          const CONST_STATUS_PLANED = "D5621E55-A2FB-4DAC-B0EE-B53F378405FF"; 
          const CONST_COURSE_FORMAT = "2423c370-7205-463f-bea6-530ddc9aa544"; 

          const scheduleString = scheduleRows.map(s => {
              const timeLabel = timeslotOptions.find((t: any) => t.value === s.timeSlotID)?.label || "";
              return `${s.dayOfWeek} (${timeLabel})`;
          }).join(", ");

          const meetingDates = generateMeetingDates(formData.startDate, formData.endDate, scheduleRows);
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

          // FORMAT DATE TO VN
          const formattedStartDate = formatDateToVN(formData.startDate);
          const autoClassName = `${formData.courseName} - (${formattedStartDate})`;
          
          const enrollmentObjects = selectedStudentIds
            .map(id => studentLookup.get(id))
            .filter((item): item is WaitingStudentItem => !!item);

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
            enrollments: enrollmentObjects 
          };

          await createClassComposite(compositePayload);
          showStatusDialog("success", "Class Created!", "Class created & students enrolled successfully!");
      }
      
      setTimeout(() => {
        if (isStandaloneRoute) navigate(`/staff/classes`);
        else navigate(`/admin/courses/${formData.courseId}`);
      }, 2000);

    } catch (err: any) {
      console.error(err);
      showStatusDialog("error", "Action Failed", err.response?.data?.message || "Failed to process class.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- POPUP LOGIC ---
  useEffect(() => {
    const fetchStudents = async () => {
        if (!isWaitingListOpen || !formData.courseId) return;
        setIsLoadingStudents(true);
        try {
            const res = await searchWaitingStudents(formData.courseId, studentSearch, 1);
            setWaitingStudents(res.data.items || []);
            updateStudentLookup(res.data.items || []);
        } catch (err) { console.error(err); } finally { setIsLoadingStudents(false); }
    };
    const timeoutId = setTimeout(() => fetchStudents(), 300);
    return () => clearTimeout(timeoutId);
  }, [isWaitingListOpen, studentSearch, formData.courseId, updateStudentLookup]);

  const handleAutoSelect = async () => {
      if (!formData.courseId) return;
      const currentTotal = selectedStudentIds.length + tempSelectedIds.length;
      const needed = formData.maxStudents - currentTotal;
      if (needed <= 0) { showErrorMessage("Class capacity is full."); return; }
      try {
          setIsAutoPicking(true);
          const res = await autoPickWaitingStudents(formData.courseId, needed);
          const pickedStudents = res.data || [];
          if (pickedStudents.length === 0) {
              showStatusDialog("error", "No Match", "No matching students found in the waiting list.");
          } else {
              updateStudentLookup(pickedStudents);
              const newIds = pickedStudents.map(s => s.studentId);
              setTempSelectedIds(prev => [...prev, ...newIds]);
              showSuccessMessage(`Auto-selected ${pickedStudents.length} students.`);
          }
      } catch (err) {
          console.error(err);
          showStatusDialog("error", "Auto Select Failed", "An error occurred while auto-selecting students.");
      } finally {
          setIsAutoPicking(false);
      }
  };

  const handleAddStudentsFromDialog = () => {
    const uniqueIds = Array.from(new Set([...selectedStudentIds, ...tempSelectedIds]));
    const addedCount = uniqueIds.length - selectedStudentIds.length;
    setSelectedStudentIds(uniqueIds);
    setIsWaitingListOpen(false);
    setTempSelectedIds([]); 
    if (addedCount > 0) showSuccessMessage(`Added ${addedCount} students to the class.`);
  };

  const handleRequestNotify = () => {
    if (tempSelectedIds.length === 0) { showErrorMessage("Please select students to notify."); return; }
    setIdsToNotify(tempSelectedIds); 
    setIsPostponeOpen(true);        
  };

  const handleNotifyPostpone = async () => {
    if (idsToNotify.length === 0) return;
    try {
      setIsLoading(true);
      const studentsToNotify: PostponedStudentItem[] = idsToNotify
        .map(id => {
           const student = studentLookup.get(id);
           if (!student) return null;
           return {
             enrollmentId: student.enrollmentId || "", 
             studentId: student.studentId,
             studentName: student.fullName,
             studentEmail: student.email || "" 
           };
        })
        .filter((s): s is PostponedStudentItem => s !== null && !!s.studentEmail);

      if (studentsToNotify.length === 0) {
         showStatusDialog("error", "Invalid Data", "No valid student emails found.");
         return;
      }
      const payload: PostponedClassNotifyRequest = {
         courseName: formData.courseName,
         plannedStartDate: formData.startDate,
         students: studentsToNotify
      };
      await sendPostponedClassEmail(payload);
      setIsPostponeOpen(false);
      showStatusDialog("success", "Email Sent", `Sent postponement notifications to ${studentsToNotify.length} students.`);
    } catch (err: any) {
      console.error(err);
      showStatusDialog("error", "Sending Failed", "Failed to send notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const enrolledStudents = selectedStudentIds
    .map(id => studentLookup.get(id))
    .filter(Boolean) as WaitingStudentItem[];

  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
         <div className="flex flex-col gap-2">
            <Breadcrumbs items={[{ label: "Classes", to: "/staff/classes" }, { label: isEdit ? "Edit Class" : "New Class" }]} />
            <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Class" : "Create New Class"}</h1>
            <p className="text-sm text-gray-500">Setup class schedule, location and enroll students.</p>
         </div>

         {isEdit && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-600" />
                <div className="text-sm">
                    <p className="font-bold">Restricted Edit Mode</p>
                    <p>Only <strong>Student List</strong> and basic info can be modified here. To change schedule, please use the <strong>Schedule Management</strong> feature.</p>
                </div>
            </div>
         )}
         
         <div className="space-y-6">
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
                                        disabled={isLoadingCourseOptions || isEdit}
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
                                disabled={isEdit}
                            />
                        </div>
                    </div>
                </Card>

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
                            readOnly={isEdit}
                        />
                        {errors.schedules && <p className="text-sm text-red-500 mt-1">{errors.schedules}</p>}
                        {isEdit && (
                            <p className="text-xs text-gray-500 mt-2 italic flex items-center gap-1 bg-gray-50 p-2 rounded">
                                <Info className="w-3 h-3" /> Schedule is read-only in Edit mode.
                            </p>
                        )}
                     </div>
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label required>Start Date</Label>
                            <DatePickerOverlay
                                value={formData.startDate}
                                onChange={(e: any) => handleInputChange("startDate", e.target.value)}
                                error={errors.startDate}
                                disabled={isEdit}
                            />
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <Input 
                                type="text" 
                                value={formatDateToVN(formData.endDate)} 
                                readOnly={true}
                                className="bg-gray-100 cursor-not-allowed"
                                disabled={isEdit}
                            />
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <Label required className="mb-0">Room</Label>
                            </div>
                            
                            {/* --- MỚI: UI cho Room Select + Button Find --- */}
                            <div className="flex items-center gap-2">
                                <Select 
                                    className="flex-1"
                                    value={formData.room}
                                    onChange={e => handleInputChange("room", e.target.value)}
                                    options={[
                                        { label: roomOptions.length ? "Select a room..." : "No rooms found", value: "" },
                                        ...roomOptions.filter(r => r.isActive).map(r => ({ label: `${r.roomCode} (Cap: ${r.capacity})`, value: r.id }))
                                    ]}
                                    // Chỉ disable khi chưa load options hoặc đang edit (trừ khi edit cũng muốn cho đổi phòng)
                                    // Theo logic Teacher, nếu chưa load thì disable select
                                    disabled={roomOptions.length === 0 || isEdit}
                                    error={errors.room}
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-10 px-3 text-sm"
                                    onClick={reloadRooms}
                                    disabled={isLoadingRooms || isEdit}
                                    iconLeft={
                                        isLoadingRooms
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <RefreshCw className="w-4 h-4" />
                                    }
                                >
                                    Find
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label required className="mb-1 block">Teacher</Label>
                            <div className="flex items-center gap-2">
                                <Select 
                                    className="flex-1"
                                    options={[
                                        { label: availableTeachers.length ? "Select a teacher..." : "No teachers found", value: "" },
                                        ...availableTeachers.map(t => ({ label: t.fullName, value: t.id }))
                                    ]}
                                    value={formData.teacherId || ""}
                                    onChange={e => handleTeacherSelectChange(e.target.value)}
                                    disabled={availableTeachers.length === 0 || isEdit}
                                    error={errors.teacher}
                                />
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="h-10 px-3 text-sm"
                                    onClick={reloadAvailableTeachers} 
                                    disabled={isLoadingTeachers || !canPickTeacher || isEdit}
                                    iconLeft={
                                      isLoadingTeachers 
                                        ? <Loader2 className="w-4 h-4 animate-spin" /> 
                                        : <RefreshCw className="w-4 h-4" />
                                    }
                                >
                                    Find
                                </Button>
                            </div>
                        </div>
                     </div>
                </Card>

                <Card className="p-6 border-t-4 border-t-purple-500">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-lg text-gray-800">Students & Capacity</h2>
                        </div>
                        <Button 
                            onClick={() => {
                                setTempSelectedIds([]);
                                setIsWaitingListOpen(true);
                            }} 
                            size="sm" 
                            variant="secondary" 
                            className="flex items-center gap-2 font-medium"
                            iconLeft={<UserPlus className="w-4 h-4" />}
                        >
                            Manage Students
                        </Button>
                    </div>

                    <div className="mb-4 max-w-xs">
                         <Label>Max Class Capacity</Label>
                         <Input 
                           type="number" 
                           value={formData.maxStudents} 
                           onChange={e => handleInputChange("maxStudents", parseInt(e.target.value))} 
                           min={1}
                           disabled={isEdit}
                         />
                    </div>

                    <div className="border rounded-md overflow-hidden bg-white">
                       <div className="bg-gray-50 px-4 py-2 border-b font-medium text-sm text-gray-500 flex justify-between">
                           <span>Enrolled Students List</span>
                           <span className="text-xs bg-white px-2 py-0.5 rounded border">
                               Count: {enrolledStudents.length} / {formData.maxStudents}
                           </span>
                       </div>
                       {enrolledStudents.length === 0 ? (
                           <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                               <Users className="w-10 h-10 mb-2 opacity-20" />
                               <p>No students added yet.</p>
                               <p className="text-xs mt-1">Click "Manage Students" to select from waiting list.</p>
                           </div>
                       ) : (
                           <div className="divide-y max-h-[400px] overflow-y-auto">
                               {enrolledStudents.map(student => (
                                   <div key={student.studentId} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                       <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                               {student.fullName.charAt(0)}
                                           </div>
                                           <div>
                                               <div className="font-medium text-gray-900 text-sm">{student.fullName}</div>
                                               <div className="text-xs text-gray-500 flex gap-2">
                                                   <span>{student.studentCode}</span>
                                                   <span>•</span>
                                                   <span>{student.email}</span>
                                               </div>
                                           </div>
                                       </div>
                                       <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
                                          onClick={() => setSelectedStudentIds(prev => prev.filter(id => id !== student.studentId))}
                                          title="Remove student"
                                       >
                                           <X className="w-4 h-4" />
                                       </Button>
                                   </div>
                               ))}
                           </div>
                       )}
                    </div>
                </Card>
         </div>

         <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-2xl border-t border-gray-200 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)} className="min-w-[100px]">Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading} 
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
              iconLeft={isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
            >
                {isEdit ? "Update Class" : "Create Class"}
            </Button>
         </div>

         <Dialog open={isWaitingListOpen} onOpenChange={setIsWaitingListOpen}>
             <DialogContent size="lg">
                 <DialogHeader><DialogTitle>Select Students from Waiting List</DialogTitle></DialogHeader>
                 <DialogBody>
                     <div className="mb-4 flex gap-2">
                         <div className="relative flex-1">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                             <Input className="pl-9" placeholder="Search..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
                             {isLoadingStudents && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />}
                         </div>
                        <Button
                          variant="secondary"
                          onClick={handleAutoSelect}
                          disabled={isAutoPicking}
                          className="flex items-center gap-2"
                          iconLeft={
                            isAutoPicking
                              ? <Loader2 className="w-4 h-4 animate-spin"/>
                              : <Wand2 className="w-4 h-4"/>
                          }
                        >
                            Auto Select
                        </Button>
                     </div>
                     <div className="border rounded-md h-[300px] overflow-y-auto">
                         {waitingStudents.length === 0 ? <div className="p-8 text-center text-gray-500">No students found.</div> : 
                             waitingStudents.map(s => {
                                 const isAlreadyAdded = selectedStudentIds.includes(s.studentId);
                                 const isSelected = tempSelectedIds.includes(s.studentId);
                                 return (
                                     <div key={s.studentId} className={`px-4 py-3 border-b flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${isAlreadyAdded ? 'opacity-60' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                                          onClick={() => !isAlreadyAdded && setTempSelectedIds(prev => prev.includes(s.studentId) ? prev.filter(id => id !== s.studentId) : [...prev, s.studentId])}>
                                         <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white'}`}>
                                             {isSelected && <Check className="w-3 h-3" />}
                                         </div>
                                         <div className="flex-1">
                                             <div className="font-medium text-sm">{s.fullName} {isAlreadyAdded && <span className="text-xs text-green-600">(Added)</span>}</div>
                                             <div className="text-xs text-gray-500">{s.studentCode}</div>
                                         </div>
                                     </div>
                                 )
                             })
                         }
                     </div>
                 </DialogBody>
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 sm:gap-0 pt-4 border-t">
                    <Button
                      variant="secondary"
                      onClick={handleRequestNotify}
                      className="flex items-center gap-2 min-w-[140px] justify-center"
                      disabled={tempSelectedIds.length === 0}
                      iconLeft={<MailWarning className="w-4 h-4" />}
                    >
                        Notify Selected
                    </Button>
                    <div className="flex gap-3 w-full sm:w-auto justify-end">
                        <Button
                          onClick={handleAddStudentsFromDialog}
                          disabled={tempSelectedIds.length === 0}
                          className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                          iconLeft={<Check className="w-4 h-4" />}
                        >
                            Add Selected ({tempSelectedIds.length})
                        </Button>
                    </div>
                </DialogFooter>
             </DialogContent>
         </Dialog>

         <Dialog open={isPostponeOpen} onOpenChange={setIsPostponeOpen}>
             <DialogContent>
                 <DialogHeader><DialogTitle className="text-amber-600 flex items-center gap-2"><MailWarning className="w-5 h-5" /> Notify Postponement</DialogTitle></DialogHeader>
                 <DialogBody>
                     <p className="text-sm text-gray-600 mb-4">Send email to <strong>{idsToNotify.length} students</strong>?</p>
                     <div className="space-y-2 bg-gray-50 p-3 rounded text-sm">
                         <div className="flex justify-between"><span className="text-gray-500">Course:</span><span className="font-medium">{formData.courseName}</span></div>
                         <div className="flex justify-between">
                            <span className="text-gray-500">New Start Date:</span>
                            <span className="font-medium">{formatDateToVN(formData.startDate)}</span>
                         </div>
                     </div>
                 </DialogBody>
                 <DialogFooter>
                     <Button variant="secondary" onClick={() => setIsPostponeOpen(false)}>Cancel</Button>
                     <Button onClick={handleNotifyPostpone} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center">
                         {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MailWarning className="w-4 h-4 mr-2" />} Send Notifications
                     </Button>
                 </DialogFooter>
             </DialogContent>
         </Dialog>

         <StatusDialog 
            open={statusDialog.open}
            onOpenChange={(open) => setStatusDialog(prev => ({ ...prev, open }))}
            status={statusDialog.type}
            title={statusDialog.title}
            message={statusDialog.message}
         />
      </div>
    </div>
  );
}