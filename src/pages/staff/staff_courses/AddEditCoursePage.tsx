import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/ui/PageHeader";
import { ChevronRight, Plus, Trash2, BookOpen, ArrowLeft, Upload, Camera, Save, FileText, Link as LinkIcon, CheckCircle, AlertCircle, Users, Clock, DollarSign, Calendar } from "lucide-react";

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

  const getFormCompletionPercentage = () => {
    const requiredFields = [
      formData.name,
      formData.description,
      formData.level,
      formData.duration,
      formData.teachers.length > 0,
      formData.startDate,
      formData.endDate
    ];
    
    const optionalFields = [
      formData.image || imagePreview,
      formData.price,
      formData.maxStudents,
      formData.syllabus || syllabusFile || syllabusUrl,
      formData.materials || materialsFile || materialsUrl,
      formData.assignments || assignmentsFile || assignmentsUrl
    ];
    
    const completedRequired = requiredFields.filter(Boolean).length;
    const completedOptional = optionalFields.filter(Boolean).length;
    
    const requiredWeight = 70; // 70% for required fields
    const optionalWeight = 30; // 30% for optional fields
    
    const requiredPercentage = (completedRequired / requiredFields.length) * requiredWeight;
    const optionalPercentage = (completedOptional / optionalFields.length) * optionalWeight;
    
    return Math.round(requiredPercentage + optionalPercentage);
  };

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
    <div className="pt-20 pb-6 space-y-8">
      {/* Enhanced Page Header */}
      <PageHeader
        title={isEdit ? "Edit Course" : "Create New Course"}
        description={isEdit ? "Update course information and content" : "Create a comprehensive course with detailed information"}
        icon={<BookOpen className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'Back to Courses',
            variant: 'secondary',
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: () => navigate('/staff/courses')
          },
          {
            type: 'button',
            label: isLoading ? 'Saving...' : 'Save Course',
            variant: 'primary',
            icon: <Save className="w-4 h-4" />,
            onClick: handleSave,
            className: isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }
        ]}
      />

      {/* Form Progress Indicator */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">Course Creation Progress</h3>
            <span className="text-xs text-blue-600">{getFormCompletionPercentage()}% Complete</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getFormCompletionPercentage()}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-blue-700">
            <div className="flex items-center gap-1">
              {formData.name && formData.description ? 
                <CheckCircle className="w-3 h-3 text-green-500" /> : 
                <AlertCircle className="w-3 h-3 text-amber-500" />
              }
              Basic Info
            </div>
            <div className="flex items-center gap-1">
              {formData.teachers.length > 0 && formData.startDate && formData.endDate ? 
                <CheckCircle className="w-3 h-3 text-green-500" /> : 
                <AlertCircle className="w-3 h-3 text-amber-500" />
              }
              Schedule & Staff
            </div>
            <div className="flex items-center gap-1">
              {(formData.syllabus || syllabusFile || syllabusUrl) ? 
                <CheckCircle className="w-3 h-3 text-green-500" /> : 
                <AlertCircle className="w-3 h-3 text-amber-500" />
              }
              Content
            </div>
          </div>
        </div>
      </Card>

      <div className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Image */}
            <Card className="overflow-hidden">
     
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Camera className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold">Course Visual Identity</h2>
                </div>
                <div className="flex flex-col lg:flex-row items-start gap-6">
                  <div className="relative group">
                    <div 
                      className="w-48 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-gradient-to-br hover:from-blue-100 hover:to-indigo-200 transition-all duration-300 group-hover:scale-105"
                      onClick={handleImageClick}
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={imagePreview} 
                            alt="Course preview" 
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all duration-300 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-sm font-medium text-gray-600">Click to upload image</p>
                          <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
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
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-blue-500" />
                        Image Guidelines
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Recommended: 400×200 pixels (2:1 ratio)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Formats: JPG, PNG, WebP</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Maximum size: 5MB</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleImageClick}
                          iconLeft={<Upload className="w-4 h-4" />}
                        >
                          {imagePreview ? 'Change Image' : 'Choose Image'}
                        </Button>
                        {imagePreview && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={removeImage}
                            iconLeft={<Trash2 className="w-4 h-4" />}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Basic Information */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                </div>
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
             FileText
             {/* Course Content */}
             <Card className="overflow-hidden">
               <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold"> Course Content & Materials</h2>
                </div>
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
                            iconLeft={<FileText className="w-4 h-4" />}
                          >
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
                              iconLeft={<Trash2 className="w-4 h-4" />}
                              className="text-red-600 hover:text-red-700"
                            >
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
                            iconLeft={<FileText className="w-4 h-4" />}
                          >
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
                              iconLeft={<Trash2 className="w-4 h-4" />}
                              className="text-red-600 hover:text-red-700"
                            >
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
                            iconLeft={<FileText className="w-4 h-4" />}
                          >
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
                              iconLeft={<Trash2 className="w-4 h-4" />}
                              className="text-red-600 hover:text-red-700"
                            >
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

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                  <h2 className="text-xl font-semibold">Set course availability</h2>
                </div>
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

            {/* Enhanced Course Preview */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                  <h2 className="text-xl font-semibold">Live Preview</h2>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-indigo-500 mt-0.5" />
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Course Name</span>
                      <p className="font-semibold text-gray-800">{formData.name || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Level</span>
                      <p className="font-semibold text-gray-800 capitalize">{formData.level || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Duration</span>
                      <p className="font-semibold text-gray-800">{formData.duration || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-purple-500 mt-0.5" />
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Teachers</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.teachers.length > 0 ? (
                          formData.teachers.map((teacher, index) => (
                            <span key={index} className="inline-flex px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              {teacher}
                            </span>
                          ))
                        ) : (
                          <p className="font-medium text-gray-400">Not assigned</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {formData.price && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Price</span>
                        <p className="font-semibold text-gray-800">{formData.price.toLocaleString()} VND</p>
                      </div>
                    </div>
                  )}
                  
                  {(formData.startDate || formData.endDate) && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-orange-500 mt-0.5" />
                      <div>
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Schedule</span>
                        <p className="font-semibold text-gray-800">
                          {formData.startDate && formData.endDate 
                            ? `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}`
                            : formData.startDate 
                            ? `Starts: ${new Date(formData.startDate).toLocaleDateString()}`
                            : formData.endDate 
                            ? `Ends: ${new Date(formData.endDate).toLocaleDateString()}`
                            : 'Not scheduled'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Status</span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        formData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {formData.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Content Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-gray-600">Syllabus:</span>
                        <span className="text-xs font-medium">
                          {syllabusFile ? `📎 ${syllabusFile.name}` : 
                           syllabusUrl ? `🔗 URL provided` :
                           formData.syllabus ? `${formData.syllabus.split('\n').length} weeks` : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-gray-600">Materials:</span>
                        <span className="text-xs font-medium">
                          {materialsFile ? `📎 ${materialsFile.name}` : 
                           materialsUrl ? `🔗 URL provided` :
                           formData.materials ? `${formData.materials.split('\n').length} items` : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-purple-500" />
                        <span className="text-xs text-gray-600">Assignments:</span>
                        <span className="text-xs font-medium">
                          {assignmentsFile ? `📎 ${assignmentsFile.name}` : 
                           assignmentsUrl ? `🔗 URL provided` :
                           formData.assignments ? `${formData.assignments.split('\n').length} tasks` : 'Not set'}
                        </span>
                      </div>
                    </div>
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
