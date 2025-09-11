import { useState } from "react";
import Card from "../../../components/ui/Card";
import Table from "../../../components/ui/Table";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";

// Mock data - in real implementation this would come from API
const mockData = {
  totalStudents: 1247,
  totalCourses: 23,
  totalTeachers: 18,
  activeEnrollments: 892,
  completionRate: 87.5,
  averageScore: 8.7,
  monthlyEnrollments: [45, 52, 38, 61, 49, 67, 58, 72, 65, 78, 81, 120],
  coursePerformance: [
    { name: "IELTS Foundation", students: 156, avgScore: 8.9, completion: 92 },
    { name: "TOEIC Preparation", students: 134, avgScore: 8.5, completion: 88 },
    { name: "Business English", students: 98, avgScore: 8.2, completion: 85 },
    { name: "Conversational English", students: 187, avgScore: 8.7, completion: 90 },
    { name: "Academic Writing", students: 76, avgScore: 8.1, completion: 82 }
  ],
  teacherPerformance: [
    { name: "Nguyen Thi Anh", courses: 4, students: 89, avgRating: 4.8 },
    { name: "Tran Van Binh", courses: 3, students: 67, avgRating: 4.6 },
    { name: "Le Thi Cam", courses: 5, students: 112, avgRating: 4.9 },
    { name: "Pham Van Dung", courses: 2, students: 45, avgRating: 4.4 },
    { name: "Hoang Thi Em", courses: 4, students: 78, avgRating: 4.7 }
  ],
  recentActivities: [
    { type: "Enrollment", description: "New student enrolled in IELTS course", time: "2 hours ago" },
    { type: "Completion", description: "TOEIC course completed with 95% success rate", time: "4 hours ago" },
    { type: "Assessment", description: "Final exam for Business English course", time: "6 hours ago" },
    { type: "Feedback", description: "New feedback received from IELTS student", time: "8 hours ago" }
  ]
};

