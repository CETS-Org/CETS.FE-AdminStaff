import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { 
  Plus, Trash2, GraduationCap, ArrowLeft, Upload, User, Camera, Save, 
  UserPlus, CheckCircle, AlertCircle, Loader2, Eye, X
} from "lucide-react";
import { createTeacher, getTeacherById, getListCredentialType } from "@/api/teacher.api";
import { api } from "@/api/api";
import type { AddTeacherProfile, CredentialTypeResponse } from "@/types/teacher.type";

interface CredentialFormData {
  id: string;
  credentialTypeId: string;
  pictureUrl: string | null;
  name: string | null;
  level: string | null;
  imageFile?: File; // Store file object for later upload
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
  const [viewingImage, setViewingImage] = useState<{ url: string; name: string } | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
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

    // Validate required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      // Validate date is not in the future
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      } else {
        // Validate age is at least 18
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        
        // Calculate exact age considering month and day
        const exactAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
        
        if (exactAge < 18) {
          newErrors.dateOfBirth = "Teacher must be at least 18 years old";
        }
      }
    }

    // Validate email
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email";
      }
    }

    // Validate phone (required)
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
        newErrors.phoneNumber = "Phone number must start with 0 and have 10 digits";
      }
    }

    if (formData.yearsExperience < 0) {
      newErrors.yearsExperience = "Years of experience must be a positive number";
    } else if (formData.yearsExperience > 50) {
      newErrors.yearsExperience = "Years of experience seems unrealistic (max 50)";
    }

    // Validate CID (required)
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

    // Validate credentials
    formData.credentials.forEach((cred, index) => {
      if (!cred.credentialTypeId) {
        newErrors[`credential_${index}_type`] = "Credential type is required";
      }
      if (!cred.name || !cred.name.trim()) {
        newErrors[`credential_${index}_name`] = "Credential name is required";
      } else if (cred.name.trim().length < 2) {
        newErrors[`credential_${index}_name`] = "Credential name must be at least 2 characters";
      }
      if (!cred.level || !cred.level.trim()) {
        newErrors[`credential_${index}_level`] = "Credential level is required";
      } else if (cred.level.trim().length < 2) {
        newErrors[`credential_${index}_level`] = "Credential level must be at least 2 characters";
      }
      // Removed URL validation - allow any pictureUrl format
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    // Calculate exact age considering month and day
    return monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
  };

  const handleInputChange = (field: keyof TeacherFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear existing error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Real-time validation
    const newErrors: Record<string, string> = {};
    
    if (field === 'fullName' && typeof value === 'string') {
      if (!value.trim()) {
        newErrors.fullName = "Full name is required";
      } else if (value.trim().length < 2) {
        newErrors.fullName = "Full name must be at least 2 characters";
      }
    }
    
    if (field === 'email' && typeof value === 'string') {
      if (!value.trim()) {
        newErrors.email = "Email is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          newErrors.email = "Please enter a valid email";
        }
      }
    }
    
    if (field === 'phoneNumber' && typeof value === 'string') {
      if (!value.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      } else {
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          newErrors.phoneNumber = "Phone number must start with 0 and have 10 digits";
        }
      }
    }
    
    if (field === 'dateOfBirth' && typeof value === 'string') {
      if (!value) {
        newErrors.dateOfBirth = "Date of birth is required";
      } else {
        const birthDate = new Date(value);
        const today = new Date();
        
        // Check if date is in the future
        if (birthDate > today) {
          newErrors.dateOfBirth = "Date of birth cannot be in the future";
        } else {
          // Check age requirement
          const age = calculateAge(value);
          if (age < 18) {
            newErrors.dateOfBirth = "Teacher must be at least 18 years old";
          }
        }
      }
    }
    
    if (field === 'cid' && typeof value === 'string') {
      if (!value.trim()) {
        newErrors.cid = "CID is required";
      } else {
        const cidRegex = /^[0-9]{9,12}$/;
        if (!cidRegex.test(value.trim())) {
          newErrors.cid = "CID must be 9-12 digits";
        }
      }
    }
    
    if (field === 'address' && typeof value === 'string') {
      if (value && value.trim().length < 5) {
        newErrors.address = "Address must be at least 5 characters";
      }
    }
    
    if (field === 'yearsExperience' && typeof value === 'number') {
      if (value < 0) {
        newErrors.yearsExperience = "Years of experience must be a positive number";
      } else if (value > 50) {
        newErrors.yearsExperience = "Years of experience seems unrealistic (max 50)";
      }
    }
    
    // Update errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
  };

  const addCredential = () => {
    // Find certificate type ID to set as default
    const certificateType = credentialTypes.find(type => type.name === 'Certificate');
    const defaultCredentialTypeId = certificateType?.id || "";
    
    const newCredential: CredentialFormData = {
      id: Date.now().toString(),
      credentialTypeId: defaultCredentialTypeId,
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
    console.log(`Updating credential ${id}, field: ${field}, value length: ${value?.length}, value preview: ${value?.substring(0, 50)}`);
    setFormData(prev => {
      const updatedCredentials = prev.credentials.map(cred => {
        if (cred.id === id) {
          const updated = { ...cred, [field]: value };
          console.log('Updated credential:', { id, field, newValue: updated[field] });
          return updated;
        }
        return cred;
      });
      
      // Clear error for this credential field when user starts typing
      const credentialIndex = prev.credentials.findIndex(cred => cred.id === id);
      if (credentialIndex !== -1) {
        const errorKey = `credential_${credentialIndex}_${field}`;
        if (errors[errorKey]) {
          setErrors(prevErrors => ({ ...prevErrors, [errorKey]: "" }));
        }
        
        // Real-time validation for credential fields
        const newErrors: Record<string, string> = {};
        const updatedCred = updatedCredentials[credentialIndex];
        
        if (field === 'credentialTypeId') {
          if (!value) {
            newErrors[`credential_${credentialIndex}_type`] = "Credential type is required";
          }
        }
        
        if (field === 'name') {
          if (!value.trim()) {
            newErrors[`credential_${credentialIndex}_name`] = "Credential name is required";
          } else if (value.trim().length < 2) {
            newErrors[`credential_${credentialIndex}_name`] = "Credential name must be at least 2 characters";
          }
        }
        
        if (field === 'level') {
          if (!value.trim()) {
            newErrors[`credential_${credentialIndex}_level`] = "Credential level is required";
          }
        }
        
        // Update errors
        if (Object.keys(newErrors).length > 0) {
          setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
        }
      }
      
      const newFormData = {
        ...prev,
        credentials: updatedCredentials
      };
      console.log('FormData updated, credentials count:', newFormData.credentials.length);
      console.log('Credential with updated field:', newFormData.credentials.find(c => c.id === id));
      
      return newFormData;
    });
  };
  
  const handleCredentialImageUpload = async (credentialId: string, file: File): Promise<string> => {
    try {
      // Get presigned URL for upload
      const fileName = `credential-${Date.now()}-${file.name}`;
      const response = await api.post<{ uploadUrl: string; filePath: string }>(
        '/api/RPT_Report/image-upload-url',
        {
          fileName,
          contentType: file.type
        }
      );
      
      console.log('📤 Upload response received:', response.data);
      
      // Upload file to presigned URL
      const uploadResponse = await fetch(response.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      // Use filePath as the public URL
      const publicUrl = response.data.filePath;
      
      console.log('✅ Upload completed. Received cloud URL:', publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error('❌ Error uploading credential image:', error);
      throw error;
    }
  };

  const removeCredential = (id: string) => {
    setFormData(prev => {
      const credentialIndex = prev.credentials.findIndex(cred => cred.id === id);
      const updatedCredentials = prev.credentials.filter(cred => cred.id !== id);
      
      // Clear errors for the removed credential
      if (credentialIndex !== -1) {
        const errorsToRemove: Record<string, string> = {};
        ['type', 'name', 'level', 'pictureUrl'].forEach(field => {
          const errorKey = `credential_${credentialIndex}_${field}`;
          if (errors[errorKey]) {
            errorsToRemove[errorKey] = "";
          }
        });
        
        if (Object.keys(errorsToRemove).length > 0) {
          setErrors(prevErrors => ({ ...prevErrors, ...errorsToRemove }));
        }
      }
      
      return {
        ...prev,
        credentials: updatedCredentials
      };
    });
  };

  const uploadCredentialImages = async (): Promise<CredentialFormData[]> => {
    const credentialsWithFiles = formData.credentials.filter(cred => cred.imageFile);
    
    if (credentialsWithFiles.length === 0) {
      // No images to upload, return credentials as is
      return formData.credentials;
    }

    setUploadingImages(true);
    
    try {
      // Upload all credential images and collect updated credentials
      const updatedCredentials = await Promise.all(
        formData.credentials.map(async (cred) => {
          if (cred.imageFile) {
            console.log(`📤 Uploading image for credential ${cred.id}...`);
            const publicUrl = await handleCredentialImageUpload(cred.id, cred.imageFile);
            console.log(`✅ Image uploaded for credential ${cred.id}, received URL:`, publicUrl);
            
            // Return credential with cloud URL
            return {
              ...cred,
              pictureUrl: publicUrl,
              imageFile: undefined
            };
          }
          // Return credential as is if no file to upload
          return cred;
        })
      );
      
      // Update formData with credentials that have cloud URLs
      setFormData(prev => ({
        ...prev,
        credentials: updatedCredentials
      }));
      
      console.log('📋 Updated credentials with cloud URLs:', updatedCredentials);
      
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return updatedCredentials;
      
    } catch (error) {
      console.error('❌ Error uploading credential images:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Upload all credential images to cloud and get URLs
      console.log('📤 Step 1: Uploading credential images to cloud...');
      const credentialsWithCloudUrls = await uploadCredentialImages();
      
      console.log('✅ Step 1 completed. Credentials with cloud URLs:', credentialsWithCloudUrls);
      
      // Step 2: Create teacher with credentials that have cloud URLs attached to pictureUrl
      console.log('👤 Step 2: Creating teacher with cloud URLs...');
      const teacherData: AddTeacherProfile = {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        cid: formData.cid, // CID will be hashed in backend
        address: formData.address,
        avatarUrl: formData.avatarUrl,
        yearsExperience: formData.yearsExperience,
        bio: formData.bio,
        credentials: credentialsWithCloudUrls
          .filter(cred => cred.credentialTypeId)
          .map(cred => ({
            credentialTypeId: cred.credentialTypeId,
            pictureUrl: cred.pictureUrl, // Cloud URL đã được gắn vào field pictureUrl
            name: cred.name,
            level: cred.level
          }))
      };
      
      console.log('📋 Creating teacher with data:', teacherData);
      console.log('📸 Credentials pictureUrls:', teacherData.credentials.map(c => c.pictureUrl));
      
      const createdTeacher = await createTeacher(teacherData);
      
      console.log('✅ Teacher created successfully:', createdTeacher);
      
      
      
      // Navigate to teacher detail page using accountId from response
      if (createdTeacher.accountId) {
        navigate(`/admin/teachers/${createdTeacher.accountId}`, {
          state: {
            updateStatus: "success",
            emailSent: true,
            emailAddress: teacherData.email
          }
        });
      } else {
        // Fallback to teachers list if no accountId
        navigate("/admin/teachers");
      }
    } catch (error) {
      console.error("❌ Error saving teacher:", error);
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
                  placeholder="0123456789"
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
                  error={errors.address}
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
                        label="Name *"
                        placeholder="e.g., IELTS Certificate"
                        value={cred.name || ""}
                        onChange={(e) => updateCredential(cred.id, 'name', e.target.value)}
                        error={errors[`credential_${index}_name`]}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Level *"
                        value={cred.level || ""}
                        onChange={(e) => updateCredential(cred.id, 'level', e.target.value)}
                        options={[
                          { label: 'A1', value: 'A1' },
                          { label: 'A2', value: 'A2' },
                          { label: 'B1', value: 'B1' },
                          { label: 'B2', value: 'B2' },
                          { label: 'C1', value: 'C1' },
                          { label: 'C2', value: 'C2' }
                        ]}
                        error={errors[`credential_${index}_level`]}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Credential Image *
                        </label>
                        <div className="flex items-center gap-3">
                          {cred.pictureUrl ? (
                            <div className="flex items-center gap-3 flex-1">
                              <div className="relative flex-shrink-0">
                                <img 
                                  key={`cred-img-${cred.id}-${cred.pictureUrl?.substring(0, 20)}`}
                                  src={cred.pictureUrl || ''} 
                                  alt="Credential preview" 
                                  className="w-32 h-32 min-w-[128px] min-h-[128px] object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-primary-400 transition-all shadow-md bg-white"
                                  style={{ 
                                    display: 'block',
                                    maxWidth: '128px',
                                    maxHeight: '128px',
                                    width: 'auto',
                                    height: 'auto',
                                    backgroundColor: 'white'
                                  }}
                                  onClick={() => setViewingImage({ url: cred.pictureUrl!, name: cred.name || 'Credential' })}
                                  onLoad={(e) => {
                                    console.log('✅ Image loaded successfully for credential:', cred.id);
                                    // Ensure image is visible
                                    e.currentTarget.style.opacity = '1';
                                    e.currentTarget.style.visibility = 'visible';
                                  }}
                                  onError={(e) => {
                                    console.error('❌ Image load error for credential:', cred.id);
                                    console.error('URL:', cred.pictureUrl);
                                    // Show placeholder instead of hiding
                                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect width="128" height="128" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EFailed to load%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                                <div 
                                  className="absolute inset-0 rounded-lg flex items-center justify-center pointer-events-none transition-opacity hover:opacity-0"
                                  style={{ backgroundColor: 'transparent' }}
                                >
                                  <Eye className="w-6 h-6 text-white opacity-0 transition-opacity" />
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => setViewingImage({ url: cred.pictureUrl!, name: cred.name || 'Credential' })}
                                  variant="secondary"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  onClick={() => updateCredential(cred.id, 'pictureUrl', '')}
                                  variant="secondary"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    // Validate file type
                                    if (!file.type.startsWith('image/')) {
                                      setErrors(prev => ({ ...prev, [`credential_${index}_pictureUrl`]: "Please select an image file" }));
                                      return;
                                    }
                                    
                                    // Validate file size (max 5MB)
                                    if (file.size > 5 * 1024 * 1024) {
                                      setErrors(prev => ({ ...prev, [`credential_${index}_pictureUrl`]: "File size must be less than 5MB" }));
                                      return;
                                    }
                                    
                                    // Store file object and show preview from local file
                                    console.log('Storing file for credential:', cred.id);
                                    
                                    // Store file object for later upload
                                    setFormData(prev => ({
                                      ...prev,
                                      credentials: prev.credentials.map(c => 
                                        c.id === cred.id ? { ...c, imageFile: file } : c
                                      )
                                    }));
                                    
                                    // Show preview immediately from local file
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const localPreview = event.target?.result as string;
                                      console.log('Local preview loaded for review');
                                      if (localPreview && localPreview.startsWith('data:image')) {
                                        // Store as preview URL (base64) for review
                                        updateCredential(cred.id, 'pictureUrl', localPreview);
                                      } else {
                                        console.error('Invalid preview data');
                                        setErrors(prev => ({ ...prev, [`credential_${index}_pictureUrl`]: "Failed to read image file" }));
                                      }
                                    };
                                    reader.onerror = (error) => {
                                      console.error('FileReader error:', error);
                                      setErrors(prev => ({ ...prev, [`credential_${index}_pictureUrl`]: "Failed to read image file" }));
                                    };
                                    reader.readAsDataURL(file);
                                    
                                    // Clear any previous errors
                                    setErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors[`credential_${index}_pictureUrl`];
                                      return newErrors;
                                    });
                                  }
                                }}
                                className="hidden"
                                id={`credential-image-${cred.id}`}
                              />
                              <label
                                htmlFor={`credential-image-${cred.id}`}
                                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                <Upload className="w-4 h-4" />
                                <span className="text-sm">Upload Image</span>
                              </label>
                            </div>
                          )}
                        </div>
                        {errors[`credential_${index}_pictureUrl`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`credential_${index}_pictureUrl`]}</p>
                        )}
                      </div>
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
              disabled={isLoading || uploadingImages}
              className="min-w-[160px] bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              {(isLoading || uploadingImages) ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadingImages ? "Uploading images..." : (isEdit ? "Updating..." : "Creating...")}
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

      {/* Image View Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImage(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">{viewingImage.name}</h3>
              <button
                onClick={() => setViewingImage(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 bg-gray-50">
              <img 
                src={viewingImage.url} 
                alt={viewingImage.name}
                className="w-full h-auto rounded-lg shadow-lg bg-white object-contain max-h-[70vh] mx-auto"
                onError={(e) => {
                  console.error('Modal image load error:', viewingImage.url);
                  e.currentTarget.src = '';
                  e.currentTarget.alt = 'Failed to load image';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
