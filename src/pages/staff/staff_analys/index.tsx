import { useState, useEffect } from "react";
import Table from "../../../components/ui/Table";
import PageHeader from "../../../components/ui/PageHeader";
import Breadcrumbs from "../../../components/ui/Breadcrumbs";
import type { PageHeaderControl } from "../../../components/ui/PageHeader";

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

// Enhanced bar chart component with animations and hover effects
const BarChart = ({ data, title, chartHeight = 200 }: { data: number[], title: string, chartHeight?: number }) => {
    const maxValue = Math.max(...data);
    const steps = 4;
    const [animatedData, setAnimatedData] = useState<number[]>(new Array(data.length).fill(0));
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setAnimatedData(data);
      }, 300);
      return () => clearTimeout(timer);
    }, [data]);
  
    return (
      <div className="space-y-4 mt-6">
        <div className="flex space-x-3">
          {/* Y-axis labels */}
          <div className="relative pr-4" style={{ height: `${chartHeight}px` }}>
            {Array.from({ length: steps + 1 }).map((_, i) => {
              const value = Math.round((maxValue / steps) * i);
              return (
                <div
                  key={i}
                  className="absolute left-0 text-xs text-neutral-500 font-medium"
                  style={{ bottom: `${(i / steps) * chartHeight - 6}px` }}
                >
                  {value}
                </div>
              );
            })}
          </div>
  
          {/* Chart bars */}
          <div className="flex items-end justify-between gap-2 flex-1" style={{ height: `${chartHeight}px` }}>
            {animatedData.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="w-full flex items-end" style={{ height: `${chartHeight}px` }}>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg shadow-sm transition-all duration-700 ease-out hover:from-blue-600 hover:to-blue-700 hover:shadow-md transform hover:scale-105 relative overflow-hidden"
                    style={{ 
                      height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`,
                      minHeight: value > 0 ? '4px' : '0px'
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    {/* Value tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {value}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-neutral-600 mt-2 font-medium">
                  {new Date(2024, index).toLocaleDateString('en', { month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
  
        <div className="text-center">
          <div className="text-xs text-neutral-500 mb-1">Timeline (2024)</div>
          <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
        </div>
      </div>
    );
  };
  

// Enhanced pie chart component with animations and better styling
const PieChart = ({ data, title }: { data: { label: string, value: number, color: string }[], title: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="space-y-2 h-full">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">{title}</h3>
        <p className="text-sm text-neutral-500">Total Students: {total.toLocaleString()}</p>
      </div>
      
      <div className="flex lg:flex-row flex-col w-full gap-8 items-center">
        {/* Pie Chart */}
        <div className="flex lg:w-1/2 items-center justify-center">
          <div className="relative w-72 h-72">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="2"
                className="opacity-30"
              />
              
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const startAngle = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
                const endAngle = startAngle + (item.value / total) * 360;
                
                const largeArcFlag = percentage > 50 ? 1 : 0;
                const isHovered = hoveredIndex === index;
                const radius = isHovered ? 38 : 35;
                
                const hx1 = 50 + radius * Math.cos(startAngle * Math.PI / 180);
                const hy1 = 50 + radius * Math.sin(startAngle * Math.PI / 180);
                const hx2 = 50 + radius * Math.cos(endAngle * Math.PI / 180);
                const hy2 = 50 + radius * Math.sin(endAngle * Math.PI / 180);
                
                return (
                  <g key={index}>
                    <path
                      d={`M 50 50 L ${hx1} ${hy1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${hx2} ${hy2} Z`}
                      fill={item.color}
                      className={`transition-all duration-300 cursor-pointer ${
                        animationComplete ? 'opacity-100' : 'opacity-0'
                      } ${isHovered ? 'drop-shadow-lg' : 'hover:brightness-110'}`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{
                        filter: isHovered ? 'brightness(1.1)' : undefined,
                        transformOrigin: '50% 50%',
                      }}
                    />
                    
                    {/* Percentage label */}
                    {percentage > 8 && (
                      <text
                        x={50 + 25 * Math.cos((startAngle + endAngle) / 2 * Math.PI / 180)}
                        y={50 + 25 * Math.sin((startAngle + endAngle) / 2 * Math.PI / 180)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-white text-xs font-semibold transform rotate-90"
                        style={{ transform: 'rotate(90deg)' }}
                      >
                        {percentage.toFixed(0)}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        
        {/* Legend */}
        <div className="lg:w-1/2 space-y-3">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            const isHovered = hoveredIndex === index;
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-1 rounded-lg transition-all duration-200 cursor-pointer ${
                  isHovered ? 'bg-gray-50 shadow-sm scale-105' : 'hover:bg-gray-50'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-neutral-700">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-neutral-900">{item.value}</div>
                  <div className="text-xs text-neutral-500">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function StaffAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  const breadcrumbItems = [
    { label: "Analytics" }
  ];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 min-h-screen">
      <div className={`max-w-7xl mx-auto space-y-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />
        
        {/* Page Header */}
        <PageHeader
          title="Academic Analytics"
          description="Comprehensive overview of center performance and key metrics"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          controls={[
            {
              type: 'select',
              label: 'Course Filter',
              options: courseOptions,
              value: selectedCourse,
              onChange: (e) => setSelectedCourse(e.target.value),
              className: 'w-full sm:w-48'
            },
            {
              type: 'select',
              label: 'Time Period',
              options: periodOptions,
              value: selectedPeriod,
              onChange: (e) => setSelectedPeriod(e.target.value),
              className: 'w-full sm:w-40'
            },
            {
              type: 'button',
              label: 'Export Data',
              variant: 'secondary',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              className: 'mt-6'
              ,
              onClick: () => {
                // Handle export functionality
                console.log('Export data clicked');
              }
            }
          ] as PageHeaderControl[]}
        />

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Students Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{mockData.totalStudents.toLocaleString()}</div>
                  <div className="text-blue-100 text-sm font-medium">Total Students</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-200">This Month</span>
                <div className="flex items-center gap-1 text-green-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                  <span className="font-semibold">+12%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Courses Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{mockData.totalCourses}</div>
                  <div className="text-emerald-100 text-sm font-medium">Active Courses</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-200">Available</span>
                <div className="flex items-center gap-1 text-green-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-semibold">2 New</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Teachers Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-violet-500 via-violet-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{mockData.totalTeachers}</div>
                  <div className="text-violet-100 text-sm font-medium">Expert Teachers</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-violet-200">Faculty</span>
                <div className="flex items-center gap-1 text-green-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-semibold">1 Joined</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Completion Rate Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{mockData.completionRate}%</div>
                  <div className="text-amber-100 text-sm font-medium">Success Rate</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-200">Completion</span>
                <div className="flex items-center gap-1 text-green-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                  <span className="font-semibold">+3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Enrollments</h3>
                <p className="text-sm text-gray-600">Student registration trends throughout the year</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <BarChart data={mockData.monthlyEnrollments} title="" />
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Course Distribution</h3>
                <p className="text-sm text-gray-600">Student enrollment across different programs</p>
              </div>
            </div>
            <div className="flex-1">
              <PieChart 
                data={[
                  { label: "IELTS Foundation", value: 156, color: "#3B82F6" },
                  { label: "TOEIC Preparation", value: 134, color: "#10B981" },
                  { label: "Business English", value: 98, color: "#8B5CF6" },
                  { label: "Conversational", value: 187, color: "#F59E0B" },
                  { label: "Academic Writing", value: 76, color: "#EF4444" }
                ]} 
                title="" 
              />
            </div>
          </div>
        </div>

        {/* Enhanced Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Course Performance</h3>
                <p className="text-sm text-gray-600">Detailed metrics for each program</p>
              </div>
            </div>
            <Table 
              columns={coursePerformanceColumns} 
              data={mockData.coursePerformance}
              emptyState="No course data available"
            />
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Teacher Performance</h3>
                <p className="text-sm text-gray-600">Faculty evaluation and statistics</p>
              </div>
            </div>
            <Table 
              columns={teacherPerformanceColumns} 
              data={mockData.teacherPerformance}
              emptyState="No teacher data available"
            />
          </div>
        </div>

        {/* Enhanced Recent Activities */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <p className="text-sm text-gray-600">Latest updates and academic events</p>
            </div>
          </div>
          <Table 
            columns={recentActivitiesColumns} 
            data={mockData.recentActivities}
            emptyState="No recent activities"
          />
        </div>

        {/* Enhanced Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Average Score</h3>
                <p className="text-sm text-gray-600">Student performance metrics</p>
              </div>
            </div>
            <div className="text-center py-6">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {mockData.averageScore}
              </div>
              <div className="text-gray-700 font-medium mb-2">Overall Center Average</div>
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
                <span className="font-semibold">+0.3 from last month</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Achievement Rate</h3>
                <p className="text-sm text-gray-600">Target completion status</p>
              </div>
            </div>
            <div className="text-center py-6">
              <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
                94%
              </div>
              <div className="text-gray-700 font-medium mb-2">Monthly Target Achieved</div>
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
                <span className="font-semibold">4% above target</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Students</h3>
                <p className="text-sm text-gray-600">Currently enrolled learners</p>
              </div>
            </div>
            <div className="text-center py-6">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                {mockData.activeEnrollments.toLocaleString()}
              </div>
              <div className="text-gray-700 font-medium mb-2">Active Enrollments</div>
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-semibold">71% participation rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   
  );
}
