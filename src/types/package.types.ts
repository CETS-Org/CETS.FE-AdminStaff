export type Package = {
  id: string;
  packageCode: string;
  name: string;
  description?: string;
  totalPrice: number;
  totalIndividualPrice: number;
  packageImageUrl?: string;
  categoryName?: string;
  categoryID?: string;
  isActive?: boolean;
  totalSessions?: number;
  validityPeriod?: number; // Add missing property
  courseNames: string[];
  courses?: PackageCourse[];
  coursesCount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
};

export type PackageCourse = {
  id?: string;
  courseId: string;
  courseName: string;
  courseCode?: string;
  courseImageUrl?: string;
  standardPrice?: number;
  sortOrder?: number;
  sequence?: number;
  description?: string;
  duration?: string;
  courseLevel?: string;
  categoryName?: string;
  courseObjective?: string[];
  rating?: number;
  studentsCount?: number;
};

export type PackageFormData = {
  id?: string;
  packageCode: string;
  name: string;
  description: string;
  totalPrice: number;
  totalIndividualPrice: number;
  image?: string;
  categoryID?: string;
  status: "active" | "inactive";
  totalSessions?: number;
  validityPeriod?: number;
  courseIDs?: string[];
};

export type CreatePackageRequest = {
  packageCode: string;
  name: string;
  description?: string;
  totalPrice: number;
  totalIndividualPrice: number;
  packageImageUrl?: string;
  categoryID?: string;
  isActive?: boolean;
  totalSessions?: number;
  validityPeriod?: number;
  courseIDs?: string[];
};

export type UpdatePackageRequest = {
  id: string;
  packageCode?: string;
  name?: string;
  description?: string;
  totalPrice?: number;
  totalIndividualPrice?: number;
  packageImageUrl?: string;
  categoryID?: string;
  isActive?: boolean;
  totalSessions?: number;
  validityPeriod?: number;
  courseIDs?: string[];
};

export type PackageCourseRelation = {
  id: string;
  packageID: string;
  courseID: string;
  sortOrder?: number;
};



