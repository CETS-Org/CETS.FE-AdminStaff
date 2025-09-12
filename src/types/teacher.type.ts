export interface TeacherCredential {
    id: string;
    degree: string;
    institution: string;
    year: string;
    field: string;
    createdAt: string;
    updatedAt: string | null;
    isDeleted: boolean;
  }
  
  export interface TeacherInfo {
    teacherId: string;
    teacherCode: string;
    yearsExperience: number;
    bio: string;
    createdAt: string;
    updatedAt: string | null;
    updatedBy: string | null;
    isDeleted: boolean;
    accountId: string;
    email: string;
    phoneNumber: string | null;
    fullName: string;
    dateOfBirth: string | null;
    cid: string | null;
    address: string | null;
    avatarUrl: string | null;
    accountStatusID: string;
    isVerified: boolean;
    verifiedCode: string | null;
    verifiedCodeExpiresAt: string | null;
    accountCreatedAt: string;
    accountUpdatedAt: string | null;
    accountUpdatedBy: string | null;
    accountIsDeleted: boolean;
    teacherCredentials: TeacherCredential[];
  }
  
  export interface Teacher {
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
    statusName: string;
    roleNames: string[];
    studentInfo: any | null;
    teacherInfo: TeacherInfo | null;
  }
    