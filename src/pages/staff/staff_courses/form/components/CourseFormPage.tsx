import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/ui/PageHeader";
import Label from "@/components/ui/Label";
import { Trash2, BookOpen, ArrowLeft, Upload, Camera, Save, FileText, Link as LinkIcon, CheckCircle, AlertCircle, Clock, DollarSign, Calendar, Loader2, PlusCircle, MinusCircle, Target, Zap, Gift, X, ChevronDown, ChevronUp } from "lucide-react";
import { createCourse, updateCourse } from "@/api/course.api";
import { createSyllabus, createSyllabusItem, updateSyllabus, updateSyllabusItem, deleteSyllabus, deleteSyllabusItem, getCourseDetailById, getCourseSchedules, createCourseSchedule, updateCourseSchedule, deleteCourseSchedule, createCourseSkill, deleteCourseSkill, createCourseBenefit, deleteCourseBenefit, createCourseRequirement, deleteCourseRequirement } from "@/api";
import type { CourseFormData } from "@/types/course.types";
import { 
  useCourseSchedules, 
  useCourseSyllabus, 
  useToast, 
  useLookupOptions, 
  useCourseRelationships, 
  useCourseObjectives 
} from '../../shared/hooks';
import { formatVND, getOptionLabel, getLabelsFromIds, dayNames } from '../../shared/utils/course-form.utils';
import CourseScheduleSection from './CourseScheduleSection';

type CourseFormPageProps = {
  mode: 'create' | 'edit';
};

