import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Select from "@/components/ui/Select";
import { 
  Users, GraduationCap, TrendingUp, DollarSign, BookOpen, 
  School, BarChart3, LineChart, Filter, MessageSquare, AlertCircle
} from "lucide-react";
import type { PageHeaderControl } from "@/components/ui/PageHeader";

// Mock data
const mockData = {
  // Weekly data
  weeklyData: {
    revenue: [
      { week: "W1", value: 125000000 },
      { week: "W2", value: 142000000 },
      { week: "W3", value: 138000000 },
      { week: "W4", value: 156000000 },
    ],
    students: [
      { week: "W1", value: 245 },
      { week: "W2", value: 268 },
      { week: "W3", value: 252 },
      { week: "W4", value: 289 },
    ],
    enrollments: [
      { week: "W1", value: 45 },
      { week: "W2", value: 52 },
      { week: "W3", value: 48 },
      { week: "W4", value: 58 },
    ],
    attendance: [
      { week: "W1", value: 92 },
      { week: "W2", value: 94 },
      { week: "W3", value: 91 },
      { week: "W4", value: 95 },
    ],
  },
  // Monthly data
  monthlyData: {
    revenue: [
      { month: "Jan", value: 456000000 },
      { month: "Feb", value: 478000000 },
      { month: "Mar", value: 492000000 },
      { month: "Apr", value: 510000000 },
      { month: "May", value: 528000000 },
      { month: "Jun", value: 545000000 },
    ],
    students: [
      { month: "Jan", value: 1245 },
      { month: "Feb", value: 1289 },
      { month: "Mar", value: 1324 },
      { month: "Apr", value: 1367 },
      { month: "May", value: 1402 },
      { month: "Jun", value: 1456 },
    ],
    enrollments: [
      { month: "Jan", value: 187 },
      { month: "Feb", value: 198 },
      { month: "Mar", value: 205 },
      { month: "Apr", value: 212 },
      { month: "May", value: 218 },
      { month: "Jun", value: 225 },
    ],
    attendance: [
      { month: "Jan", value: 88 },
      { month: "Feb", value: 90 },
      { month: "Mar", value: 89 },
      { month: "Apr", value: 92 },
      { month: "May", value: 93 },
      { month: "Jun", value: 94 },
    ],
  },
  // Course details
  courseDetails: [
    {
      id: 1,
      courseName: "IELTS Foundation",
      totalClasses: 12,
      activeClasses: 10,
      students: 156,
      revenue: 312000000,
      avgRating: 4.8,
      completionRate: 94,
      status: "Active"
    },
    {
      id: 2,
      courseName: "TOEIC Preparation",
      totalClasses: 10,
      activeClasses: 8,
      students: 134,
      revenue: 268000000,
      avgRating: 4.7,
      completionRate: 91,
      status: "Active"
    },
    {
      id: 3,
      courseName: "Business English",
      totalClasses: 8,
      activeClasses: 7,
      students: 98,
      revenue: 196000000,
      avgRating: 4.6,
      completionRate: 88,
      status: "Active"
    },
    {
      id: 4,
      courseName: "Academic Writing",
      totalClasses: 6,
      activeClasses: 5,
      students: 76,
      revenue: 152000000,
      avgRating: 4.5,
      completionRate: 85,
      status: "Active"
    },
  ],
  // Class details with full metrics
  classDetails: [
    {
      id: 1,
      className: "IELTS-A01",
      course: "IELTS Foundation",
      teacher: "Dr. Nguyen Thi Anh",
      students: 45,
      capacity: 50,
      utilization: 90,
      avgAttendance: 94,
      assignmentSubmissionRate: 88,
      assignmentCompletionRate: 92,
      avgRating: 4.8,
      avgScore: 8.7,
      status: "Active",
      schedule: "Mon, Wed, Fri - 9:00 AM"
    },
    {
      id: 2,
      className: "IELTS-A02",
      course: "IELTS Foundation",
      teacher: "Mr. Tran Van Binh",
      students: 38,
      capacity: 50,
      utilization: 76,
      avgAttendance: 92,
      assignmentSubmissionRate: 85,
      assignmentCompletionRate: 89,
      avgRating: 4.7,
      avgScore: 8.5,
      status: "Active",
      schedule: "Tue, Thu - 2:00 PM"
    },
    {
      id: 3,
      className: "TOEIC-B01",
      course: "TOEIC Preparation",
      teacher: "Ms. Le Thi Cam",
      students: 42,
      capacity: 40,
      utilization: 105,
      avgAttendance: 95,
      assignmentSubmissionRate: 90,
      assignmentCompletionRate: 94,
      avgRating: 4.9,
      avgScore: 8.4,
      status: "Active",
      schedule: "Mon, Wed, Fri - 2:00 PM"
    },
    {
      id: 4,
      className: "BE-C01",
      course: "Business English",
      teacher: "Dr. Pham Van Dung",
      students: 32,
      capacity: 35,
      utilization: 91,
      avgAttendance: 89,
      assignmentSubmissionRate: 82,
      assignmentCompletionRate: 87,
      avgRating: 4.6,
      avgScore: 8.2,
      status: "Active",
      schedule: "Tue, Thu - 9:00 AM"
    },
    {
      id: 5,
      className: "AW-D01",
      course: "Academic Writing",
      teacher: "Dr. Hoang Thi Em",
      students: 28,
      capacity: 30,
      utilization: 93,
      avgAttendance: 91,
      assignmentSubmissionRate: 95,
      assignmentCompletionRate: 96,
      avgRating: 4.8,
      avgScore: 8.6,
      status: "Active",
      schedule: "Mon, Wed - 10:00 AM"
    },
  ],
  // Teacher details
  teacherDetails: [
    {
      id: 1,
      name: "Dr. Nguyen Thi Anh",
      email: "nguyen.anh@cets.edu",
      phone: "0901234567",
      courses: ["IELTS Foundation", "Academic Writing"],
      totalClasses: 3,
      totalStudents: 89,
      avgRating: 4.8,
      totalHours: 120,
      avgAttendance: 94,
      completionRate: 92,
      status: "Active"
    },
    {
      id: 2,
      name: "Mr. Tran Van Binh",
      email: "tran.binh@cets.edu",
      phone: "0902345678",
      courses: ["IELTS Foundation"],
      totalClasses: 2,
      totalStudents: 67,
      avgRating: 4.7,
      totalHours: 80,
      avgAttendance: 92,
      completionRate: 89,
      status: "Active"
    },
    {
      id: 3,
      name: "Ms. Le Thi Cam",
      email: "le.cam@cets.edu",
      phone: "0903456789",
      courses: ["TOEIC Preparation", "Business English"],
      totalClasses: 3,
      totalStudents: 112,
      avgRating: 4.9,
      totalHours: 140,
      avgAttendance: 95,
      completionRate: 94,
      status: "Active"
    },
    {
      id: 4,
      name: "Dr. Pham Van Dung",
      email: "pham.dung@cets.edu",
      phone: "0904567890",
      courses: ["Business English"],
      totalClasses: 2,
      totalStudents: 45,
      avgRating: 4.6,
      totalHours: 70,
      avgAttendance: 89,
      completionRate: 87,
      status: "Active"
    },
    {
      id: 5,
      name: "Dr. Hoang Thi Em",
      email: "hoang.em@cets.edu",
      phone: "0905678901",
      courses: ["Academic Writing"],
      totalClasses: 1,
      totalStudents: 28,
      avgRating: 4.8,
      totalHours: 50,
      avgAttendance: 91,
      completionRate: 96,
      status: "Active"
    },
  ],
  // Financial reports
  financialReports: {
    totalRevenue: 4567800000,
    revenueThisMonth: 456780000,
    revenueLastMonth: 428000000,
    revenueGrowth: 6.7,
    expenses: {
      total: 1580000000,
      salaries: 980000000,
      facilities: 320000000,
      marketing: 180000000,
      other: 100000000
    },
    profit: 2987800000,
    profitMargin: 65.4,
    pendingPayments: 125000000,
    overduePayments: 45000000,
    paymentMethods: [
      { method: "Bank Transfer", amount: 2345000000, percentage: 51.3 },
      { method: "Credit Card", amount: 1234000000, percentage: 27.0 },
      { method: "E-Wallet", amount: 678000000, percentage: 14.8 },
      { method: "Cash", amount: 310800000, percentage: 6.9 }
    ],
    monthlyBreakdown: [
      { month: "Jan", revenue: 456000000, expenses: 145000000, profit: 311000000 },
      { month: "Feb", revenue: 478000000, expenses: 152000000, profit: 326000000 },
      { month: "Mar", revenue: 492000000, expenses: 148000000, profit: 344000000 },
      { month: "Apr", revenue: 510000000, expenses: 155000000, profit: 355000000 },
      { month: "May", revenue: 528000000, expenses: 162000000, profit: 366000000 },
      { month: "Jun", revenue: 545000000, expenses: 158000000, profit: 387000000 },
    ]
  },
  // Staff feedback completion stats
  staffFeedbackStats: [
    {
      id: 1,
      staffName: "Nguyen Van A",
      role: "Academic Staff",
      email: "nguyen.a@cets.edu",
      totalFeedback: 12,
      completedFeedback: 11,
      pendingFeedback: 1,
      completionRate: 91.7,
      lastFeedbackDate: "2024-06-15"
    },
    {
      id: 2,
      staffName: "Tran Thi B",
      role: "Accountant Staff",
      email: "tran.b@cets.edu",
      totalFeedback: 8,
      completedFeedback: 7,
      pendingFeedback: 1,
      completionRate: 87.5,
      lastFeedbackDate: "2024-06-14"
    },
    {
      id: 3,
      staffName: "Le Van C",
      role: "Academic Staff",
      email: "le.c@cets.edu",
      totalFeedback: 15,
      completedFeedback: 14,
      pendingFeedback: 1,
      completionRate: 93.3,
      lastFeedbackDate: "2024-06-13"
    },
    {
      id: 4,
      staffName: "Pham Thi D",
      role: "Accountant Staff",
      email: "pham.d@cets.edu",
      totalFeedback: 10,
      completedFeedback: 9,
      pendingFeedback: 1,
      completionRate: 90.0,
      lastFeedbackDate: "2024-06-12"
    },
    {
      id: 5,
      staffName: "Hoang Van E",
      role: "Academic Staff",
      email: "hoang.e@cets.edu",
      totalFeedback: 9,
      completedFeedback: 8,
      pendingFeedback: 1,
      completionRate: 88.9,
      lastFeedbackDate: "2024-06-11"
    },
    {
      id: 6,
      staffName: "Vo Thi F",
      role: "Accountant Staff",
      email: "vo.f@cets.edu",
      totalFeedback: 11,
      completedFeedback: 10,
      pendingFeedback: 1,
      completionRate: 90.9,
      lastFeedbackDate: "2024-06-10"
    },
  ],
};

