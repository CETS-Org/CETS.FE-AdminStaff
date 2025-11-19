import { Play, Pause, Headphones } from "lucide-react";
import type { Question } from "../types/placementQuestion.types";
import MultipleChoiceQuestion from "./questionTypes/MultipleChoiceQuestion";
import TrueFalseQuestion from "./questionTypes/TrueFalseQuestion";
import FillInBlankQuestion from "./questionTypes/FillInBlankQuestion";
import ShortAnswerQuestion from "./questionTypes/ShortAnswerQuestion";
import EssayQuestion from "./questionTypes/EssayQuestion";
import MatchingQuestion from "./questionTypes/MatchingQuestion";

interface QuestionRendererProps {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  skillType: string;
  questionAudioUrl?: string;
  questionAudioPlaying?: Record<string, boolean>;
  toggleQuestionAudio?: (question: Question & { audioUrl?: string }) => void;
  normalizeAudioUrl?: (url: string | undefined) => string | undefined;
}

/**
 * Renders the appropriate question component based on question type
 * Handles audio player for questions with audio
 */
export default function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
  skillType,
  questionAudioUrl,
  questionAudioPlaying,
  toggleQuestionAudio,
  normalizeAudioUrl,
}: QuestionRendererProps) {
  const commonProps = {
    question,
    answer,
    onAnswerChange,
    skillType,
  };

  // Render question component based on type
  const renderQuestionComponent = () => {
    switch (question.type) {
      case "multiple_choice":
        return <MultipleChoiceQuestion {...commonProps} />;
      case "true_false":
        return <TrueFalseQuestion {...commonProps} />;
      case "fill_in_the_blank":
        return <FillInBlankQuestion {...commonProps} />;
      case "short_answer":
        return <ShortAnswerQuestion {...commonProps} />;
      case "essay":
        return <EssayQuestion {...commonProps} />;
      case "matching":
        return <MatchingQuestion {...commonProps} />;
      default:
        return <div className="text-red-600">Unknown question type: {question.type}</div>;
    }
  };

  // Chỉ hiển thị play button cho listening questions
  const isListening = skillType?.toLowerCase().includes("listening") || false;
  
  // Chỉ hiển thị audio player nếu:
  // 1. skillType là listening
  // 2. Có đầy đủ các props audio cần thiết
  const shouldShowAudioPlayer = isListening && 
    questionAudioUrl && 
    toggleQuestionAudio && 
    questionAudioPlaying && 
    normalizeAudioUrl;

  return (
    <div className="space-y-4">
      {/* Audio Player for Question - chỉ hiển thị cho listening */}
      {shouldShowAudioPlayer && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleQuestionAudio({ ...question, audioUrl: questionAudioUrl })}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              title={questionAudioPlaying[normalizeAudioUrl(questionAudioUrl) || questionAudioUrl] ? "Pause" : "Play"}
            >
              {questionAudioPlaying[normalizeAudioUrl(questionAudioUrl) || questionAudioUrl] ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1 flex items-center gap-2">
              <Headphones className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">
                  {questionAudioPlaying[normalizeAudioUrl(questionAudioUrl) || questionAudioUrl]
                    ? "Playing audio..."
                    : "Click to play audio for this question"}
                </p>
                {question.audioTimestamp && (
                  <p className="text-xs text-purple-600 mt-1">Timestamp: {question.audioTimestamp}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {renderQuestionComponent()}
    </div>
  );
}

