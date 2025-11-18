import { api } from './api';

export interface CourseFeedback {
  feedbackId: string;
  submitterId: string;
  submitterName: string;
  feedbackTypeId: string;
  feedbackTypeName: string;
  rating?: number;
  comment?: string;
  contentClarity?: string;
  courseRelevance?: string;
  materialsQuality?: string;
  teacherId?: string;
  teacherName?: string;
  teachingEffectiveness?: string;
  communicationSkills?: string;
  teacherSupportiveness?: string;
  createdAt: string;
}

export const getCourseFeedbacks = async (courseId: string) => {
  return api.get<CourseFeedback[]>(`/api/COM_Feedback/course/${courseId}`);
};
