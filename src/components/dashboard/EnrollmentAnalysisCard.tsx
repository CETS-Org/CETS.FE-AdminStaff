import { TrendingUp, Users, Activity, Award } from 'lucide-react';
import Card from '@/components/ui/Card';

interface EnrollmentTrendPoint {
  period: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  growthRate: number;
}

interface EnrollmentByCourse {
  courseId: string;
  courseName: string;
  courseCode: string;
  category: string;
  totalEnrollments: number;
  activeEnrollments: number;
  growthRate: number;
  trend: 'up' | 'down' | 'stable';
}

interface EnrollmentAnalysisCardProps {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  monthOverMonthGrowth: number;
  monthlyTrend: EnrollmentTrendPoint[];
  topGrowingCourses: EnrollmentByCourse[];
  insights: string[];
  loading?: boolean;
}

export default function EnrollmentAnalysisCard({
  totalEnrollments,
  activeEnrollments,
  completedEnrollments,
  monthOverMonthGrowth,
  monthlyTrend,
  topGrowingCourses,
  insights,
  loading = false,
}: EnrollmentAnalysisCardProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const maxEnrollmentCount = Math.max(...monthlyTrend.map(d => d.totalEnrollments), 1);

  const getGrowthColor = (growth: number) => {
    if (growth > 10) return 'text-green-600 bg-green-50 border-green-200';
    if (growth < -10) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Enrollment Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Enrollments */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-blue-600 font-medium">Total Enrollments</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">{totalEnrollments}</div>
            </div>
          </div>

          {/* Active Enrollments */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="p-2 rounded-lg bg-green-100">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-green-600 font-medium">Active Enrollments</div>
              <div className="text-2xl font-bold text-green-700 mt-1">{activeEnrollments}</div>
            </div>
          </div>

          {/* Month-over-Month Growth */}
          <div className={`flex items-start gap-3 p-4 rounded-lg ${getGrowthColor(monthOverMonthGrowth)}`}>
            <div className={`p-2 rounded-lg ${monthOverMonthGrowth > 0 ? 'bg-green-100' : monthOverMonthGrowth < 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <TrendingUp className={`w-5 h-5 ${monthOverMonthGrowth > 0 ? 'text-green-600' : monthOverMonthGrowth < 0 ? 'text-red-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <div className={`text-sm font-medium ${monthOverMonthGrowth > 0 ? 'text-green-600' : monthOverMonthGrowth < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                Monthly Growth
              </div>
              <div className={`text-2xl font-bold mt-1 ${monthOverMonthGrowth > 0 ? 'text-green-700' : monthOverMonthGrowth < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                {monthOverMonthGrowth > 0 ? '+' : ''}{monthOverMonthGrowth.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Enrollment Trend */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Monthly Enrollment Trend</h4>
          <div className="flex items-end justify-between gap-2 h-64">
            {monthlyTrend.map((point, index) => (
              <div key={index} className="flex flex-col items-center flex-1 h-full">
                <div className="flex-1 flex flex-col justify-end w-full px-1">
                  <div className="relative group">
                    <div
                      className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 rounded-t"
                      style={{
                        height: `${(point.totalEnrollments / maxEnrollmentCount) * 200}px`,
                        minHeight: point.totalEnrollments > 0 ? '8px' : '0px'
                      }}
                    ></div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <div className="font-semibold">{point.period}</div>
                      <div>Total: {point.totalEnrollments}</div>
                      <div>Active: {point.activeEnrollments}</div>
                      <div>Completed: {point.completedEnrollments}</div>
                      <div>Growth: {point.growthRate > 0 ? '+' : ''}{point.growthRate.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 font-medium">{point.period.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Growing Courses */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Top Growing Courses</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Course Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Total Enrollments</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Active</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Growth Rate</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Trend</th>
                </tr>
              </thead>
              <tbody>
                {topGrowingCourses.length > 0 ? (
                  topGrowingCourses.map((course, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{course.courseName}</td>
                      <td className="py-3 px-4 text-gray-600">{course.category}</td>
                      <td className="py-3 px-4 text-right text-gray-900">{course.totalEnrollments}</td>
                      <td className="py-3 px-4 text-right text-blue-600 font-medium">{course.activeEnrollments}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getGrowthColor(course.growthRate)}`}>
                          {course.growthRate > 0 ? '+' : ''}{course.growthRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xl ${getTrendColor(course.trend)}`}>
                          {getTrendIcon(course.trend)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No enrollment data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-3">Key Insights</h4>
              <ul className="space-y-2">
                {insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

