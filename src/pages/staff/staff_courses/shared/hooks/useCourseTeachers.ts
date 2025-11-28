import { useState } from 'react';

interface TeacherAssignment {
  assignmentId: string;
  teacherId: string;
}

export const useCourseTeachers = () => {
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [originalTeacherAssignments, setOriginalTeacherAssignments] = useState<TeacherAssignment[]>([]);

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const loadTeachers = (teacherAssignments: any[]) => {
    setSelectedTeachers(teacherAssignments.map((assignment: any) => assignment.teacherID || assignment.teacherId));
    setOriginalTeacherAssignments(teacherAssignments.map((assignment: any) => ({
      assignmentId: assignment.id || assignment.assignmentID || assignment.Id,
      teacherId: assignment.teacherID || assignment.teacherId
    })));
  };

  const resetTeachers = () => {
    setSelectedTeachers([]);
    setOriginalTeacherAssignments([]);
  };

  return {
    selectedTeachers,
    originalTeacherAssignments,
    toggleTeacher,
    loadTeachers,
    resetTeachers
  };
};

