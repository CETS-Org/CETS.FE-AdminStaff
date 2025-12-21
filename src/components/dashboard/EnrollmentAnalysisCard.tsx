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

interface EnrollmentByCourseAggregated {
  courseId: string;
  courseName: string;
  courseCode?: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  numberOfClasses: number;
}

interface EnrollmentAnalysisCardProps {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  monthOverMonthGrowth: number;
  monthlyTrend: EnrollmentTrendPoint[];
  topGrowingCourses: EnrollmentByCourse[];
  enrollmentByCourse?: EnrollmentByCourseAggregated[];
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
  enrollmentByCourse = [],
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

  return (
    <Card className="p-6">
      {/* Monthly Enrollment Trend Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Monthly Enrollment Trend</h4>
        <div className="flex items-end justify-between gap-2 h-64">
          {monthlyTrend.map((point, index) => (
            <div key={index} className="flex flex-col items-center flex-1 h-full">
              <div className="flex-1 flex flex-col justify-end w-full px-1">
                <div className="relative group">
                  <div
                    className="bg-teal-500 hover:bg-teal-600 transition-all duration-300 rounded-t"
                    style={{
                      height: `${(point.totalEnrollments / maxEnrollmentCount) * 200}px`,
                      minHeight: point.totalEnrollments > 0 ? '8px' : '0px'
                    }}
                  ></div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <div className="font-semibold">{point.period}</div>
                    <div>Total: {point.totalEnrollments}</div>
                    <div>Growth: {point.growthRate > 0 ? '+' : ''}{point.growthRate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2 font-medium">{point.period.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enrollment by Course */}
      {enrollmentByCourse.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Enrollment by Course</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Course Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Course Code</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Total</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Active</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Completed</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Dropped</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Classes</th>
                </tr>
              </thead>
              <tbody>
                {enrollmentByCourse.slice(0, 10).map((course) => (
                  <tr key={course.courseId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{course.courseName}</td>
                    <td className="py-3 px-4 text-gray-600">{course.courseCode || 'N/A'}</td>
                    <td className="py-3 px-4 text-right text-gray-900 font-semibold">{course.totalEnrollments}</td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">{course.activeEnrollments}</td>
                    <td className="py-3 px-4 text-right text-blue-600 font-medium">{course.completedEnrollments}</td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">{course.droppedEnrollments}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{course.numberOfClasses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}

