import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, X, Package as PackageIcon, BookOpen, DollarSign, Clock, Calendar, Users, CheckCircle, Star, Target, User, History } from 'lucide-react';
import Card from '@/components/ui/Card';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import DeleteConfirmDialog from '../shared/components/DeleteConfirmDialog';
import { getPackageById, getPackageCourses, getPackageDetailById, deletePackage } from '@/api/package.api';
import type { Package, PackageCourse } from '@/types/package.types';
import { useToast } from '@/pages/staff/staff_courses/shared/hooks/useToast';
import Toast from '@/components/ui/Toast';

const PackageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Toast notifications
  const { showSuccessToast, showErrorToast, toastMessage, showSuccessMessage, showErrorMessage } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packageDetail, setPackageDetail] = useState<Package | null>(null);
  const [packageCourses, setPackageCourses] = useState<PackageCourse[]>([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format Vietnamese currency
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Format date and time
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Fetch package details
  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Prefer details endpoint which may include embedded courses
        const detailResponse = await getPackageDetailById(id);
        const detailData = detailResponse.data as Package;
        setPackageDetail(detailData);

        const embeddedCourses = (detailData as any)?.courses as PackageCourse[] | undefined;
        if (Array.isArray(embeddedCourses)) {
          setPackageCourses(embeddedCourses);
        } else {
          // Fallback if courses are not embedded
          const coursesResponse = await getPackageCourses(id);
          const coursesData = coursesResponse.data.value || coursesResponse.data || [];
          setPackageCourses(coursesData);
        }
      } catch (err: any) {
        // Fallback to legacy two-call approach if details endpoint fails
        try {
          const packageResponse = await getPackageById(id);
          const packageData = packageResponse.data;
          setPackageDetail(packageData);

          const coursesResponse = await getPackageCourses(id);
          const coursesData = coursesResponse.data.value || coursesResponse.data || [];
          setPackageCourses(coursesData);
        } catch (innerErr: any) {
          console.error('Error fetching package details:', innerErr);
          setError(innerErr.response?.data?.message || 'Failed to load package details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [id]);

  // Handlers
  const handleEdit = () => navigate(`/admin/packages/edit/${id}`);
  const handleDelete = () => setDeleteDialog(true);
  
  const handleConfirmDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await deletePackage(id);
      
      showSuccessMessage(`Package "${packageDetail?.name}" deleted successfully!`);
      
      // Close dialog and navigate back to packages list after a short delay
      setDeleteDialog(false);
      setTimeout(() => {
        navigate('/admin/packages');
      }, 1000);
    } catch (err: any) {
      console.error('Error deleting package:', err);
      showErrorMessage(err.response?.data?.message || 'Failed to delete package. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Packages', to: '/admin/packages' },
    { label: 'Package Detail', to: `/admin/packages/${id}` },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-red-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Package</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="secondary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No package found
  if (!packageDetail) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <PackageIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Package Not Found</h3>
          <p className="text-gray-600 mb-6">The package you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/admin/packages')} variant="secondary">
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
          
          <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-4">
              <Button
                variant="primary"
                onClick={() => navigate('/admin/packages')}
                iconLeft={<ArrowLeft className="w-4 h-4" />}
                className="!bg-blue-500 hover:!bg-blue-600"
              >
                Back to Packages
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={handleEdit}
                iconLeft={<Pencil className="w-4 h-4" />}
                className="!bg-green-500 hover:!bg-green-600"
              >
                Edit Package
              </Button>
              <Button
                variant="secondary"
                onClick={handleDelete}
                iconLeft={<Trash2 className="w-4 h-4" />}
                className="!bg-red-500 hover:!bg-red-600 !text-white"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Package'}
              </Button>
            </div>
          </div>
        </div>

        {/* Package Overview */}
        <Card>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Package Image */}
              <div className="flex-shrink-0">
                {packageDetail.packageImageUrl ? (
                  <img 
                    src={packageDetail.packageImageUrl} 
                    alt={packageDetail.name}
                    className="w-48 h-48 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center text-purple-700 font-bold text-4xl shadow-lg">
                    {packageDetail.name?.charAt(0) || 'P'}
                  </div>
                )}
              </div>

              {/* Package Information */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{packageDetail.name}</h1>
                  <p className="text-lg text-gray-600">{packageDetail.description || 'No description available'}</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Package Code:</span>
                    <span className="text-sm font-semibold text-gray-900">{packageDetail.packageCode || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${packageDetail.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
                    `}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5
                        ${packageDetail.isActive ? 'bg-green-500' : 'bg-gray-400'}
                      `} />
                      {packageDetail.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Package Price</span>
                    </div>
                    <p className="text-xl font-bold text-green-900">{formatVND(packageDetail.totalPrice || 0)} ₫</p>
                    <p className="text-xs text-green-600">Package discount applied</p>
                  </div>

                  {packageDetail.totalIndividualPrice && packageDetail.totalIndividualPrice > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">Individual Price</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{formatVND(packageDetail.totalIndividualPrice)} ₫</p>
                      <p className="text-xs text-gray-600">If purchased separately</p>
                    </div>
                  )}


                  {packageDetail.totalSessions && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-purple-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Total Sessions</span>
                      </div>
                      <p className="text-xl font-bold text-purple-900">{packageDetail.totalSessions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Audit Information */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Audit Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Created Information */}
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-900">Created By</h3>
                      <p className="text-xs text-blue-600">Package creation information</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">User:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {packageDetail?.createdBy || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Date & Time:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDateTime(packageDetail?.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Updated Information */}
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <History className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-purple-900">Last Updated By</h3>
                      <p className="text-xs text-purple-600">Latest modification information</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">User:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {packageDetail?.updatedBy || packageDetail?.createdBy || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Date & Time:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDateTime(packageDetail?.updatedAt || packageDetail?.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metadata */}
            {packageDetail?.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <PackageIcon className="w-4 h-4" />
                    Package ID:
                  </span>
                  <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded ml-2">
                    {packageDetail.id}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Package Courses */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Courses ({packageCourses.length})</h2>
            </div>

            {packageCourses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {packageCourses.map((course, index) => (
                  <div
                    key={course.courseId || course.id}
                    onClick={() => navigate(`/admin/courses/${course.courseId}`)}
                    className="p-6 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all bg-white cursor-pointer"
                  >
                    {/* Course Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {course.sequence || index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-gray-900 mb-1">{course.courseName}</h4>
                        {course.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Course Metadata */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {course.courseLevel && (
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">
                            <span className="text-gray-500">Level: </span>
                            <span className="font-medium text-gray-900">{course.courseLevel}</span>
                          </span>
                        </div>
                      )}
                      {course.categoryName && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                            {course.categoryName}
                          </span>
                        </div>
                      )}
                      {course.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-700">{course.duration}</span>
                        </div>
                      )}
                      {course.standardPrice !== undefined && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-gray-900">{formatVND(course.standardPrice)} ₫</span>
                        </div>
                      )}
                    </div>

                    {/* Rating and Students */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                      {course.rating !== undefined && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold text-gray-900">{course.rating}/10</span>
                        </div>
                      )}
                      {course.studentsCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">{course.studentsCount} students</span>
                        </div>
                      )}
                    </div>

                    {/* Course Objectives */}
                    {course.courseObjective && course.courseObjective.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Learning Objectives
                        </h5>
                        <ul className="space-y-1.5">
                          {course.courseObjective.slice(0, 3).map((objective, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">•</span>
                              <span className="flex-1">{objective}</span>
                            </li>
                          ))}
                          {course.courseObjective.length > 3 && (
                            <li className="text-sm text-blue-600 font-medium">
                              +{course.courseObjective.length - 3} more objectives
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No courses found in this package</p>
              </div>
            )}
          </div>
        </Card>

        {/* Delete Dialog */}
        <DeleteConfirmDialog
          open={deleteDialog}
          onOpenChange={setDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Delete Package"
          message={`Are you sure you want to delete the package "${packageDetail.name}"? This action cannot be undone.`}
          confirmText={isDeleting ? "Deleting..." : "Delete Package"}
          isLoading={isDeleting}
        />

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
      </div>
    </div>
  );
};

export default PackageDetailPage;