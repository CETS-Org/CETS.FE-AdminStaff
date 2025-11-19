import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  randomPlacementTest,
  createPlacementTestWithQuestions,
  updatePlacementTest,
  getPlacementTestById,
  getAllPlacementQuestions,
  type PlacementTest,
  type PlacementQuestion,
} from '@/api/placementTest.api';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/ui/PageHeader';
import { Plus, Trash2, Edit, RefreshCw, CheckCircle, X, Eye, Play } from 'lucide-react';
import CreatePlacementQuestionDialog from './components/CreatePlacementQuestionDialog';
import QuestionDetailDialog from './components/QuestionDetailDialog';
import PlacementTestPreviewDialog from './components/PlacementTestPreviewDialog';

export default function CreatePlacementTestPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success, error: showError } = useToast();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [selectedQuestions, setSelectedQuestions] = useState<PlacementQuestion[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<PlacementQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PlacementQuestion | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<PlacementQuestion | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // Helper function để sắp xếp questions theo thứ tự:
  // 1. Reading multiple_choice
  // 2. Passage ngắn (reading, difficulty = 2)
  // 3. Passage dài (reading, difficulty = 3)
  // 4. Listening multiple_choice
  // 5. Audio ngắn (listening, difficulty = 2)
  // 6. Audio dài (listening, difficulty = 3)
  const sortQuestions = (questions: PlacementQuestion[]): PlacementQuestion[] => {
    return [...questions].sort((a, b) => {
      const getSortOrder = (q: PlacementQuestion): number => {
        const skillType = q.skillType?.toLowerCase() || "";
        const questionType = q.questionType.toLowerCase();
        const difficulty = q.difficulty;
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
  };

  useEffect(() => {
    loadAvailableQuestions();
    if (isEditMode && id) {
      loadPlacementTest(id);
    }
  }, [isEditMode, id]);

  const loadPlacementTest = async (testId: string) => {
    try {
      setLoading(true);
      const response = await getPlacementTestById(testId);
      const test = response.data;
      setTitle(test.title);
      setDurationMinutes(test.durationMinutes);
      // Sắp xếp questions khi load từ database
      const sortedQuestions = sortQuestions(test.questions || []);
      setSelectedQuestions(sortedQuestions);
    } catch (err: any) {
      showError('Failed to load placement test');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await getAllPlacementQuestions();
      setAvailableQuestions(response.data || []);
    } catch (err: any) {
      showError('Failed to load available questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleRandomize = async () => {
    try {
      setLoading(true);
      const response = await randomPlacementTest();
      const randomTest = response.data;
      // Sắp xếp questions ngay khi generate random
      const sortedQuestions = sortQuestions(randomTest.questions || []);
      setSelectedQuestions(sortedQuestions);
      success('Random placement test generated successfully');
    } catch (err: any) {
      showError(err?.response?.data || 'Failed to generate random test');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = (question: PlacementQuestion) => {
    if (!selectedQuestions.find((q) => q.id === question.id)) {
      // Sắp xếp questions sau khi thêm câu hỏi mới
      const newQuestions = [...selectedQuestions, question];
      const sortedQuestions = sortQuestions(newQuestions);
      setSelectedQuestions(sortedQuestions);
    }
  };

  const handleRemoveQuestion = (questionId: string) => {
    setSelectedQuestions(selectedQuestions.filter((q) => q.id !== questionId));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showError('Title is required');
      return;
    }
    if (selectedQuestions.length === 0) {
      showError('Please add at least one question');
      return;
    }

    try {
      setLoading(true);
      
      // Sắp xếp selectedQuestions theo thứ tự trước khi submit
      const sortedQuestions = sortQuestions(selectedQuestions);
      const questionIds = sortedQuestions.map((q) => q.id);
      
      if (isEditMode && id) {
        await updatePlacementTest(id, {
          title,
          durationMinutes,
          questionIds,
        });
        success('Placement test updated successfully');
      } else {
        await createPlacementTestWithQuestions({
          title,
          durationMinutes,
          questionIds,
        });
        success('Placement test created successfully');
      }
      navigate('/staff/placement-test');
    } catch (err: any) {
      showError(err?.response?.data || 'Failed to save placement test');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionCreated = async () => {
    const editingQuestionId = editingQuestion?.id;
    
    // Refresh available questions và lấy response
    try {
      setLoadingQuestions(true);
      const response = await getAllPlacementQuestions();
      const updatedAvailableQuestions = response.data || [];
      setAvailableQuestions(updatedAvailableQuestions);
      
      // Refresh selectedQuestions nếu đang edit một question trong selectedQuestions
      if (editingQuestionId && selectedQuestions.some(q => q.id === editingQuestionId)) {
        const updatedQuestion = updatedAvailableQuestions.find(q => q.id === editingQuestionId);
        if (updatedQuestion) {
          setSelectedQuestions(prev => {
            const updated = prev.map(q => q.id === editingQuestionId ? updatedQuestion : q);
            return sortQuestions(updated);
          });
        }
      }
    } catch (err: any) {
      showError('Failed to refresh questions');
    } finally {
      setLoadingQuestions(false);
    }
    
    // Reset editingQuestion sau khi update thành công
    setEditingQuestion(null);
  };

  const handleViewQuestion = (question: PlacementQuestion) => {
    setViewingQuestion(question);
    setShowDetailDialog(true);
  };

  const handleEditQuestion = (question: PlacementQuestion) => {
    setEditingQuestion(question);
    setShowQuestionDialog(true);
    // Đóng detail dialog nếu đang mở
    setShowDetailDialog(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Placement Test' : 'Create Placement Test'}
        description="Create or edit a placement test by selecting questions or using random generation"
      />

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Test Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter test title"
              required
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={durationMinutes.toString()}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
              min={1}
              required
            />
          </div>
        </div>

        {/* Random Generation */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Random Test Generation</h3>
            <Button
              variant="secondary"
              onClick={handleRandomize}
              disabled={loading}
              iconLeft={<RefreshCw className="w-4 h-4" />}
            >
              Generate Random Test
            </Button>
          </div>
          <p className="text-sm text-neutral-600 mb-4">
            Click "Generate Random Test" to automatically create a test with random questions based on default criteria.
          </p>
        </div>

        {/* Selected Questions */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Selected Questions ({selectedQuestions.length})
            </h3>
            <Button
              variant="secondary"
              onClick={() => setShowQuestionDialog(true)}
              iconLeft={<Plus className="w-4 h-4" />}
            >
              Create New Question
            </Button>
          </div>

          {selectedQuestions.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-neutral-300 rounded-lg">
              <p className="text-neutral-600 mb-2">No questions selected</p>
              <p className="text-sm text-neutral-500">
                Use "Generate Random Test" or add questions manually below
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortQuestions(selectedQuestions).map((question) => (
                <div
                  key={question.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                  onClick={() => handleViewQuestion(question)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">{question.title}</div>
                    <div className="text-sm text-neutral-600 mt-1">
                      {question.skillType} • {question.questionType} • Difficulty: {question.difficulty}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewQuestion(question);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveQuestion(question.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Questions */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Available Questions ({availableQuestions.length})
            </h3>
            <Button
              variant="secondary"
              onClick={loadAvailableQuestions}
              disabled={loadingQuestions}
              iconLeft={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
          </div>

          {loadingQuestions ? (
            <div className="text-center py-8">
              <div className="text-neutral-500">Loading questions...</div>
            </div>
          ) : availableQuestions.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-neutral-300 rounded-lg">
              <p className="text-neutral-600 mb-2">No questions available</p>
              <p className="text-sm text-neutral-500 mb-4">
                Create your first placement question to get started
              </p>
              <Button
                onClick={() => setShowQuestionDialog(true)}
                iconLeft={<Plus className="w-4 h-4" />}
              >
                Create Question
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableQuestions.map((question) => {
                const isSelected = selectedQuestions.some((q) => q.id === question.id);
                return (
                  <div
                    key={question.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
                      isSelected
                        ? 'border-green-300 bg-green-50'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                    onClick={() => handleViewQuestion(question)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">{question.title}</div>
                      <div className="text-sm text-neutral-600 mt-1">
                        {question.skillType} • {question.questionType} • Difficulty: {question.difficulty}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isSelected ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Added</span>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewQuestion(question);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddQuestion(question);
                            }}
                            iconLeft={<Plus className="w-4 h-4" />}
                          >
                            Add
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t pt-6 flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowPreviewDialog(true)}
              disabled={selectedQuestions.length === 0}
              iconLeft={<Eye className="w-4 h-4" />}
            >
              Preview Test
            </Button>
            {isEditMode && id && (
              <Button
                variant="secondary"
                onClick={() => navigate(`/staff/placement-test/try/${id}`)}
                disabled={selectedQuestions.length === 0}
                iconLeft={<Play className="w-4 h-4" />}
              >
                Try Test
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => navigate('/staff/placement-test')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !title.trim() || selectedQuestions.length === 0}>
              {isEditMode ? 'Update Test' : 'Create Test'}
            </Button>
          </div>
        </div>
      </div>

      <CreatePlacementQuestionDialog
        open={showQuestionDialog}
        onOpenChange={setShowQuestionDialog}
        onSuccess={handleQuestionCreated}
        editQuestion={editingQuestion}
      />

      <QuestionDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        question={viewingQuestion}
        onEdit={handleEditQuestion}
      />

      <PlacementTestPreviewDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        questions={selectedQuestions}
        testTitle={title}
        durationMinutes={durationMinutes}
      />
    </div>
  );
}

