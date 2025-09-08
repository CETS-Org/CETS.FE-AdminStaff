import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ChevronRight, Plus, Trash2, GraduationCap, ArrowLeft, Upload, User, Camera, Save } from "lucide-react";

interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: string;
  field: string;
}

interface Teacher {
  id?: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  hireDate: string;
  specialization: string;
  experience: string;
  status: "active" | "inactive";
  avatar?: string;
  qualifications: Qualification[];
}

const specializations = [
  "English Literature & Linguistics",
  "IELTS",
  "TOEIC", 
  "Kids English",
  "Business English",
  "Conversation",
  "Grammar",
  "Pronunciation",
  "Academic Writing",
  "Creative Writing"
];

const experienceOptions = [
  "1 year",
  "2 years", 
  "3 years",
  "4 years",
  "5 years",
  "6 years",
  "7 years",
  "8 years",
  "9 years",
  "10+ years"
];

const degreeOptions = [
  "Ph.D.",
  "M.A.",
  "M.S.",
  "B.A.",
  "B.S.",
  "Certificate",
  "Diploma"
];

export default function AddEditTeacherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    hireDate: "",
    specialization: "",
    experience: "",
    status: "active",
    avatar: "",
    qualifications: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit && id) {
      // Load teacher data for editing
      loadTeacherData(id);
    } else {
      // Set default values for new teacher
      setFormData({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        hireDate: new Date().toISOString().slice(0, 10),
        specialization: "",
        experience: "",
        status: "active",
        avatar: "",
        qualifications: []
      });
    }
  }, [id, isEdit]);

  const loadTeacherData = async (teacherId: string) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API
      const mockTeacher: Teacher = {
        id: teacherId,
        name: "Dr. Michael Smith",
        email: "michael.smith@email.com",
        phone: "+1 (555) 987-6543",
        dateOfBirth: "1980-06-20",
        hireDate: "2020-08-15",
        specialization: "English Literature & Linguistics",
        experience: "15 years",
        status: "active",
        qualifications: [
          {
            id: "1",
            degree: "Ph.D.",
            institution: "University of Oxford",
            year: "2015",
            field: "English Literature"
          },
          {
            id: "2",
            degree: "M.A.",
            institution: "Cambridge University",
            year: "2010",
            field: "Linguistics"
          }
        ]
      };

      setFormData({
        name: mockTeacher.name,
        email: mockTeacher.email,
        phone: mockTeacher.phone,
        dateOfBirth: mockTeacher.dateOfBirth,
        hireDate: mockTeacher.hireDate,
        specialization: mockTeacher.specialization,
        experience: mockTeacher.experience,
        status: mockTeacher.status,
        avatar: mockTeacher.avatar || "",
        qualifications: mockTeacher.qualifications
      });
    } catch (error) {
      console.error("Error loading teacher data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.hireDate) {
      newErrors.hireDate = "Hire date is required";
    }

    if (!formData.specialization) {
      newErrors.specialization = "Specialization is required";
    }

    if (!formData.experience) {
      newErrors.experience = "Experience is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof Omit<Teacher, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addQualification = () => {
    const newQualification: Qualification = {
      id: Date.now().toString(),
      degree: "",
      institution: "",
      year: "",
      field: ""
    };
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, newQualification]
    }));
  };

  const updateQualification = (id: string, field: keyof Qualification, value: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.map(qual =>
        qual.id === id ? { ...qual, [field]: value } : qual
      )
    }));
  };

  const removeQualification = (id: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(qual => qual.id !== id)
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call - replace with actual API
      console.log("Saving teacher:", formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to teachers list
      navigate("/teachers");
    } catch (error) {
      console.error("Error saving teacher:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: "Please select an image file" }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: "File size must be less than 5MB" }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar: result }));
        setErrors(prev => ({ ...prev, avatar: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setAvatarPreview("");
    setFormData(prev => ({ ...prev, avatar: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    navigate("/teachers");
  };

  if (isLoading && isEdit) {
    return (
      <div className="p-6 mx-auto w-full mt-16 lg:pl-70">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading teacher data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full mt-16 lg:pl-0">
      {/* Header with Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/teachers" className="hover:text-gray-900">Teachers</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">
              {isEdit ? "Edit Teacher" : "Add New Teacher"}
            </span>
          </div>
          <Button
            onClick={handleCancel}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Teachers
            </div>          
          </Button>
        </div>
      </div>

      <div className=" mx-auto">
        <Card title={isEdit ? "Edit Teacher Information" : "Add New Teacher"}>
          <div className="space-y-8">
            {/* Avatar Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Profile Photo</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div 
                    className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 cursor-pointer hover:border-primary-300 transition-colors"
                    onClick={handleAvatarClick}
                  >
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt="Current avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Upload Profile Photo</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload a professional photo. Supported formats: JPG, PNG, GIF. Max size: 5MB.
                    </p>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleAvatarClick}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Choose Photo
                      </Button>
                      {avatarPreview && (
                        <Button
                          onClick={removeAvatar}
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                    {errors.avatar && (
                      <p className="text-sm text-red-600 mt-2">{errors.avatar}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name *"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Phone *"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                />
                <Input
                  label="Date of Birth *"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  error={errors.dateOfBirth}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Hire Date *"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  error={errors.hireDate}
                />
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ]}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Specialization *"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  options={specializations.map(s => ({ label: s, value: s }))}
                  error={errors.specialization}
                />
                <Select
                  label="Experience *"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  options={experienceOptions.map(e => ({ label: e, value: e }))}
                  error={errors.experience}
                />
              </div>
            </div>

            {/* Qualifications */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Qualifications</h3>
                <Button
                  onClick={addQualification}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Qualification
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.qualifications.map((qual, index) => (
                  <div key={qual.id} className="p-6 border border-gray-200 rounded-lg space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Qualification {index + 1}</span>
                          <p className="text-sm text-gray-500">Academic background</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeQualification(qual.id)}
                        variant="secondary"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Degree"
                        value={qual.degree}
                        onChange={(e) => updateQualification(qual.id, 'degree', e.target.value)}
                        options={degreeOptions.map(d => ({ label: d, value: d }))}
                      />
                      <Input
                        label="Field of Study"
                        placeholder="e.g., English Literature"
                        value={qual.field}
                        onChange={(e) => updateQualification(qual.id, 'field', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Institution"
                        placeholder="e.g., University of Oxford"
                        value={qual.institution}
                        onChange={(e) => updateQualification(qual.id, 'institution', e.target.value)}
                      />
                      <Input
                        label="Year"
                        placeholder="e.g., 2015"
                        value={qual.year}
                        onChange={(e) => updateQualification(qual.id, 'year', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                
                {formData.qualifications.length === 0 && (
                  <div className="text-center py-16 text-gray-500 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No qualifications added yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Add your academic background and certifications</p>
                    <Button
                      onClick={addQualification}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Qualification
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-8 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-6">
              <div className="text-sm text-gray-500">
                {isEdit ? "Last updated: Today" : "All fields marked with * are required"}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="min-w-[140px]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isEdit ? "Updating..." : "Adding..."}
                    </div>
                  ) : (
                    <p className="flex items-center gap-2"><Save className="w-4 h-4" /> {isEdit ? "Update Teacher" : "Add Teacher"}</p> 
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
