import Card from '@/components/ui/Card';

interface DropoutTrendPoint {
  period: string;
  totalStudents: number;
  droppedOut: number;
  dropoutRate: number;
  retentionRate: number;
}

interface DropoutByClass {
  classId: string;
  className: string;
  courseName: string;
  totalStudents: number;
  droppedOut: number;
  dropoutRate: number;
  startDate: string;
  status: string;
}

interface DropoutAnalysisCardProps {
  overallDropoutRate: number;
  dropoutTrend: DropoutTrendPoint[];
  dropoutByClass: DropoutByClass[];
  averageTimeToDropout: number;
  recommendations: string[];
  loading?: boolean;
}

export default function DropoutAnalysisCard({
  overallDropoutRate,
  dropoutTrend,
  dropoutByClass,
  averageTimeToDropout,
  recommendations,
  loading = false,
}: DropoutAnalysisCardProps) {
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

  const getDropoutRateColor = (rate: number) => {
    if (rate >= 30) return 'text-red-600 bg-red-50 border-red-200';
    if (rate >= 15) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const maxDropoutCount = Math.max(...dropoutTrend.map(d => d.droppedOut), 1);

  return (
    <Card className="p-6">
      {/* Monthly Dropout Trend */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Monthly Dropout Trend</h4>
          <div className="flex items-end justify-between gap-2 h-64">
            {dropoutTrend.map((point, index) => (
              <div key={index} className="flex flex-col items-center flex-1 h-full">
                <div className="flex-1 flex flex-col justify-end w-full px-1">
                  <div className="relative group">
                    <div
                      className="bg-red-500 hover:bg-red-600 transition-all duration-300 rounded-t"
                      style={{
                        height: `${(point.droppedOut / maxDropoutCount) * 200}px`,
                        minHeight: point.droppedOut > 0 ? '8px' : '0px'
                      }}
                    ></div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <div className="font-semibold">{point.period}</div>
                      <div>Dropped: {point.droppedOut}/{point.totalStudents}</div>
                      <div>Rate: {point.dropoutRate.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 font-medium">{point.period}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dropout by Class */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Dropout by Class</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Class Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Total Students</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Dropped Out</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Dropout Rate</th>
                </tr>
              </thead>
              <tbody>
                {dropoutByClass.length > 0 ? (
                  dropoutByClass.slice(0, 10).map((cls, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{cls.className}</td>
                      <td className="py-3 px-4 text-gray-600">{cls.courseName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {cls.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">{cls.totalStudents}</td>
                      <td className="py-3 px-4 text-right font-medium text-red-600">{cls.droppedOut}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDropoutRateColor(cls.dropoutRate)}`}>
                          {cls.dropoutRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No dropout data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
  );
}


