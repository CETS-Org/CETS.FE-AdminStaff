import { useState, useEffect } from 'react';
import { api } from '@/api';
import type { CourseDetailData, Class as ClassInfo, CourseSkillDetail, CourseBenefitDetail, CourseRequirementDetail, CourseSyllabus } from '@/types/course.types';
import type { ClassSession } from '@/types/timetable.type';

export const useCourseDetail = (courseId: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseDetailData | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [skills, setSkills] = useState<CourseSkillDetail[]>([]);
  const [benefits, setBenefits] = useState<CourseBenefitDetail[]>([]);
  const [requirements, setRequirements] = useState<CourseRequirementDetail[]>([]);
  const [syllabi, setSyllabi] = useState<CourseSyllabus[]>([]);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch course detail
        const courseResponse = await api.getCourseDetailById(courseId);
        const apiData = courseResponse.data;

        const mappedCourseDetail: CourseDetailData = {
          id: apiData.id,
          courseCode: apiData.courseCode || 'N/A',
          name: apiData.courseName,
          level: apiData.courseLevel,
          format: apiData.formatName || apiData.courseFormatName || 'N/A',
          duration: apiData.duration,
          teachers: apiData.teacherDetails || [],
          status: apiData.isActive ? 'active' : 'inactive',
          description: apiData.description,
          objectives: apiData.courseObjective,
          image: apiData.courseImageUrl,
          price: apiData.standardPrice,
          currentStudents: apiData.studentsCount || 0,
          rating: apiData.rating || 0,
          category: apiData.categoryName || 'Uncategorized',
          totalStudents: apiData.studentsCount || 0,
          createdAt: apiData.createdAt,
          updatedAt: apiData.updatedAt,
          createdBy: apiData.createdBy,
          updatedBy: apiData.updatedBy,
        };

        setCourseDetail(mappedCourseDetail);

        setSkills(apiData.courseSkills || []);
        setBenefits(apiData.benefits || []);
        setRequirements(apiData.requirements || []);
        setSyllabi(apiData.syllabi || []);

        // Fetch classes
        try {
          const classesResponse = await api.getClassesByCourse(courseId);
          const apiClasses = classesResponse.data || [];

          const mappedClasses: ClassInfo[] = apiClasses.map((classItem: any) => ({
            id: classItem.id,
            name: classItem.className || 'Unnamed Class',
            courseId: courseId,
            courseName: mappedCourseDetail.name,
            teacher: 'TBA',
            teacherAvatar: undefined,
            schedule: `${classItem.startDate || 'TBA'} - ${classItem.endDate || 'TBA'}`,
            room: 'TBA',
            currentStudents: classItem.enrolledCount || 0,
            maxStudents: classItem.capacity || 0,
            status: classItem.isActive ? 'active' : 'inactive',
            startDate: classItem.startDate || '',
            endDate: classItem.endDate || '',
          }));

          setClasses(mappedClasses);

          // Fetch course schedules
          const allClassSessions: ClassSession[] = [];
          try {
            const schedulesResponse = await api.getCourseSchedules(courseId);
            const courseSchedules = schedulesResponse.data || [];

            courseSchedules.forEach((schedule: ClassSession) => {
              if (schedule.dayOfWeek && schedule.timeSlotName) {
                allClassSessions.push(schedule);
              }
            });
          } catch (err) {
            console.warn('Could not fetch course schedules:', err);
          }

          // Fetch class meetings
          for (const classItem of apiClasses) {
            try {
              const meetingsResponse = await fetch(
                `${import.meta.env.VITE_API_URL || 'https://localhost:8000'}/api/ACAD_ClassMeetings/${classItem.id}`
              );
              if (meetingsResponse.ok) {
                const meetings = await meetingsResponse.json();

                meetings.forEach((meeting: any) => {
                  if (meeting.dayOfWeek && meeting.timeSlotName) {
                    allClassSessions.push({
                      id: meeting.id || `meeting-${classItem.id}-${Date.now()}-${Math.random()}`,
                      courseID: classItem.courseId || '',
                      timeSlotID: meeting.timeSlotID || '',
                      dayOfWeek: meeting.dayOfWeek,
                      courseName: meeting.courseName || classItem.className || 'Class Meeting',
                      timeSlotName: meeting.timeSlotName,
                      createdAt: meeting.createdAt || new Date().toISOString(),
                      updatedAt: meeting.updatedAt || null,
                    });
                  }
                });
              }
            } catch (err) {
              console.warn(`Could not fetch meetings for class ${classItem.id}:`, err);
            }
          }

          setClassSessions(allClassSessions);
        } catch (err) {
          console.warn('Could not fetch classes:', err);
          setClasses([]);
          setClassSessions([]);
        }
      } catch (err: any) {
        console.error('Error fetching course detail:', err);
        setError(err.response?.data?.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  return {
    loading,
    error,
    courseDetail,
    classes,
    classSessions,
    skills,
    benefits,
    requirements,
    syllabi,
  };
};

