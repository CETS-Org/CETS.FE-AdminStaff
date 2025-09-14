import type { Student, UpdateStudent } from "@/types/student.type";
import { create } from "zustand";


export interface StudentStore {
  students: Student[];
  setStudents: (students: Student[]) => void;
  updatedStudent: (student: UpdateStudent) => void;
  deletedStudent: (studentId : string) => void;
}

export const useStudentStore = create<StudentStore>()((set) => ({
  students: [],
  setStudents: (students: Student[]) => set({ students }),
  updatedStudent: (updateData: UpdateStudent) =>
    set((state) => ({
      students: state.students.map((student) => {
        if (student.accountId === updateData.accountID) {
          // Map UpdateStudent to Student
          const updatedStudent: Student = {
            ...student,
            fullName: updateData.fullName || student.fullName,
            email: updateData.email,
            phoneNumber: updateData.phoneNumber || student.phoneNumber,
            cid: updateData.cid || student.cid,
            address: updateData.address || student.address,
            dateOfBirth: updateData.dateOfBirth || student.dateOfBirth,
            avatarUrl: updateData.avatarUrl || student.avatarUrl,
            studentInfo: student.studentInfo ? {
              ...student.studentInfo,
              guardianName: updateData.guardianName || student.studentInfo.guardianName,
              guardianPhone: updateData.guardianPhone || student.studentInfo.guardianPhone,
              school: updateData.school || student.studentInfo.school,
              academicNote: updateData.academicNote || student.studentInfo.academicNote,
            } : null
          };
          return updatedStudent;
        }
        return student;
      }),
    })),
    deletedStudent: (studentId: string) =>
      set((state) => ({
        students: state.students.filter((student) => student.accountId !== studentId),
      })),
}));
  
  