// Simple bar chart component
const BarChart = ({ data, title, chartHeight = 200 }: { data: number[], title: string, chartHeight?: number }) => {
    const maxValue = Math.max(...data);
    const steps = 4; // số nấc chia trục Y
  
    return (
      <div className="space-y-2 mt-4">
        <div className="flex space-x-2">
          {/* Cột số lượng (trục Y) */}
          <div className="relative pr-3" style={{ height: `${chartHeight}px` }}>
            {Array.from({ length: steps + 1 }).map((_, i) => {
              const value = Math.round((maxValue / steps) * i);
              return (
                <div
                  key={i}
                  className="absolute left-0 text-xs text-neutral-500"
                  style={{ bottom: `${(i / steps) * chartHeight}px` }}
                >
                  {value}
                </div>
              );
            })}
          </div>
  
          {/* Biểu đồ cột */}
          <div className="flex items-end justify-between space-x-1 flex-1" style={{ height: `${chartHeight}px` }}>
            {data.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                {/* wrapper có height = chartHeight */}
                <div className="w-full flex items-end" style={{ height: `${chartHeight}px` }}>
                  <div
                    className="w-full bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600"
                    style={{ height: `${(value / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-600 mt-1">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
  
        <div className="text-xs text-neutral-500 text-center">Month</div>
        <h3 className="text-sm font-medium text-neutral-700 w-full text-center mt-2">{title}</h3>
      </div>
    );
  };
  

// Simple pie chart component
const PieChart = ({ data, title }: { data: { label: string, value: number, color: string }[], title: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="space-y-3 h-full">
      <h3 className="text-sm font-medium text-neutral-700">{title}</h3>
      <div className="flex lg:flex-row flex-col w-full gap-4 items-center">
      <div className="flex lg:w-1/2 items-center justify-center">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const startAngle = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
              const endAngle = startAngle + (item.value / total) * 360;
              
              const x1 = 50 + 40 * Math.cos(startAngle * Math.PI / 180);
              const y1 = 50 + 40 * Math.sin(startAngle * Math.PI / 180);
              const x2 = 50 + 40 * Math.cos(endAngle * Math.PI / 180);
              const y2 = 50 + 40 * Math.sin(endAngle * Math.PI / 180);
              
              const largeArcFlag = percentage > 50 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={item.color}
                  className="transition-all duration-300 hover:opacity-80"
                />
              );
            })}
          </svg>
        </div>
      </div>
      <div className="lg:w-1/2 space-y-1 flex flex-col item-center text-center">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-neutral-700">{item.label}</span>
            <span className="text-neutral-500">({item.value})</span>
          </div>
        ))}
      </div>
      </div>
     
    </div>
  );
};

export default function StaffAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCourse, setSelectedCourse] = useState("all");

  const periodOptions = [
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "This Quarter", value: "quarter" },
    { label: "This Year", value: "year" }
  ];

  const courseOptions = [
    { label: "All Courses", value: "all" },
    { label: "IELTS Foundation", value: "ielts" },
    { label: "TOEIC Preparation", value: "toeic" },
    { label: "Business English", value: "business" },
    { label: "Conversational English", value: "conversational" },
    { label: "Academic Writing", value: "academic" }
  ];

  const coursePerformanceColumns = [
    { header: "Course Name", accessor: (row: any) => row.name },
    { header: "Students", accessor: (row: any) => row.students },
    { header: "Avg Score", accessor: (row: any) => row.avgScore },
    { header: "Completion Rate (%)", accessor: (row: any) => row.completion }
  ];

  const teacherPerformanceColumns = [
    { header: "Teacher Name", accessor: (row: any) => row.name },
    { header: "Courses", accessor: (row: any) => row.courses },
    { header: "Students", accessor: (row: any) => row.students },
    { header: "Avg Rating", accessor: (row: any) => row.avgRating }
  ];

  const recentActivitiesColumns = [
    { header: "Type", accessor: (row: any) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        row.type === "Enrollment" ? "bg-green-100 text-green-800" :
        row.type === "Completion" ? "bg-blue-100 text-blue-800" :
        row.type === "Assessment" ? "bg-purple-100 text-purple-800" :
        "bg-orange-100 text-orange-800"
      }`}>
        {row.type}
      </span>
    )},
    { header: "Description", accessor: (row: any) => row.description },
    { header: "Time", accessor: (row: any) => row.time }
  ];

  return (
    <div className=" mt-16 p-4 md:p-8 lg:pl-0 bg-gray-50">
         <div className="min-h-screen ">
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Academic Analytics</h1>
            <p className="text-neutral-600 mt-1">Overview of center performance and statistics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select
              label="Select Course"
              options={courseOptions}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-48"
            />
            <Select
              label="Select Period"
              options={periodOptions}
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-40"
            />
            <Button variant="primary">
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{mockData.totalStudents.toLocaleString()}</div>
              <div className="text-blue-100">Total Students</div>
              <div className="text-sm text-blue-200 mt-1">+12% from last month</div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{mockData.totalCourses}</div>
              <div className="text-green-100">Courses</div>
              <div className="text-sm text-green-200 mt-1">+2 new courses</div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{mockData.totalTeachers}</div>
              <div className="text-purple-100">Teachers</div>
              <div className="text-sm text-purple-200 mt-1">+1 new teacher</div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{mockData.completionRate}%</div>
              <div className="text-orange-100">Completion Rate</div>
              <div className="text-sm text-orange-200 mt-1">+3% from last month</div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-full" title="Monthly Enrollments" description="Number of new student enrollments">
            <div className="flex flex-col justify-end h-full">
                
                <BarChart data={mockData.monthlyEnrollments} title="Monthly Enrollments" />
            </div>
            
          </Card>
          
          <Card title="Course Distribution" description="Student distribution across courses">
            <PieChart 
              data={[
                { label: "IELTS", value: 156, color: "#3B82F6" },
                { label: "TOEIC", value: 134, color: "#10B981" },
                { label: "Business", value: 98, color: "#8B5CF6" },
                { label: "Conversational", value: 187, color: "#F59E0B" },
                { label: "Academic", value: 76, color: "#EF4444" }
              ]} 
              title="Student Distribution by Course" 
            />
          </Card>
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Course Performance" description="Detailed statistics for each course">
            <Table 
              columns={coursePerformanceColumns} 
              data={mockData.coursePerformance}
              emptyState="No course data available"
            />
          </Card>
          
          <Card title="Teacher Performance" description="Teacher evaluation and statistics">
            <Table 
              columns={teacherPerformanceColumns} 
              data={mockData.teacherPerformance}
              emptyState="No teacher data available"
            />
          </Card>
        </div>

        {/* Recent Activities */}
        <Card title="Recent Activities" description="Latest updates on academic affairs">
          <Table 
            columns={recentActivitiesColumns} 
            data={mockData.recentActivities}
            emptyState="No recent activities"
          />
        </Card>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Average Score" description="Student score statistics">
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-primary-600">{mockData.averageScore}</div>
              <div className="text-neutral-600 mt-2">Overall center average</div>
              <div className="text-sm text-green-600 mt-1">↑ +0.3 from last month</div>
            </div>
          </Card>
          
          <Card title="Goal Achievement Rate" description="Comparison with set targets">
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-green-600">94%</div>
              <div className="text-neutral-600 mt-2">Monthly target achieved</div>
              <div className="text-sm text-green-600 mt-1">4% above plan</div>
            </div>
          </Card>
          
          <Card title="Active Students" description="Students regularly participating">
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-blue-600">{mockData.activeEnrollments}</div>
              <div className="text-neutral-600 mt-2">Currently enrolled students</div>
              <div className="text-sm text-blue-600 mt-1">71% of total students</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
    </div>
   
  );
}
