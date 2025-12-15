
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/ui/PageHeader";
import Label from "@/components/ui/Label";
import { Trash2, Package as PackageIcon, ArrowLeft, Upload, Camera, Save, DollarSign, Clock, Calendar, CheckCircle, AlertCircle, Loader2, BookOpen, Plus, X } from "lucide-react";
import { createPackage, updatePackage, getPackageImageUploadUrl, getPackageDetail } from "@/api/package.api";
import { getCoursesList } from "@/api/course.api";
import type { PackageFormData, Package, PackageCourse } from "@/types/package.types";
import { useToast } from "@/pages/staff/staff_courses/shared/hooks/useToast";
import Toast from "@/components/ui/Toast";

type PackageFormPageProps = {
  mode: 'create' | 'edit';
};

export default function PackageFormPage({ mode }: PackageFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';
  
  // Toast notifications
  const { showSuccessToast, showErrorToast, toastMessage, showSuccessMessage, showErrorMessage } = useToast();

  // Form state
  const [formData, setFormData] = useState<Omit<PackageFormData, 'id'>>({
    packageCode: "",
    name: "",
    description: "",
    totalPrice: 0,
    totalIndividualPrice: 0,
    status: "active",
    totalSessions: 0,
    validityPeriod: 0,
    courseIDs: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  
  const imageObjectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit && id) {
      loadPackageData(id);
    }
    loadAvailableCourses();
  }, [isEdit, id]);

  // Auto-calculate total individual price 
  useEffect(() => {
    const calculatedIndividualPrice = selectedCourses.reduce((total, course) => {
      return total + (course.standardPrice || 0);
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      totalIndividualPrice: calculatedIndividualPrice
    }));
  }, [selectedCourses]);

  const loadPackageData = async (packageId: string) => {
    try {
      setIsLoading(true);
      const response = await getPackageDetail(packageId);
      const packageData = response.data;

      setFormData({
        packageCode: packageData.packageCode,
        name: packageData.name,
        description: packageData.description || "",
        totalPrice: packageData.totalPrice,
        totalIndividualPrice: packageData.totalIndividualPrice,
        status: packageData.isActive ? "active" : "inactive",
        totalSessions: packageData.totalSessions || 0,
        validityPeriod: packageData.validityPeriod || 0,
        courseIDs: packageData.courses?.map((c: PackageCourse) => c.courseId) || []
      });

      if (packageData.packageImageUrl) {
        setImagePreview(packageData.packageImageUrl);
      }

      // Set selected courses if available
      if (packageData.courses && packageData.courses.length > 0) {
        setSelectedCourses(packageData.courses);
      }
    } catch (error) {
      console.error("Error loading package data:", error);
      showErrorMessage("Failed to load package data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableCourses = async () => {
    try {
      const response = await getCoursesList();
      const coursesData = response.data.value || response.data || [];
      setAvailableCourses(coursesData);
    } catch (error) {
      console.error("Error loading courses:", error);
      showErrorMessage("Failed to load courses");
    }
  };

  const handleInputChange = (field: keyof PackageFormData, value: string | number) => {
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

  const processImageFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showErrorMessage('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showErrorMessage('Image size should be less than 5MB');
      return;
    }
    // Show preview immediately via object URL
    const newUrl = URL.createObjectURL(file);
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
    }
    imageObjectUrlRef.current = newUrl;
    setImagePreview(newUrl);

    // Store file for later upload
    setImageFile(file);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processImageFile(event.target.files?.[0] || null);
  };

  const onImageDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    processImageFile(file || null);
  };

  const onImageDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
      imageObjectUrlRef.current = null;
    }
    setImagePreview("");
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCourseSelection = (courseId: string, isSelected: boolean) => {
    if (isSelected) {
      const course = availableCourses.find(c => c.id === courseId);
      if (course) {
        setSelectedCourses(prev => [...prev, course]);
        setFormData(prev => ({
          ...prev,
          courseIDs: [...(prev.courseIDs || []), courseId]
        }));
      }
    } else {
      setSelectedCourses(prev => prev.filter(c => c.id !== courseId));
      setFormData(prev => ({
        ...prev,
        courseIDs: (prev.courseIDs || []).filter(id => id !== courseId)
      }));
    }
  };

  const removeSelectedCourse = (courseId: string) => {
    setSelectedCourses(prev => prev.filter(c => c.id !== courseId));
    setFormData(prev => ({
      ...prev,
      courseIDs: (prev.courseIDs || []).filter(id => id !== courseId)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Package name is required";
    }

    if (!formData.packageCode.trim()) {
      newErrors.packageCode = "Package code is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Package description is required";
    }

    if (formData.totalPrice <= 0) {
      newErrors.totalPrice = "Total price must be greater than 0";
    }

    if (formData.validityPeriod && formData.validityPeriod <= 0) {
      newErrors.validityPeriod = "Validity period must be greater than 0";
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
      
      let packageImageUrl = imagePreview;
      
      // Upload image if a new file is selected
      if (imageFile) {
        try {
          // Step 1: Get presigned URL from backend
          const uploadUrlResponse = await getPackageImageUploadUrl(imageFile.name, imageFile.type);

          if (!uploadUrlResponse.data.uploadUrl) {
            throw new Error('Failed to get upload URL');
          }

          const { uploadUrl, publicUrl } = uploadUrlResponse.data;

          // Step 2: Upload directly to storage using presigned URL
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': imageFile.type,
            },
            body: imageFile,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image to storage');
          }

          packageImageUrl = publicUrl;
         } catch (error) {
           console.error('Error uploading image:', error);
           showErrorMessage('Failed to upload image. Please try again.');
           setIsLoading(false);
           return;
         }
      }
      
      const payload = {
        packageCode: formData.packageCode,
        name: formData.name,
        description: formData.description,
        totalPrice: formData.totalPrice,
        totalIndividualPrice: formData.totalIndividualPrice,
        packageImageUrl: packageImageUrl || undefined,
        isActive: formData.status === "active",
        totalSessions: formData.totalSessions || undefined,
        validityPeriod: formData.validityPeriod || undefined,
        courseIDs: formData.courseIDs
      };

      if (isEdit && id) {
        await updatePackage(id, { id, ...payload });
        showSuccessMessage("Package updated successfully!");
      } else {
        await createPackage(payload);
        showSuccessMessage("Package created successfully!");
        setTimeout(() => navigate('/admin/packages'), 1500);
      }
    } catch (error) {
      console.error("Error saving package:", error);
      showErrorMessage(isEdit ? "Failed to update package. Please try again." : "Failed to create package. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/packages');
  };

  // Format Vietnamese currency
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      {/* Toast Notifications */}
      {showSuccessToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => {}}
        />
      )}
      {showErrorToast && (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => {}}
        />
      )}
      

      <div className="p-6">
        {/* Page Header */}
        <PageHeader
          title={isEdit ? "Edit Package" : "Create Package"}
          description={isEdit ? "Update package information and settings" : "Create a new course package"}
          icon={<PackageIcon className="w-5 h-5 text-white" />}
          controls={[
            {
              type: 'button',
              label: 'Back',
              variant: 'secondary',
              icon: <ArrowLeft className="w-4 h-4" />,
              onClick: handleCancel
            }
          ]}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <PackageIcon className="w-6 h-6 text-primary-500" />
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="packageCode">
                        Package Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="packageCode"
                        value={formData.packageCode}
                        onChange={(e) => handleInputChange('packageCode', e.target.value)}
                        placeholder="Enter package code"
                        error={errors.packageCode}
                      />
                    </div>

                    <div>
                      <Label htmlFor="name">
                        Package Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter package name"
                        error={errors.name}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter package description"
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalPrice">
                        Package Price (VND) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="totalPrice"
                        type="number"
                        value={formData.totalPrice}
                        onChange={(e) => handleInputChange('totalPrice', Number(e.target.value))}
                        placeholder="Enter package price"
                        error={errors.totalPrice}
                        min={0}
                      />
                    </div>

                  </div>
                </div>
              </div>
            </Card>

            {/* Package Image */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Camera className="w-6 h-6 text-blue-500" />
                  <h2 className="text-xl font-semibold">Package Image</h2>
                </div>

                <div
                  onClick={handleImageClick}
                  onDrop={onImageDrop}
                  onDragOver={onImageDragOver}
                  className="relative w-full h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors cursor-pointer overflow-hidden"
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Package preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Upload className="w-12 h-12 mb-2" />
                      <p className="text-sm">Click or drag image to upload</p>
                      <p className="text-xs mt-1">Maximum file size: 5MB</p>
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
            </Card>

            {/* Course Selection */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-green-500" />
                  <h2 className="text-xl font-semibold">Course Selection</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Available Courses</Label>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 max-h-96 overflow-y-auto">
                      {availableCourses.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No courses available</p>
                      ) : (
                        <div className="space-y-2">
                          {availableCourses.map((course) => (
                            <label
                              key={course.id}
                              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all duration-200"
                            >
                              <input
                                type="checkbox"
                                checked={formData.courseIDs?.includes(course.id) || false}
                                onChange={(e) => handleCourseSelection(course.id, e.target.checked)}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{course.courseName}</p>
                                <p className="text-sm text-gray-500">{course.courseCode}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {formatVND(course.standardPrice || 0)} ₫
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedCourses.length > 0 && (
                    <div>
                      <Label className="text-green-500">Selected Courses ({selectedCourses.length})</Label>
                      <div className="rounded-xl py-2">
                        <div className="space-y-2">
                          {selectedCourses.map((course) => (
                            <div
                              key={course.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-300"
                            >
                              <div>
                                <p className="font-medium text-gray-900">{course.courseName}</p>
                                <p className="text-sm text-gray-500">
                                  {course.courseCode} - {formatVND(course.standardPrice || 0)} ₫
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => removeSelectedCourse(course.id)}
                                className="text-white hover:text-white !bg-red-500 hover:!bg-red-600"
                                iconLeft={<Trash2 className="w-4 h-4" />}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                  <h2 className="text-xl font-semibold">Status</h2>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="mr-3 w-4 h-4 text-green-600"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === "inactive"}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="mr-3 w-4 h-4 text-gray-600"
                    />
                    <span className="text-sm font-medium">Inactive</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Summary */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h2 className="text-xl font-semibold">Summary</h2>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <PackageIcon className="w-4 h-4 text-indigo-500 mt-1" />
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Package Name</span>
                      <p className="font-semibold text-gray-800">{formData.name || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-4 h-4 text-green-500 mt-1" />
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Package Price</span>
                      <p className="font-semibold text-gray-800">
                        {formData.totalPrice > 0 ? `${formatVND(formData.totalPrice)} ₫` : 'Not set'}
                      </p>
                    </div>
                  </div>

         
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-4 h-4 text-blue-500 mt-1" />
                      <div className="flex-1">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Individual Price</span>
                        <p className="font-semibold text-gray-800">{formatVND(formData.totalIndividualPrice)} ₫</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Save {formatVND(formData.totalIndividualPrice - formData.totalPrice)} ₫
                        </p>
                      </div>
                    </div>

                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Selected Courses</span>
                      <p className="font-semibold text-gray-800">{selectedCourses.length} course(s)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-1" />
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Status</span>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                          formData.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {formData.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {isEdit ? "Update package information" : "All fields marked with * are required"}
            </p>
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
                className="min-w-[160px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {isEdit ? "Update Package" : "Create Package"}
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
