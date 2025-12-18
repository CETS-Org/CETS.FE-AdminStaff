import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, X, CalendarCheck2, TableIcon, GraduationCap, Eye, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ScheduleHeader from '@/components/schedule/ScheduleHeader';
import ScheduleGrid from '@/components/schedule/ScheduleGrid';
import { startOfWeek, addDays } from '@/components/schedule/scheduleUtils';
import { useCourseDetail } from '../shared/hooks/useCourseDetail';
import { CourseOverviewCards } from './components/CourseOverviewCards';
import { CourseInfoSection } from './components/CourseInfoSection';
import DeleteConfirmDialog from '../shared/components/DeleteConfirmDialog';
import { convertSessionsToBaseSession, getWeekNavigationProps, DAY_OF_WEEK_MAP } from '../shared/utils/scheduleHelpers';
import { deleteCourse } from '@/api/course.api';
import type { Class as ClassInfo } from '@/types/course.types';
import { isStaffUser } from '@/lib/utils';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isStaff = isStaffUser();
  const basePath = isStaff ? '/staff' : '/admin';
  
  // Fetch course data
  const { loading, error, courseDetail, classes, classSessions, skills, benefits, requirements, syllabi } =
    useCourseDetail(id);

  // Define custom time slots
  const timeSlots = [
    { start: '09:00', end: '10:30' },
    { start: '13:30', end: '15:00' },
    { start: '15:30', end: '17:00' },
    { start: '18:00', end: '19:30' },
    { start: '20:00', end: '21:30' },
  ];

  // Local state
  const [deleteCourseDialog, setDeleteCourseDialog] = useState(false);
  const [subTab, setSubTab] = useState<'schedule' | 'table'>('schedule');
  const [classSearch, setClassSearch] = useState('');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate course date range
  const courseDateRange = useMemo(() => {
    if (classes.length === 0) {
      return { startDate: null, endDate: null };
    }
    
    const dates = classes
      .map((c) => ({
      start: new Date(c.startDate),
        end: new Date(c.endDate),
      }))
      .filter((d) => !isNaN(d.start.getTime()) && !isNaN(d.end.getTime()));
    
    if (dates.length === 0) {
      return { startDate: null, endDate: null };
    }
    
    const startDate = new Date(Math.min(...dates.map((d) => d.start.getTime())));
    const endDate = new Date(Math.max(...dates.map((d) => d.end.getTime())));
    
    return { startDate, endDate };
  }, [classes]);

  // Convert sessions for schedule grid
  const scheduleSessions = useMemo(
    () => convertSessionsToBaseSession(classSessions, weekStart, courseDateRange),
    [classSessions, weekStart, courseDateRange]
  );

  // Week navigation props
  const { weekEnd, todayIdx, canGoPrevious, canGoNext } = getWeekNavigationProps(
    weekStart,
    courseDateRange
  );

  // Filter classes
  const filteredClasses = useMemo(() => {
    return classes.filter((classItem) =>
      classItem.name.toLowerCase().includes(classSearch.toLowerCase())
    );
  }, [classes, classSearch]);

  // Handlers
  const handleEdit = () => navigate(`${basePath}/courses/edit/${id}`);
  const handleDelete = () => setDeleteCourseDialog(true);
  
  const handleConfirmDeleteCourse = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await deleteCourse(id);
      
      // Close dialog and navigate back to courses list
      setDeleteCourseDialog(false);
      navigate(`${basePath}/courses`);
    } catch (err: any) {
      console.error('Error deleting course:', err);
      alert(err.response?.data?.message || 'Failed to delete course. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleViewClass = (classData: ClassInfo) => navigate(`/staff/classes/${classData.id}`);

  const handlePreviousWeek = () => {
    if (canGoPrevious) {
      setWeekStart(addDays(weekStart, -7));
    }
  };

  const handleNextWeek = () => {
    if (canGoNext) {
      setWeekStart(addDays(weekStart, 7));
    }
  };

  const handleOpenDatePicker = () => {
    const now = new Date();
    let targetDate = now;
    
    if (courseDateRange.startDate && now < courseDateRange.startDate) {
      targetDate = courseDateRange.startDate;
    } else if (courseDateRange.endDate && now > courseDateRange.endDate) {
      targetDate = courseDateRange.endDate;
    }
    
    setWeekStart(startOfWeek(targetDate));
  };

  const breadcrumbItems = [
    { label: 'Courses', to: `${basePath}/courses` },
    { label: 'Course Detail', to: `${basePath}/courses/detail` },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
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
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Course</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="secondary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No course found
  if (!courseDetail) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Course Not Found</h3>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(`${basePath}/courses`)} variant="secondary">
            Back to Courses
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
                onClick={() => navigate(`${basePath}/courses`)}
                iconLeft={<ArrowLeft className="w-4 h-4" />}
                className="!bg-blue-500 hover:!bg-blue-600"
              >
                Back to Courses
              </Button>
            </div>
            
            {!isStaff && (
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleEdit}
                  iconLeft={<Pencil className="w-4 h-4" />}
                  className="!bg-green-500 hover:!bg-green-600"
                >
                  Edit Course
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDelete}
                  iconLeft={<Trash2 className="w-4 h-4" />}
                  className="!bg-red-500 hover:!bg-red-600 !text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Course'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        <CourseOverviewCards
          courseDetail={courseDetail}
          classes={classes}
          classSessions={classSessions}
        />

        {/* Course Information */}
        <CourseInfoSection
          courseDetail={courseDetail}
          skills={skills}
          benefits={benefits}
          requirements={requirements}
          syllabi={syllabi}
        />

        {/* Schedule Section */}
        <Card>
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Course Schedule</h2>
              {courseDateRange.startDate && courseDateRange.endDate && (
                <p className="text-sm text-gray-600 mt-1">
                  {courseDateRange.startDate.toLocaleDateString()} -{' '}
                  {courseDateRange.endDate.toLocaleDateString()}
                </p>
              )}
            </div>
              <div className="flex space-x-2">
                <Button
                variant={subTab === 'schedule' ? 'primary' : 'secondary'}
                onClick={() => setSubTab('schedule')}
                  iconLeft={<CalendarCheck2 className="w-4 h-4" />}
                >
                Weekly View
                </Button>
                <Button
                variant={subTab === 'table' ? 'primary' : 'secondary'}
                onClick={() => setSubTab('table')}
                  iconLeft={<TableIcon className="w-4 h-4" />}
                >
                List View
                </Button>
              </div>
            </div>

          {subTab === 'schedule' && (
            <div>
              <ScheduleHeader
                weekStart={weekStart}
                weekEnd={weekEnd}
                onPreviousWeek={handlePreviousWeek}
                onNextWeek={handleNextWeek}
                onOpenDatePicker={handleOpenDatePicker}
              />
              <ScheduleGrid
                weekStart={weekStart}
                sessions={scheduleSessions}
                startHour={9}
                slots={5}
                slotMinutes={90}
                timeSlots={timeSlots}
                todayIdx={todayIdx}
                selectedIdx={-1}
                onSessionClick={() => {}}
                isStudent={false}
              />
              </div>
            )}

          {subTab === 'table' && (
            <div className="p-6 pt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classSessions.length > 0 ? (
                      classSessions.map((session) => {
                        const dayIndex = DAY_OF_WEEK_MAP[session.dayOfWeek];
                        const sessionDate = new Date(weekStart);
                        sessionDate.setDate(weekStart.getDate() + dayIndex);
                        
                        return (
                          <tr key={session.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sessionDate.toLocaleDateString()} ({session.dayOfWeek})
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {session.timeSlotName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {session.courseName}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No schedule sessions available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        {/* Classes Section */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Classes ({classes.length})</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Search classes..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                />
              </div>

              {filteredClasses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      onClick={() => handleViewClass(classItem)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{classItem.name}</h4>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          classItem.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : classItem.status === 'full'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {classItem.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{classItem.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <span>
                            {classItem.currentStudents}/{classItem.maxStudents} students
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                          <Eye className="w-4 h-4" />
                          View Details
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No classes found for this course</p>
              </div>
            )}
            </div>
          </div>
        </Card>

        {/* Delete Dialog */}
        <DeleteConfirmDialog
          open={deleteCourseDialog}
          onOpenChange={setDeleteCourseDialog}
          onConfirm={handleConfirmDeleteCourse}
          title="Delete Course"
          message={`Are you sure you want to delete the course "${courseDetail.name}"? This action cannot be undone.`}
          confirmText={isDeleting ? "Deleting..." : "Delete Course"}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
};

export default CourseDetailPage;

