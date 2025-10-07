// src/pages/staff/staff_courses/AddEditClassPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Label from "@/components/ui/Label";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ArrowLeft, Save, Calendar, Users, BookOpen, Loader2 } from "lucide-react";

interface Class {
  id?: string;
  name: string;
  courseId: string;
  courseName: string;
  teacher: string;
  teacherId?: string;
  schedule: string;
  room: string;
  currentStudents: number;
  maxStudents: number;
  status: "active" | "inactive" | "full";
  startDate: string;
  endDate: string;
  description?: string;
  sessions?: number;
  completedSessions?: number;
}

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Full", value: "full" }
];

const teacherOptions = [
  "Dr. Sarah Johnson",
  "Prof. Michael Chen",
  "Ms. Emily Davis",
  "Mr. David Wilson",
  "Dr. Lisa Brown",
  "Prof. James Taylor"
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
  "Conference Room"
];

// Mock course data for dropdown/reference
const mockCourses = [
  { id: "ENGO01", name: "English Conversation" },
  { id: "ENGO02", name: "Business English" },
  { id: "REACT01", name: "React Fundamentals" },
  { id: "VUE01", name: "Vue.js Advanced" }
];

export default function AddEditClassPage() {
  const params = useParams<{ courseId?: string; classId?: string; id?: string }>();
  const navigate = useNavigate();
  
  // Handle both route patterns: /staff/classes/:id/edit and /staff/courses/:courseId/classes/:classId/edit
  const classId = params.id || params.classId;
  const courseId = params.courseId;
  const isStandaloneRoute = !courseId; // True if accessed from /staff/classes
  const isEdit = !!classId;
  
  const [formData, setFormData] = useState<Class>({
    name: "",
    courseId: courseId || "",
    courseName: "",
    teacher: "",
    schedule: "",
    room: "",
    currentStudents: 0,
    maxStudents: 20,
    status: "active",
    startDate: "",
    endDate: "",
    description: "",
    sessions: 48,
    completedSessions: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && classId) {
      loadClassData(classId);
    } else if (courseId) {
      loadCourseInfo(courseId);
    }
  }, [isEdit, classId, courseId]);

  const loadClassData = async (id: string) => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockClassData = {
        id,
        name: "English Advanced - Morning Class",
        courseId: courseId || "ENGO01",
        courseName: "English Conversation",
        teacher: "Dr. Sarah Johnson",
        teacherId: "T001",
        schedule: "Mon, Wed, Fri - 8:00 AM",
        room: "Room A101",
        currentStudents: 15,
        maxStudents: 20,
        status: "active" as const,
        startDate: "2024-01-15",
        endDate: "2024-04-15",
        description: "Advanced English conversation class focusing on business communication and professional development.",
        sessions: 48,
        completedSessions: 12
      };

      setFormData(mockClassData);
    } catch (error) {
      console.error("Error loading class data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCourseInfo = async (id: string) => {
    try {
      const course = mockCourses.find(c => c.id === id);
      if (course) {
        setFormData(prev => ({
          ...prev,
          courseId: id,
          courseName: course.name
        }));
      }
    } catch (error) {
      console.error("Error loading course info:", error);
    }
  };

  const handleInputChange = (field: keyof Class, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isStandaloneRoute && !formData.courseId) {
      newErrors.courseId = "Course is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Class name is required";
    }
    if (!formData.teacher.trim()) {
      newErrors.teacher = "Teacher is required";
    }
    if (!formData.schedule.trim()) {
      newErrors.schedule = "Schedule is required";
    }
    if (!formData.room.trim()) {
      newErrors.room = "Room is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (formData.maxStudents <= 0) {
      newErrors.maxStudents = "Max students must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      console.log("Saving class:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to appropriate page
      if (isStandaloneRoute) {
        navigate(`/staff/classes`);
      } else {
        navigate(`/staff/courses/${courseId}`);
      }
    } catch (error) {
      console.error("Error saving class:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isStandaloneRoute) {
      navigate('/staff/classes');
    } else {
      navigate(`/staff/courses`);
    }
  };

  const breadcrumbItems = isStandaloneRoute 
    ? [
        { label: "Classes", to: "/staff/classes" },
        { label: isEdit ? "Edit Class" : "Add Class" }
      ]
    : [
        { label: "Courses", to: "/staff/courses" },
        { label: formData.courseName || "Course", to: `/staff/courses/${courseId}` },
        { label: isEdit ? "Edit Class" : "Add Class" }
      ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-16">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
          <Breadcrumbs items={breadcrumbItems}/>
            <PageHeader
              title={isEdit ? "Edit Class" : "Add New Class"}
              description={isEdit ? "Update class information and content" : "Create a class with detailed information"}
              controls={[
                {
                  type: 'button',
                  label: 'Back to Classes',
                  variant: 'secondary',
                  icon: <ArrowLeft className="w-4 h-4" />,
                  onClick: handleCancel
                }
              ]}
            />      
        </div>

        {/* Form */}
        <div className={`grid grid-cols-1 gap-6 ${isEdit ? 'lg:grid-cols-3' : 'max-w-4xl mx-auto'}`}>
          {/* Main Form */}
          <div className={`space-y-6 ${isEdit ? 'lg:col-span-2' : ''}`}>
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
                        const selectedCourse = mockCourses.find(c => c.id === e.target.value);
                        handleInputChange("courseId", e.target.value);
                        if (selectedCourse) {
                          handleInputChange("courseName", selectedCourse.name);
                        }
                      }}
                      options={[
                        { label: "Select a course", value: "" },
                        ...mockCourses.map(course => ({ label: course.name, value: course.id }))
                      ]}
                      error={errors.courseId}
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Course</Label>
                    <Input
                      value={formData.courseName}
                      disabled
                      className="bg-gray-50"
                    />
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
                <div>
                  <Label required>Teacher</Label>
                  <Select
                    value={formData.teacher}
                    onChange={(e) => handleInputChange("teacher", e.target.value)}
                    options={[
                      { label: "Select a teacher", value: "" },
                      ...teacherOptions.map(teacher => ({ label: teacher, value: teacher }))
                    ]}
                    error={errors.teacher}
                  />
                </div>

                <div>
                  <Label required>Room</Label>
                  <Select
                    value={formData.room}
                    onChange={(e) => handleInputChange("room", e.target.value)}
                    options={[
                      { label: "Select a room", value: "" },
                      ...roomOptions.map(room => ({ label: room, value: room }))
                    ]}
                    error={errors.room}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label required>Schedule</Label>
                  <Input
                    value={formData.schedule}
                    onChange={(e) => handleInputChange("schedule", e.target.value)}
                    placeholder="e.g., Mon, Wed, Fri - 8:00 AM"
                    error={errors.schedule}
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

            {/* Capacity & Status */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Capacity & Status</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label required>Max Students</Label>
                  <Input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => handleInputChange("maxStudents", parseInt(e.target.value))}
                    min="1"
                    error={errors.maxStudents}
                  />
                </div>

                <div>
                  <Label>Current Students</Label>
                  <Input
                    type="number"
                    value={formData.currentStudents}
                    onChange={(e) => handleInputChange("currentStudents", parseInt(e.target.value))}
                    min="0"
                    disabled={!isEdit}
                    className={!isEdit ? "bg-gray-50" : ""}
                  />
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
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            {isEdit && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Class Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enrollment</span>
                    <span className="font-medium">
                      {formData.currentStudents}/{formData.maxStudents}
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      formData.status === 'active' ? 'bg-green-100 text-green-700' :
                      formData.status === 'full' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {isEdit ? "Last updated: Today" : "All fields marked with * are required"}
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCancel}
                variant="secondary"
                disabled={isLoading}
                className="min-w-[120px]"
              >
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
