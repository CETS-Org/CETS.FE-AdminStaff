import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useToast } from "@/hooks/useToast";
import {
  ChevronRight,
  ChevronLeft,
  FileText,
  PenTool,
  Eye,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import QuestionBuilder from "./QuestionBuilder";
import QuestionImport from "./QuestionImport";
import type { Question } from "../types/placementQuestion.types";
import {
  createPlacementQuestion,
  updatePlacementQuestion,
  getQuestionTypes,
  getQuestionJsonUploadUrl,
  getAudioUploadUrl,
  type PlacementQuestion,
  type QuestionType,
} from "@/api/placementTest.api";
import { api, endpoint } from "@/api/api";
import { config } from "@/lib/config";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editQuestion?: PlacementQuestion | null;
}

type Step = "basic" | "questions" | "preview";

interface Skill {
  lookUpId: string;
  code: string;
  name: string;
  isActive: boolean;
}

//Helper function to upload JSON to presigned URL
export const uploadJsonToPresignedUrl = async (url: string, jsonData: string) => {
  //const fileName = url.split('/').pop() || 'data.json';
  const blob = new Blob([jsonData], { type: "application/json" });

  return fetch(url, {
    method: "PUT",
    body: blob, 
    headers: {
      "Content-Type": "application/json",
    },
  });
};

//Helper function to upload audio file to presigned URL
export const uploadAudioFileToPresignedUrl = async (url: string, file: File) => {
  return fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "audio/mpeg",
    },
  });
};



