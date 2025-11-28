import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Plus, FileText, Edit, Trash2, Search, Eye, BookOpen, Headphones, Filter, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import Pagination from '@/shared/pagination';
import {
  getAllPlacementQuestions,
  deletePlacementQuestion,
  type PlacementQuestion,
} from '@/api/placementTest.api';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/ui/PageHeader';
import Table from '@/components/ui/Table';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import CreatePlacementQuestionDialog from './components/CreatePlacementQuestionDialog';
import QuestionDetailDialog from './components/QuestionDetailDialog';
import type { PlacementQuestion as PlacementQuestionType } from '@/api/placementTest.api';

export default function PlacementQuestionManagementPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [questionToDelete, setQuestionToDelete] = useState<PlacementQuestion | null>(null);
  const [questionToView, setQuestionToView] = useState<PlacementQuestion | null>(null);
  const [questionToEdit, setQuestionToEdit] = useState<PlacementQuestion | null>(null);
  const [showCreateQuestionDialog, setShowCreateQuestionDialog] = useState(false);
  const [showEditQuestionDialog, setShowEditQuestionDialog] = useState(false);
  
  // Filter states
  const [filterSkillType, setFilterSkillType] = useState<string>('all');
  const [filterQuestionType, setFilterQuestionType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  
  // Date range filter
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  // Show/hide additional filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await getAllPlacementQuestions();
      setQuestions(response.data || []);
    } catch (err: any) {
      showError(err?.response?.data || 'Failed to load placement questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;

    try {
      await deletePlacementQuestion(questionToDelete.id);
      success('Placement question deleted successfully');
      setQuestionToDelete(null);
      loadQuestions();
    } catch (err: any) {
      showError(err?.response?.data || 'Failed to delete placement question');
    }
  };

  const handleEdit = (question: PlacementQuestion) => {
    setQuestionToEdit(question);
    setShowEditQuestionDialog(true);
  };

  const handleView = (question: PlacementQuestion) => {
    setQuestionToView(question);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterSkillType('all');
    setFilterQuestionType('all');
    setFilterDifficulty('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1); // Reset to first page when filters are reset
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterSkillType, filterQuestionType, filterDifficulty, startDate, endDate]);

  // Check if any filter is active
  const hasActiveFilters = searchTerm.trim() !== '' || 
                           filterSkillType !== 'all' || 
                           filterQuestionType !== 'all' || 
                           filterDifficulty !== 'all' ||
                           startDate !== '' ||
                           endDate !== '';

  // Get unique values for filters
  const skillTypes = useMemo(() => {
    const types = new Set(questions.map(q => q.skillType));
    return Array.from(types).sort();
  }, [questions]);

  const questionTypes = useMemo(() => {
    const types = new Set(questions.map(q => q.questionType));
    return Array.from(types).sort();
  }, [questions]);

  const difficulties = useMemo(() => {
    return [1, 2, 3];
  }, []);

  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    // Date range filter
    if (startDate || endDate) {
      filtered = filtered.filter((q) => {
        const questionDate = new Date(q.createdAt);
        questionDate.setHours(0, 0, 0, 0); // Reset time to start of day
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (questionDate < start) return false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // End of day
          if (questionDate > end) return false;
        }
        
        return true;
      });
    }

    // Search filter
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter((q) => {
        if (q.title?.toLowerCase().includes(searchLower)) return true;
        if (q.skillType?.toLowerCase().includes(searchLower)) return true;
        if (q.questionType?.toLowerCase().includes(searchLower)) return true;
        if (q.difficulty?.toString().includes(searchLower)) return true;
        return false;
      });
    }

    // Skill type filter
    if (filterSkillType !== 'all') {
      filtered = filtered.filter((q) => q.skillType === filterSkillType);
    }

    // Question type filter
    if (filterQuestionType !== 'all') {
      filtered = filtered.filter((q) => q.questionType === filterQuestionType);
    }

    // Difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === parseInt(filterDifficulty));
    }

    return filtered;
  }, [questions, debouncedSearchTerm, filterSkillType, filterQuestionType, filterDifficulty, startDate, endDate]);

  // Paginated questions
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, currentPage, itemsPerPage]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = filteredQuestions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredQuestions.length);

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return 'Multiple Choice';
      case 2:
        return 'Short Passage/Audio';
      case 3:
        return 'Long Passage/Audio';
      default:
        return `Level ${difficulty}`;
    }
  };

  const getSkillTypeIcon = (skillType: string) => {
    const lower = skillType?.toLowerCase() || '';
    if (lower.includes('reading')) {
      return <BookOpen className="w-4 h-4 text-blue-600" />;
    } else if (lower.includes('listening')) {
      return <Headphones className="w-4 h-4 text-purple-600" />;
    }
    return <FileText className="w-4 h-4 text-gray-600" />;
  };

  const columns = [
    {
      header: 'Title',
      accessor: (question: PlacementQuestion) => (
        <div className="font-medium text-neutral-900 max-w-xs truncate" title={question.title}>
          {question.title || 'Untitled Question'}
        </div>
      ),
    },
    {
      header: 'Skill Type',
      accessor: (question: PlacementQuestion) => (
        <div className="flex items-center gap-2">
          {getSkillTypeIcon(question.skillType)}
          <span className="text-neutral-600">{question.skillType || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Question Type',
      accessor: (question: PlacementQuestion) => (
        <div className="text-neutral-600">{question.questionType || 'N/A'}</div>
      ),
    },
    {
      header: 'Difficulty',
      accessor: (question: PlacementQuestion) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            question.difficulty === 1
              ? 'bg-green-100 text-green-700'
              : question.difficulty === 2
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-orange-100 text-orange-700'
          }`}>
            {getDifficultyLabel(question.difficulty)}
          </span>
        </div>
      ),
    },
    {
      header: 'Created At',
      accessor: (question: PlacementQuestion) => (
        <div className="text-neutral-600 text-sm">
          {new Date(question.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (question: PlacementQuestion) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(question)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(question)}
            className="p-2 text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setQuestionToDelete(question)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      <PageHeader
        title="Placement Question Management"
        description="Manage placement test questions"
      />

      <div className="flex flex-col gap-4">
        {/* Search, Filters and Create Button Row */}
        <div className="flex flex-col gap-4">
          {/* Top Row: Search, Basic Filters, Toggle Button, Create Button */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            {/* Left side: Search and Basic Filters */}
            <div className="flex flex-wrap gap-3 items-center flex-1 min-w-0">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title, skill type, question type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Skill Type Filter - Always visible */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-neutral-700 whitespace-nowrap">Skill Type:</label>
                <select
                  value={filterSkillType}
                  onChange={(e) => setFilterSkillType(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm min-w-[130px]"
                >
                  <option value="all">All</option>
                  {skillTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Advanced Filters Button */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700"
                title={showAdvancedFilters ? "Hide filters" : "Show more filters"}
              >
                <Filter className="w-4 h-4" />
                <span className="whitespace-nowrap">Filters</span>
                {showAdvancedFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Reset Filters Button - Always visible if active */}
              {hasActiveFilters && (
                <Button
                  variant="secondary"
                  onClick={handleResetFilters}
                  className="px-3 py-2 text-sm border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 whitespace-nowrap"
                  iconLeft={<X className="w-4 h-4" />}
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Right side: Create Button */}
            <Button
              onClick={() => setShowCreateQuestionDialog(true)}
              iconLeft={<Plus className="w-4 h-4" />}
              className="whitespace-nowrap"
            >
              Create Question
            </Button>
          </div>

          {/* Advanced Filters Row - Collapsible */}
          {showAdvancedFilters && (
            <div className="flex flex-wrap gap-3 items-center p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              {/* Question Type Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-neutral-700 whitespace-nowrap">Question Type:</label>
                <select
                  value={filterQuestionType}
                  onChange={(e) => setFilterQuestionType(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm min-w-[130px] bg-white"
                >
                  <option value="all">All</option>
                  {questionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-neutral-700 whitespace-nowrap">Difficulty:</label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm min-w-[130px] bg-white"
                >
                  <option value="all">All</option>
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff.toString()}>
                      {getDifficultyLabel(diff)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="flex items-center gap-2 border-l border-neutral-300 pl-3">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <label className="text-sm font-medium text-neutral-700 whitespace-nowrap">Date Range:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                  max={endDate || undefined}
                  placeholder="From"
                />
                <span className="text-neutral-400">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                  min={startDate || undefined}
                  placeholder="To"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-300 transition-colors"
                    title="Clear date range"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="px-4 py-2 bg-blue-50 rounded-lg">
            <span className="text-blue-600 font-medium">Total: </span>
            <span className="text-blue-800 font-bold">{questions.length}</span>
          </div>
          <div className="px-4 py-2 bg-green-50 rounded-lg">
            <span className="text-green-600 font-medium">Filtered: </span>
            <span className="text-green-800 font-bold">{filteredQuestions.length}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-neutral-500">Loading questions...</div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
          <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 mb-2">No questions found</p>
          <p className="text-sm text-neutral-500 mb-4">
            {debouncedSearchTerm || filterSkillType !== 'all' || filterQuestionType !== 'all' || filterDifficulty !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first placement question'}
          </p>
          {!debouncedSearchTerm && filterSkillType === 'all' && filterQuestionType === 'all' && filterDifficulty === 'all' && (
            <Button
              onClick={() => setShowCreateQuestionDialog(true)}
              iconLeft={<Plus className="w-4 h-4" />}
            >
              Create Question
            </Button>
          )}
        </div>
      ) : (
        <>
          <Table data={paginatedQuestions} columns={columns} />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredQuestions.length}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!questionToDelete}
        onClose={() => setQuestionToDelete(null)}
        title="Delete Placement Question"
        message={`Are you sure you want to delete "${questionToDelete?.title || 'this question'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        type="danger"
      />

      {/* Create Question Dialog */}
      <CreatePlacementQuestionDialog
        open={showCreateQuestionDialog}
        onOpenChange={setShowCreateQuestionDialog}
        onSuccess={() => {
          success('Question created successfully');
          loadQuestions();
          setShowCreateQuestionDialog(false);
        }}
      />

      {/* Edit Question Dialog */}
      {questionToEdit && (
        <CreatePlacementQuestionDialog
          open={showEditQuestionDialog}
          onOpenChange={(open) => {
            setShowEditQuestionDialog(open);
            if (!open) {
              setQuestionToEdit(null);
            }
          }}
          editQuestion={questionToEdit}
          onSuccess={() => {
            success('Question updated successfully');
            loadQuestions();
            setShowEditQuestionDialog(false);
            setQuestionToEdit(null);
          }}
        />
      )}

      {/* View Question Detail Dialog */}
      {questionToView && (
        <QuestionDetailDialog
          open={!!questionToView}
          onOpenChange={(open) => {
            if (!open) setQuestionToView(null);
          }}
          question={questionToView}
          onEdit={(question) => {
            setQuestionToView(null);
            handleEdit(question);
          }}
        />
      )}
    </div>
  );
}