// Available metrics to track
const availableMetrics = [
  { id: "revenue", label: "Revenue", icon: DollarSign, color: "#10B981" },
  { id: "students", label: "Students", icon: Users, color: "#3B82F6" },
  { id: "enrollments", label: "New Enrollments", icon: TrendingUp, color: "#8B5CF6" },
  { id: "attendance", label: "Attendance Rate", icon: School, color: "#F59E0B" },
];

// Chart Component
const Chart = ({ 
  data, 
  period, 
  metric, 
  color 
}: { 
  data: any[]; 
  period: "week" | "month";
  metric: string;
  color: string;
}) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const isCurrency = metric === "revenue";
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 h-64">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="w-full flex items-end" style={{ height: "200px" }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80 relative"
                  style={{ 
                    height: `${height}%`,
                    backgroundColor: color,
                    minHeight: item.value > 0 ? '4px' : '0px'
                  }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {isCurrency 
                      ? `${(item.value / 1000000).toFixed(0)}M VND`
                      : item.value.toLocaleString()
                    }
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-600 font-medium mt-2">{item[period === "week" ? "week" : "month"]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Line Chart Component
const LineChartComponent = ({ 
  data, 
  period, 
  metric, 
  color 
}: { 
  data: any[]; 
  period: "week" | "month";
  metric: string;
  color: string;
}) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue || 1;
  const isCurrency = metric === "revenue";
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return { x, y, value: item.value, label: item[period === "week" ? "week" : "month"] };
  });

  const pathData = points.map(p => `${p.x},${p.y}`).join(' L ');

  return (
    <div className="space-y-4">
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}
          {/* Line */}
          <path
            d={`M ${pathData}`}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Area under line */}
          <path
            d={`M ${pathData} L 100,100 L 0,100 Z`}
            fill={color}
            opacity="0.1"
          />
          {/* Points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill={color}
                className="hover:r-4 transition-all cursor-pointer"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill={color}
                opacity="0.2"
                className="hover:opacity-30 transition-all"
              />
            </g>
          ))}
        </svg>
        {/* Y-axis labels */}
        <div className="absolute left-2 top-2 bottom-2 flex flex-col justify-between text-xs text-gray-500">
          <span>{isCurrency ? `${(maxValue / 1000000).toFixed(0)}M` : maxValue.toLocaleString()}</span>
          <span>{isCurrency ? `${(minValue / 1000000).toFixed(0)}M` : minValue.toLocaleString()}</span>
        </div>
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pb-2 text-xs text-gray-500">
          {points.map((point, index) => (
            <span key={index}>{point.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function AdminAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("month");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["revenue", "students"]);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const currentData = selectedPeriod === "week" ? mockData.weeklyData : mockData.monthlyData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const breadcrumbItems = [{ label: "Analytics" }];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 min-h-screen">
      <div className={`max-w-7xl mx-auto space-y-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Breadcrumbs items={breadcrumbItems} />
        
        <PageHeader
          title="Analytics Dashboard"
          description="Track and analyze system performance"
          icon={<BarChart3 className="w-5 h-5 text-white" />}
          controls={[
            {
              type: 'select',
              label: 'Time Period',
              options: [
                { label: 'Weekly', value: 'week' },
                { label: 'Monthly', value: 'month' }
              ],
              value: selectedPeriod,
              onChange: (e) => setSelectedPeriod(e.target.value as "week" | "month"),
              className: 'w-full sm:w-40'
            },
            {
              type: 'select',
              label: 'Chart Type',
              options: [
                { label: 'Bar', value: 'bar' },
                { label: 'Line', value: 'line' }
              ],
              value: chartType,
              onChange: (e) => setChartType(e.target.value as "bar" | "line"),
              className: 'w-full sm:w-40'
            }
          ] as PageHeaderControl[]}
        />

        {/* Metric Selection */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Select Metrics to Track</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {availableMetrics.map((metric) => {
              const isSelected = selectedMetrics.includes(metric.id);
              const MetricIcon = metric.icon;
              return (
                <button
                  key={metric.id}
                  onClick={() => toggleMetric(metric.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MetricIcon className="w-4 h-4" />
                  <span className="font-medium">{metric.label}</span>
                  {isSelected && (
                    <span className="ml-1 text-blue-600">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Charts */}
        {selectedMetrics.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedMetrics.map((metricId) => {
              const metric = availableMetrics.find(m => m.id === metricId);
              if (!metric) return null;
              
              const data = currentData[metricId as keyof typeof currentData];
              
              return (
                <Card key={metricId} className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                      <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{metric.label}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedPeriod === "week" ? "Weekly" : "Monthly"}
                      </p>
                    </div>
                  </div>
                  {chartType === "bar" ? (
                    <Chart 
                      data={data} 
                      period={selectedPeriod} 
                      metric={metricId}
                      color={metric.color}
                    />
                  ) : (
                    <LineChartComponent 
                      data={data} 
                      period={selectedPeriod} 
                      metric={metricId}
                      color={metric.color}
                    />
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Tabs for detailed reports */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="classes">Class Details</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="feedback">Staff Feedback</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Keep existing charts */}
          <TabsContent value="overview" className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Course Report</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Classes</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Classes</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockData.courseDetails.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{course.courseName}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{course.totalClasses}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{course.activeClasses}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{course.students}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-green-600">
                          {formatCurrency(course.revenue)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">{course.avgRating}</span>
                            <span className="text-yellow-500">⭐</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="font-semibold text-blue-600">{course.completionRate}%</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {course.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Teacher Report</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courses</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classes</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Students</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teaching Hours</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockData.teacherDetails.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{teacher.name}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{teacher.email}</td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {teacher.courses.map((course, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {course}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{teacher.totalClasses}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{teacher.totalStudents}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{teacher.totalHours}h</td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">{teacher.avgRating}</span>
                            <span className="text-yellow-500">⭐</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="font-semibold text-blue-600">{teacher.avgAttendance}%</span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="font-semibold text-green-600">{teacher.completionRate}%</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {teacher.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Class Details Tab */}
          <TabsContent value="classes" className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-3 mb-6">
                <School className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Class Details</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment Submission</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment Completion</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockData.classDetails.map((classItem) => (
                      <tr key={classItem.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{classItem.className}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{classItem.course}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{classItem.teacher}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className="font-semibold">{classItem.students}</span>
                          <span className="text-gray-500">/{classItem.capacity}</span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="font-semibold text-blue-600">{classItem.avgAttendance}%</span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="font-semibold text-green-600">{classItem.assignmentSubmissionRate}%</span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="font-semibold text-purple-600">{classItem.assignmentCompletionRate}%</span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">{classItem.avgRating}</span>
                            <span className="text-yellow-500">⭐</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="font-semibold text-indigo-600">{classItem.avgScore}</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{classItem.schedule}</td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {classItem.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(mockData.financialReports.totalRevenue)}</div>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Revenue This Month</div>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(mockData.financialReports.revenueThisMonth)}</div>
                    <div className="text-xs text-green-600 mt-1">+{mockData.financialReports.revenueGrowth}%</div>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Annual Revenue</div>
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(mockData.financialReports.totalRevenue)}</div>
                    <div className="text-xs text-gray-600 mt-1">Total revenue</div>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-600">Pending Payments</div>
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(mockData.financialReports.pendingPayments)}</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-2 h-64">
                  {mockData.financialReports.monthlyBreakdown.map((item, index) => {
                    const maxValue = Math.max(...mockData.financialReports.monthlyBreakdown.map(m => m.revenue));
                    const revenueHeight = (item.revenue / maxValue) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group">
                        <div className="w-full flex items-end justify-center" style={{ height: "200px" }}>
                          <div
                            className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80 relative"
                            style={{ 
                              height: `${revenueHeight}%`,
                              backgroundColor: "#10B981",
                              minHeight: item.revenue > 0 ? '4px' : '0px'
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {formatCurrency(item.revenue)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium mt-2">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                {mockData.financialReports.paymentMethods.map((method, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{method.method}</span>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(method.amount)}</div>
                      <div className="text-xs text-gray-500">{method.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Staff Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-semibold text-gray-900">Staff Feedback Completion</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Feedback</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockData.staffFeedbackStats.map((staff) => (
                      <tr key={staff.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{staff.staffName}</div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {staff.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{staff.email}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-semibold">{staff.totalFeedback}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className="font-semibold text-green-600">{staff.completedFeedback}</span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="font-semibold text-orange-600">{staff.pendingFeedback}</span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${
                              staff.completionRate >= 90 ? 'text-green-600' :
                              staff.completionRate >= 80 ? 'text-blue-600' :
                              'text-orange-600'
                            }`}>
                              {staff.completionRate.toFixed(1)}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  staff.completionRate >= 90 ? 'bg-green-600' :
                                  staff.completionRate >= 80 ? 'bg-blue-600' :
                                  'bg-orange-600'
                                }`}
                                style={{ width: `${staff.completionRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {new Date(staff.lastFeedbackDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
