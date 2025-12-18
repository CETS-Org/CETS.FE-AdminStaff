import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  ArrowLeft,
  Headphones,
  BookOpen,
  Eye,
  EyeOff,
  X,
  Play,
  Pause,
} from "lucide-react";
import {
  getPlacementTestById,
  type PlacementTest,
  type PlacementQuestion,
} from "@/api/placementTest.api";
import { config } from "@/lib/config";
import type { Question, PlacementQuestionData } from "./types/placementQuestion.types";
import { useToast } from "@/hooks/useToast";
import QuestionRenderer from "./components/QuestionRenderer";
import AssignmentHeader from "./components/AssignmentHeader";
import ProgressIndicator from "./components/ProgressIndicator";
import ScoreResultDialog from "./components/ScoreResultDialog";

export default function StaffPlacementTestTaking() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [placementTest, setPlacementTest] = useState<PlacementTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionDataList, setQuestionDataList] = useState<Array<{ question: PlacementQuestion; data: PlacementQuestionData; questions: Question[] }>>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTimeLimit, setInitialTimeLimit] = useState<number | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [submissionScore, setSubmissionScore] = useState<{
    score: number;
    totalPoints: number;
    earnedPoints: number;
    totalQuestions: number;
    correctAnswers: number;
    answeredQuestions: number;
  } | null>(null);
  const [showReadingPassage, setShowReadingPassage] = useState(true);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [questionAudioPlaying, setQuestionAudioPlaying] = useState<Record<string, boolean>>({});
  const questionAudioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load placement test data
  useEffect(() => {
    const loadPlacementTest = async () => {
      if (!testId) {
        setError("Missing test ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch placement test details
        const response = await getPlacementTestById(testId);
        const test = response.data;

        setPlacementTest(test);

        // Load all question data
        if (test.questions && test.questions.length > 0) {
          const questionDataPromises = test.questions.map(async (question) => {
            if (!question.questionUrl) {
              return null;
            }

            try {
              // Build direct URL to cloud storage
              const questionUrl = question.questionUrl.startsWith('/')
                ? question.questionUrl
                : `/${question.questionUrl}`;
              const directUrl = `${config.storagePublicUrl}${questionUrl}`;

              const questionResponse = await fetch(directUrl);
              if (!questionResponse.ok) {
                throw new Error(`Failed to fetch question data: ${questionResponse.status}`);
              }

              const data: PlacementQuestionData = await questionResponse.json();
              const questionsList: Question[] = (data.questions || []).map((q: any) => ({
                ...q,
                id: q.id || `q-${Date.now()}-${q.order}`,
                type: q.type || "multiple_choice",
                order: q.order || 0,
                question: q.question || "",
                points: q.points || 0,
              }));

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

          const results = await Promise.all(questionDataPromises);
          const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);
          
          // Sắp xếp theo thứ tự đã lưu trong DB (giữ nguyên thứ tự từ test.questions)
          // Backend đã lưu questions theo đúng thứ tự: Reading multiple_choice -> Passage ngắn -> Passage dài -> Listening multiple_choice -> Audio ngắn -> Audio dài
          // Nên giữ nguyên thứ tự từ test.questions thay vì sắp xếp lại
          // Tuy nhiên, nếu cần sắp xếp lại (fallback), sử dụng logic tương tự CreatePlacementTestPage
          const sortedResults = validResults.sort((a, b) => {
            // Lấy index từ test.questions để giữ nguyên thứ tự
            const indexA = test.questions.findIndex(q => q.id === a.question.id);
            const indexB = test.questions.findIndex(q => q.id === b.question.id);
            
            // Nếu có index, giữ nguyên thứ tự từ test.questions
            if (indexA !== -1 && indexB !== -1) {
              return indexA - indexB;
            }
            
            // Fallback: sắp xếp theo logic nếu không tìm thấy index
            const getSortOrder = (result: { question: PlacementQuestion; data: PlacementQuestionData; questions: Question[] }): number => {
              const skillType = result.question.skillType?.toLowerCase() || "";
              const questionType = result.question.questionType.toLowerCase();
              const difficulty = result.question.difficulty;
              const isReading = skillType.includes("reading");
              const isListening = skillType.includes("listening");
              
              // Reading questions (order 1-3)
              if (isReading) {
                // 1. Reading multiple_choice (không phải passage)
                if (questionType !== "passage") {
                  return 1;
                }
                // 2. Passage ngắn (difficulty = 2)
                if (questionType === "passage" && difficulty === 2) {
                  return 2;
                }
                // 3. Passage dài (difficulty = 3)
                if (questionType === "passage" && difficulty === 3) {
                  return 3;
                }
                // Default reading
                return 4;
              }
              
              // Listening questions (order 4-6)
              if (isListening) {
                // 4. Listening multiple_choice (không phải audio)
                if (questionType !== "audio") {
                  return 4;
                }
                // 5. Audio ngắn (difficulty = 2)
                if (questionType === "audio" && difficulty === 2) {
                  return 5;
                }
                // 6. Audio dài (difficulty = 3)
                if (questionType === "audio" && difficulty === 3) {
                  return 6;
                }
                // Default listening
                return 7;
              }
              
              // Default (không xác định được skill type)
              return 50;
            };
            
            return getSortOrder(a) - getSortOrder(b);
          });
          
          setQuestionDataList(sortedResults);

          // Flatten all questions from all question sets
          // Giữ nguyên thứ tự từ sortedResults (đã sắp xếp đúng theo yêu cầu)
          // Chỉ sắp xếp questions trong mỗi placement question group theo order
          const allQuestions: Question[] = [];
          sortedResults.forEach((result) => {
            // Sắp xếp questions trong mỗi group theo order để đảm bảo thứ tự đúng trong group
            const sortedGroupQuestions = [...result.questions].sort((a, b) => a.order - b.order);
            
            sortedGroupQuestions.forEach((q) => {
              // Attach passage or audio to question if available
              const questionWithContext = {
                ...q,
                _passage: result.data.readingPassage,
                _audioUrl: result.data.media?.audioUrl || result.question.questionUrl,
                _questionDataResult: result, // Store reference to questionData result for context
              };
              allQuestions.push(questionWithContext);
            });
          });

          // KHÔNG sắp xếp lại allQuestions vì thứ tự đã đúng từ sortedResults
          // Questions đã được sắp xếp đúng theo: Reading multiple_choice -> Passage ngắn -> Passage dài -> Listening multiple_choice -> Audio ngắn -> Audio dài
          setQuestions(allQuestions);
        }

        // Initialize timer if duration exists
        if (test.durationMinutes) {
          const timeInSeconds = test.durationMinutes * 60;
          setInitialTimeLimit(timeInSeconds);
          setTimeRemaining(timeInSeconds);
          setIsTimerRunning(true);
        }
      } catch (err: any) {
        console.error("Failed to load placement test:", err);
        setError(err.response?.data || err.message || "Failed to load placement test");
      } finally {
        setLoading(false);
      }
    };

    loadPlacementTest();
  }, [testId]);

  // Timer countdown
  useEffect(() => {
    if (isTimerRunning && timeRemaining !== null && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerRunning(false);
            handleSubmit(true); // Auto-submit when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining]);

  // Show warning when less than 5 minutes remaining
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining <= 300 && timeRemaining > 0 && !showTimeWarning) {
      setShowTimeWarning(true);
    }
  }, [timeRemaining, showTimeWarning]);

  // Auto-hide warning after 10 seconds
  useEffect(() => {
    if (showTimeWarning) {
      const timer = setTimeout(() => {
        setShowTimeWarning(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showTimeWarning]);

  // Auto-save answers
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const interval = setInterval(() => {
        saveAnswers();
      }, 30000); // Auto-save every 30 seconds

      return () => {
        clearInterval(interval);
      };
    }
  }, [answers]);

  // Cleanup audio refs on unmount
  useEffect(() => {
    return () => {
      Object.values(questionAudioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
      questionAudioRefs.current = {};
    };
  }, []);

  const formatTime = useCallback((seconds: number | null): string => {
    if (seconds === null) {
      return "--:--";
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const saveAnswers = async () => {
    try {
      setIsSaving(true);
      // Save answers to localStorage as backup
      localStorage.setItem(`placement_test_${testId}_answers`, JSON.stringify(answers));
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to save answers:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Calculate score
  const calculateDetailedScore = (): {
    score: number;
    totalPoints: number;
    earnedPoints: number;
    totalQuestions: number;
    correctAnswers: number;
    answeredQuestions: number;
  } | null => {
    if (questions.length === 0) {
      return null;
    }

    let totalScore = 0;
    let totalPoints = 0;
    let answeredCount = 0;
    let correctCount = 0;

    questions.forEach((question) => {
      const questionPoints = question.points || 0;
      totalPoints += questionPoints;

      const studentAnswer = answers[question.id];
      const correctAnswer = question.correctAnswer;

      if (studentAnswer === undefined || studentAnswer === null || studentAnswer === "") {
        return;
      }

      answeredCount++;
      let isCorrect = false;

      switch (question.type) {
        case "multiple_choice":
          isCorrect = studentAnswer === correctAnswer;
          break;
        case "true_false":
          const studentBool = studentAnswer === true || studentAnswer === "true" || studentAnswer === "True";
          const correctBool = correctAnswer === true || correctAnswer === "true" || correctAnswer === "True";
          isCorrect = studentBool === correctBool;
          break;
        case "fill_in_the_blank":
          if (question.blanks && question.blanks.length > 0) {
            if (typeof studentAnswer === "string") {
              const blank = question.blanks[0];
              const normalizedStudent = blank.caseSensitive
                ? studentAnswer.trim()
                : studentAnswer.trim().toLowerCase();
              isCorrect = blank.correctAnswers.some((correct) => {
                const normalizedCorrect = blank.caseSensitive
                  ? correct.trim()
                  : correct.trim().toLowerCase();
                return normalizedStudent === normalizedCorrect;
              });
            }
          } else if (correctAnswer !== undefined && correctAnswer !== null) {
            const normalizedStudent = String(studentAnswer).trim().toLowerCase();
            const normalizedCorrect = String(correctAnswer).trim().toLowerCase();
            isCorrect = normalizedStudent === normalizedCorrect;
          }
          break;
        case "matching":
          if (question.matching && question.matching.correctMatches) {
            const studentMatches = studentAnswer;
            const correctMatches = question.matching.correctMatches;
            if (typeof studentMatches === "object" && studentMatches !== null) {
              const allCorrect = correctMatches.every((correctMatch: any) => {
                return studentMatches[correctMatch.left] === correctMatch.right;
              });
              const studentMatchCount = Object.keys(studentMatches).length;
              const correctMatchCount = correctMatches.length;
              isCorrect = allCorrect && studentMatchCount === correctMatchCount;
            }
          }
          break;
        default:
          return;
      }

      if (isCorrect) {
        totalScore += questionPoints;
        correctCount++;
      }
    });

    if (totalPoints > 0) {
      const percentageScore = (totalScore / totalPoints) * 10;
      const finalScore = Math.round(percentageScore * 100) / 100;

      return {
        score: finalScore,
        totalPoints,
        earnedPoints: totalScore,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        answeredQuestions: answeredCount,
      };
    }

    return null;
  };

  const handleSubmit = async (autoSubmit: boolean = false) => {
    if (!autoSubmit) {
      setShowSubmitDialog(true);
      return;
    }

    if (!testId) {
      showError("Test ID is missing");
      return;
    }

    setSubmitting(true);
    try {
      // Calculate score
      const detailedScore = calculateDetailedScore();

      if (detailedScore) {
        setSubmissionScore(detailedScore);
        setShowScoreDialog(true);
      } else {
        success("Placement test completed! (Score calculation not available)");
        navigate(-1);
      }
    } catch (err: any) {
      console.error("Failed to submit placement test:", err);
      showError(err.response?.data || err.message || "Failed to submit placement test");
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const confirmSubmit = () => {
    setShowSubmitDialog(false);
    handleSubmit(true);
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    saveAnswers();
    navigate(-1);
  };

  // Get audio URL for a question
  const getQuestionAudioUrl = (question: Question): string | null => {
    const audioUrl = (question as any)._audioUrl || question.reference;
    if (!audioUrl) return null;
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl;
    }
    return `${config.storagePublicUrl}${audioUrl.startsWith('/') ? audioUrl : '/' + audioUrl}`;
  };

  const normalizeAudioUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `${config.storagePublicUrl}${url.startsWith("/") ? url : "/" + url}`;
  };

  const toggleQuestionAudio = (question: Question & { audioUrl?: string }) => {
    if (!question.audioUrl) return;

    const normalizedUrl = normalizeAudioUrl(question.audioUrl);
    if (!normalizedUrl) return;

    const audioKey = normalizedUrl;
    const isPlaying = questionAudioPlaying[audioKey] || false;

    if (isPlaying) {
      // Pause audio
      const audio = questionAudioRefs.current[audioKey];
      if (audio) {
        audio.pause();
      }
      setQuestionAudioPlaying((prev) => ({ ...prev, [audioKey]: false }));
    } else {
      // Play audio
      let audio = questionAudioRefs.current[audioKey];
      if (!audio) {
        audio = new Audio(normalizedUrl);
        audio.addEventListener('ended', () => {
          setQuestionAudioPlaying((prev) => ({ ...prev, [audioKey]: false }));
        });
        questionAudioRefs.current[audioKey] = audio;
      }

      // Stop all other audio
      Object.values(questionAudioRefs.current).forEach((a) => {
        if (a !== audio) {
          a.pause();
          a.currentTime = 0;
        }
      });
      Object.keys(questionAudioRefs.current).forEach((key) => {
        if (key !== audioKey) {
          setQuestionAudioPlaying((prev) => ({ ...prev, [key]: false }));
        }
      });

      audio.play();
      setQuestionAudioPlaying((prev) => ({ ...prev, [audioKey]: true }));
    }
  };

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];
    const questionAudioUrl = getQuestionAudioUrl(question);
    
    // Lấy skillType từ question data result (mỗi question có skillType riêng)
    const questionDataResult = (question as any)._questionDataResult;
    const currentSkillType = questionDataResult?.question?.skillType || placementTest?.questions?.[0]?.skillType || "";

    return (
      <QuestionRenderer
        question={question}
        answer={answer}
        onAnswerChange={(answer: any) => handleAnswerChange(question.id, answer)}
        skillType={currentSkillType}
        questionAudioUrl={questionAudioUrl || undefined}
        questionAudioPlaying={questionAudioPlaying || undefined}
        toggleQuestionAudio={toggleQuestionAudio || undefined}
        normalizeAudioUrl={normalizeAudioUrl || undefined}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error || !placementTest) {
    return (
      <div className="px-6 py-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-neutral-600">{error || "Placement test not found"}</p>
          <Button onClick={() => navigate(-1)} className="mt-4" variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="px-6 py-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">No Questions</h2>
          <p className="text-neutral-600">This placement test doesn't have any questions yet.</p>
          <Button onClick={() => navigate(-1)} className="mt-4" variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Group questions by passage
  const groupQuestionsByPassage = () => {
    const passageGroups = new Map<string, Question[]>();
    const questionsWithoutPassage: Question[] = [];

    questions.forEach((q) => {
      const passage = (q as any)._passage;
      if (passage && passage.trim()) {
        const passageKey = passage.trim();
        if (!passageGroups.has(passageKey)) {
          passageGroups.set(passageKey, []);
        }
        passageGroups.get(passageKey)!.push(q);
      } else {
        questionsWithoutPassage.push(q);
      }
    });

    const passages = Array.from(passageGroups.entries()).map(([passage, qs]) => ({
      passage,
      questions: qs.sort((a, b) => a.order - b.order),
      firstQuestionOrder: Math.min(...qs.map((q) => q.order)),
    })).sort((a, b) => a.firstQuestionOrder - b.firstQuestionOrder);

    return { passages, questionsWithoutPassage };
  };

  const { passages, questionsWithoutPassage } = groupQuestionsByPassage();
  const hasMultiplePassages = passages.length > 1 || (passages.length > 0 && questionsWithoutPassage.length > 0);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const isReading = placementTest?.questions?.[0]?.skillType?.toLowerCase().includes("reading") || false;

  // Get current question's passage
  const getCurrentQuestionContext = () => {
    if (!currentQuestion) return { currentQuestion: null, passage: null, passageQuestions: [], questionIndexInPassage: 0 };

    for (const passageGroup of passages) {
      const indexInPassage = passageGroup.questions.findIndex((q) => q.id === currentQuestion.id);
      if (indexInPassage !== -1) {
        return {
          currentQuestion,
          passage: passageGroup.passage,
          passageQuestions: passageGroup.questions,
          questionIndexInPassage: indexInPassage,
        };
      }
    }

    return {
      currentQuestion,
      passage: null,
      passageQuestions: [currentQuestion],
      questionIndexInPassage: 0,
    };
  };

  const currentContext = getCurrentQuestionContext();
  const currentPassage = currentContext.passage;
  const currentPassageQuestions = currentContext.passageQuestions;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <AssignmentHeader
        title={placementTest.title}
        skillName={placementTest.questions?.[0]?.skillType || ""}
        lastSaved={lastSaved}
        isSaving={isSaving}
        onBack={() => navigate(-1)}
        onSave={saveAnswers}
        onSubmit={() => handleSubmit(false)}
        canSubmit={!submitting}
        timeRemaining={timeRemaining}
        timeLimitSeconds={initialTimeLimit}
        formatTime={formatTime}
      />

      {/* Time Warning Banner */}
      {showTimeWarning && timeRemaining !== null && timeRemaining < 300 && (
        <div className={`mx-6 mt-4 p-4 rounded-lg border-2 ${
          timeRemaining < 60
            ? "bg-red-500 text-white border-red-600 animate-pulse"
            : "bg-yellow-100 text-yellow-800 border-yellow-300"
        }`}>
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${timeRemaining < 60 ? "animate-bounce" : ""}`} />
            <div className="flex-1">
              <p className="font-semibold">
                {timeRemaining < 60
                  ? "⚠️ CRITICAL: Less than 1 minute remaining!"
                  : "⚠️ Warning: Less than 5 minutes remaining!"}
              </p>
              <p className="text-sm mt-1 opacity-90">
                {timeRemaining < 60
                  ? "Your test will be automatically submitted when time expires. Please save your work!"
                  : "Please make sure to save your answers. Your test will be automatically submitted when time expires."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTimeWarning(false)}
              className="text-current opacity-75 hover:opacity-100 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-full xl:max-w-screen-2xl mx-auto">
          {/* Progress Indicator + Time Remaining - ở trên cùng */}
          <Card className="p-6 border-primary-200 mb-6">
            <ProgressIndicator
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              answeredCount={answeredCount}
              timeRemaining={timeRemaining}
              formatTime={formatTime}
            />
          </Card>

          {/* Layout: 2 columns when passage exists, centered single column otherwise */}
          <div className={`grid gap-6 ${currentPassage ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
              {/* Left - Reading Passage (only shown when passage exists) */}
              {currentPassage && (
                <div className="lg:sticky lg:top-24 h-full lg:self-start">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-semibold text-neutral-800">Reading Passage</h2>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowReadingPassage(!showReadingPassage)}
                        iconLeft={showReadingPassage ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      >
                        {showReadingPassage ? "Hide" : "Show"}
                      </Button>
                    </div>
                    {showReadingPassage && (
                      <div className="bg-white border border-neutral-200 rounded-lg p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                        <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed text-sm">
                          {currentPassage}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}

                {/* Question Area */}
                <div>
                  <Card className="p-6">
                    {currentQuestion && (() => {
                      const isAnswered = answers[currentQuestion.id] !== undefined &&
                        answers[currentQuestion.id] !== null &&
                        answers[currentQuestion.id] !== "";

                      return (
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg border-1 border-gray-200 bg-white shadow-md">
                            <div className="mb-4 flex items-center justify-between">
                              <div>
                                <span className="text-sm font-medium text-primary-600">
                                  Question {currentQuestionIndex + 1} of {questions.length}
                                </span>
                                <span className="ml-2 text-sm text-neutral-500">
                                  ({currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''})
                                </span>
                              </div>
                              {isAnswered && (
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                  Answered
                                </span>
                              )}
                            </div>

                            <div className="mb-4">
                              {renderQuestion(currentQuestion)}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                            <Button
                              variant="secondary"
                              onClick={handlePrevious}
                              disabled={currentQuestionIndex === 0}
                            >
                              Previous
                            </Button>
                            <div className="flex gap-2">
                              {currentQuestionIndex < questions.length - 1 ? (
                                <Button
                                  variant="primary"
                                  onClick={handleNext}
                                >
                                  Next
                                </Button>
                              ) : (
                                <Button
                                  variant="primary"
                                  onClick={() => handleSubmit(false)}
                                  iconLeft={<Send className="w-4 h-4" />}
                                >
                                  Submit Test
                                </Button>
                              )}
                            </div>
                          </div>

                          {questions.length > 1 && (
                            <div className="pt-4 border-t border-neutral-200">
                              <p className="text-sm font-medium text-neutral-700 mb-3">
                                All Questions:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {questions.map((q, qIndex) => {
                                  const qIsAnswered = answers[q.id] !== undefined &&
                                    answers[q.id] !== null &&
                                    answers[q.id] !== "";
                                  const qIsCurrent = qIndex === currentQuestionIndex;

                              return (
                                <button
                                  key={q.id}
                                  onClick={() => handleQuestionClick(qIndex)}
                                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                    qIsCurrent
                                      ? "bg-primary-600 text-white"
                                      : qIsAnswered
                                      ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                                      : "bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200"
                                  }`}
                                >
                                  {qIndex + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                </Card>
              </div>
            </div>
          {/* ) : (
              // Layout thông thường khi không có passage
              <div className="space-y-6">
                <Card className="p-6">
                  {currentQuestion && (() => {
                    const isAnswered = answers[currentQuestion.id] !== undefined &&
                      answers[currentQuestion.id] !== null &&
                      answers[currentQuestion.id] !== "";

                    return (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border-1 border-gray-200 bg-white shadow-md">
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-primary-600">
                                Question {currentQuestionIndex + 1} of {questions.length}
                              </span>
                              <span className="ml-2 text-sm text-neutral-500">
                                ({currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''})
                              </span>
                            </div>
                            {isAnswered && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                Answered
                              </span>
                            )}
                          </div>

                          <div className="mb-4">
                            {renderQuestion(currentQuestion)}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                          <Button
                            variant="secondary"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                          >
                            Previous
                          </Button>
                          <div className="flex gap-2">
                            {currentQuestionIndex < questions.length - 1 ? (
                              <Button
                                variant="primary"
                                onClick={handleNext}
                              >
                                Next
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                onClick={() => handleSubmit(false)}
                                iconLeft={<Send className="w-4 h-4" />}
                              >
                                Submit Test
                              </Button>
                            )}
                          </div>
                        </div>

                        {questions.length > 1 && (
                          <div className="pt-4 border-t border-neutral-200">
                            <p className="text-sm font-medium text-neutral-700 mb-3">
                              All Questions:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {questions.map((q, qIndex) => {
                                const qIsAnswered = answers[q.id] !== undefined &&
                                  answers[q.id] !== null &&
                                  answers[q.id] !== "";
                                const qIsCurrent = qIndex === currentQuestionIndex;

                                return (
                                  <button
                                    key={q.id}
                                    onClick={() => handleQuestionClick(qIndex)}
                                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                      qIsCurrent
                                        ? "bg-primary-600 text-white"
                                        : qIsAnswered
                                        ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                                        : "bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200"
                                    }`}
                                  >
                                    {qIndex + 1}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Card>

                <Card className="p-6 border-primary-200">
                  <ProgressIndicator
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={questions.length}
                    answeredCount={answeredCount}
                    timeRemaining={timeRemaining}
                    formatTime={formatTime}
                  />
                </Card>
              </div>
            )
          )} */}
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Placement Test</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-3">
              <p className="text-neutral-700">
                Are you sure you want to submit this placement test?
                <br />
                You have answered {answeredCount} out of {questions.length} questions.
              </p>
              {answeredCount < questions.length && (
                <p className="text-yellow-600 text-sm">
                  You have {questions.length - answeredCount} unanswered questions.
                </p>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmSubmit}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={confirmExit}
        title="Exit Placement Test"
        message="Your progress will be saved. You can return to complete this test later."
        confirmText="Exit"
        cancelText="Continue"
      />

      {/* Score Result Dialog */}
      <ScoreResultDialog
        isOpen={showScoreDialog}
        onClose={() => {
          setShowScoreDialog(false);
          navigate(-1);
        }}
        submissionScore={submissionScore}
      />
    </div>
  );
}

