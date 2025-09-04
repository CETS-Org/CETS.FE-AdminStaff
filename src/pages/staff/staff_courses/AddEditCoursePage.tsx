import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ChevronRight, Plus, Trash2, BookOpen, ArrowLeft, Upload, Camera, Save, FileText, Link as LinkIcon } from "lucide-react";

interface Course {
  id?: string;
  name: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  teachers: string[];
  status: "active" | "inactive";
  image?: string;
  price?: number;
  maxStudents?: number;
  startDate: string;
  endDate: string;
  syllabus?: string;
  materials?: string;
  assignments?: string;
}

const levelOptions = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" }
];

const durationOptions = [
  "4 weeks",
  "6 weeks", 
  "8 weeks",
  "10 weeks",
  "12 weeks",
  "16 weeks",
  "20 weeks",
  "24 weeks"
];

const teacherOptions = [
  "Sarah Johnson",
  "Michael Chen",
  "Emily Davis",
  "David Wilson",
  "Lisa Brown",
  "James Miller",
  "Jennifer Taylor",
  "Robert Anderson"
];

export default function AddEditCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    name: "",
    description: "",
    level: "beginner",
    duration: "",
    teachers: [],
    status: "active",
    image: "",
    price: 0,
    maxStudents: 20,
    startDate: "",
    endDate: "",
    syllabus: "",
    materials: "",
    assignments: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [materialsFile, setMaterialsFile] = useState<File | null>(null);
  const [assignmentsFile, setAssignmentsFile] = useState<File | null>(null);
  const [syllabusUrl, setSyllabusUrl] = useState<string>("");
  const [materialsUrl, setMaterialsUrl] = useState<string>("");
  const [assignmentsUrl, setAssignmentsUrl] = useState<string>("");

  useEffect(() => {
    if (isEdit && id) {
      // Load course data for editing
      loadCourseData(id);
    } else {
      // Set default values for new course
      setFormData({
        name: "",
        description: "",
        level: "beginner",
        duration: "",
        teachers: [],
        status: "active",
        image: "",
        price: 0,
        maxStudents: 20,
        startDate: "",
        endDate: "",
        syllabus: "",
        materials: "",
        assignments: ""
      });
    }
  }, [isEdit, id]);

  const loadCourseData = async (courseId: string) => {
    try {
      setIsLoading(true);
             // Mock data - replace with actual API call
       const mockCourseData = {
         name: "React Fundamentals",
         description: "Learn the basics of React development with hands-on projects",
         level: "beginner" as const,
         duration: "8 weeks",
         teachers: ["Sarah Johnson", "Michael Chen"],
         status: "active" as const,
         image: "https://via.placeholder.com/400x200?text=Course+Image",
         price: 12000000,
         maxStudents: 25,
         startDate: "2024-01-15",
         endDate: "2024-03-15",
         syllabus: "Week 1: Introduction to React\nWeek 2: Components and Props\nWeek 3: State and Lifecycle\nWeek 4: Event Handling\nWeek 5: Forms and Controlled Components\nWeek 6: Hooks Introduction\nWeek 7: Advanced Hooks\nWeek 8: Project Work",
         materials: "React Documentation\nOnline Resources\nPractice Exercises\nVideo Tutorials",
         assignments: "Assignment 1: Create a Todo App\nAssignment 2: Build a Weather Widget\nAssignment 3: Final Project - E-commerce Site"
       };

      setFormData(mockCourseData);
      setImagePreview(mockCourseData.image || "");
    } catch (error) {
      console.error("Error loading course data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Course, value: string | number) => {
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          image: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImagePreview("");
    setFormData(prev => ({
      ...prev,
      image: ""
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addTeacher = (teacher: string) => {
    if (teacher && !formData.teachers.includes(teacher)) {
      setFormData(prev => ({
        ...prev,
        teachers: [...prev.teachers, teacher]
      }));
    }
  };

  const removeTeacher = (teacherToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      teachers: prev.teachers.filter(teacher => teacher !== teacherToRemove)
    }));
  };

  const handleFileUpload = (type: 'syllabus' | 'materials' | 'assignments', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF, Excel, or text file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB');
        return;
      }

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        switch (type) {
          case 'syllabus':
            setSyllabusFile(file);
            setFormData(prev => ({ ...prev, syllabus: content }));
            break;
          case 'materials':
            setMaterialsFile(file);
            setFormData(prev => ({ ...prev, materials: content }));
            break;
          case 'assignments':
            setAssignmentsFile(file);
            setFormData(prev => ({ ...prev, assignments: content }));
            break;
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUrlInput = (type: 'syllabus' | 'materials' | 'assignments', url: string) => {
    switch (type) {
      case 'syllabus':
        setSyllabusUrl(url);
        if (url) {
          setFormData(prev => ({ ...prev, syllabus: `URL: ${url}` }));
        }
        break;
      case 'materials':
        setMaterialsUrl(url);
        if (url) {
          setFormData(prev => ({ ...prev, materials: `URL: ${url}` }));
        }
        break;
      case 'assignments':
        setAssignmentsUrl(url);
        if (url) {
          setFormData(prev => ({ ...prev, assignments: `URL: ${url}` }));
        }
        break;
    }
  };

  const removeFile = (type: 'syllabus' | 'materials' | 'assignments') => {
    switch (type) {
      case 'syllabus':
        setSyllabusFile(null);
        setSyllabusUrl("");
        setFormData(prev => ({ ...prev, syllabus: "" }));
        break;
      case 'materials':
        setMaterialsFile(null);
        setMaterialsUrl("");
        setFormData(prev => ({ ...prev, materials: "" }));
        break;
      case 'assignments':
        setAssignmentsFile(null);
        setAssignmentsUrl("");
        setFormData(prev => ({ ...prev, assignments: "" }));
        break;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Course name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Course description is required";
    }

    if (!formData.duration) {
      newErrors.duration = "Duration is required";
    }

    if (!formData.teachers.length) {
      newErrors.teachers = "At least one teacher is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (formData.price && formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    if (formData.maxStudents && formData.maxStudents <= 0) {
      newErrors.maxStudents = "Maximum students must be greater than 0";
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
      
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Saving course:", formData);
      
      // Navigate back to courses list
      navigate('/courses');
    } catch (error) {
      console.error("Error saving course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Courses', to: '/courses' },
    { label: isEdit ? 'Edit Course' : 'Add Course', to: '#' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full mt-16 lg:pl-70">
      {/* Header with Breadcrumb */}
      <div className="mb-8">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link to="/" className="hover:text-gray-900">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/courses" className="hover:text-gray-900">Courses</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">
              {isEdit ? "Edit Course" : "Add New Course"}
            </span>
          </div>
        <div className="flex items-center justify-between mb-6">
          
          <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900"> {isEdit ? "Edit Course" : "Add New Course"}</h1>
                <p className="text-gray-600 mt-2">Update course information with the form below</p>
              </div>
            </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/courses')}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Courses
              </div>          
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Course'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Image */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  Course Image
                </h3>
                
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div 
                      className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors"
                      onClick={handleImageClick}
                    >
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Course preview" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Click to upload</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">Upload Course Image</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a high-quality image that represents your course. 
                      Recommended size: 400x200 pixels. Max file size: 5MB.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleImageClick}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Choose Image
                      </Button>
                      {imagePreview && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={removeImage}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Basic Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter course name"
                      error={errors.name}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level *
                    </label>
                    <Select
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      options={levelOptions}
                      error={errors.level}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
                    </label>
                    <Select
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      options={durationOptions.map(d => ({ label: d, value: d }))}
                      error={errors.duration}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teachers *
                    </label>
                    <div className="space-y-3">
                                             <Select
                         value=""
                         onChange={(e) => addTeacher(e.target.value)}
                         options={teacherOptions.map(t => ({ label: t, value: t }))}
                       />
                      {formData.teachers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.teachers.map((teacher, index) => (
                            <div key={index} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                              <span className="text-sm">{teacher}</span>
                              <button
                                type="button"
                                onClick={() => removeTeacher(teacher)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.teachers && (
                        <p className="text-sm text-red-600">{errors.teachers}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      error={errors.startDate}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      error={errors.endDate}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (VND)
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value))}
                      placeholder="Enter course price"
                      error={errors.price}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Students
                    </label>
                    <Input
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => handleInputChange('maxStudents', Number(e.target.value))}
                      placeholder="Enter max students"
                      error={errors.maxStudents}
                    />
                  </div>
                </div>

                                 <div className="mt-6">
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Course Description *
                   </label>
                   <textarea
                     value={formData.description}
                     onChange={(e) => handleInputChange('description', e.target.value)}
                     placeholder="Enter detailed course description..."
                     rows={4}
                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                       errors.description ? 'border-red-500' : 'border-gray-300'
                     }`}
                   />
                   {errors.description && (
                     <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                   )}
                 </div>
               </div>
             </Card>

             {/* Course Content */}
             <Card>
               <div className="p-6">
                 <h3 className="text-lg font-semibold mb-6">Course Content</h3>
                 
                                   <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Syllabus
                      </label>
                      <div className="space-y-3">
                        <textarea
                          value={formData.syllabus}
                          onChange={(e) => handleInputChange('syllabus', e.target.value)}
                          placeholder="Enter course syllabus (weekly breakdown)..."
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept=".pdf,.xlsx,.xls,.txt"
                            onChange={(e) => handleFileUpload('syllabus', e)}
                            className="hidden"
                            id="syllabus-file"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => document.getElementById('syllabus-file')?.click()}
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Upload File
                          </Button>
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                            <Input
                              type="url"
                              placeholder="Or enter URL"
                              value={syllabusUrl}
                              onChange={(e) => handleUrlInput('syllabus', e.target.value)}
                              className="w-64"
                            />
                          </div>
                          {(syllabusFile || syllabusUrl) && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => removeFile('syllabus')}
                              className="flex items-center gap-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Clear
                            </Button>
                          )}
                        </div>
                        {syllabusFile && (
                          <p className="text-xs text-green-600">✓ File uploaded: {syllabusFile.name}</p>
                        )}
                        {syllabusUrl && (
                          <p className="text-xs text-green-600">✓ URL added: {syllabusUrl}</p>
                        )}
                        <p className="text-xs text-gray-500">Enter weekly topics and learning objectives, or upload PDF/Excel file, or provide URL</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Materials
                      </label>
                      <div className="space-y-3">
                        <textarea
                          value={formData.materials}
                          onChange={(e) => handleInputChange('materials', e.target.value)}
                          placeholder="List required materials, textbooks, resources..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept=".pdf,.xlsx,.xls,.txt"
                            onChange={(e) => handleFileUpload('materials', e)}
                            className="hidden"
                            id="materials-file"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => document.getElementById('materials-file')?.click()}
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Upload File
                          </Button>
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                            <Input
                              type="url"
                              placeholder="Or enter URL"
                              value={materialsUrl}
                              onChange={(e) => handleUrlInput('materials', e.target.value)}
                              className="w-64"
                            />
                          </div>
                          {(materialsFile || materialsUrl) && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => removeFile('materials')}
                              className="flex items-center gap-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Clear
                            </Button>
                          )}
                        </div>
                        {materialsFile && (
                          <p className="text-xs text-green-600">✓ File uploaded: {materialsFile.name}</p>
                        )}
                        {materialsUrl && (
                          <p className="text-xs text-green-600">✓ URL added: {materialsUrl}</p>
                        )}
                        <p className="text-xs text-gray-500">List textbooks, online resources, and required materials, or upload file, or provide URL</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assignments & Projects
                      </label>
                      <div className="space-y-3">
                        <textarea
                          value={formData.assignments}
                          onChange={(e) => handleInputChange('assignments', e.target.value)}
                          placeholder="Describe assignments, projects, and assessments..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept=".pdf,.xlsx,.xls,.txt"
                            onChange={(e) => handleFileUpload('assignments', e)}
                            className="hidden"
                            id="assignments-file"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => document.getElementById('assignments-file')?.click()}
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Upload File
                          </Button>
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                            <Input
                              type="url"
                              placeholder="Or enter URL"
                              value={assignmentsUrl}
                              onChange={(e) => handleUrlInput('assignments', e.target.value)}
                              className="w-64"
                            />
                          </div>
                          {(assignmentsFile || assignmentsUrl) && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => removeFile('assignments')}
                              className="flex items-center gap-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Clear
                            </Button>
                          )}
                        </div>
                        {assignmentsFile && (
                          <p className="text-xs text-green-600">✓ File uploaded: {assignmentsFile.name}</p>
                        )}
                        {assignmentsUrl && (
                          <p className="text-xs text-green-600">✓ URL added: {assignmentsUrl}</p>
                        )}
                        <p className="text-xs text-gray-500">List homework assignments, projects, and assessment methods, or upload file, or provide URL</p>
                      </div>
                    </div>
                  </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Course Status</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === "inactive"}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Inactive</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Course Preview */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Course Preview</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{formData.name || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Level:</span>
                    <p className="font-medium">{formData.level || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium">{formData.duration || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Teachers:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.teachers.length > 0 ? (
                        formData.teachers.map((teacher, index) => (
                          <span key={index} className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                            {teacher}
                          </span>
                        ))
                      ) : (
                        <p className="font-medium text-gray-400">Not set</p>
                      )}
                    </div>
                  </div>
                                     <div>
                     <span className="text-gray-500">Status:</span>
                     <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                       formData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                     }`}>
                       {formData.status}
                     </span>
                   </div>
                                       <div>
                      <span className="text-gray-500">Syllabus:</span>
                      <p className="font-medium text-xs mt-1">
                        {syllabusFile ? `📎 ${syllabusFile.name}` : 
                         syllabusUrl ? `🔗 URL provided` :
                         formData.syllabus ? `${formData.syllabus.split('\n').length} weeks` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Materials:</span>
                      <p className="font-medium text-xs mt-1">
                        {materialsFile ? `📎 ${materialsFile.name}` : 
                         materialsUrl ? `🔗 URL provided` :
                         formData.materials ? `${formData.materials.split('\n').length} items` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Assignments:</span>
                      <p className="font-medium text-xs mt-1">
                        {assignmentsFile ? `📎 ${assignmentsFile.name}` : 
                         assignmentsUrl ? `🔗 URL provided` :
                         formData.assignments ? `${formData.assignments.split('\n').length} tasks` : 'Not set'}
                      </p>
                    </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
