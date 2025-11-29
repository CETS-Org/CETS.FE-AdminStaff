import React from 'react';
import Card from '@/components/ui/Card';
import { AlertCircle, TrendingDown, MessageSquare } from 'lucide-react';
import type { ExitSurveyAnalyticsResponse } from '@/api/exitSurvey.api';

interface ExitSurveyReasonCardProps {
  data: ExitSurveyAnalyticsResponse;
}

export const ExitSurveyReasonCard: React.FC<ExitSurveyReasonCardProps> = ({ data }) => {
  // Convert reason statistics to sorted array
  const reasonStats = Object.entries(data.reasonCategoryStatistics)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: data.totalSurveys > 0 ? (count / data.totalSurveys) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Convert feedback ratings to array
  const feedbackRatings = Object.entries(data.averageFeedbackRatings)
    .map(([category, rating]) => ({
      category: category
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^./, str => str.toUpperCase()),
      rating: rating,
      color: rating >= 4 ? 'text-green-600' : rating >= 3 ? 'text-yellow-600' : 'text-red-600'
    }))
    .sort((a, b) => a.rating - b.rating); // Sort from lowest to highest to show problem areas first

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Exit Survey Analysis
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Dropout reasons from student feedback surveys
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{data.totalSurveys}</p>
          <p className="text-xs text-gray-500">Total Surveys</p>
        </div>
      </div>

      {/* Survey Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-medium text-gray-700">This Month</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{data.surveysThisMonth}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-purple-600" />
            <p className="text-sm font-medium text-gray-700">This Year</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{data.surveysThisYear}</p>
        </div>
      </div>

      {/* Dropout Reasons */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Dropout Reasons</h4>
        <div className="space-y-3">
          {reasonStats.length > 0 ? (
            reasonStats.slice(0, 5).map((stat, index) => (
              <div key={stat.reason} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {stat.reason}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{stat.count}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({stat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No survey data available</p>
          )}
        </div>
      </div>

      {/* Average Feedback Ratings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Average Feedback Ratings (1-5 scale)
        </h4>
        <div className="space-y-3">
          {feedbackRatings.length > 0 ? (
            feedbackRatings.map((feedback) => (
              <div key={feedback.category} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{feedback.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        feedback.rating >= 4
                          ? 'bg-green-500'
                          : feedback.rating >= 3
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${(feedback.rating / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${feedback.color} w-8 text-right`}>
                    {feedback.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No feedback data available</p>
          )}
        </div>
      </div>

      {/* Insights */}
      {reasonStats.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Key Insights</p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                <li>
                  Top reason: <strong>{reasonStats[0].reason}</strong> (
                  {reasonStats[0].percentage.toFixed(1)}%)
                </li>
                {feedbackRatings.length > 0 && (
                  <li>
                    Lowest rated: <strong>{feedbackRatings[0].category}</strong> (
                    {feedbackRatings[0].rating.toFixed(1)}/5)
                  </li>
                )}
                <li>
                  {data.surveysThisMonth} surveys completed this month vs {data.surveysThisYear} this year
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