export default function CourseFormPage({ mode }: CourseFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  // Custom hooks
  const { showSuccessToast, showErrorToast, toastMessage, showSuccessMessage, showErrorMessage } = useToast();
  const lookupOptions = useLookupOptions(isEdit);
  const {
    schedules,
    originalSchedules,
    checkScheduleDuplicate,
    isTimeSlotAvailable,
    isDayAvailable,
    addSchedule,
    removeSchedule,
    updateSchedule,
    loadSchedules,
    resetSchedules
  } = useCourseSchedules(lookupOptions.timeslotOptions);
  
  const {
    syllabi,
    originalSyllabi,
    expandedItems,
    addSyllabus,
    removeSyllabus,
    updateSyllabusField,
    addItemToSyllabus,
    removeItemFromSyllabus,
    toggleItemExpanded,
    updateSyllabusItemField,
    addObjectiveToItem,
    updateObjectiveInItem,
    removeObjectiveFromItem,
    loadSyllabi,
    resetSyllabi
  } = useCourseSyllabus();

  const {
    courseObjectives,
    addCourseObjective,
    removeCourseObjective,
    updateCourseObjective,
    loadObjectives,
    resetObjectives
  } = useCourseObjectives();

  const {
    selectedSkills,
    selectedBenefits,
    selectedRequirements,
    originalSkillRelations,
    originalBenefitRelations,
    originalRequirementRelations,
    toggleSkill,
    toggleBenefit,
    toggleRequirement,
    loadSkills,
    loadBenefits,
    loadRequirements,
    resetRelationships
  } = useCourseRelationships();

  // Form state
  const [formData, setFormData] = useState<Omit<CourseFormData, 'id'>>({
    name: "",
    description: "",
    level: "beginner",
    status: "active",
    image: "",
    price: 50000,
    maxStudents: 20,
    syllabus: "",
    courseCode: "",
    courseLevelID: "",
    courseFormatID: "",
    categoryID: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const imageObjectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [syllabusUrl, setSyllabusUrl] = useState<string>("");
  const [materialsUrl, setMaterialsUrl] = useState<string>("");
  const [assignmentsUrl, setAssignmentsUrl] = useState<string>("");
  const [syllabusTitle, setSyllabusTitle] = useState<string>("");
  const [syllabusItem, setSyllabusItem] = useState<{
    sessionNumber: number;
    topicTitle: string;
    totalSlots?: number;
    required: boolean;
    objectives?: string;
    contentSummary?: string;
    preReadingUrl?: string;
  }>({
    sessionNumber: 1,
    topicTitle: "",
    totalSlots: undefined,
    required: true,
    objectives: "",
    contentSummary: "",
    preReadingUrl: ""
  });

  useEffect(() => {
    if (isEdit && id) {
      loadCourseData(id);
    } else {
      // Reset all state for new course
      resetSyllabi();
      resetObjectives();
      resetRelationships();
      resetSchedules();
    }
  }, [isEdit, id]);

  // Set default values when lookup options are loaded (for create mode)
  useEffect(() => {
    if (!isEdit && lookupOptions.defaultValues) {
      setFormData(prev => ({
        ...prev,
        ...lookupOptions.defaultValues
      }));
    }
  }, [isEdit, lookupOptions.defaultValues]);

  const loadCourseData = async (_courseId: string) => {
    try {
      setIsLoading(true);
      const res = await getCourseDetailById(_courseId);
      const d = res.data;
      
      // Set form data (only fields available in the API)
      setFormData(prev => ({
        ...prev,
        name: d.courseName || "",
        description: d.description || "",
        price: d.standardPrice || 0,
        image: d.courseImageUrl || "",
        courseCode: d.courseCode || "",
        courseLevelID: d.courseLevelID || "",
        courseFormatID: d.courseFormatID || "",
        categoryID: d.categoryID || "",
        status: d.isActive ? "active" : "inactive"
      }));
      
      setImagePreview(d.courseImageUrl || "");
      
      // Load course objectives
      if (d.courseObjective && Array.isArray(d.courseObjective)) {
        loadObjectives(d.courseObjective);
      }
      
      // Load skills, benefits, requirements
      if (d.courseSkills && Array.isArray(d.courseSkills)) {
        loadSkills(d.courseSkills);
      }
      if (d.benefits && Array.isArray(d.benefits)) {
        loadBenefits(d.benefits);
      }
      if (d.requirements && Array.isArray(d.requirements)) {
        loadRequirements(d.requirements);
      }
      
      // Load syllabi
      if (d.syllabi && Array.isArray(d.syllabi) && d.syllabi.length > 0) {
        loadSyllabi(d.syllabi);
        if (d.syllabi.length > 0) {
          setSyllabusTitle(d.syllabi[0].title);
        }
      }

      // Load schedules
      try {
        const schedulesRes = await getCourseSchedules(_courseId);
        const apiSchedules = schedulesRes.data || [];
        loadSchedules(apiSchedules);
      } catch (error) {
        console.warn("Could not load course schedules:", error);
        resetSchedules();
      }
    } catch (error) {
      console.error("Error loading course data:", error);
      showErrorMessage("Failed to load course data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CourseFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const processImageFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    // Show preview immediately via object URL
    const newUrl = URL.createObjectURL(file);
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
    }
    imageObjectUrlRef.current = newUrl;
    setImagePreview(newUrl);

    // Store the file for later upload
    setImageFile(file);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processImageFile(event.target.files?.[0] || null);
  };

  const onImageDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    processImageFile(file || null);
  };

  const onImageDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
      imageObjectUrlRef.current = null;
    }
    setImagePreview("");
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
      image: ""
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (type: 'syllabus', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF, Excel, or text file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB');
        return;
      }

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        switch (type) {
          case 'syllabus':
            setSyllabusFile(file);
            setFormData(prev => ({ ...prev, syllabus: content }));
            break;
          
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUrlInput = (type: 'syllabus' | 'materials' | 'assignments', url: string) => {
    switch (type) {
      case 'syllabus':
        setSyllabusUrl(url);
        if (url) {
          setFormData(prev => ({ ...prev, syllabus: `URL: ${url}` }));
        }
        break;
      case 'materials':
        setMaterialsUrl(url);
        if (url) {
          setFormData(prev => ({ ...prev, materials: `URL: ${url}` }));
        }
        break;
      case 'assignments':
        setAssignmentsUrl(url);
        if (url) {
          setFormData(prev => ({ ...prev, assignments: `URL: ${url}` }));
        }
        break;
    }
  };

  const removeFile = (type: 'syllabus' | 'materials' | 'assignments') => {
    switch (type) {
      case 'syllabus':
        setSyllabusFile(null);
        setSyllabusUrl("");
        setFormData(prev => ({ ...prev, syllabus: "" }));
        break;
     
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Course name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Course description is required";
    }


    if (formData.price && formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    if (formData.maxStudents && formData.maxStudents <= 0) {
      newErrors.maxStudents = "Maximum students must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      let courseImageUrl = formData.image; // Use existing URL for edit mode
      
      // Upload image to R2 if a new file is selected
      if (imageFile) {
        try {
          // Step 1: Get presigned URL from backend
          const uploadUrlResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/ACAD_Course/image-upload-url`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: imageFile.name,
              contentType: imageFile.type,
            }),
          });

          if (!uploadUrlResponse.ok) {
            throw new Error('Failed to get upload URL');
          }

          const { uploadUrl, publicUrl } = await uploadUrlResponse.json();

          // Step 2: Upload directly to R2 using presigned URL
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': imageFile.type,
            },
            body: imageFile,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image to storage');
          }

          courseImageUrl = publicUrl;
         } catch (error) {
           console.error('Error uploading image:', error);
           showErrorMessage('Failed to upload image. Please try again.');
           setIsLoading(false);
           return;
         }
      }
      
      const payload: any = {
        courseCode: formData.courseCode,
        courseName: formData.name,
        courseLevelID: formData.courseLevelID,
        courseFormatID: formData.courseFormatID,
        courseImageUrl: courseImageUrl || undefined,
        courseObjective: courseObjectives.filter(o => o.trim()),
        categoryID: formData.categoryID,
        description: formData.description,
        standardPrice: formData.price || 0,
        benefitIDs: selectedBenefits,
        requirementIDs: selectedRequirements,
        skillIDs: selectedSkills,
        schedules: schedules.filter(sc => sc.timeSlotID && sc.timeSlotID.trim()).map(sc => ({
          timeSlotID: sc.timeSlotID,
          dayOfWeek: Number(sc.dayOfWeek) || 0
        }))
      };

      if (!isEdit && syllabi && syllabi.length > 0) {
        // Map syllabi to the API format
        payload.syllabi = syllabi.map(s => ({
          title: s.title || `${formData.courseCode || formData.name} Syllabus`,
          description: s.description || '',
          items: s.items.map(item => ({
            sessionNumber: item.sessionNumber,
            topicTitle: item.topicTitle,
            totalSlots: item.totalSlots || null,
            required: item.required !== false,
            objectives: Array.isArray(item.objectives) ? item.objectives.join('\n') : (item.objectives || null),
            contentSummary: item.contentSummary || null,
            preReadingUrl: item.preReadingUrl || null
          }))
        }));
      }

      // Save or update course first
      let savedCourseId = id;
      if (isEdit && id) {
        await updateCourse(id, { id, ...payload });
      } else {
        // Create mode - single API call with syllabi included
        const createRes = await createCourse(payload);
        savedCourseId = (createRes?.data?.Id || createRes?.data?.id || '').toString();
      }

      // For edit mode, handle syllabi updates separately
      // For create mode, syllabi are already included in the course creation
      const userDataStr = localStorage.getItem('userInfo');
      const currentUserId = userDataStr ? (JSON.parse(userDataStr)?.id || JSON.parse(userDataStr)?.Id || JSON.parse(userDataStr)?.accountId || JSON.parse(userDataStr)?.AccountId) : undefined;

      if (isEdit && savedCourseId && currentUserId) {
        try {
          // If no syllabi provided via new UI, fallback to single from formData.syllabus
          const list = syllabi && syllabi.length ? syllabi : (formData.syllabus ? [{ 
            title: `${formData.courseCode || formData.name} Syllabus`, 
            description: formData.syllabus, 
            items: [{
              sessionNumber: 1,
              topicTitle: 'Course Overview',
              totalSlots: 1,
              required: true,
              objectives: ['Understand course objectives', 'Get familiar with course structure'],
              contentSummary: 'Introduction to the course and overview of topics',
              preReadingUrl: ''
            }]
          }] : []);

          // If no syllabi are provided, create a default one with a default item
          if (list.length === 0) {
            const defaultSyllabus = {
              title: `${formData.courseCode || formData.name || 'Course'} Syllabus`,
              description: formData.description || 'Course syllabus',
              items: [{
                sessionNumber: 1,
                topicTitle: 'Course Overview',
                totalSlots: 1,
                required: true,
                objectives: ['Understand course objectives', 'Get familiar with course structure'],
                contentSummary: 'Introduction to the course and overview of topics',
                preReadingUrl: ''
              }]
            };
            list.push(defaultSyllabus);
          }

          // Delete removed syllabi and items (only in edit mode)
          if (isEdit && originalSyllabi.length > 0) {
            // Find syllabi that were removed
            const currentSyllabusIds = new Set(list.filter(s => s.id).map(s => s.id));
            const removedSyllabi = originalSyllabi.filter(orig => orig.id && !currentSyllabusIds.has(orig.id));
            
            for (const removed of removedSyllabi) {
              try {
                await deleteSyllabus(removed.id!);
                console.log(`Deleted syllabus: ${removed.id}`);
              } catch (err) {
                console.error(`Failed to delete syllabus ${removed.id}:`, err);
              }
            }

            // Find syllabus items that were removed from existing syllabi
            for (const currentSyllabus of list) {
              if (currentSyllabus.id) {
                const originalSyllabus = originalSyllabi.find(orig => orig.id === currentSyllabus.id);
                if (originalSyllabus) {
                  const currentItemIds = new Set(currentSyllabus.items.filter(it => it.id).map(it => it.id));
                  const removedItems = originalSyllabus.items.filter(orig => orig.id && !currentItemIds.has(orig.id));
                  
                  for (const removedItem of removedItems) {
                    try {
                      await deleteSyllabusItem(removedItem.id!);
                      console.log(`Deleted syllabus item: ${removedItem.id}`);
                    } catch (err) {
                      console.error(`Failed to delete syllabus item ${removedItem.id}:`, err);
                    }
                  }
                }
              }
            }
          }

          let syllabusCount = 0;
          let itemCount = 0;

          console.log('Saving syllabi:', list); // Debug log

          for (const s of list) {
            try {
              let syllabusId = s.id; // Check if syllabus already has an ID
              console.log('Processing syllabus:', { id: syllabusId, title: s.title, itemCount: s.items?.length }); // Debug log

              if (syllabusId) {
                // Update existing syllabus
                console.log(`Updating syllabus ${syllabusId}`); // Debug log
                await updateSyllabus(syllabusId, {
                  SyllabusID: syllabusId,
                  Title: s.title || `${formData.courseCode || formData.name} Syllabus`,
                  Description: s.description || '',
                  UpdatedBy: currentUserId,
                });
              } else {
                // Create new syllabus
                console.log('Creating new syllabus'); // Debug log
              const syllabusPayload = {
                courseID: savedCourseId,
                title: s.title || `${formData.courseCode || formData.name} Syllabus`,
                description: s.description || '',
                createdBy: currentUserId,
              };
              const createSyllabusRes = await createSyllabus(syllabusPayload);
                syllabusId = createSyllabusRes?.data?.syllabusID || createSyllabusRes?.data?.SyllabusID || createSyllabusRes?.data?.id || createSyllabusRes?.data?.Id;
                console.log('Created syllabus with ID:', syllabusId); // Debug log
              }

              if (!syllabusId) {
                continue;
              }

              syllabusCount++;

              // Create or update items
              if (s.items && s.items.length > 0) {
                console.log(`Processing ${s.items.length} items for syllabus ${syllabusId}`); // Debug log
                for (const it of s.items) {
                  try {
                    console.log('Processing item:', { id: it.id, topicTitle: it.topicTitle, sessionNumber: it.sessionNumber }); // Debug log
                    if (it.id) {
                      // Update existing item
                      console.log(`Updating item ${it.id}`); // Debug log
                      await updateSyllabusItem(it.id, {
                        SyllabusItemID: it.id,
                        TopicTitle: it.topicTitle || 'Overview',
                        TotalSlots: it.totalSlots,
                        Required: !!it.required,
                        Objectives: (it.objectives && it.objectives.length) ? it.objectives.join('\n') : undefined,
                        ContentSummary: it.contentSummary || undefined,
                        PreReadingUrl: it.preReadingUrl || undefined,
                        UpdatedBy: currentUserId,
                      });
                    } else {
                      // Create new item
                      console.log('Creating new item'); // Debug log
                    await createSyllabusItem({
                      syllabusID: syllabusId,
                      sessionNumber: Number(it.sessionNumber) || 1,
                      topicTitle: it.topicTitle || 'Overview',
                      totalSlots: it.totalSlots,
                      required: !!it.required,
                      objectives: (it.objectives && it.objectives.length) ? it.objectives.join('\n') : undefined,
                      contentSummary: it.contentSummary || undefined,
                      preReadingUrl: it.preReadingUrl || undefined,
                      createdBy: currentUserId,
                    });
                    }
                    itemCount++;
                  } catch (itemError: any) {
                    console.error('Failed to save syllabus item:', itemError);
                    // Continue with other items even if one fails
                  }
                }
              }
            } catch (syllabusError) {
              console.error('Failed to save syllabus:', syllabusError);
              // Continue with other syllabi even if one fails
            }
          }
        } catch (e) {
          // Non-blocking: log and continue navigation
          console.error('Failed to create syllabus or item', e);
        }
      }

      // Handle schedules in edit mode (create mode already sends schedules in the payload)
      if (isEdit && savedCourseId) {
        try {
          // Delete removed schedules
          if (originalSchedules.length > 0) {
            const currentScheduleIds = new Set(schedules.filter(sc => sc.id).map(sc => sc.id));
            const removedSchedules = originalSchedules.filter(orig => orig.id && !currentScheduleIds.has(orig.id));
            
            for (const removed of removedSchedules) {
              try {
                await deleteCourseSchedule(removed.id!);
                console.log(`Deleted schedule: ${removed.id}`);
              } catch (err) {
                console.error(`Failed to delete schedule ${removed.id}:`, err);
              }
            }
          }

          // Validate no duplicates before saving schedules
          const scheduleCombinations = new Set<string>();
          const duplicateSchedules: number[] = [];
          
          schedules.forEach((schedule, idx) => {
            const key = `${schedule.timeSlotID}-${schedule.dayOfWeek}`;
            if (scheduleCombinations.has(key)) {
              duplicateSchedules.push(idx);
            } else {
              scheduleCombinations.add(key);
            }
          });
          
          if (duplicateSchedules.length > 0) {
            showErrorMessage(`Cannot save: Duplicate schedules found at positions ${duplicateSchedules.map(i => i + 1).join(', ')}. Please remove duplicates before saving.`);
            return;
          }
          
          // Create or update schedules
          for (const schedule of schedules) {
            if (schedule.id) {
              // Update existing schedule
              try {
                await updateCourseSchedule(schedule.id, {
                  courseID: savedCourseId,
                  timeSlotID: schedule.timeSlotID,
                  dayOfWeek: Number(schedule.dayOfWeek) || 0
                });
              } catch (err) {
                console.error(`Failed to update schedule ${schedule.id}:`, err);
              }
            } else {
              // Create new schedule
              try {
                await createCourseSchedule({
                  courseID: savedCourseId,
                  timeSlotID: schedule.timeSlotID,
                  dayOfWeek: Number(schedule.dayOfWeek) || 0
                });
              } catch (err) {
                console.error(`Failed to create schedule:`, err);
              }
            }
          }
        } catch (err) {
          console.error("Error managing schedules:", err);
        }
      }

      // Handle skills, benefits, requirements relationships in edit mode
      if (isEdit && savedCourseId) {
        try {
          // Skills
          const currentSkillIds = new Set(selectedSkills);
          const originalSkillIds = new Set(originalSkillRelations.map(r => r.lookupId));
          
          // Delete removed skills
          for (const relation of originalSkillRelations) {
            if (!currentSkillIds.has(relation.lookupId)) {
              try {
                await deleteCourseSkill(relation.relationshipId);
                console.log(`Deleted skill relationship: ${relation.relationshipId}`);
              } catch (err) {
                console.error(`Failed to delete skill relationship ${relation.relationshipId}:`, err);
              }
            }
          }
          
          // Create new skills
          for (const skillId of selectedSkills) {
            if (!originalSkillIds.has(skillId)) {
              try {
                await createCourseSkill({
                  courseID: savedCourseId,
                  skillID: skillId
                });
                console.log(`Created skill relationship for skill: ${skillId}`);
              } catch (err) {
                console.error(`Failed to create skill relationship for ${skillId}:`, err);
              }
            }
          }

          // Benefits
          const currentBenefitIds = new Set(selectedBenefits);
          const originalBenefitIds = new Set(originalBenefitRelations.map(r => r.lookupId));
          
          // Delete removed benefits
          for (const relation of originalBenefitRelations) {
            if (!currentBenefitIds.has(relation.lookupId)) {
              try {
                await deleteCourseBenefit(relation.relationshipId);
                console.log(`Deleted benefit relationship: ${relation.relationshipId}`);
              } catch (err) {
                console.error(`Failed to delete benefit relationship ${relation.relationshipId}:`, err);
              }
            }
          }
          
          // Create new benefits
          for (const benefitId of selectedBenefits) {
            if (!originalBenefitIds.has(benefitId)) {
              try {
                await createCourseBenefit({
                  courseID: savedCourseId,
                  benefitID: benefitId
                });
                console.log(`Created benefit relationship for benefit: ${benefitId}`);
              } catch (err) {
                console.error(`Failed to create benefit relationship for ${benefitId}:`, err);
              }
            }
          }

          // Requirements
          const currentRequirementIds = new Set(selectedRequirements);
          const originalRequirementIds = new Set(originalRequirementRelations.map(r => r.lookupId));
          
          // Delete removed requirements
          for (const relation of originalRequirementRelations) {
            if (!currentRequirementIds.has(relation.lookupId)) {
              try {
                await deleteCourseRequirement(relation.relationshipId);
                console.log(`Deleted requirement relationship: ${relation.relationshipId}`);
              } catch (err) {
                console.error(`Failed to delete requirement relationship ${relation.relationshipId}:`, err);
              }
            }
          }
          
          // Create new requirements
          for (const requirementId of selectedRequirements) {
            if (!originalRequirementIds.has(requirementId)) {
              try {
                await createCourseRequirement({
                  courseID: savedCourseId,
                  requirementID: requirementId
                });
                console.log(`Created requirement relationship for requirement: ${requirementId}`);
              } catch (err) {
                console.error(`Failed to create requirement relationship for ${requirementId}:`, err);
              }
            }
          }
        } catch (err) {
          console.error("Error managing course relationships:", err);
        }
      }

      // Show success message
      if (isEdit) {
        showSuccessMessage("Course updated successfully!");
      } else {
        showSuccessMessage("Course created successfully with all details!");
        // Navigate after a short delay to allow toast to be seen (only for create)
        setTimeout(() => {
          navigate('/staff/courses');
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving course:", error);
      showErrorMessage(isEdit ? "Failed to update course. Please try again." : "Failed to create course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/staff/courses');
  };

  const getFormCompletionPercentage = () => {
    const requiredFields = [
      formData.name,
      formData.description,
      formData.level,
      true
    ];
    
    const optionalFields = [
      formData.image || imagePreview,
      formData.price,
      formData.maxStudents,
      formData.syllabus || syllabusFile || syllabusUrl || syllabi.length > 0,
      selectedSkills.length > 0,
      selectedBenefits.length > 0,
      selectedRequirements.length > 0,
      courseObjectives.length > 0
    ];
    
    const completedRequired = requiredFields.filter(Boolean).length;
    const completedOptional = optionalFields.filter(Boolean).length;
    
    const requiredWeight = 70; // 70% for required fields
    const optionalWeight = 30; // 30% for optional fields
    
    const requiredPercentage = (completedRequired / requiredFields.length) * requiredWeight;
    const optionalPercentage = (completedOptional / optionalFields.length) * optionalWeight;
    
    return Math.round(requiredPercentage + optionalPercentage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-6 space-y-8">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-green-200 bg-green-50 text-green-800 shadow-lg min-w-[280px]">
            <div className="w-6 h-6 mt-0.5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Success</p>
              <p className="text-sm">{toastMessage}</p>
            </div>
            <button
              onClick={() => {}}
              className="ml-2 text-green-700 hover:text-green-900"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 shadow-lg min-w-[280px]">
            <div className="w-6 h-6 mt-0.5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm">{toastMessage}</p>
            </div>
            <button
              onClick={() => {}}
              className="ml-2 text-red-700 hover:text-red-900"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Page Header */}
      <PageHeader
        title={isEdit ? "Edit Course" : "Create New Course"}
        description={isEdit ? "Update course information and content" : "Create a comprehensive course with detailed information"}
        icon={<BookOpen className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'Back to Courses',
            variant: 'secondary',
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: handleCancel
          }
        ]}
      />

      {/* Form Progress Indicator */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">Course Creation Progress</h3>
            <span className="text-xs text-blue-600">{getFormCompletionPercentage()}% Complete</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getFormCompletionPercentage()}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-blue-700">
            <div className="flex items-center gap-1">
              {formData.name && formData.description ? 
                <CheckCircle className="w-3 h-3 text-green-500" /> : 
                <AlertCircle className="w-3 h-3 text-amber-500" />
              }
              Basic Info
            </div>
             <div className="flex items-center gap-1">
               {(selectedSkills.length > 0 || selectedBenefits.length > 0 || selectedRequirements.length > 0 || courseObjectives.length > 0) ? 
                 <CheckCircle className="w-3 h-3 text-green-500" /> : 
                 <AlertCircle className="w-3 h-3 text-amber-500" />
               }
               Additional Info
             </div>
            <div className="flex items-center gap-1">
              {(formData.syllabus || syllabusFile || syllabusUrl || syllabi.length > 0) ? 
                <CheckCircle className="w-3 h-3 text-green-500" /> : 
                <AlertCircle className="w-3 h-3 text-amber-500" />
              }
              Content
            </div>
          </div>
        </div>
      </Card>

      <div className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Image */}
            <Card className="overflow-hidden">
     
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Camera className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold">Course Visual Identity</h2>
                </div>
                <div className="flex flex-col lg:flex-row items-start gap-6">
                  <div className="relative group">
                    <div 
                      className={`w-48 h-32 rounded-xl border-2 ${imagePreview ? 'border-solid border-gray-300' : 'border-dashed border-gray-300 bg-gradient-to-br from-blue-50 to-indigo-100'} cursor-pointer hover:border-primary-400 ${!imagePreview ? 'hover:bg-gradient-to-br hover:from-blue-100 hover:to-indigo-200 flex items-center justify-center' : 'relative'} transition-all duration-300 group-hover:scale-105 overflow-hidden z-10`}
                      onClick={handleImageClick}
                      onDrop={onImageDrop}
                      onDragOver={onImageDragOver}
                    >
                      {imagePreview ? (
                        <>
                          <img 
                            src={imagePreview} 
                            alt="Course preview" 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </>
                      ) : (
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-sm font-medium text-gray-600">Click to upload image</p>
                          <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-blue-500" />
                        Image Guidelines
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Recommended: 400×200 pixels (2:1 ratio)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Formats: JPG, PNG, WebP</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Maximum size: 5MB</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleImageClick}
                          iconLeft={<Upload className="w-4 h-4" />}
                        >
                          {imagePreview ? 'Change Image' : 'Choose Image'}
                        </Button>
                        {imagePreview && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={removeImage}
                            iconLeft={<Trash2 className="w-4 h-4" />}
                            className="text-white hover:text-white !bg-red-500 hover:!bg-accent2-500 border-red-200"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Basic Information */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label required>
                      Course Code
                    </Label>
                    <Input
                      value={formData.courseCode || ''}
                      onChange={(e) => handleInputChange('courseCode', e.target.value)}
                      placeholder="Enter course code"
                    />
                  </div>
                  <div>
                    <Label required>
                      Course Name
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter course name"
                      error={errors.name}
                    />
                  </div>

                  <div>
                    <Label required>
                      Level
                    </Label>
                    <Select
                      value={formData.courseLevelID || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, courseLevelID: e.target.value }))}
                      options={lookupOptions.courseLevelOptions}
                    />
                  </div>

                  <div>
                    <Label required>
                      Course Format
                    </Label>
                    <Select
                      value={formData.courseFormatID || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, courseFormatID: e.target.value }))}
                      options={lookupOptions.courseFormatOptions}
                    />
                  </div>

                  <div>
                    <Label required>
                      Category
                    </Label>
                    <Select
                      value={formData.categoryID || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryID: e.target.value }))}
                      options={lookupOptions.categoryOptions}
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (VND)
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value))}
                      placeholder="Enter course price"
                      error={errors.price}
                      min={50000}
                    />
                  </div>

                </div>

                <div className="mt-6">
                  <Label required>
                    Course Description
                  </Label>
                   <textarea
                     value={formData.description}
                     onChange={(e) => handleInputChange('description', e.target.value)}
                     placeholder="Enter detailed course description..."
                     rows={4}
                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                       errors.description ? 'border-red-500' : 'border-gray-300'
                     }`}
                   />
                   {errors.description && (
                     <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                   )}
                 </div>

                          {/* Course Objectives */}
                          <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                  <Target className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-800">Course Objectives</h3>
                                  <p className="text-sm text-gray-500">Define what students will achieve</p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={addCourseObjective}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
                                iconLeft={<PlusCircle className="w-4 h-4" />}
                              >
                                Add Objective
                              </Button>
                            </div>
                            
                            {courseObjectives.length === 0 && (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
                                <Target className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No objectives defined yet</p>
                                <p className="text-sm text-gray-500 mt-1">Add clear, measurable objectives to help students understand course outcomes</p>
                              </div>
                            )}
                            
                            <div className="space-y-3">
                              {courseObjectives.map((obj, idx) => (
                                <div key={idx} className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                                      <span className="text-xs font-semibold text-blue-600">{idx + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                      <Input 
                                        value={obj} 
                                        onChange={(e) => updateCourseObjective(idx, e.target.value)} 
                                        placeholder={`Objective #${idx + 1} - What will students learn?`}
                                        className="border-0 bg-transparent p-0 text-gray-700 placeholder-gray-400 focus:ring-0"
                                      />
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="secondary" 
                                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white hover:text-white !bg-red-500 hover:!bg-accent2-500 border-red-200"
                                      onClick={() => removeCourseObjective(idx)}
                                      iconLeft={<Trash2 className="w-3 h-3" />}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Skills */}
                          <div className="mt-8">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">Skills</h3>
                                <p className="text-sm text-gray-500">Select skills students will develop</p>
                              </div>
                            </div>
                            
                            {lookupOptions.skillOptions.length === 0 && (
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                                <Zap className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No skills available</p>
                                <p className="text-sm text-gray-500 mt-1">Skills will appear here once loaded from the system</p>
                              </div>
                            )}
                            
                            {lookupOptions.skillOptions.length > 0 && (
                              <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-2">
                                  {lookupOptions.skillOptions.map((skill) => (
                                    <label key={skill.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all duration-200 group">
                                      <input
                                        type="checkbox"
                                        checked={selectedSkills.includes(skill.value)}
                                        onChange={() => toggleSkill(skill.value)}
                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                      />
                                      <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">{skill.label}</span>
                                    </label>
                                  ))}
                                  </div>
                                </div>
                                {selectedSkills.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">Selected skills ({selectedSkills.length}):</p>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedSkills.map((skillId) => {
                                        const skill = lookupOptions.skillOptions.find(s => s.value === skillId);
                                        return (
                                          <span key={skillId} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                            {skill?.label}
                                            <button
                                              type="button"
                                              onClick={() => toggleSkill(skillId)}
                                              className="ml-1 text-green-600 hover:text-green-800"
                                            >
                                              ×
                                            </button>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Benefits */}
                          <div className="mt-8">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                                <Gift className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">Benefits</h3>
                                <p className="text-sm text-gray-500">Highlight course advantages</p>
                              </div>
                            </div>
                            
                            {lookupOptions.benefitOptions.length === 0 && (
                              <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6 text-center">
                                <Gift className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No benefits available</p>
                                <p className="text-sm text-gray-500 mt-1">Benefits will appear here once loaded from the system</p>
                              </div>
                            )}
                            
                            {lookupOptions.benefitOptions.length > 0 && (
                              <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-2">
                                  {lookupOptions.benefitOptions.map((benefit) => (
                                    <label key={benefit.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-200 group">
                                      <input
                                        type="checkbox"
                                        checked={selectedBenefits.includes(benefit.value)}
                                        onChange={() => toggleBenefit(benefit.value)}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                      />
                                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">{benefit.label}</span>
                                    </label>
                                  ))}
                                  </div>
                                </div>
                                {selectedBenefits.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">Selected benefits ({selectedBenefits.length}):</p>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedBenefits.map((benefitId) => {
                                        const benefit = lookupOptions.benefitOptions.find(b => b.value === benefitId);
                                        return (
                                          <span key={benefitId} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                            {benefit?.label}
                                            <button
                                              type="button"
                                              onClick={() => toggleBenefit(benefitId)}
                                              className="ml-1 text-purple-600 hover:text-purple-800"
                                            >
                                              ×
                                            </button>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Requirements */}
                          <div className="mt-8">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">Requirements</h3>
                                <p className="text-sm text-gray-500">Prerequisites for enrollment</p>
                              </div>
                            </div>
                            
                            {lookupOptions.requirementOptions.length === 0 && (
                              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 text-center">
                                <CheckCircle className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No requirements available</p>
                                <p className="text-sm text-gray-500 mt-1">Requirements will appear here once loaded from the system</p>
                              </div>
                            )}
                            
                            {lookupOptions.requirementOptions.length > 0 && (
                              <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-2">
                                  {lookupOptions.requirementOptions.map((requirement) => (
                                    <label key={requirement.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all duration-200 group">
                                      <input
                                        type="checkbox"
                                        checked={selectedRequirements.includes(requirement.value)}
                                        onChange={() => toggleRequirement(requirement.value)}
                                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                      />
                                      <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">{requirement.label}</span>
                                    </label>
                                  ))}
                                  </div>
                                </div>
                                {selectedRequirements.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">Selected requirements ({selectedRequirements.length}):</p>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedRequirements.map((requirementId) => {
                                        const requirement = lookupOptions.requirementOptions.find(r => r.value === requirementId);
                                        return (
                                          <span key={requirementId} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                            {requirement?.label}
                                            <button
                                              type="button"
                                              onClick={() => toggleRequirement(requirementId)}
                                              className="ml-1 text-orange-600 hover:text-orange-800"
                                            >
                                              ×
                                            </button>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

               </div>
             </Card>
             {/* Course Content */}
             <Card className="overflow-hidden">
               <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold"> Course Content & Materials</h2>
                </div>
                  <div className="space-y-6">
                    {/* Multiple Syllabi & Items */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800">Syllabi</h4>
                        <Button size="sm" variant="secondary" onClick={addSyllabus}>Add Syllabus</Button>
                      </div>
                      {syllabi.length === 0 && (
                        <p className="text-xs text-gray-500">No syllabus added yet. Add one or keep the description only.</p>
                      )}
                      {/* Scrollable container for syllabi */}
                      <div className="max-h-[720px] overflow-y-auto pr-2 space-y-4">
                      {syllabi.map((s, sIdx) => (
                        <div key={sIdx} className="border rounded-md p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">Syllabus #{sIdx + 1}</h5>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="text-white hover:text-white !bg-red-500 hover:!bg-accent2-500 border-red-200 !p-2" 
                              onClick={() => removeSyllabus(sIdx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Title</Label>
                              <Input value={s.title} onChange={(e) => updateSyllabusField(sIdx, 'title', e.target.value)} placeholder="e.g., IELTS Writing Syllabus" />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Description</Label>
                              <textarea
                                value={s.description}
                                onChange={(e) => updateSyllabusField(sIdx, 'description', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="High-level description"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <h6 className="text-sm font-semibold">Items</h6>
                            <Button size="sm" variant="secondary" onClick={() => addItemToSyllabus(sIdx)}>Add Item</Button>
                          </div>
                          {s.items.length === 0 && (
                            <p className="text-xs text-gray-500">No items yet. Add items or leave empty.</p>
                          )}
                          <div className="space-y-4">
                            {s.items.map((it, iIdx) => {
                              const itemKey = `${sIdx}-${iIdx}`;
                              const isExpanded = expandedItems.has(itemKey);
                              
                              return (
                              <div key={iIdx} className="border-2 border-gray-300 rounded-lg bg-gray-50 shadow-sm">
                                {/* Item Header - Clickable */}
                                <div 
                                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                  onClick={() => toggleItemExpanded(sIdx, iIdx)}
                                >
                                  <div className="flex items-center gap-2">
                                    {isExpanded ? (
                                      <ChevronUp className="w-5 h-5 text-gray-600" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-600" />
                                    )}
                                    <h6 className="font-semibold text-gray-900">
                                      Session #{it.sessionNumber || iIdx + 1}: {it.topicTitle || 'Untitled'}
                                    </h6>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="text-white hover:text-white !bg-red-500 hover:!bg-accent2-500 border-red-200 !p-2" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeItemFromSyllabus(sIdx, iIdx);
                                    }}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                {/* Collapsible Item Fields */}
                                {isExpanded && (
                                <div className="p-4 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Session Number</Label>
                                  <Input type="number" min={1} value={it.sessionNumber} onChange={(e) => updateSyllabusItemField(sIdx, iIdx, 'sessionNumber', Number(e.target.value))} />
                                </div>
                                <div>
                                  <Label>Topic Title</Label>
                                  <Input value={it.topicTitle} onChange={(e) => updateSyllabusItemField(sIdx, iIdx, 'topicTitle', e.target.value)} />
                                </div>
                                <div>
                                  <Label>Total Slots</Label>
                                  <Input type="number" min={1} value={it.totalSlots ?? ''} onChange={(e) => updateSyllabusItemField(sIdx, iIdx, 'totalSlots', e.target.value ? Number(e.target.value) : 0)} />
                                </div>
                                <div className="flex items-end">
                                  <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={it.required} onChange={(e) => updateSyllabusItemField(sIdx, iIdx, 'required', e.target.checked)} />
                                    <span className="text-sm">Required</span>
                                  </label>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label>Objectives</Label>
                                    <Button size="sm" variant="secondary" onClick={() => addObjectiveToItem(sIdx, iIdx)}>Add Objective</Button>
                                  </div>
                                  {(it.objectives && it.objectives.length > 0) ? (
                                    <div className="space-y-2">
                                      {it.objectives.map((obj, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-2">
                                          <Input className="flex-1" value={obj} onChange={(e) => updateObjectiveInItem(sIdx, iIdx, oIdx, e.target.value)} placeholder={`Objective #${oIdx + 1}`} />
                                          <Button size="sm" 
                                          variant="secondary" 
                                          className="text-white hover:text-white !bg-red-500 hover:!bg-accent2-500 border-red-200" 
                                          onClick={() => removeObjectiveFromItem(sIdx, iIdx, oIdx)}>
                                            Remove
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-500">No objectives. Add one.</p>
                                  )}
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Content Summary</Label>
                                  <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary-500" value={it.contentSummary} onChange={(e) => updateSyllabusItemField(sIdx, iIdx, 'contentSummary', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Pre-reading URL</Label>
                                  <Input type="url" value={it.preReadingUrl} onChange={(e) => updateSyllabusItemField(sIdx, iIdx, 'preReadingUrl', e.target.value)} />
                                </div>
                                </div>
                                </div>
                                )}
                              </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>

                    {/* Course Schedules */}
                    <CourseScheduleSection
                      schedules={schedules}
                      timeslotOptions={lookupOptions.timeslotOptions}
                      onAddSchedule={() => addSchedule(showErrorMessage)}
                      onRemoveSchedule={removeSchedule}
                      onUpdateSchedule={(idx: number, field: 'timeSlotID' | 'dayOfWeek', value: string | number) => updateSchedule(idx, field, value, showErrorMessage)}
                      isTimeSlotAvailable={isTimeSlotAvailable}
                      checkScheduleDuplicate={checkScheduleDuplicate}
                    />
                  </div>
              </div>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                  <h2 className="text-xl font-semibold">Set course availability</h2>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === "inactive"}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Inactive</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Enhanced Course Preview */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                  <h2 className="text-xl font-semibold">Live Preview</h2>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-indigo-500 mt-1" />
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Course Name</span>
                      <p className="font-semibold text-gray-800">{formData.name || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-green-500 mt-1" />
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Level</span>
                      <p className="font-semibold text-gray-800 capitalize">{formData.level || 'Not set'}</p>
                    </div>
                  </div>
                  
                  {formData.price && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-4 h-4 text-green-500 mt-1" />
                      <div>
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Price</span>
                        <p className="font-semibold text-gray-800">{formatVND(formData.price)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-1" />
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Category</span>
                      <p className="font-semibold text-gray-800">{getOptionLabel(lookupOptions.categoryOptions, formData.categoryID)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-indigo-500 mt-1" />
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Format</span>
                      <p className="font-semibold text-gray-800">{getOptionLabel(lookupOptions.courseFormatOptions, formData.courseFormatID)}</p>
                    </div>
                  </div>
                  
                  
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-1" />
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Status</span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                        formData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {formData.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Content Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-gray-600">Syllabus:</span>
                        <span className="text-xs font-medium">
                          {syllabusFile ? `📎 ${syllabusFile.name}` : 
                           syllabusUrl ? `🔗 URL provided` :
                           formData.syllabus ? `${formData.syllabus.split('\n').length} weeks` : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Zap className="w-3 h-3 text-emerald-600 mt-0.5" />
                        <div>
                          <span className="text-xs text-gray-600">Skills:</span>
                          <span className="text-xs font-medium ml-1">
                            {getLabelsFromIds(lookupOptions.skillOptions, selectedSkills).join(', ') || 'Not set'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Gift className="w-3 h-3 text-purple-600 mt-0.5" />
                        <div>
                          <span className="text-xs text-gray-600">Benefits:</span>
                          <span className="text-xs font-medium ml-1">
                            {getLabelsFromIds(lookupOptions.benefitOptions, selectedBenefits).join(', ') || 'Not set'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-orange-600 mt-0.5" />
                        <div>
                          <span className="text-xs text-gray-600">Requirements:</span>
                          <span className="text-xs font-medium ml-1">
                            {getLabelsFromIds(lookupOptions.requirementOptions, selectedRequirements).join(', ') || 'Not set'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="w-3 h-3 text-indigo-600 mt-0.5" />
                        <div>
                          <span className="text-xs text-gray-600">Schedules:</span>
                          <span className="text-xs font-medium ml-1">
                            {schedules.length
                              ? schedules.map(s => `${dayNames[s.dayOfWeek]} • ${getOptionLabel(lookupOptions.timeslotOptions, s.timeSlotID)}`).join('; ')
                              : 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl mt-4 p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {isEdit ? "Last updated: Today" : "All fields marked with * are required"}
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCancel}
                variant="secondary"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="min-w-[160px] bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {isEdit ? "Update Course" : "Create Course"}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
