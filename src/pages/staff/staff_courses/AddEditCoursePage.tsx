import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ArrowLeft, Save, Plus, Edit, Upload, FileText, BookOpen, Image as ImageIcon } from "lucide-react";

type Course = {
  id: number;
  name: string;
  level: string;
  duration: string;
  price: number;
  maxStudents: number;
  currentStudents: number;
  status: "active" | "inactive" | "full";
  description?: string;
  image?: string;
  syllabus?: string;
};

export default function AddEditCoursePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    level: "",
    duration: "",
    price: "",
    maxStudents: "",
    currentStudents: "",
    status: "active" as "active" | "inactive" | "full",
    description: "",
    image: "",
    syllabus: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Mock data for editing
  useEffect(() => {
    if (isEditMode && id) {
      // Simulate loading course data
      setLoading(true);
      setTimeout(() => {
        const mockCourse: Course = {
          id: parseInt(id),
          name: "IELTS Foundation",
          level: "A1-B1",
          duration: "6 months",
          price: 12000000,
          maxStudents: 20,
          currentStudents: 15,
          status: "active",
          description: "Basic IELTS preparation course for beginners",
          image: "https://via.placeholder.com/300x150?text=IELTS",
          syllabus: "Week 1-4: Reading Skills\nWeek 5-8: Writing Skills\nWeek 9-12: Listening Skills\nWeek 13-16: Speaking Skills"
        };

        setFormData({
          name: mockCourse.name,
          level: mockCourse.level,
          duration: mockCourse.duration,
          price: mockCourse.price.toString(),
          maxStudents: mockCourse.maxStudents.toString(),
          currentStudents: mockCourse.currentStudents.toString(),
          status: mockCourse.status,
          description: mockCourse.description || "",
          image: mockCourse.image || "",
          syllabus: mockCourse.syllabus || ""
        });
        setLoading(false);
      }, 1000);
    }
  }, [id, isEditMode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Course name is required";
    }

    if (!formData.level) {
      newErrors.level = "Level is required";
    }

    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    if (!formData.price || parseInt(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.maxStudents || parseInt(formData.maxStudents) <= 0) {
      newErrors.maxStudents = "Valid max students is required";
    }

    if (!formData.currentStudents || parseInt(formData.currentStudents) < 0) {
      newErrors.currentStudents = "Valid current students is required";
    }

    if (parseInt(formData.currentStudents) > parseInt(formData.maxStudents)) {
      newErrors.currentStudents = "Current students cannot exceed max students";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const courseData = {
        name: formData.name,
        level: formData.level,
        duration: formData.duration,
        price: parseInt(formData.price),
        maxStudents: parseInt(formData.maxStudents),
        currentStudents: parseInt(formData.currentStudents),
        status: formData.status,
        description: formData.description || undefined,
        image: formData.image || undefined,
        syllabus: formData.syllabus || undefined
      };

      console.log("Saving course:", courseData);
      
      // In real app, this would be an API call
      alert(isEditMode ? "Course updated successfully!" : "Course created successfully!");
      
      setLoading(false);
      navigate("/staff/courses");
    }, 1500);
  };

  const handleCancel = () => {
    navigate("/staff/courses");
  };

  const handleImportSyllabus = () => {
    // Mock file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Mock reading file content
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setFormData(prev => ({ ...prev, syllabus: content }));
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const levelOptions = [
    { label: "Beginner", value: "Beginner" },
    { label: "A1", value: "A1" },
    { label: "A2", value: "A2" },
    { label: "B1", value: "B1" },
    { label: "B2", value: "B2" },
    { label: "C1", value: "C1" },
    { label: "C2", value: "C2" },
    { label: "A1-B1", value: "A1-B1" },
    { label: "B2-C1", value: "B2-C1" },
    { label: "All levels", value: "All levels" }
  ];

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Full", value: "full" }
  ];

  if (loading && isEditMode) {
    return (
      <div className="p-6 mx-auto mt-16 lg:pl-70">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto mt-16 lg:pl-70">
      {/* Header */}
      <div className="mb-8">
        <div className="flex  gap-4 mb-6">
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Button>
        </div>
        <div className="">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {isEditMode ? "Edit Course" : "Add New Course"}
          </h1>
          <p className="text-lg text-gray-600  ">
            {isEditMode ? "Update course information and content" : "Create a comprehensive course for students with detailed information"}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            <Card title="Basic Information" className="h-fit">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Course Name *"
                    placeholder="Enter course name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                  />
                  <Select
                    label="Level *"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    options={levelOptions}
                    error={errors.level}
                  />
                  <Input
                    label="Duration *"
                    placeholder="e.g., 6 months, 12 weeks"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    error={errors.duration}
                  />
                  <Input
                    label="Price (VND) *"
                    type="number"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    error={errors.price}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Maximum Students *"
                    type="number"
                    placeholder="Enter max students"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    error={errors.maxStudents}
                  />
                  <Input
                    label="Current Students *"
                    type="number"
                    placeholder="Enter current students"
                    value={formData.currentStudents}
                    onChange={(e) => setFormData({ ...formData, currentStudents: e.target.value })}
                    error={errors.currentStudents}
                  />
                </div>

                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "full" })}
                  options={statusOptions}
                />
              </div>
            </Card>

            <Card title="Course Description" className="h-fit">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter detailed course description..."
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Content & Media */}
          <div className="space-y-6">
            <Card title="Course Syllabus" className="h-fit">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Syllabus Content</span>
                  </div>
                  <Button
                    onClick={handleImportSyllabus}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Import File
                  </Button>
                </div>
                <div>
                  <textarea
                    value={formData.syllabus}
                    onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                    className="w-full p-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={8}
                    placeholder="Enter course syllabus content or import from file..."
                  />
                </div>
                <div className="text-sm text-gray-500">
                  <p>Supported formats: PDF, DOC, DOCX, TXT</p>
                </div>
              </div>
            </Card>

            <Card title="Course Media" className="h-fit">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Course Image</span>
                </div>
                <Input
                  label="Image URL"
                  placeholder="Enter image URL"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
                
                {formData.image && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-neutral-700 mb-2">Preview</h4>
                    <div className="border rounded-lg overflow-hidden max-w-md">
                      <img
                        src={formData.image}
                        alt="Course preview"
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/300x150?text=Image+Not+Found";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-8 border-t mt-8">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
            size="lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2"
            size="lg"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : (isEditMode ? "Update Course" : "Create Course")}
          </Button>
        </div>
      </div>
    </div>
  );
}
