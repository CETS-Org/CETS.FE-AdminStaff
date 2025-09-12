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
  
  export interface Student {
    accountId: string;
    email: string;
    phoneNumber: string | null;
    fullName: string;
    dateOfBirth: string | null;
    cid: string | null;
    address: string | null;
    avatarUrl: string | null;
    password?: string; // Optional for security reasons
    accountStatusID: string;
    isVerified: boolean;
    verifiedCode: string | null;
    verifiedCodeExpiresAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    updatedBy: string | null;
    isDeleted: boolean;
    statusName: string; // Can be empty string ""
    roleNames: string[];
    studentInfo: StudentInfo | null;
    teacherInfo: any | null;
  }
  