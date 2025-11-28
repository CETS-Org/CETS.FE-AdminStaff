import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { config } from "@/lib/config";
import type { PlacementQuestion } from "@/api/placementTest.api";
import type { Question } from "../types/placementQuestion.types";
import { CheckCircle, Headphones, FileText, Edit } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: PlacementQuestion | null;
  onEdit?: (question: PlacementQuestion) => void;
}

export default function QuestionDetailDialog({ open, onOpenChange, question, onEdit }: Props) {
  const [loading, setLoading] = useState(false);
  const [questionData, setQuestionData] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (open && question) {
      loadQuestionData();
    } else {
      setQuestionData(null);
      setQuestions([]);
    }
  }, [open, question]);

  const loadQuestionData = async () => {
    if (!question || !question.questionUrl) {
      return;
    }

    try {
      setLoading(true);
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
      setQuestionData(data);

      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error("Error loading question data:", err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeAudioUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `${config.storagePublicUrl}${url.startsWith("/") ? url : "/" + url}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Question Details
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-neutral-500">Loading question data...</div>
            </div>
          ) : question ? (
            <div className="space-y-6">
              {/* Question Info */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Question Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Title:</span> {question.title}
                  </div>
                  <div>
                    <span className="font-medium">Skill Type:</span> {question.skillType}
                  </div>
                  <div>
                    <span className="font-medium">Question Type:</span> {question.questionType}
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span> {question.difficulty}
                  </div>
                  <div>
                    <span className="font-medium">Total Questions:</span> {questions.length}
                  </div>
                </div>
              </div>

              {/* Reading Passage */}
              {questionData?.readingPassage && (
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Reading Passage</h3>
                  </div>
                  <p className="text-sm text-blue-900 whitespace-pre-wrap">
                    {questionData.readingPassage}
                  </p>
                </div>
              )}

              {/* Audio */}
              {questionData?.media?.audioUrl && (
                <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-800">Audio</h3>
                  </div>
                  <audio
                    controls
                    src={normalizeAudioUrl(questionData.media.audioUrl)}
                    className="w-full mt-2"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* Questions List */}
              {questions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Questions ({questions.length})</h3>
                  {questions
                    .sort((a, b) => a.order - b.order)
                    .map((q, idx) => (
                      <div key={q.id || idx} className="border border-neutral-200 rounded-lg p-4">
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
                                    : "bg-neutral-50 text-neutral-600"
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
                          <div className="mt-3 pt-3 border-t border-neutral-100">
                            <p className="text-xs text-neutral-500 italic">
                              <span className="font-medium text-neutral-600">Explanation:</span> {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {questions.length === 0 && !loading && (
                <div className="text-center py-8 border-2 border-dashed border-neutral-300 rounded-lg">
                  <p className="text-neutral-600">No questions found in this question set</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-500">No question selected</p>
            </div>
          )}
        </DialogBody>
        {question && onEdit && (
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onEdit(question);
                onOpenChange(false);
              }}
              iconLeft={<Edit className="w-4 h-4" />}
            >
              Edit Question
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

