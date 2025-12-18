import { Brain, TrendingUp, Users, DollarSign, Target, Sparkles, ChevronRight, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface AIRecommendation {
  id: string;
  category: 'revenue' | 'enrollment' | 'retention' | 'operations' | 'marketing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actionItems: string[];
  estimatedImpact: {
    revenue?: number;
    enrollments?: number;
    retention?: number;
  };
  confidence: number;
  generatedAt: string;
}

interface AIRecommendationsCardProps {
  recommendations: AIRecommendation[];
  summary: string;
  keyInsights: string[];
  riskFactors: string[];
  opportunities: string[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function AIRecommendationsCard({
  recommendations,
  summary,
  keyInsights,
  riskFactors,
  opportunities,
  loading = false,
  onRefresh,
}: AIRecommendationsCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue':
        return <DollarSign className="w-4 h-4" />;
      case 'enrollment':
        return <Users className="w-4 h-4" />;
      case 'retention':
        return <Target className="w-4 h-4" />;
      case 'operations':
        return <TrendingUp className="w-4 h-4" />;
      case 'marketing':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'enrollment':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'retention':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'operations':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'marketing':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with AI Branding */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                AI-Powered Strategic Recommendations
              </h3>
              <p className="text-sm text-gray-600 max-w-2xl">{summary}</p>
            </div>
          </div>
          {onRefresh && (
            <Button variant="secondary" size="sm" onClick={onRefresh} iconLeft={<RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />}>
              Refresh
            </Button>
          )}
        </div>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Key Insights */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Key Insights
          </h4>
          <ul className="space-y-2">
            {keyInsights.slice(0, 3).map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-blue-800">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Risk Factors */}
        <Card className="p-4 bg-red-50 border-red-200">
          <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Risk Factors
          </h4>
          <ul className="space-y-2">
            {riskFactors.slice(0, 3).map((risk, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-red-800">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Opportunities */}
        <Card className="p-4 bg-green-50 border-green-200">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Growth Opportunities
          </h4>
          <ul className="space-y-2">
            {opportunities.slice(0, 3).map((opportunity, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-green-800">
                <span className="text-green-600 font-bold mt-0.5">•</span>
                <span>{opportunity}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Recommendations List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Recommendations</h3>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="p-5 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg border ${getCategoryColor(recommendation.category)}`}>
                    {getCategoryIcon(recommendation.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority === 'high' ? 'high' : recommendation.priority === 'medium' ? 'medium' : 'low'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{recommendation.description}</p>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-500">Confidence</span>
                  <div className="flex items-center gap-1">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${recommendation.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{recommendation.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Impact Preview */}
              <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                <div className="text-xs font-medium text-purple-900 mb-2">Expected Impact:</div>
                <div className="text-sm text-purple-800">{recommendation.impact}</div>
                
                {/* Estimated Impact Metrics */}
                {(recommendation.estimatedImpact.revenue || recommendation.estimatedImpact.enrollments || recommendation.estimatedImpact.retention) && (
                  <div className="flex items-center gap-4 mt-2">
                    {recommendation.estimatedImpact.revenue && (
                      <div className="flex items-center gap-1 text-xs text-green-700">
                        <DollarSign className="w-3 h-3" />
                        <span className="font-semibold">{formatCurrency(recommendation.estimatedImpact.revenue)}</span>
                      </div>
                    )}
                    {recommendation.estimatedImpact.enrollments && (
                      <div className="flex items-center gap-1 text-xs text-blue-700">
                        <Users className="w-3 h-3" />
                        <span className="font-semibold">+{recommendation.estimatedImpact.enrollments} enrollments</span>
                      </div>
                    )}
                    {recommendation.estimatedImpact.retention && (
                      <div className="flex items-center gap-1 text-xs text-purple-700">
                        <Target className="w-3 h-3" />
                        <span className="font-semibold">+{recommendation.estimatedImpact.retention}% retention</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Items */}
              <div>
                <div className="text-xs font-medium text-gray-700 mb-2">Action Steps:</div>
                <ul className="space-y-1.5">
                  {recommendation.actionItems.map((action, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Brain className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">Chưa có khuyến nghị từ AI</p>
          </div>
        )}
      </Card>
    </div>
  );
}


