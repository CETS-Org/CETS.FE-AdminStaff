import { TrendingUp, TrendingDown, Minus, Star, Users } from 'lucide-react';
import Card from '@/components/ui/Card';

interface TopCourse {
  courseId: string;
  courseName: string;
  courseCode: string;
  category: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completionRate: number;
  averageRating: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
  growthRate: number;
}

interface TopCoursesCardProps {
  courses: TopCourse[];
  loading?: boolean;
}

export default function TopCoursesCard({ courses, loading = false }: TopCoursesCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Courses by Enrollment</h3>
        <div className="text-sm text-gray-500">Top {courses.length}</div>
      </div>

      <div className="space-y-4">
        {courses.map((course, index) => (
          <div
            key={course.courseId}
            className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
          >
            {/* Rank */}
            <div className="flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                  index === 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : index === 1
                    ? 'bg-gray-100 text-gray-700'
                    : index === 2
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                {index + 1}
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{course.courseName}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {course.courseCode} • {course.category}
                  </p>
                </div>

                {/* Trend Badge */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(course.trend)}`}>
                  {getTrendIcon(course.trend)}
                  {Math.abs(course.growthRate).toFixed(1)}%
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500">Total Enrolled</div>
                    <div className="text-sm font-semibold text-gray-900">{course.totalEnrollments}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="text-xs text-gray-500">Active</div>
                    <div className="text-sm font-semibold text-gray-900">{course.activeEnrollments}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <div>
                    <div className="text-xs text-gray-500">Rating</div>
                    <div className="text-sm font-semibold text-gray-900">{course.averageRating.toFixed(1)}/5</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Revenue</div>
                  <div className="text-sm font-semibold text-gray-900">{formatCurrency(course.revenue)}</div>
                </div>
              </div>

              {/* Completion Rate Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium text-gray-900">{course.completionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${course.completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Users className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500">Chưa có dữ liệu khóa học</p>
        </div>
      )}
    </Card>
  );
}


