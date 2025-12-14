import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Button from "@/components/ui/Button";
import { 
  MessageSquare, 
  Star, 
  User, 
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award
} from "lucide-react";
import { getCourseFeedbacks, type CourseFeedback } from "@/api/feedback.api";

export default function CourseFeedbackPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<CourseFeedback[]>([]);
  const [activeTab, setActiveTab] = useState<'course' | 'teacher'>('course');

  useEffect(() => {
    if (courseId) {
      fetchFeedbacks();
    } else {
      console.error("No courseId found in URL params");
      setError("No course ID provided");
      setLoading(false);
    }
  }, [courseId]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCourseFeedbacks(courseId!);
      setFeedbacks(response.data);
    } catch (err: any) {
      console.error("Error fetching feedbacks:", err);
      setError(err.response?.data?.message || "Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const courseFeedbacks = feedbacks.filter(f => {
    // Check if it's a course feedback by type name or by having course-specific fields
    const isCourseType = f.feedbackTypeName && (
      f.feedbackTypeName.toLowerCase().includes('course') ||
      f.feedbackTypeName.toLowerCase().includes('forcourse')
    );
    const hasCourseFields = [f.contentClarity, f.courseRelevance, f.materialsQuality]
      .some(v => v !== undefined && v !== null);
    return isCourseType || hasCourseFields;
  });

  const teacherFeedbacks = feedbacks.filter(f => {
    // Check if it's a teacher feedback by type name or by having teacher-specific fields
    const isTeacherType = f.feedbackTypeName && (
      f.feedbackTypeName.toLowerCase().includes('teacher') ||
      f.feedbackTypeName.toLowerCase().includes('forteacher')
    );
    const hasTeacherFields = [f.teachingEffectiveness, f.communicationSkills, f.teacherSupportiveness]
      .some(v => v !== undefined && v !== null);
    return isTeacherType || hasTeacherFields;
  });

  const displayedFeedbacks = activeTab === 'course' ? courseFeedbacks : teacherFeedbacks;

  const scoreMap: Record<string, number> = {
    // generic
    "excellent": 5,
    "very_good": 4.5,
    "good": 4,
    "average": 3,
    "fair": 2.5,
    "poor": 2,
    "very_poor": 1,
    // relevance
    "highly_relevant": 5,
    "relevant": 4,
    "somewhat_relevant": 3,
    "not_relevant": 1.5,
    // supportiveness
    "very_supportive": 5,
    "supportive": 4,
    "neutral": 3,
    "unsupportive": 2,
  };

  const normalizeScore = (value: number | string | undefined | null): number | undefined => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "number") return value;
    const key = value.toString().trim().toLowerCase().replace(/\s+/g, "_");
    if (scoreMap[key] !== undefined) return scoreMap[key];
    const parsed = parseFloat(key);
    return isNaN(parsed) ? undefined : parsed;
  };

  const calculateAverage = (values: (number | string | undefined)[]) => {
    const validValues = values
      .map((v) => normalizeScore(v))
      .filter((v): v is number => v !== undefined && !isNaN(v));
    if (validValues.length === 0) return 0;
    return (validValues.reduce((sum, v) => sum + v, 0) / validValues.length).toFixed(1);
  };

  // Fallback to overall rating when specific dimension is missing so charts are not empty
  const avgCourseRating = calculateAverage(courseFeedbacks.map(f => f.rating));
  const avgTeacherRating = calculateAverage(teacherFeedbacks.map(f => f.rating));
  const avgContentClarity = calculateAverage(courseFeedbacks.map(f => f.contentClarity));
  const avgCourseRelevance = calculateAverage(courseFeedbacks.map(f => f.courseRelevance));
  const avgMaterialsQuality = calculateAverage(courseFeedbacks.map(f => f.materialsQuality));
  const avgTeachingEffectiveness = calculateAverage(teacherFeedbacks.map(f => f.teachingEffectiveness));
  const avgCommunicationSkills = calculateAverage(teacherFeedbacks.map(f => f.communicationSkills));
  const avgTeacherSupportiveness = calculateAverage(teacherFeedbacks.map(f => f.teacherSupportiveness));

  const formatScore = (value?: string | number | null) => {
    if (value === undefined || value === null) return "N/A";
    const normalized = normalizeScore(value);
    if (normalized !== undefined && !isNaN(normalized)) return `${normalized}/5`;
    return String(value);
  };

  const breadcrumbItems = [
    { label: "Courses", href: "/admin/courses" },
    { label: "Course Feedbacks" }
  ];

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-neutral-400 text-sm">No rating</span>;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-neutral-700">{rating}/5</span>
      </div>
    );
  };

  const renderRatingBar = (label: string, value: string, icon: React.ReactNode) => (
    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-neutral-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
            style={{ width: `${(parseFloat(value) / 5) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-blue-600 w-8">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="flex items-center justify-between">
        <PageHeader
          title="Course Feedbacks"
          description="View and analyze student feedback for this course"
          icon={<MessageSquare className="w-5 h-5 text-white" />}
        />
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/courses")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
      </div>

      {loading ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
            <p className="text-sm text-neutral-600">Loading feedbacks...</p>
          </div>
        </Card>
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <Button variant="secondary" onClick={fetchFeedbacks}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Feedbacks</p>
                  <p className="text-2xl font-bold text-blue-900">{feedbacks.length}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Course Feedbacks</p>
                  <p className="text-2xl font-bold text-green-900">{courseFeedbacks.length}</p>
                  <p className="text-xs text-green-600">Avg: {avgCourseRating}/5</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">Teacher Feedbacks</p>
                  <p className="text-2xl font-bold text-purple-900">{teacherFeedbacks.length}</p>
                  <p className="text-xs text-purple-600">Avg: {avgTeacherRating}/5</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700">Overall Rating</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {calculateAverage(feedbacks.map(f => f.rating))}/5
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Average Ratings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Course Feedback Averages
                </h3>
                <div className="space-y-3">
                  {renderRatingBar("Content Clarity", String(avgContentClarity), <TrendingUp className="w-4 h-4 text-blue-500" />)}
                  {renderRatingBar("Course Relevance", String(avgCourseRelevance), <Award className="w-4 h-4 text-blue-500" />)}
                  {renderRatingBar("Materials Quality", String(avgMaterialsQuality), <BookOpen className="w-4 h-4 text-blue-500" />)}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                  Teacher Feedback Averages
                </h3>
                <div className="space-y-3">
                  {renderRatingBar("Teaching Effectiveness", String(avgTeachingEffectiveness), <TrendingUp className="w-4 h-4 text-purple-500" />)}
                  {renderRatingBar("Communication Skills", String(avgCommunicationSkills), <MessageSquare className="w-4 h-4 text-purple-500" />)}
                  {renderRatingBar("Teacher Supportiveness", String(avgTeacherSupportiveness), <Award className="w-4 h-4 text-purple-500" />)}
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-neutral-200">
            <button
              onClick={() => setActiveTab('course')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'course'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              Course Feedback ({courseFeedbacks.length})
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'teacher'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              Teacher Feedback ({teacherFeedbacks.length})
            </button>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {displayedFeedbacks.length === 0 ? (
              <Card>
                <div className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-12 h-12 text-neutral-300 mb-3" />
                  <p className="text-neutral-600">No feedbacks available</p>
                </div>
              </Card>
            ) : (
              displayedFeedbacks.map((feedback) => (
                <Card key={feedback.feedbackId} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-800">{feedback.submitterName}</p>
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          feedback.feedbackTypeName.toLowerCase().includes('course')
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {feedback.feedbackTypeName}
                        </span>
                        {renderStars(feedback.rating)}
                      </div>
                    </div>

                    {feedback.comment && (
                      <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
                        <p className="text-neutral-700">{feedback.comment}</p>
                      </div>
                    )}

                    {/* Course-specific ratings */}
                    {(feedback.contentClarity || feedback.courseRelevance || feedback.materialsQuality) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        {feedback.contentClarity && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-600">Content Clarity:</span>
                            <span className="font-medium text-blue-600">{formatScore(feedback.contentClarity)}</span>
                          </div>
                        )}
                        {feedback.courseRelevance && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-600">Relevance:</span>
                            <span className="font-medium text-blue-600">{formatScore(feedback.courseRelevance)}</span>
                          </div>
                        )}
                        {feedback.materialsQuality && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-600">Materials:</span>
                            <span className="font-medium text-blue-600">{formatScore(feedback.materialsQuality)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Teacher-specific ratings */}
                    {(feedback.teachingEffectiveness || feedback.communicationSkills || feedback.teacherSupportiveness) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {feedback.teacherName && (
                          <div className="col-span-3 text-sm text-neutral-600 mb-2">
                            Teacher: <span className="font-medium text-neutral-800">{feedback.teacherName}</span>
                          </div>
                        )}
                        {feedback.teachingEffectiveness && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-600">Effectiveness:</span>
                            <span className="font-medium text-purple-600">{formatScore(feedback.teachingEffectiveness)}</span>
                          </div>
                        )}
                        {feedback.communicationSkills && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-600">Communication:</span>
                            <span className="font-medium text-purple-600">{formatScore(feedback.communicationSkills)}</span>
                          </div>
                        )}
                        {feedback.teacherSupportiveness && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-600">Supportiveness:</span>
                            <span className="font-medium text-purple-600">{formatScore(feedback.teacherSupportiveness)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
