import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/Dialog";
import { config } from "@/lib/config";
import type { PlacementQuestion } from "@/api/placementTest.api";
import type { Question } from "../types/placementQuestion.types";
import { CheckCircle, Headphones, FileText, Eye } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: PlacementQuestion[];
  testTitle: string;
  durationMinutes: number;
}

interface QuestionData {
  question: PlacementQuestion;
  data: any;
  questions: Question[];
}

export default function PlacementTestPreviewDialog({
  open,
  onOpenChange,
  questions,
  testTitle,
  durationMinutes,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [questionDataList, setQuestionDataList] = useState<QuestionData[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && questions.length > 0) {
      loadAllQuestionData();
    } else {
      setQuestionDataList([]);
      setExpandedQuestions(new Set());
    }
  }, [open, questions]);

  const loadAllQuestionData = async () => {
    try {
      setLoading(true);
      const dataPromises = questions.map(async (question) => {
        if (!question.questionUrl) {
          return null;
        }

        try {
          // Build direct URL to cloud storage (no need to call API)
          // Format: https://pub-59cfd11e5f0d4b00af54839edc83842d.r2.dev/{questionUrl}
          const questionUrl = question.questionUrl.startsWith('/') 
            ? question.questionUrl 
            : `/${question.questionUrl}`;
          const directUrl = `${config.storagePublicUrl}${questionUrl}`;

          const questionResponse = await fetch(directUrl);
          if (!questionResponse.ok) {
            throw new Error(`Failed to fetch question data: ${questionResponse.status}`);
          }

          const data = await questionResponse.json();
          const questionsList: Question[] = data.questions && Array.isArray(data.questions)
            ? data.questions.map((q: any) => ({
                ...q,
                id: q.id || `q-${Date.now()}-${q.order}`,
                type: q.type || "multiple_choice",
                order: q.order || 0,
                question: q.question || "",
                points: q.points || 0,
              }))
            : [];

          return {
            question,
            data,
            questions: questionsList,
          };
        } catch (err) {
          console.error(`Error loading question ${question.id}:`, err);
          return null;
        }
      });

      const results = await Promise.all(dataPromises);
      const filteredResults = results.filter((r): r is QuestionData => r !== null);
      
      // Sắp xếp theo thứ tự: câu hỏi đơn -> passage ngắn -> passage dài -> audio ngắn -> audio dài
      const sortedResults = filteredResults.sort((a, b) => {
        const getSortOrder = (qd: QuestionData): number => {
          const questionType = qd.question.questionType.toLowerCase();
          const difficulty = qd.question.difficulty;
          
          // Câu hỏi đơn (không phải passage/audio)
          if (questionType !== "passage" && questionType !== "audio") {
            return 1;
          }
          
          // Passage ngắn (difficulty = 2)
          if (questionType === "passage" && difficulty === 2) {
            return 2;
          }
          
          // Passage dài (difficulty = 3)
          if (questionType === "passage" && difficulty === 3) {
            return 3;
          }
          
          // Audio ngắn (difficulty = 2)
          if (questionType === "audio" && difficulty === 2) {
            return 4;
          }
          
          // Audio dài (difficulty = 3)
          if (questionType === "audio" && difficulty === 3) {
            return 5;
          }
          
          // Default
          return 6;
        };
        
        return getSortOrder(a) - getSortOrder(b);
      });
      
      setQuestionDataList(sortedResults);
    } catch (err) {
      console.error("Error loading question data:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const normalizeAudioUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `${config.storagePublicUrl}${url.startsWith("/") ? url : "/" + url}`;
  };

  const totalQuestions = questionDataList.reduce((sum, qd) => sum + qd.questions.length, 0);
  const totalPoints = questionDataList.reduce((sum, qd) => 
    sum + qd.questions.reduce((qSum, q) => qSum + (q.points || 0), 0), 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Preview Placement Test
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-neutral-500">Loading test data...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Test Info */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Test Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Title:</span> {testTitle || "Untitled Test"}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {durationMinutes} minutes
                  </div>
                  <div>
                    <span className="font-medium">Question Sets:</span> {questions.length}
                  </div>
                  <div>
                    <span className="font-medium">Total Questions:</span> {totalQuestions}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Total Points:</span> {totalPoints} points
                  </div>
                </div>
              </div>

              {/* Questions List */}
              {questionDataList.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Question Sets ({questionDataList.length})</h3>
                  {questionDataList.map((questionData, idx) => {
                    const isExpanded = expandedQuestions.has(questionData.question.id);
                    return (
                      <div
                        key={questionData.question.id}
                        className="border border-neutral-200 rounded-lg overflow-hidden"
                      >
                        {/* Question Set Header */}
                        <div
                          className="bg-neutral-50 p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                          onClick={() => toggleQuestionExpanded(questionData.question.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-neutral-900">
                                {idx + 1}. {questionData.question.title}
                              </div>
                              <div className="text-sm text-neutral-600 mt-1">
                                {questionData.question.skillType} • {questionData.question.questionType} • 
                                Difficulty: {questionData.question.difficulty} • 
                                {questionData.questions.length} question{questionData.questions.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-neutral-500">
                                {isExpanded ? "Hide" : "Show"} Questions
                              </span>
                              <Eye className={`w-5 h-5 text-neutral-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="p-4 bg-white">
                            {questionData.data?.readingPassage ? (
                              // Layout 2 cột: Passage bên trái, Questions bên phải
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Reading Passage - Left Column */}
                                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 lg:sticky lg:top-4 lg:self-start">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-semibold text-blue-800">Reading Passage</h4>
                                  </div>
                                  <p className="text-sm text-blue-900 whitespace-pre-wrap">
                                    {questionData.data.readingPassage}
                                  </p>
                                </div>

                                {/* Questions - Right Column */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sm">Questions:</h4>
                                  {questionData.questions
                                    .sort((a, b) => a.order - b.order)
                                    .map((q, qIdx) => (
                                      <div key={q.id || qIdx} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-xs font-semibold text-accent-300 bg-secondary-200 px-2.5 py-1 rounded">
                                            Q{q.order}
                                          </span>
                                          <span className="text-xs text-neutral-500 uppercase tracking-wide">
                                            {q.type.replace("_", " ")}
                                          </span>
                                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded">
                                            {q.points} point{q.points !== 1 ? "s" : ""}
                                          </span>
                                        </div>
                                        <p className="text-sm font-medium text-neutral-900 mb-2">{q.question}</p>

                                        {/* Options */}
                                        {q.options && q.options.length > 0 && (
                                          <div className="ml-2 space-y-1">
                                            {q.options.map((opt) => (
                                              <div
                                                key={opt.id}
                                                className={`text-sm p-2 rounded ${
                                                  q.correctAnswer === opt.id
                                                    ? "bg-green-50 text-green-700 border border-green-200"
                                                    : "bg-white text-neutral-600 border border-neutral-200"
                                                }`}
                                              >
                                                <span className="font-medium">{opt.label}.</span> {opt.text}
                                                {q.correctAnswer === opt.id && (
                                                  <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* True/False */}
                                        {q.type === "true_false" && q.correctAnswer !== undefined && (
                                          <div className="ml-2 mt-2">
                                            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded ${
                                              q.correctAnswer === true 
                                                ? "bg-green-50 text-green-700 border border-green-200" 
                                                : "bg-red-50 text-red-700 border border-red-200"
                                            }`}>
                                              <CheckCircle className="w-4 h-4" />
                                              <span className="text-sm font-semibold">
                                                Correct Answer: {q.correctAnswer === true ? "True" : "False"}
                                              </span>
                                            </div>
                                          </div>
                                        )}

                                        {/* Fill-in-the-Blank */}
                                        {q.type === "fill_in_the_blank" && q.correctAnswer && (
                                          <div className="ml-2 mt-2">
                                            <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded inline-block">
                                              <span className="text-sm font-semibold">
                                                Correct Answer{Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1 ? "s" : ""}: {
                                                  Array.isArray(q.correctAnswer)
                                                    ? q.correctAnswer.join(", ")
                                                    : q.correctAnswer
                                                } ✓
                                              </span>
                                            </div>
                                          </div>
                                        )}

                                        {/* Explanation */}
                                        {q.explanation && (
                                          <div className="mt-3 pt-3 border-t border-neutral-200">
                                            <p className="text-xs text-neutral-500 italic">
                                              <span className="font-medium text-neutral-600">Explanation:</span> {q.explanation}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ) : (
                              // Layout thông thường khi không có passage
                              <div className="space-y-4">
                                {/* Audio */}
                                {questionData.data?.media?.audioUrl && (
                                  <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Headphones className="w-5 h-5 text-purple-600" />
                                      <h4 className="font-semibold text-purple-800">Audio</h4>
                                    </div>
                                    <audio
                                      controls
                                      src={normalizeAudioUrl(questionData.data.media.audioUrl)}
                                      className="w-full mt-2"
                                    >
                                      Your browser does not support the audio element.
                                    </audio>
                                  </div>
                                )}

                                {/* Questions */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sm">Questions:</h4>
                                  {questionData.questions
                                    .sort((a, b) => a.order - b.order)
                                    .map((q, qIdx) => (
                                      <div key={q.id || qIdx} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-xs font-semibold text-accent-300 bg-secondary-200 px-2.5 py-1 rounded">
                                            Q{q.order}
                                          </span>
                                          <span className="text-xs text-neutral-500 uppercase tracking-wide">
                                            {q.type.replace("_", " ")}
                                          </span>
                                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded">
                                            {q.points} point{q.points !== 1 ? "s" : ""}
                                          </span>
                                        </div>
                                        <p className="text-sm font-medium text-neutral-900 mb-2">{q.question}</p>

                                        {/* Options */}
                                        {q.options && q.options.length > 0 && (
                                          <div className="ml-2 space-y-1">
                                            {q.options.map((opt) => (
                                              <div
                                                key={opt.id}
                                                className={`text-sm p-2 rounded ${
                                                  q.correctAnswer === opt.id
                                                    ? "bg-green-50 text-green-700 border border-green-200"
                                                    : "bg-white text-neutral-600 border border-neutral-200"
                                                }`}
                                              >
                                                <span className="font-medium">{opt.label}.</span> {opt.text}
                                                {q.correctAnswer === opt.id && (
                                                  <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* True/False */}
                                        {q.type === "true_false" && q.correctAnswer !== undefined && (
                                          <div className="ml-2 mt-2">
                                            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded ${
                                              q.correctAnswer === true 
                                                ? "bg-green-50 text-green-700 border border-green-200" 
                                                : "bg-red-50 text-red-700 border border-red-200"
                                            }`}>
                                              <CheckCircle className="w-4 h-4" />
                                              <span className="text-sm font-semibold">
                                                Correct Answer: {q.correctAnswer === true ? "True" : "False"}
                                              </span>
                                            </div>
                                          </div>
                                        )}

                                        {/* Fill-in-the-Blank */}
                                        {q.type === "fill_in_the_blank" && q.correctAnswer && (
                                          <div className="ml-2 mt-2">
                                            <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded inline-block">
                                              <span className="text-sm font-semibold">
                                                Correct Answer{Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1 ? "s" : ""}: {
                                                  Array.isArray(q.correctAnswer)
                                                    ? q.correctAnswer.join(", ")
                                                    : q.correctAnswer
                                                } ✓
                                              </span>
                                            </div>
                                          </div>
                                        )}

                                        {/* Explanation */}
                                        {q.explanation && (
                                          <div className="mt-3 pt-3 border-t border-neutral-200">
                                            <p className="text-xs text-neutral-500 italic">
                                              <span className="font-medium text-neutral-600">Explanation:</span> {q.explanation}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-neutral-300 rounded-lg">
                  <p className="text-neutral-600">No question data available</p>
                </div>
              )}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}