export default function CreatePlacementQuestionDialog({
  open,
  onOpenChange,
  onSuccess,
  editQuestion,
}: Props) {
  const { toasts, hideToast, success, error: showError } = useToast();

  // Basic Info
  const [title, setTitle] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [questionTypeId, setQuestionTypeId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState(1);

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const steps: Step[] = ["basic", "questions", "preview"];

  // Data
  const [skills, setSkills] = useState<Skill[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalQuestionJson, setOriginalQuestionJson] = useState<string | null>(null);
  const [initialQuestionUrl, setInitialQuestionUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"builder" | "import">("builder");

  // Find the selected skill object
  const selectedSkill = skills.find((s) => s.lookUpId === selectedSkillId);

  // Filter question types based on selected skill type
  const filteredQuestionTypes = useMemo(() => {
    if (!selectedSkillId || !questionTypes.length) return [];
    
    const skillTypeName = selectedSkill?.name?.toLowerCase() || selectedSkill?.code?.toLowerCase() || "";
    const isReading = skillTypeName.includes("reading");
    const isListening = skillTypeName.includes("listening");
    
    if (isReading) {
      // Reading: chỉ hiện multiple_choice và passage
      return questionTypes.filter((qt) => {
        const qtName = qt.name.toLowerCase();
        return qt.isActive && (
          qtName.includes("multiple choice") || 
          qtName.includes("multiplechoice") ||
          qtName.includes("passage")
        );
      });
    } else if (isListening) {
      // Listening: chỉ hiện multiple_choice và audio
      return questionTypes.filter((qt) => {
        const qtName = qt.name.toLowerCase();
        return qt.isActive && (
          qtName.includes("multiple choice") || 
          qtName.includes("multiplechoice") ||
          qtName.includes("audio")
        );
      });
    }
    
    // Default: hiện tất cả
    return questionTypes.filter((qt) => qt.isActive);
  }, [selectedSkillId, questionTypes, selectedSkill]);

  // Get difficulty options based on selected question type
  const difficultyOptions = useMemo(() => {
    if (!questionTypeId) return [];
    
    const currentQuestionType = questionTypes.find((qt) => qt.id === questionTypeId);
    const questionTypeName = currentQuestionType?.name?.toLowerCase() || "";
    const isMultipleChoice = questionTypeName.includes("multiple choice") || questionTypeName.includes("multiplechoice");
    const isPassageOrAudio = questionTypeName.includes("passage") || questionTypeName.includes("audio");
    
    if (isMultipleChoice) {
      // Multiple Choice: chỉ hiện option "Multiple Choice" (difficulty = 1)
      return [
        { value: "1", label: "1 - Multiple Choice" }
      ];
    } else if (isPassageOrAudio) {
      // Passage/Audio: hiện Short và Long
      const skillTypeName = selectedSkill?.name?.toLowerCase() || selectedSkill?.code?.toLowerCase() || "";
      const isReading = skillTypeName.includes("reading");
      const labelType = isReading ? "Passage" : "Audio";
      
      return [
        { value: "2", label: `2 - Short ${labelType}` },
        { value: "3", label: `3 - Long ${labelType}` }
      ];
    }
    
    // Default
    return [
      { value: "1", label: "1 - Single Question" },
      { value: "2", label: "2 - Short Passage/Audio" },
      { value: "3", label: "3 - Long Passage/Audio" },
    ];
  }, [questionTypeId, questionTypes, selectedSkill]);

  // Reset questionTypeId and difficulty when skill type changes
  useEffect(() => {
    if (selectedSkillId) {
      // Reset questionTypeId when skill changes (unless editing)
      if (!editQuestion) {
        setQuestionTypeId(null);
        setDifficulty(1);
      }
    }
  }, [selectedSkillId, editQuestion]);

  // Reset difficulty when question type changes
  useEffect(() => {
    if (questionTypeId) {
      const currentQuestionType = questionTypes.find((qt) => qt.id === questionTypeId);
      const questionTypeName = currentQuestionType?.name?.toLowerCase() || "";
      const isMultipleChoice = questionTypeName.includes("multiple choice") || questionTypeName.includes("multiplechoice");
      const isPassageOrAudio = questionTypeName.includes("passage") || questionTypeName.includes("audio");
      
      // Reset difficulty when question type changes (unless editing)
      if (!editQuestion) {
        if (isMultipleChoice) {
          setDifficulty(1); // Multiple Choice -> difficulty = 1
        } else if (isPassageOrAudio) {
          setDifficulty(2); // Passage/Audio -> default to difficulty = 2 (short)
        }
      }
    }
  }, [questionTypeId, questionTypes, editQuestion]);

  // Load data for editing
  const loadQuestionForEdit = useCallback(async () => {
    if (!editQuestion) return;

    try {
      setTitle(editQuestion.title);
      setSelectedSkillId(editQuestion.skillTypeID);
      setQuestionTypeId(editQuestion.questionTypeID);
      setDifficulty(editQuestion.difficulty);
      setInitialQuestionUrl(editQuestion.questionUrl || null);

      // Load question data if questionUrl exists
      if (editQuestion.questionUrl) {
        try {
          // Build direct URL to cloud storage (no need to call API)
          // Format: https://pub-59cfd11e5f0d4b00af54839edc83842d.r2.dev/{questionUrl}
          const questionUrl = editQuestion.questionUrl.startsWith('/') 
            ? editQuestion.questionUrl 
            : `/${editQuestion.questionUrl}`;
          const directUrl = `${config.storagePublicUrl}${questionUrl}`;

          const questionResponse = await fetch(directUrl);
          if (!questionResponse.ok) {
            throw new Error(`Failed to fetch question data: ${questionResponse.status}`);
          }

          const questionData = await questionResponse.json();

          let formattedQuestions: Question[] = [];
          if (questionData.questions && Array.isArray(questionData.questions)) {
            // Restore audio URL from questionData.media.audioUrl if exists (for listening)
            // This ensures audio can be played when editing
            const audioUrlFromMedia = questionData.media?.audioUrl;
            
            formattedQuestions = questionData.questions.map((q: any) => {
              const formattedQ = {
                ...q,
                id: q.id || `q-${Date.now()}-${q.order}`,
                type: q.type || "multiple_choice",
                order: q.order || 0,
                question: q.question || "",
                points: q.points || 0,
              };
              
              // Restore audio URL from media.audioUrl or reference for listening questions
              // audioUrlFromMedia can be public URL (already normalized) or relative path (filePath)
              // Both will work when restored into currentAudioUrl and normalized by getAudioSource()
              if (audioUrlFromMedia) {
                console.log("🎵 loadQuestionForEdit - Restoring audio URL from media.audioUrl:", audioUrlFromMedia);
                (formattedQ as any)._audioUrl = audioUrlFromMedia;
                formattedQ.reference = audioUrlFromMedia;
              } else if (q.reference) {
                console.log("🎵 loadQuestionForEdit - Restoring audio URL from reference:", q.reference);
                (formattedQ as any)._audioUrl = q.reference;
              }
              
              return formattedQ;
            });
            setQuestions(formattedQuestions);
          } else if (questionData.media?.audioUrl) {
            // If no questions but has audio URL, restore it for future questions
            // This handles edge case where question has audio but no questions yet
            formattedQuestions = [];
            setQuestions(formattedQuestions);
          }

          // Store original JSON for comparison
          const existingPayload = buildQuestionDataPayload(formattedQuestions);
          if (existingPayload) {
            setOriginalQuestionJson(serializeQuestionData(existingPayload));
          }
        } catch (err) {
          console.error("Error loading question data:", err);
          showError(`Failed to load question data: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      }
    } catch (err) {
      console.error("Error loading question for edit:", err);
      showError("Failed to load question data");
    }
  }, [editQuestion, showError]);

  // Load skills and question types on mount
  useEffect(() => {
    if (open) {
        loadSkills();
        loadOptions();
      if (editQuestion) {
        loadQuestionForEdit();
      } else {
        resetForm();
      }
    }
  }, [open, editQuestion, loadQuestionForEdit]);


//   const loadOptions = async () => {
//     try {
//       setLoadingOptions(true);
//       const [questionTypesRes, skillTypesRes] = await Promise.all([
//         getQuestionTypes(),
//         api.get(`${endpoint.coreLookup}/type/code/CourseSkill`),
//       ]);
//       setQuestionTypes(questionTypesRes.data || []);
//       setSkills(skillTypesRes.data || []);
//     } catch (err) {
//       console.error("Error loading options:", err);
//       showError("Failed to load options");
//     } finally {
//       setLoadingOptions(false);
//     }
//   };
const loadOptions = async () => {
  try {
    setLoadingOptions(true);
    const questionTypesRes = await getQuestionTypes();
    // const skillTypesRes = await api.get(`${endpoint.coreLookup}/type/code/CourseSkill`);
    setQuestionTypes(questionTypesRes.data || []);
    // setSkills(skillTypesRes.data || []);
  } catch (err) {
    console.error("Error loading options:", err);
    showError("Failed to load options");
  } finally {
    setLoadingOptions(false);
  }
  }


  const loadSkills = async () => {
    try {
        setLoadingOptions(true);
      const response = await api.get(`${endpoint.coreLookup}/type/code/CourseSkill`);
      setSkills(response.data || []);
    } catch (err) {
      console.error("Error loading skills:", err);
      showError("Failed to load skills");
    } finally {
        setLoadingOptions(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSelectedSkillId(null);
    setQuestionTypeId(null);
    setDifficulty(1);
    setQuestions([]);
    setError(null);
    setCurrentStep("basic");
    setOriginalQuestionJson(null);
    setInitialQuestionUrl(null);
  };

  const handleAddQuestion = (question: Question) => {
    const newQuestion = {
      ...question,
      id: question.id || `q-${Date.now()}-${Math.random()}`,
      order: questions.length + 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (id: string, updatedQuestion: Partial<Question>) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          const merged = { ...q, ...updatedQuestion };
          // Clean up audio fields
          if ("_audioFile" in updatedQuestion) {
            if ((updatedQuestion as any)._audioFile === null || (updatedQuestion as any)._audioFile === undefined) {
              delete (merged as any)._audioFile;
            }
          }
          if ("_audioUrl" in updatedQuestion) {
            const audioUrlValue = (updatedQuestion as any)._audioUrl;
            if (audioUrlValue === "" || audioUrlValue === null || audioUrlValue === undefined) {
              delete (merged as any)._audioUrl;
            }
          }
          // Clean up passage field
          if ((q as any)._passage && !("_passage" in updatedQuestion)) {
            delete (merged as any)._passage;
          } else if ("_passage" in updatedQuestion && (updatedQuestion as any)._passage === undefined) {
            delete (merged as any)._passage;
          }
          return merged;
        }
        return q;
      })
    );
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(
      questions
        .filter((q) => q.id !== id)
        .map((q, idx) => ({
          ...q,
          order: idx + 1,
        }))
    );
  };

  const handleReorderQuestions = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...questions];
    const [moved] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, moved);
    setQuestions(newQuestions.map((q, idx) => ({ ...q, order: idx + 1 })));
  };

  const handleImportQuestions = (importedQuestions: Question[]) => {
    const newQuestions = importedQuestions.map((q, idx) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${idx}`,
      order: questions.length + idx + 1,
    }));
    setQuestions([...questions, ...newQuestions]);
  };

  // Helper function to normalize audio URL to public URL
  const normalizeAudioUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `${config.storagePublicUrl}${url.startsWith("/") ? url : "/" + url}`;
  };

  // Helper function to extract relative path from audio URL for grouping comparison
  // This ensures audio URLs with same relative path but different formats (public URL vs relative path) are grouped together
  const extractAudioPathForGrouping = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    // If it's a public URL, extract the relative path
    if (url.startsWith(config.storagePublicUrl)) {
      return url.replace(config.storagePublicUrl, "").replace(/^\/+/, "");
    }
    // If it's already a relative path, return it
    return url.replace(/^\/+/, "");
  };

  const buildQuestionDataPayload = (sourceQuestions: Question[]): any | null => {
    if (sourceQuestions.length === 0) return null;

    const sortedQuestions = [...sourceQuestions].sort((a, b) => a.order - b.order);

    let readingPassage: string | undefined;
    let audioUrl: string | undefined;

    const passageCounts = new Map<string, number>();
    const audioCounts = new Map<string, number>();

    const processedQuestions = sortedQuestions.map((q) => {
      const question = { ...q };

      const existingAudio = (question as any)._audioUrl || question.reference;
      if (existingAudio) {
        const normalizedAudio = normalizeAudioUrl(existingAudio);
        if (normalizedAudio) {
          (question as any)._audioUrl = normalizedAudio;
          question.reference = normalizedAudio;
        }
      }

      const passage = (question as any)._passage;
      const audio = (question as any)._audioUrl || question.reference;

      if (passage && passage.trim()) {
        passageCounts.set(passage.trim(), (passageCounts.get(passage.trim()) || 0) + 1);
      }
      if (audio) {
        audioCounts.set(audio, (audioCounts.get(audio) || 0) + 1);
      }

      const { _audioFile, ...cleanedQ } = question as any;
      if (!cleanedQ._passage || !cleanedQ._passage.trim()) {
        delete cleanedQ._passage;
      }
      return cleanedQ;
    });

    if (passageCounts.size > 0) {
      readingPassage = Array.from(passageCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
    }
    if (audioCounts.size > 0) {
      const mostCommonAudio = Array.from(audioCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
      audioUrl = normalizeAudioUrl(mostCommonAudio);
    }

    return {
      version: "1.0",
      questions: processedQuestions,
      ...(readingPassage && { readingPassage }),
      ...(audioUrl && {
        media: {
          audioUrl,
        },
      }),
    };
  };

  const serializeQuestionData = (data: any): string => {
    const normalizedQuestions = data.questions.map((question: any) => {
      const normalized = { ...question };
      if (normalized.reference) {
        normalized.reference = normalizeAudioUrl(normalized.reference) || normalized.reference;
      }
      return normalized;
    });

    const normalizedMedia = data.media
      ? {
          ...data.media,
          ...(data.media.audioUrl && {
            audioUrl: normalizeAudioUrl(data.media.audioUrl) || data.media.audioUrl,
          }),
        }
      : undefined;

    const payload: Record<string, unknown> = {
      version: data.version,
      questions: normalizedQuestions,
    };

    if (data.readingPassage) {
      payload.readingPassage = data.readingPassage;
    }

    if (normalizedMedia) {
      payload.media = normalizedMedia;
    }

    return JSON.stringify(payload);
  };

  // Group questions by passage or audio for separate placement questions
  const groupQuestionsByResource = (sourceQuestions: Question[]): Array<{
    questions: Question[];
    passage?: string;
    audioUrl?: string;
    title: string;
  }> => {
    const sortedQuestions = [...sourceQuestions].sort((a, b) => a.order - b.order);
    const groups: Map<string, { questions: Question[]; passage?: string; audioUrl?: string; title: string }> = new Map();

    // Get skill type and question type for grouping logic
    const currentSkill = skills.find(s => s.lookUpId === selectedSkillId);
    const skillTypeName = currentSkill?.name?.toLowerCase() || currentSkill?.code?.toLowerCase() || "";
    const isListening = skillTypeName.includes("listening");
    
    const currentQuestionType = questionTypes.find(qt => qt.id === questionTypeId);
    const questionTypeName = currentQuestionType?.name?.toLowerCase() || "";
    const isMultipleChoice = questionTypeName.includes("multiple choice") || questionTypeName.includes("multiplechoice");
    const isAudioType = questionTypeName.includes("audio");

    let audioGroupCounter = 0;
    
    sortedQuestions.forEach((q) => {
      const passage = (q as any)._passage?.trim();
      const audio = (q as any)._audioUrl?.trim() || q.reference?.trim();
      // Extract relative path from audio URL for grouping comparison
      // This ensures audio URLs with same relative path but different formats are grouped together
      const audioPathForGrouping = extractAudioPathForGrouping(audio);

      // Create a key for grouping: passage for reading, audio for listening, or individual for standalone
      let groupKey: string;
      let groupTitle: string;

      if (passage) {
        // Group by passage (for reading)
        groupKey = `passage:${passage}`;
        groupTitle = passage.substring(0, 100) || title.trim();
      } else if (isListening && isMultipleChoice && difficulty === 1) {
        // For listening + multiple choice + difficulty = 1: each question is standalone (no grouping)
        groupKey = `standalone:${q.id}`;
        groupTitle = q.question.substring(0, 100) || title.trim();
      } else if (isListening && isAudioType && (difficulty === 2 || difficulty === 3)) {
        // For listening + audio type + difficulty = 2 or 3: group by audio
        if (audioPathForGrouping) {
          // Use relative path for grouping to ensure same audio is grouped together
          groupKey = `audio:${audioPathForGrouping}`;
          if (!groups.has(groupKey)) {
            audioGroupCounter++;
          }
          groupTitle = title.trim() || `Audio Question ${audioGroupCounter}`;
        } else {
          // No audio - standalone
          groupKey = `standalone:${q.id}`;
          groupTitle = q.question.substring(0, 100) || title.trim();
        }
      } else if (audioPathForGrouping) {
        // Default: Group by audio (for listening - other cases)
        // Use relative path for grouping to ensure same audio is grouped together
        groupKey = `audio:${audioPathForGrouping}`;
        if (!groups.has(groupKey)) {
          audioGroupCounter++;
        }
        groupTitle = title.trim() || `Audio Question ${audioGroupCounter}`;
      } else {
        // Standalone question - each question is its own group
        groupKey = `standalone:${q.id}`;
        groupTitle = q.question.substring(0, 100) || title.trim();
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          questions: [],
          title: groupTitle,
          ...(passage && { passage }),
          // Store the original audio URL (not the path) for saving to JSON
          // Use the first audio URL found in the group for consistency
          ...(audio && groupKey.startsWith("audio:") && { audioUrl: audio }),
        });
      }

      const group = groups.get(groupKey)!;
      group.questions.push(q);
    });

    return Array.from(groups.values());
  };

  const validateStep = (step: Step): boolean => {
    setError(null);

    switch (step) {
      case "basic":
        if (!title.trim()) {
          setError("Title is required");
          return false;
        }
        if (!selectedSkillId) {
          setError("Please select a skill type");
          return false;
        }
        // if (!questionTypeId) {
        //   setError("Please select a question type");
        //   return false;
        // }
        return true;

      case "questions":
        if (questions.length === 0) {
          setError("Please add at least one question");
          return false;
        }
        // Validate each question
        for (const q of questions) {
          if (!q.question.trim()) {
            setError(`Question ${q.order} is missing text`);
            return false;
          }
          if (q.points <= 0) {
            setError(`Question ${q.order} must have points > 0`);
            return false;
          }
          if (q.type === "multiple_choice") {
            if (!q.options || q.options.length < 2) {
              setError(`Question ${q.order} (Multiple Choice) needs at least 2 options`);
              return false;
            }
            if (!q.correctAnswer) {
              setError(`Question ${q.order} (Multiple Choice) needs a correct answer`);
              return false;
            }
          }
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep("questions")) {
      setCurrentStep("questions");
      return;
    }

    try {
      setLoading(true);

      // Audio files have been uploaded to cloud immediately in QuestionBuilder when selected
      // So we just need to use the audio URLs from questions, no need to upload again
      console.log("🔍 Checking questions for audio URLs:", questions.map(q => ({
        id: q.id,
        audioUrl: (q as any)._audioUrl || q.reference,
        hasAudioFile: !!(q as any)._audioFile
      })));
      
      // Clean up any remaining _audioFile references (shouldn't happen, but just in case)
      const questionsWithAudioUrls = questions.map(q => {
        // Remove _audioFile if exists (audio should already be uploaded)
        if ((q as any)._audioFile) {
          console.warn("⚠️ Question has _audioFile but audio should already be uploaded. Removing _audioFile.");
          const { _audioFile, ...cleanedQ } = q as any;
          return cleanedQ;
        }
        return q;
      });

      // Build question data with audio URLs (already uploaded in QuestionBuilder)
      const questionData = buildQuestionDataPayload(questionsWithAudioUrls);
      if (!questionData) {
        showError("Failed to generate question data");
        return;
      }

      // Serialize question data to JSON string
      const questionJson = serializeQuestionData(questionData);

      if (editQuestion) {
        // Update existing question
        const updatedQuestionJson = questionJson;
        const questionJsonChanged = !originalQuestionJson || updatedQuestionJson !== originalQuestionJson;
        
        // Audio files are uploaded immediately in QuestionBuilder, so no need to check for _audioFile
        // If audio URL changed, we need to update JSON even if content is same
        const shouldUpdateJson = questionJsonChanged;

        let newQuestionFilePath: string | null = null;

        if (shouldUpdateJson) {
          const jsonFileName = `placement-question-${editQuestion.id}.json`;
          const uploadUrlResponse = await getQuestionJsonUploadUrl(jsonFileName);
          const uploadUrlData = uploadUrlResponse.data;

          if (
            uploadUrlData &&
            typeof uploadUrlData === "object" &&
            "uploadUrl" in uploadUrlData &&
            "filePath" in uploadUrlData
          ) {
            const { uploadUrl, filePath } = uploadUrlData as { uploadUrl: string; filePath: string };

            const jsonUploadResponse = await uploadJsonToPresignedUrl(uploadUrl, updatedQuestionJson);

            if (!jsonUploadResponse.ok) {
              throw new Error(`JSON upload failed with status: ${jsonUploadResponse.status}`);
            }

            newQuestionFilePath = filePath;
          }
        }

        // Update question
        const updateData: any = {
          id: editQuestion.id,
          title: title.trim(),
          skillTypeID: selectedSkillId,
          questionTypeID: questionTypeId,
          difficulty,
        };

        // Always update questionUrl if JSON was updated (including when audio file was uploaded)
        const questionUrlToPersist = newQuestionFilePath || initialQuestionUrl;
        if (questionUrlToPersist) {
          updateData.questionUrl = questionUrlToPersist;
        }

        await updatePlacementQuestion(updateData);
        success("Placement question updated successfully!");
      } else {
        // Create new question(s)
        // Group questions by passage (reading) or audio (listening)
        // Each group will create one placement question
        // Note: Audio files are already uploaded in QuestionBuilder, so questions already have audio URLs
        const questionGroups = groupQuestionsByResource(questionsWithAudioUrls);
        
        if (questionGroups.length === 0) {
          showError("No questions to create");
          return;
        }

        const baseTimestamp = Date.now();
        const createPromises = questionGroups.map(async (group, groupIndex) => {
          // Build question data payload for this group
          const groupQuestionData = {
            version: "1.0",
            questions: group.questions,
            ...(group.passage && { readingPassage: group.passage }),
            ...(group.audioUrl && {
              media: {
                audioUrl: normalizeAudioUrl(group.audioUrl) || group.audioUrl,
              },
            }),
          };

          const groupQuestionJson = JSON.stringify(groupQuestionData);
          
          // Get upload URL for this group (use unique timestamp for each)
          const jsonFileName = `placement-question-${baseTimestamp}-${groupIndex}-${Math.random().toString(36).substring(7)}.json`;
          const uploadUrlResponse = await getQuestionJsonUploadUrl(jsonFileName);
          const uploadUrlData = uploadUrlResponse.data;

          if (
            uploadUrlData &&
            typeof uploadUrlData === "object" &&
            "uploadUrl" in uploadUrlData &&
            "filePath" in uploadUrlData
          ) {
            const { uploadUrl, filePath } = uploadUrlData as { uploadUrl: string; filePath: string };

            // Upload JSON to presigned URL
            const jsonUploadResponse = await uploadJsonToPresignedUrl(uploadUrl, groupQuestionJson);

            if (!jsonUploadResponse.ok) {
              throw new Error(`JSON upload failed with status: ${jsonUploadResponse.status}`);
            }

            // Create placement question request
            return {
              title: group.title,
              questionUrl: filePath,
              skillTypeID: selectedSkillId!,
              questionTypeID: questionTypeId!,
              difficulty,
            };
          } else {
            throw new Error("Failed to get upload URL");
          }
        });

        // Wait for all upload URLs to be prepared and uploaded
        const questionRequests = await Promise.all(createPromises);

        // Create all placement questions at once
        const response = await createPlacementQuestion(questionRequests);

        const createdQuestions = response.data || [];
        if (createdQuestions.length > 0) {
          const totalSubQuestions = questionGroups.reduce((sum, group) => sum + group.questions.length, 0);
          success(`Successfully created ${createdQuestions.length} placement question(s) with ${totalSubQuestions} total sub-questions!`);
        } else {
          success("Placement questions created successfully!");
        }
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error saving placement question:", error);
      showError("Failed to save placement question");
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (step: Step): string => {
    switch (step) {
      case "basic":
        return "Basic Information";
      case "questions":
        return "Questions";
      case "preview":
        return "Preview";
      default:
        return "";
    }
  };

  const getStepIcon = (step: Step) => {
    switch (step) {
      case "basic":
        return <FileText className="w-5 h-5" />;
      case "questions":
        return <PenTool className="w-5 h-5" />;
      case "preview":
        return <Eye className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const totalPoints = useMemo(() => {
    return questions.reduce((sum, q) => sum + q.points, 0);
  }, [questions]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="xl" className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editQuestion ? "Edit Placement Question" : "Create Placement Question"}
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="flex-1 overflow-y-auto min-h-0">
            {/* Progress Steps */}
            <div className="flex items-center mb-4 mt-4">
              {steps.map((step, index) => (
                <Fragment key={step}>
                  <div className="flex flex-col items-center flex-1 basis-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        steps.indexOf(currentStep) >= index
                          ? "bg-primary-600 border-primary-600 text-white"
                          : "bg-white border-neutral-300 text-neutral-400"
                      }`}
                    >
                      {getStepIcon(step)}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center ${
                        steps.indexOf(currentStep) >= index
                          ? "text-primary-600 font-medium"
                          : "text-neutral-400"
                      }`}
                    >
                      {getStepTitle(step)}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        steps.indexOf(currentStep) > index ? "bg-primary-600" : "bg-neutral-200"
                      }`}
                    />
                  )}
                </Fragment>
              ))}
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Basic Information */}
            {currentStep === "basic" && (
              <div className="space-y-6 min-h-full">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Question Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Reading Comprehension - Climate Change"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Skill Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedSkillId || ""}
                    onChange={(e) => setSelectedSkillId(e.target.value || null)}
                    options={
                      skills
                        ?.filter((skill) => {
                          if (!skill.isActive) return false;
                          const skillNameLower = skill.name.toLowerCase();
                          return skillNameLower.includes("reading") || skillNameLower.includes("listening");
                        })
                        .map((skill) => ({
                          value: skill.lookUpId,
                          label: skill.name,
                        })) || []
                    }
                    required
                  >
                    <option value="">Select a skill...</option>
                  </Select>
                  {loadingOptions && <p className="text-sm text-neutral-500 mt-1">Loading skills...</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Question Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={questionTypeId || ""}
                    onChange={(e) => setQuestionTypeId(e.target.value || null)}
                    options={
                      filteredQuestionTypes.map((qt) => ({
                        value: qt.id,
                        label: qt.name,
                      }))
                    }
                    required
                    disabled={!selectedSkillId}
                  >
                    <option value="">Select a question type...</option>
                  </Select>
                  {loadingOptions && <p className="text-sm text-neutral-500 mt-1">Loading question types...</p>}
                  {!selectedSkillId && (
                    <p className="text-sm text-neutral-500 mt-1">Please select a skill type first</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Difficulty <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={difficulty.toString()}
                    onChange={(e) => setDifficulty(parseInt(e.target.value) || 1)}
                    options={difficultyOptions.length > 0 ? difficultyOptions : [
                      { value: "1", label: "1 - Single Question" },
                      { value: "2", label: "2 - Short Passage/Audio" },
                      { value: "3", label: "3 - Long Passage/Audio" },
                    ]}
                    required
                    disabled={!questionTypeId}
                  >
                    {difficultyOptions.length === 0 && <option value="">Select a question type first</option>}
                  </Select>
                  {!questionTypeId && (
                    <p className="text-sm text-neutral-500 mt-1">Please select a question type first</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Questions */}
            {currentStep === "questions" && (
              <div className="space-y-6 min-h-full flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-neutral-200">
                  <button
                    onClick={() => setActiveTab("builder")}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "builder"
                        ? "border-primary-600 text-primary-600"
                        : "border-transparent text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    <PenTool className="w-4 h-4 inline mr-2" />
                    Question Builder
                  </button>
                  <button
                    onClick={() => setActiveTab("import")}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "import"
                        ? "border-primary-600 text-primary-600"
                        : "border-transparent text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                    Import Questions
                  </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0">
                  {activeTab === "builder" && (
                    <QuestionBuilder
                      questions={questions}
                      onAddQuestion={handleAddQuestion}
                      onUpdateQuestion={handleUpdateQuestion}
                      onDeleteQuestion={handleDeleteQuestion}
                      onReorderQuestions={handleReorderQuestions}
                      skillType={selectedSkill?.name || "Other"}
                      questionTypeId={questionTypeId}
                      questionTypes={questionTypes}
                      difficulty={difficulty}
                    />
                  )}

                  {activeTab === "import" && (
                    <QuestionImport
                      onImport={handleImportQuestions}
                      skillType={selectedSkill?.name || "Other"}
                      questionTypeId={questionTypeId}
                      questionTypes={questionTypes}
                    />
                  )}
                </div>

                {/* Summary Footer */}
                {questions.length > 0 && (
                  <div className="mt-auto pt-4 border-t border-neutral-200">
                    <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 border border-primary-200 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <PenTool className="w-4 h-4 text-primary-600" />
                            <span className="text-sm font-medium text-neutral-700">
                              Total Questions:
                            </span>
                            <span className="text-sm font-semibold text-primary-900">
                              {questions.length}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-neutral-700">
                              Total Points:
                            </span>
                            <span className="text-sm font-semibold text-green-700">
                              {totalPoints}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Preview */}
            {currentStep === "preview" && (
              <div className="space-y-4">
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4">Question Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Title:</span> {title}
                    </div>
                    <div>
                      <span className="font-medium">Skill Type:</span> {selectedSkill?.name || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Question Type:</span>{" "}
                      {questionTypes.find((qt) => qt.id === questionTypeId)?.name || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span> {difficulty}
                    </div>
                    <div>
                      <span className="font-medium">Total Questions:</span> {questions.length}
                    </div>
                    <div>
                      <span className="font-medium">Total Points:</span> {totalPoints}
                    </div>
                  </div>
                </div>

                {questions.length > 0 && (() => {
                  // Group questions by passage/audio for preview
                  const questionGroups = groupQuestionsByResource(questions);
                  
                  return (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Questions Preview</h3>
                      <div className="text-xs text-neutral-500 mb-2">
                        {questionGroups.length} placement question(s) will be created
                      </div>
                      {questionGroups.map((group, groupIdx) => {
                        const isPassageGroup = !!group.passage;
                        const isAudioGroup = !!group.audioUrl;
                        const isStandaloneGroup = !isPassageGroup && !isAudioGroup;
                        
                        return (
                          <div 
                            key={groupIdx} 
                            className={`border-2 rounded-lg p-4 ${
                              isPassageGroup 
                                ? "border-blue-200 bg-blue-50" 
                                : isAudioGroup
                                ? "border-purple-200 bg-purple-50"
                                : "border-neutral-200 bg-neutral-50"
                            }`}
                          >
                            {/* Passage Header */}
                            {group.passage && (
                              <div className="mb-4 pb-3 border-b border-blue-300">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2.5 py-1 rounded">
                                    Passage {groupIdx + 1}
                                  </span>
                                  <span className="text-xs text-blue-600">
                                    {group.questions.length} question{group.questions.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="text-sm text-blue-900 bg-white border border-blue-200 rounded p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">
                                  {group.passage}
                                </div>
                              </div>
                            )}

                            {/* Audio Header */}
                            {group.audioUrl && (
                              <div className="mb-4 pb-3 border-b border-purple-300">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-semibold text-purple-800 bg-purple-100 px-2.5 py-1 rounded">
                                    Audio {groupIdx + 1}
                                  </span>
                                  <span className="text-xs text-purple-600">
                                    {group.questions.length} question{group.questions.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="text-xs text-purple-700 bg-white border border-purple-200 rounded p-2 break-all">
                                  {group.audioUrl}
                                </div>
                              </div>
                            )}

                            {/* Standalone Group Header */}
                            {isStandaloneGroup && (
                              <div className="mb-3">
                                <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded">
                                  Standalone Question
                                </span>
                              </div>
                            )}

                            {/* Questions in this group */}
                            <div className="space-y-2">
                              {group.questions
                                .sort((a, b) => a.order - b.order)
                                .map((q, qIdx) => (
                                  <div key={q.id} className="bg-white border border-neutral-200 rounded-lg p-3">
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
                                  </div>
                                ))}
                            </div>

                            {/* Group Summary */}
                            <div className={`mt-3 pt-2 border-t text-xs ${
                              isPassageGroup
                                ? "border-blue-200 text-blue-700"
                                : isAudioGroup
                                ? "border-purple-200 text-purple-700"
                                : "border-neutral-200 text-neutral-700"
                            }`}>
                              This group will be saved as 1 placement question record in the database
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </DialogBody>

          <DialogFooter className="flex justify-between px-0 pb-6">
            <div className="flex gap-2"></div>
            <div className="flex gap-2 pr-4">
              {currentStep !== "basic" && (
                <Button variant="secondary" onClick={handlePrevious} iconLeft={<ChevronLeft className="w-4 h-4" />}>
                  Previous
                </Button>
              )}
              {currentStep !== "preview" ? (
                <Button onClick={handleNext} iconRight={<ChevronRight className="w-4 h-4" />}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} iconLeft={<CheckCircle className="w-4 h-4" />}>
                  {editQuestion ? "Update Question" : "Create Question"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      {toasts.length > 0 &&
        createPortal(
          <>
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className="fixed top-4 right-4 z-[60] max-w-md w-full animate-slide-in-right"
              >
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${
                    toast.type === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : toast.type === "error"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-blue-50 border-blue-200 text-blue-800"
                  }`}
                >
                  <span className="text-sm">{toast.message}</span>
                  <button
                    onClick={() => hideToast(toast.id)}
                    className="ml-auto text-neutral-500 hover:text-neutral-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </>,
          document.body
        )}
    </>
  );
}
