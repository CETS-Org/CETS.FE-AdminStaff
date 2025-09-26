import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { 
  Plus, Trash2, GraduationCap, ArrowLeft, Upload, User, Camera, Save, 
  UserPlus, CheckCircle, AlertCircle, Loader2 
} from "lucide-react";
import { createTeacher, getTeacherById, getListCredentialType } from "@/api/teacher.api";
import type { AddTeacherProfile, CredentialTypeResponse } from "@/types/teacher.type";

interface CredentialFormData {
  id: string;
  credentialTypeId: string;
  pictureUrl: string | null;
  name: string | null;
  level: string | null;
}


interface TeacherFormData {
  email: string;
  phoneNumber: string;
  fullName: string;
  dateOfBirth: string;
  cid: string;
  address: string | null;
  avatarUrl: string | null;
  yearsExperience: number;
  bio: string | null;
  credentials: CredentialFormData[];
}


export default function AddEditTeacherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<TeacherFormData>({
    email: "",
    phoneNumber: "",
    fullName: "",
    dateOfBirth: "",
    cid: "",
    address: "",
    avatarUrl: "",
    yearsExperience: 0,
    bio: "",
    credentials: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [credentialTypes, setCredentialTypes] = useState<CredentialTypeResponse[]>([]);
  const [completedSteps] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 1, title: "Profile Photo", description: "Upload teacher's photo" },
    { id: 2, title: "Basic Information", description: "Personal details" },
    { id: 3, title: "Professional Info", description: "Experience & bio" },
    { id: 4, title: "Credentials", description: "Certificates & qualifications" }
  ];

  // Fetch credential types when component mounts
  useEffect(() => {
    const fetchCredentialTypes = async () => {
      try {
        const types = await getListCredentialType();
        setCredentialTypes(types);
      } catch (error) {
        console.error('Error fetching credential types:', error);
      }
    };

    fetchCredentialTypes();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      // Load teacher data for editing
      loadTeacherData(id);
    } else {
      // Set default values for new teacher
      setFormData({
        email: "",
        phoneNumber: "",
        fullName: "",
        dateOfBirth: "",
        cid: "",
        address: "",
        avatarUrl: "",
        yearsExperience: 0,
        bio: "",
        credentials: []
      });
    }
  }, [id, isEdit]);

  const loadTeacherData = async (teacherId: string) => {
    setIsLoading(true);
    try {
      const teacher = await getTeacherById(teacherId);
      
      setFormData({
        email: teacher.email || "",
        phoneNumber: teacher.phoneNumber || "",
        fullName: teacher.fullName || "",
        dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.split('T')[0] : "",
        cid: teacher.cid || "",
        address: teacher.address || "",
        avatarUrl: teacher.avatarUrl || "",
        yearsExperience: teacher.teacherInfo?.yearsExperience || 0,
        bio: teacher.teacherInfo?.bio || "",
        credentials: teacher.teacherInfo?.teacherCredentials?.map(cred => ({
          id: cred.credentialId,
          credentialTypeId: cred.credentialTypeId,
          pictureUrl: cred.pictureUrl,
          name: cred.name,
          level: cred.level
        })) || []
      });
      
      if (teacher.avatarUrl) {
        setAvatarPreview(teacher.avatarUrl);
      }
    } catch (error) {
      console.error("Error loading teacher data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.cid.trim()) {
      newErrors.cid = "CID is required";
    }

    if (formData.yearsExperience < 0) {
      newErrors.yearsExperience = "Years of experience must be a positive number";
    }

    // Validate credentials
    formData.credentials.forEach((cred, index) => {
      if (!cred.credentialTypeId) {
        newErrors[`credential_${index}_type`] = "Credential type is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TeacherFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addCredential = () => {
    const newCredential: CredentialFormData = {
      id: Date.now().toString(),
      credentialTypeId: "",
      pictureUrl: null,
      name: "",
      level: ""
    };
    setFormData(prev => ({
      ...prev,
      credentials: [...prev.credentials, newCredential]
    }));
  };

  const updateCredential = (id: string, field: keyof CredentialFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      credentials: prev.credentials.map(cred =>
        cred.id === id ? { ...cred, [field]: value } : cred
      )
    }));
  };

  const removeCredential = (id: string) => {
    setFormData(prev => ({
      ...prev,
      credentials: prev.credentials.filter(cred => cred.id !== id)
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const teacherData: AddTeacherProfile = {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        cid: formData.cid,
        address: formData.address,
        avatarUrl: formData.avatarUrl,
        yearsExperience: formData.yearsExperience,
        bio: formData.bio,
        credentials: formData.credentials.filter(cred => cred.credentialTypeId).map(cred => ({
          credentialTypeId: cred.credentialTypeId,
          pictureUrl: cred.pictureUrl,
          name: cred.name,
          level: cred.level
        }))
      };
      
      await createTeacher(teacherData);
      
      // Navigate back to teachers list
      navigate("admin/teachers");
    } catch (error) {
      console.error("Error saving teacher:", error);
      // You can add more specific error handling here
      setErrors({ submit: "Failed to save teacher. Please try again." });
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
        setFormData(prev => ({ ...prev, avatarUrl: result }));
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
    setFormData(prev => ({ ...prev, avatarUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    navigate("/admin/teachers");
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

  const breadcrumbItems = [
    { label: "Teachers", to: "/admin/teachers" },
    { label: isEdit ? "Edit Teacher" : "Add New Teacher" }
  ];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Header */}
      <PageHeader
        title={isEdit ? "Edit Teacher" : "Add New Teacher"}
        description={isEdit ? "Update teacher information and credentials" : "Create a new teacher profile with all necessary details"}
        icon={isEdit ? <User className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'Back to Teachers',
            variant: 'secondary',
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: handleCancel
          }
        ]}
      />

      {/* Progress Steps */}
      {!isEdit && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                    completedSteps.includes(step.id) 
                      ? 'bg-green-500 text-white' 
                      : step.id === 1
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`font-medium text-sm ${step.id === 1 ? 'text-primary-600' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form Content */}
        <div className="xl:col-span-2 space-y-8">
          {/* Avatar Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
              {!isEdit && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Step 1</span>}
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-2xl border-4 border-dashed border-gray-200 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer hover:border-primary-300 hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 transition-all duration-300 group"
                  onClick={handleAvatarClick}
                >
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : formData.avatarUrl ? (
                    <img 
                      src={formData.avatarUrl} 
                      alt="Current avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400 group-hover:text-primary-400 transition-colors" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Upload Professional Photo</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose a high-quality, professional headshot. This will be visible to students and staff.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleAvatarClick}
                      variant="secondary"
                      size="sm"
                      iconLeft={<Upload className="w-4 h-4" />} 
                    >
                      Choose Photo
                    </Button>
                    {avatarPreview && (
                      <Button
                        onClick={removeAvatar}
                        variant="secondary"
                        size="sm"
                        iconLeft={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF • Max 5MB</p>
                  {errors.avatar && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errors.avatar}
                    </div>
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              {!isEdit && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Step 2</span>}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name *"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  error={errors.fullName}
                />
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="teacher@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Phone Number *"
                  placeholder="0912345678"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  error={errors.phoneNumber}
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
                  label="Citizen ID (CID) *"
                  placeholder="Enter citizen ID number"
                  value={formData.cid}
                  onChange={(e) => handleInputChange('cid', e.target.value)}
                  error={errors.cid}
                />
                <Input
                  label="Home Address"
                  placeholder="Enter home address"
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
              {!isEdit && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Step 3</span>}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Years of Experience *"
                  type="number"
                  placeholder="5"
                  value={formData.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
                  error={errors.yearsExperience}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Professional Bio
                </label>
                <textarea
                  placeholder="Brief description of teaching experience, specializations, and achievements..."
                  value={formData.bio || ""}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Credentials & Qualifications</h3>
                {!isEdit && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Step 4</span>}
              </div>
              <Button
                onClick={addCredential}
                variant="secondary"
                iconLeft={<Plus className="w-4 h-4" />}
              >
                Add Credential
              </Button>
            </div>
            
            <div className="space-y-4">
                {formData.credentials.map((cred, index) => {
                  const credentialType = credentialTypes.find(type => type.id === cred.credentialTypeId);
                  const isCertificate = credentialType?.name === 'Certificate';
                  const bgColor = isCertificate ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
                  const iconBg = isCertificate ? 'bg-blue-100' : 'bg-green-100';
                  const iconColor = isCertificate ? 'text-blue-600' : 'text-green-600';
                  const IconComponent = isCertificate ? GraduationCap : GraduationCap; // You can use different icons
                  
                  return (
                    <div key={cred.id} className={`p-6 border rounded-lg space-y-4 ${bgColor} shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
                            <IconComponent className={`w-5 h-5 ${iconColor}`} />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              {credentialType?.name || 'Credential'} {index + 1}
                            </span>
                            <p className="text-sm text-gray-500">
                              {credentialType?.name || 'Professional credential'}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeCredential(cred.id)}
                          variant="secondary"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Select
                          label="Credential Type *"
                          value={cred.credentialTypeId}
                          onChange={(e) => updateCredential(cred.id, 'credentialTypeId', e.target.value)}
                          options={credentialTypes.map(type => ({ label: type.name, value: type.id }))}
                        />
                        {errors[`credential_${index}_type`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`credential_${index}_type`]}</p>
                        )}
                      </div>
                      <Input
                        label="Name"
                        placeholder="e.g., IELTS Certificate"
                        value={cred.name || ""}
                        onChange={(e) => updateCredential(cred.id, 'name', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Level"
                        placeholder="e.g., Advanced"
                        value={cred.level || ""}
                        onChange={(e) => updateCredential(cred.id, 'level', e.target.value)}
                      />
                      <Input
                        label="Picture URL"
                        placeholder="e.g., https://example.com/certificate.jpg"
                        value={cred.pictureUrl || ""}
                        onChange={(e) => updateCredential(cred.id, 'pictureUrl', e.target.value)}
                      />
                    </div>
                  </div>
                  );
                })}
                
              {formData.credentials.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-dashed border-amber-200">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No credentials added yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Add professional certificates, degrees, and qualifications</p>
                  <Button
                    onClick={addCredential}
                    variant="secondary"
                    iconLeft={<Plus className="w-4 h-4" />}
                  >
                    Add First Credential
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Profile Photo</span>
                <div className="flex items-center gap-2">
                  {formData.avatarUrl || avatarPreview ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Added</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Optional</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Basic Info</span>
                <div className="flex items-center gap-2">
                  {formData.fullName && formData.email && formData.phoneNumber && formData.dateOfBirth && formData.cid ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Complete</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-500">Required</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Professional Info</span>
                <div className="flex items-center gap-2">
                  {formData.yearsExperience >= 0 ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Complete</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-500">Required</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Credentials</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{formData.credentials.length} added</span>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.submit}
                </div>
              </div>
            )}
          </div>
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
                  {isEdit ? "Update Teacher" : "Create Teacher"}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
