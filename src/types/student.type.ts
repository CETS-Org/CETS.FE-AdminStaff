import type { Account } from "./account.type";

export interface StudentInfo {
    accountId: string;
    studentCode: string;
    studentNumber: number;
    guardianName: string;
    guardianPhone: string | null;
    school: string | null;
    academicNote: string | null;
    createdAt: string;
    updatedAt: string | null;
    updatedBy: string | null;
    isDeleted: boolean;
  } 
// export interface Student {
//     accountId: string;
//     email: string;
//     phoneNumber: string | null;
//     fullName: string;
//     dateOfBirth: string | null;
//     cid: string | null;
//     address: string | null;
//     avatarUrl: string | null;
//     password?: string; // Optional for security reasons
//     accountStatusID: string;
//     isVerified: boolean;
//     verifiedCode: string | null;
//     verifiedCodeExpiresAt: string | null;
//     createdAt: string;
//     updatedAt: string | null;
//     updatedBy: string | null;
//     isDeleted: boolean;
//     statusName: string; // Can be empty string ""
//     roleNames: string[];
//     studentInfo: StudentInfo | null;
//     teacherInfo: any | null;
//   } 

export interface Student extends Account {
    studentInfo: StudentInfo | null;
}
  export interface CourseEnrollment {
      id: string;
      courseCode: string;
      courseName: string;
      description: string | null;
      courseImageUrl: string | null;
      isActive: boolean;
      teachers: string[]; // Array of teacher names
      enrollmentStatus: string;
      createdAt: string;    
  }