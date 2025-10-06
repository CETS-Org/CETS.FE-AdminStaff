import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import { 
  ArrowLeft, Upload, User, Camera, Save, 
  CheckCircle, AlertCircle, Loader2, GraduationCap, Edit, 
  Trash2
} from "lucide-react";
import { getStudentById, updateStudent } from "@/api/student.api";
import type { Student, UpdateStudent } from "@/types/student.type";

interface StudentFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  cid: string;
  address: string | null;
  avatarUrl: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  school: string | null;
  academicNote: string | null;
}

export default function EditStudentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<StudentFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    cid: "",
    address: "",
    avatarUrl: "",
    guardianName: "",
    guardianPhone: "",
    school: "",
    academicNote: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [student, setStudent] = useState<Student | null>(null);
  const [completedSteps] = useState<number[]>([1, 2, 3]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmUpdateOpen, setIsConfirmUpdateOpen] = useState(false);

  const steps = [
    { id: 1, title: "Profile Photo", description: "Update student's photo" },
    { id: 2, title: "Basic Information", description: "Personal details" },
    { id: 3, title: "Guardian Information", description: "Guardian & academic info" }
  ];

  // Fetch student data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsInitialLoading(true);
        
        if (id) {
          const studentData = await getStudentById(id);
          setStudent(studentData);
          
          setFormData({
            fullName: studentData.fullName || "",
            email: studentData.email || "",
            phoneNumber: studentData.phoneNumber || "",
            dateOfBirth: studentData.dateOfBirth ? studentData.dateOfBirth.split('T')[0] : "",
            cid: studentData.cid || "",
            address: studentData.address || "",
            avatarUrl: studentData.avatarUrl || "",
            guardianName: studentData.studentInfo?.guardianName || "",
            guardianPhone: studentData.studentInfo?.guardianPhone || "",
            school: studentData.studentInfo?.school || "",
            academicNote: studentData.studentInfo?.academicNote || ""
          });
          
          if (studentData.avatarUrl) {
            setAvatarPreview(studentData.avatarUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        setErrors({ submit: "Failed to load student data. Please try again." });
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    // keep strings in form state; convert to null only in payload
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
        setFormData(prev => ({ ...prev, avatarUrl: result }));
        // Clear avatar error
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.avatar;
          return newErrors;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setAvatarPreview("");
    setFormData(prev => ({ ...prev, avatarUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Required phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
        newErrors.phoneNumber = "Phone number must start with 0 and have 10 digits";
      }
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      }
    }

    // Required CID validation
    if (!formData.cid.trim()) {
      newErrors.cid = "CID is required";
    } else {
      const cidRegex = /^[0-9]{9,12}$/;
      if (!cidRegex.test(formData.cid.trim())) {
        newErrors.cid = "CID must be 9-12 digits";
      }
    }

    // Validate address if provided
    if (formData.address && formData.address.trim().length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    // Validate guardian phone format if provided
    if (formData.guardianPhone && formData.guardianPhone.trim()) {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(formData.guardianPhone.replace(/\s/g, ''))) {
        newErrors.guardianPhone = "Guardian phone must start with 0 and have 10 digits";
      }
    }

    // Validate academic note if provided
    if (formData.academicNote && formData.academicNote.trim().length < 10) {
      newErrors.academicNote = "Academic note must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const performUpdate = async () => {
    if (!validateForm() || !id) {
      return;
    }

    try {
      setIsLoading(true);
      
      const updateData: UpdateStudent = {
        accountID: id,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || null,
        cid: formData.cid || null,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth || null,
        avatarUrl: formData.avatarUrl,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        school: formData.school,
        academicNote: formData.academicNote
      };

      await updateStudent(id, updateData);
      // Optimistic preloaded data to avoid waiting for refetch
      const preloadedStudent: any = {
        ...(student || {}),
        fullName: updateData.fullName ?? student?.fullName,
        email: updateData.email ?? student?.email,
        phoneNumber: updateData.phoneNumber ?? student?.phoneNumber,
        cid: updateData.cid ?? student?.cid,
        address: updateData.address ?? student?.address,
        dateOfBirth: updateData.dateOfBirth ?? student?.dateOfBirth,
        avatarUrl: updateData.avatarUrl ?? student?.avatarUrl,
        studentInfo: {
          ...(student?.studentInfo || {}),
          guardianName: updateData.guardianName ?? student?.studentInfo?.guardianName,
          guardianPhone: updateData.guardianPhone ?? student?.studentInfo?.guardianPhone,
          school: updateData.school ?? student?.studentInfo?.school,
          academicNote: updateData.academicNote ?? student?.studentInfo?.academicNote,
        }
      };
      navigate(`/admin/students/${id}`, { 
        state: { updateStatus: "success", preloadedStudent }
      });
    } catch (error) {
      console.error("Error updating student:", error);
      setErrors({ submit: "Failed to update student. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    setIsConfirmUpdateOpen(true);
  };

  if (isInitialLoading) {
    return (
      <div className="p-6 mx-auto mt-16 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 mx-auto mt-16 max-w-6xl">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Student Not Found</h3>
          <p className="text-gray-500 mb-4">The student you're looking for doesn't exist or has been removed.</p>
          <Button
            onClick={() => navigate("/admin/students")}
            variant="secondary"
          >
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Students", to: "/admin/students" },
    { label: student.fullName, to: `/admin/students/${id}` },
    { label: "Edit Student" }
  ];

  return (
    <div className="p-6 mx-auto mt-16 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs items={breadcrumbItems} />
          <PageHeader
            title={`Edit Student Profile`}
            description="Update student profile information"
            icon={<Edit className="w-5 h-5 text-white" />}
            controls={[
              {
                type: 'button',
                label: 'Back to Profile',
                variant: 'secondary',
                icon: <ArrowLeft className="w-4 h-4" />,
                onClick:() => navigate(`/admin/students/${id}`)
              }
            ]}
          />
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                  completedSteps.includes(step.id) 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="w-16 h-px bg-gray-300 mx-4 mt-[-20px]"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Step 1: Profile Photo */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Camera className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
                <p className="text-sm text-gray-500">Update the student's profile photo</p>
              </div>
            </div>
            
            <div className="flex items-start gap-8">
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 cursor-pointer hover:border-primary-300 transition-all duration-200 group"
                  onClick={handleAvatarClick}
                >
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Student avatar preview" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Upload Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Supported formats: JPG, PNG, GIF</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Recommended: Square aspect ratio</li>
                  </ul>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleAvatarClick}
                    variant="secondary"
                    className="flex items-center gap-2"
                    iconLeft={<Upload className="w-4 h-4" />}
                  >
                    Change Photo
                  </Button>
                  {avatarPreview && (
                    <Button
                      onClick={removeAvatar}
                      className="flex items-center gap-2 bg-red-500 text-red-600 hover:text-red-700 hover:bg-red-50"
                      iconLeft={<Trash2 className="w-4 h-4" />}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {errors.avatar && (
                  <div className="text-red-500 text-sm">{errors.avatar}</div>
                )}
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

          {/* Step 2: Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                <p className="text-sm text-gray-500">Personal details and contact information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Full Name *"
                  placeholder="Enter student's full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  error={errors.fullName}
                  required
                />
              </div>
              <div>
                <Input
                  label="Date of Birth *"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  error={errors.dateOfBirth}
                />
              </div>
              <div>
                <Input
                  label="Citizen ID (CID) *"
                  placeholder="Enter citizen ID"
                  value={formData.cid}
                  onChange={(e) => handleInputChange("cid", e.target.value)}
                  error={errors.cid}
                />
              </div>
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div>
                <Input
                  label="Address"
                  placeholder="Enter home address"
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  error={errors.address}
                />
              </div>
               <div>
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={errors.email}
                  required
                />
              </div> 
              <div>
                <Input
                  label="Phone Number *"
                  placeholder="0123456789"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  error={errors.phoneNumber}
                />
              </div> 
            </div>
          </div>

          {/* Step 3: Guardian Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Guardian & Academic Information</h3>
                <p className="text-sm text-gray-500">Guardian contact details and academic background</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Guardian Name"
                  placeholder="Enter guardian's name"
                  value={formData.guardianName || ""}
                  onChange={(e) => handleInputChange("guardianName", e.target.value)}
                  error={errors.guardianName}
                />
              </div>
              <div>
                <Input
                  label="Guardian Phone"
                  placeholder="0123456789"
                  value={formData.guardianPhone || ""}
                  onChange={(e) => handleInputChange("guardianPhone", e.target.value)}
                  error={errors.guardianPhone}
                />
              </div>
              <div>
                <Input
                  label="School"
                  placeholder="Enter current/previous school"
                  value={formData.school || ""}
                  onChange={(e) => handleInputChange("school", e.target.value)}
                  error={errors.school}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Academic Note
              </label>
              <textarea
                placeholder="Enter any additional academic information or notes..."
                value={formData.academicNote || ""}
                onChange={(e) => handleInputChange("academicNote", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              {errors.academicNote && (
                <div className="text-red-500 text-sm mt-1">{errors.academicNote}</div>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="text-red-800 text-sm">{errors.submit}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="text-red-500">*</span> Required fields
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate(`/admin/students/${id}`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="min-w-[140px]"
              iconLeft={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            >
              {isLoading ? "Updating..." : "Update Student"}
            </Button>
          </div>
        </div>
      </div>
      {/* Confirm Update Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmUpdateOpen}
        onClose={() => setIsConfirmUpdateOpen(false)}
        onConfirm={() => {
          setIsConfirmUpdateOpen(false);
          void performUpdate();
        }}
        title="Confirm Update"
        message="Do you want to update this student?"
        confirmText="Yes, update"
        cancelText="No, cancel"
        type="warning"
      />
    </div>
  );
}
