export type ClassRow = {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  teacher: string;
  room: string;
  currentStudents: number;
  maxStudents: number;
  status: "active" | "inactive" | "full";
  schedule?: string;
  startDate?: string;
  endDate?: string;
};

export const mockClasses: ClassRow[] = [
  {
    id: "CLS001",
    name: "React Fundamentals - Morning Class",
    courseId: "1",
    courseName: "React Fundamentals",
    teacher: "Sarah Johnson",
    room: "Room 101",
    currentStudents: 25,
    maxStudents: 30,
    status: "active",
    schedule: "Mon, Wed, Fri 9:00-11:00",
    startDate: "2024-01-15",
    endDate: "2024-03-15"
  },
  {
    id: "CLS002",
    name: "React Fundamentals - Evening Class",
    courseId: "1",
    courseName: "React Fundamentals",
    teacher: "Michael Chen",
    room: "Room 102",
    currentStudents: 30,
    maxStudents: 30,
    status: "full",
    schedule: "Tue, Thu 18:00-20:00",
    startDate: "2024-01-15",
    endDate: "2024-03-15"
  },
  {
    id: "CLS003",
    name: "Advanced JavaScript - Section A",
    courseId: "2",
    courseName: "Advanced JavaScript",
    teacher: "Mike Chen",
    room: "Room 203",
    currentStudents: 18,
    maxStudents: 25,
    status: "active",
    schedule: "Mon, Wed, Fri 14:00-16:00",
    startDate: "2024-02-01",
    endDate: "2024-04-15"
  },
  {
    id: "CLS004",
    name: "Advanced JavaScript - Section B",
    courseId: "2",
    courseName: "Advanced JavaScript",
    teacher: "Emily Rodriguez",
    room: "Room 204",
    currentStudents: 22,
    maxStudents: 25,
    status: "active",
    schedule: "Tue, Thu, Sat 10:00-12:00",
    startDate: "2024-02-01",
    endDate: "2024-04-15"
  },
  {
    id: "CLS005",
    name: "UI/UX Design - Beginner",
    courseId: "3",
    courseName: "UI/UX Design Principles",
    teacher: "Emily Rodriguez",
    room: "Design Lab 1",
    currentStudents: 0,
    maxStudents: 20,
    status: "inactive",
    schedule: "Mon, Wed 16:00-18:00",
    startDate: "2024-03-01",
    endDate: "2024-04-15"
  },
  {
    id: "CLS006",
    name: "Python for Data Science - Morning",
    courseId: "4",
    courseName: "Python for Data Science",
    teacher: "Dr. Alex Kumar",
    room: "Lab 301",
    currentStudents: 22,
    maxStudents: 25,
    status: "active",
    schedule: "Mon, Wed, Fri 9:00-11:00",
    startDate: "2024-01-20",
    endDate: "2024-04-20"
  },
  {
    id: "CLS007",
    name: "Python for Data Science - Evening",
    courseId: "4",
    courseName: "Python for Data Science",
    teacher: "Dr. Alex Kumar",
    room: "Lab 302",
    currentStudents: 20,
    maxStudents: 25,
    status: "active",
    schedule: "Tue, Thu 18:00-20:00",
    startDate: "2024-01-20",
    endDate: "2024-04-20"
  },
  {
    id: "CLS008",
    name: "Mobile App Development - iOS",
    courseId: "5",
    courseName: "Mobile App Development",
    teacher: "James Wilson",
    room: "Room 405",
    currentStudents: 15,
    maxStudents: 20,
    status: "active",
    schedule: "Mon, Wed, Fri 14:00-17:00",
    startDate: "2024-02-15",
    endDate: "2024-05-15"
  },
  {
    id: "CLS009",
    name: "Mobile App Development - Android",
    courseId: "5",
    courseName: "Mobile App Development",
    teacher: "James Wilson",
    room: "Room 406",
    currentStudents: 18,
    maxStudents: 20,
    status: "active",
    schedule: "Tue, Thu, Sat 10:00-13:00",
    startDate: "2024-02-15",
    endDate: "2024-05-15"
  },
  {
    id: "CLS010",
    name: "Web Development Bootcamp",
    courseId: "6",
    courseName: "Full Stack Web Development",
    teacher: "Sarah Johnson",
    room: "Room 501",
    currentStudents: 28,
    maxStudents: 30,
    status: "active",
    schedule: "Mon-Fri 9:00-12:00",
    startDate: "2024-01-10",
    endDate: "2024-06-10"
  },
  {
    id: "CLS011",
    name: "Database Management - SQL",
    courseId: "7",
    courseName: "Database Management Systems",
    teacher: "Michael Chen",
    room: "Lab 201",
    currentStudents: 16,
    maxStudents: 25,
    status: "active",
    schedule: "Mon, Wed 15:00-17:00",
    startDate: "2024-02-05",
    endDate: "2024-04-05"
  },
  {
    id: "CLS012",
    name: "Machine Learning Basics",
    courseId: "8",
    courseName: "Introduction to Machine Learning",
    teacher: "Dr. Alex Kumar",
    room: "Lab 303",
    currentStudents: 24,
    maxStudents: 25,
    status: "active",
    schedule: "Tue, Thu, Sat 14:00-16:00",
    startDate: "2024-01-25",
    endDate: "2024-05-25"
  },
  {
    id: "CLS013",
    name: "Cloud Computing - AWS",
    courseId: "9",
    courseName: "Cloud Computing with AWS",
    teacher: "James Wilson",
    room: "Room 307",
    currentStudents: 20,
    maxStudents: 25,
    status: "active",
    schedule: "Mon, Wed, Fri 10:00-12:00",
    startDate: "2024-02-10",
    endDate: "2024-05-10"
  },
  {
    id: "CLS014",
    name: "Cybersecurity Fundamentals",
    courseId: "10",
    courseName: "Cybersecurity Basics",
    teacher: "Emily Rodriguez",
    room: "Security Lab",
    currentStudents: 25,
    maxStudents: 25,
    status: "full",
    schedule: "Tue, Thu 16:00-18:00",
    startDate: "2024-02-01",
    endDate: "2024-04-30"
  },
  {
    id: "CLS015",
    name: "DevOps Engineering",
    courseId: "11",
    courseName: "DevOps Practices",
    teacher: "Michael Chen",
    room: "Room 408",
    currentStudents: 0,
    maxStudents: 20,
    status: "inactive",
    schedule: "Mon, Wed 18:00-20:00",
    startDate: "2024-03-15",
    endDate: "2024-06-15"
  }
];

// Statistics derived from mock data
export const getClassStatistics = () => {
  const totalClasses = mockClasses.length;
  const activeClasses = mockClasses.filter(c => c.status === 'active').length;
  const fullClasses = mockClasses.filter(c => c.status === 'full').length;
  const totalStudents = mockClasses.reduce((sum, c) => sum + c.currentStudents, 0);

  return {
    totalClasses,
    activeClasses,
    fullClasses,
    totalStudents
  };
};

// Get classes by status
export const getClassesByStatus = (status: "active" | "inactive" | "full") => {
  return mockClasses.filter(c => c.status === status);
};

// Get classes by teacher
export const getClassesByTeacher = (teacherName: string) => {
  return mockClasses.filter(c => c.teacher === teacherName);
};

// Get all unique teachers
export const getAllTeachers = () => {
  const teachers = new Set(mockClasses.map(c => c.teacher));
  return Array.from(teachers);
};

// Get classes by course
export const getClassesByCourse = (courseId: string) => {
  return mockClasses.filter(c => c.courseId === courseId);
};

