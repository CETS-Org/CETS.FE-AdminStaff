import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/ui/PageHeader";
import Label from "@/components/ui/Label";
import { Trash2, BookOpen, ArrowLeft, Upload, Camera, Save, FileText, Link as LinkIcon, CheckCircle, AlertCircle, Clock, DollarSign, Calendar, Loader2, PlusCircle, MinusCircle, Target, Zap, Gift, X } from "lucide-react";
import { getCourseDetail, createCourse, updateCourse, getCourseCategories, getCourseSkills, getCourseBenefits, getCourseRequirements } from "@/api/course.api";
import { getLookupsByTypeCode, createSyllabus, createSyllabusItem, getTimeslots } from "@/api";
import type { CourseFormData } from "@/types/course.types";

export default function AddEditCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

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

  // Lookup options from API
  const [courseLevelOptions, setCourseLevelOptions] = useState<{ label: string; value: string }[]>([]);
  const [courseFormatOptions, setCourseFormatOptions] = useState<{ label: string; value: string }[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([]);
  const [skillOptions, setSkillOptions] = useState<{ label: string; value: string }[]>([]);
  const [benefitOptions, setBenefitOptions] = useState<{ label: string; value: string }[]>([]);
  const [requirementOptions, setRequirementOptions] = useState<{ label: string; value: string }[]>([]);
  const [timeslotOptions, setTimeslotOptions] = useState<{ label: string; value: string }[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Toast notifications
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const imageObjectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [syllabusUrl, setSyllabusUrl] = useState<string>("");
  const [materialsUrl, setMaterialsUrl] = useState<string>("");
  const [assignmentsUrl, setAssignmentsUrl] = useState<string>("");
  // Syllabus & Syllabus Item UI state
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
  // (Learning Material removed - requires classMeetingID not available here)

  // Currency formatter for Vietnamese Dong
  const formatVND = (amount?: number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

  // Helpers to resolve labels for Live Preview
  const getOptionLabel = (options: { label: string; value: string }[], v?: string) => {
    if (!v) return 'Not set';
    const found = options.find(o => String(o.value) === String(v));
    return found?.label || 'Not set';
  };
  const getLabelsFromIds = (options: { label: string; value: string }[], ids: string[]) =>
    options.filter(o => ids?.some(id => String(id) === String(o.value))).map(o => o.label);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Toast helper functions
  const showSuccessMessage = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  const showErrorMessage = (message: string) => {
    setToastMessage(message);
    setShowErrorToast(true);
    setTimeout(() => setShowErrorToast(false), 5000);
  };

  useEffect(() => {
    if (isEdit && id) {
      // Load course data for editing
      loadCourseData(id);
    } else {
      // Set default values for new course
      setFormData({
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
      // Initialize other state variables for new course
      setSyllabi([]);
      setCourseObjectives([]);
      setSelectedSkills([]);
      setSelectedBenefits([]);
      setSelectedRequirements([]);
      setSchedules([]);
    }
  }, [isEdit, id]);

  // Load lookup options (CourseLevel, CourseFormat, Skills, Benefits, Requirements, Timeslots)
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [levelsRes, formatsRes, categoriesRes, skillsRes, benefitsRes, requirementsRes, timeslotsRes] = await Promise.all([
          getLookupsByTypeCode('CourseLevel'),
          getLookupsByTypeCode('CourseFormat'),
          getCourseCategories(),
          getCourseSkills(),
          getCourseBenefits(),
          getCourseRequirements(),
          getTimeslots()
        ]);
        const toOptions = (items: any[]) => (items || []).map((x: any) => ({ label: x.name || x.Name, value: x.lookUpId || x.LookUpId }));
        const levelOpts = toOptions(levelsRes.data);
        const formatOpts = toOptions(formatsRes.data);
        const catOptions = (categoriesRes.data || []).map((c: any) => ({ label: c.name || c.Name, value: c.id || c.Id }));
        
        setCourseLevelOptions(levelOpts);
        setCourseFormatOptions(formatOpts);
        setCategoryOptions(catOptions);
        
        const skillOpts = (skillsRes.data || []).map((s: any) => ({ label: s.name || s.Name || s.description || 'Unnamed', value: s.lookUpId || s.LookUpId }));
        setSkillOptions(skillOpts);
        
        const benefitOpts = (benefitsRes.data || []).map((b: any) => ({ label: b.name || b.Name || b.description || b.Description || 'Unnamed', value: b.lookUpId || b.LookUpId }));
        setBenefitOptions(benefitOpts);
        
        const reqOpts = (requirementsRes.data || []).map((r: any) => ({ label: r.name || r.Name || r.description || r.Description || 'Unnamed', value: r.lookUpId || r.LookUpId }));
        setRequirementOptions(reqOpts);
        
        // Timeslots
        const timeslotOpts = (timeslotsRes.data || []).map((t: any) => ({ label: t.name || t.Name || t.timeSlotName || t.TimeSlotName || `${t.startTime || ''} - ${t.endTime || ''}`, value: t.id || t.Id || t.lookUpId || t.LookUpId }));
        setTimeslotOptions(timeslotOpts);

        // Set default values for new course (only if not editing)
        if (!isEdit) {
          setFormData(prev => ({
            ...prev,
            courseLevelID: levelOpts[0]?.value || '',
            courseFormatID: formatOpts[0]?.value || '',
            categoryID: catOptions[0]?.value || ''
          }));
        }
      } catch (err) {
        console.error('Failed to load lookup options', err);
      }
    };
    loadLookups();
  }, [isEdit]);

  const loadCourseData = async (_courseId: string) => {
    try {
      setIsLoading(true);
      const res = await getCourseDetail(_courseId);
      const d = res.data;
      setFormData(prev => ({
        ...prev,
        name: d.courseName || "",
        description: d.description || "",
        price: d.standardPrice || 0,
        image: d.courseImageUrl || "",
        courseCode: d.courseCode || ""
      }));
      setImagePreview(d.courseImageUrl || "");
      // Suggest syllabus title when editing existing
      const suggestedTitle = `${d.courseCode || d.courseName || ""} Syllabus`.trim();
      setSyllabusTitle(suggestedTitle);
    } catch (error) {
      console.error("Error loading course data:", error);
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

  // Multi-syllabus helpers
  type SyllabusItemUI = {
    sessionNumber: number;
    topicTitle: string;
    totalSlots?: number;
    required: boolean;
    objectives: string[];
    contentSummary?: string;
    preReadingUrl?: string;
  };

  type SyllabusUI = {
    title: string;
    description: string;
    items: SyllabusItemUI[];
  };

  const [syllabi, setSyllabi] = useState<SyllabusUI[]>([]);

  // Course Objectives (for the course itself)
  const [courseObjectives, setCourseObjectives] = useState<string[]>([]);
  const addCourseObjective = () => setCourseObjectives(prev => [...prev, ""]);
  const removeCourseObjective = (idx: number) => setCourseObjectives(prev => prev.filter((_, i) => i !== idx));
  const updateCourseObjective = (idx: number, val: string) => setCourseObjectives(prev => prev.map((o, i) => i === idx ? val : o));

          // Skills, Benefits, Requirements (using checkboxes to prevent duplicates)
          const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
          const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
          const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);

          const toggleSkill = (skillId: string) => {
            setSelectedSkills(prev => 
              prev.includes(skillId) 
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
            );
          };

          const toggleBenefit = (benefitId: string) => {
            setSelectedBenefits(prev => 
              prev.includes(benefitId) 
                ? prev.filter(id => id !== benefitId)
                : [...prev, benefitId]
            );
          };

          const toggleRequirement = (requirementId: string) => {
            setSelectedRequirements(prev => 
              prev.includes(requirementId) 
                ? prev.filter(id => id !== requirementId)
                : [...prev, requirementId]
            );
          };

  // Schedules
  type ScheduleUI = { timeSlotID: string; dayOfWeek: number };
  const [schedules, setSchedules] = useState<ScheduleUI[]>([]);
  const addSchedule = () => setSchedules(prev => [...prev, { timeSlotID: "", dayOfWeek: 0 }]);
  const removeSchedule = (idx: number) => setSchedules(prev => prev.filter((_, i) => i !== idx));
  const updateScheduleField = (idx: number, field: keyof ScheduleUI, val: string | number) => {
    setSchedules(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const addSyllabus = () => {
    setSyllabi(prev => ([...prev, { title: '', description: '', items: [] }]));
  };

  const removeSyllabus = (index: number) => {
    setSyllabi(prev => prev.filter((_, i) => i !== index));
  };

  const updateSyllabusField = (index: number, field: keyof SyllabusUI, value: string) => {
    setSyllabi(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addItemToSyllabus = (syllabusIndex: number) => {
    setSyllabi(prev => prev.map((s, i) => i === syllabusIndex ? {
      ...s,
      items: [...s.items, { sessionNumber: (s.items.length + 1), topicTitle: '', totalSlots: undefined, required: true, objectives: [], contentSummary: '', preReadingUrl: '' }]
    } : s));
  };

  const removeItemFromSyllabus = (syllabusIndex: number, itemIndex: number) => {
    setSyllabi(prev => prev.map((s, i) => i === syllabusIndex ? {
      ...s,
      items: s.items.filter((_, j) => j !== itemIndex)
    } : s));
  };

  const updateSyllabusItemField = (syllabusIndex: number, itemIndex: number, field: keyof SyllabusItemUI, value: string | number | boolean) => {
    setSyllabi(prev => prev.map((s, i) => i === syllabusIndex ? {
      ...s,
      items: s.items.map((it, j) => j === itemIndex ? { ...it, [field]: value as any } : it)
    } : s));
  };

  const addObjectiveToItem = (syllabusIndex: number, itemIndex: number) => {
    setSyllabi(prev => prev.map((s, i) => i === syllabusIndex ? {
      ...s,
      items: s.items.map((it, j) => j === itemIndex ? { ...it, objectives: [...(it.objectives || []), ""] } : it)
    } : s));
  };

  const updateObjectiveInItem = (syllabusIndex: number, itemIndex: number, objectiveIndex: number, value: string) => {
    setSyllabi(prev => prev.map((s, i) => i === syllabusIndex ? {
      ...s,
      items: s.items.map((it, j) => {
        if (j !== itemIndex) return it;
        const next = [...(it.objectives || [])];
        next[objectiveIndex] = value;
        return { ...it, objectives: next };
      })
    } : s));
  };

  const removeObjectiveFromItem = (syllabusIndex: number, itemIndex: number, objectiveIndex: number) => {
    setSyllabi(prev => prev.map((s, i) => i === syllabusIndex ? {
      ...s,
      items: s.items.map((it, j) => {
        if (j !== itemIndex) return it;
        const next = (it.objectives || []).filter((_, idx) => idx !== objectiveIndex);
        return { ...it, objectives: next };
      })
    } : s));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Course name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Course description is required";
    }

    // Teacher validation removed

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

      // Save or update course first
      let savedCourseId = id;
      if (isEdit && id) {
        await updateCourse(id, { id, ...payload });
      } else {
        const createRes = await createCourse(payload);
        savedCourseId = (createRes?.data?.Id || createRes?.data?.id || '').toString();
      }

      // Create multiple syllabi and their items if provided
      const userDataStr = localStorage.getItem('userInfo');
      const currentUserId = userDataStr ? (JSON.parse(userDataStr)?.id || JSON.parse(userDataStr)?.Id || JSON.parse(userDataStr)?.accountId || JSON.parse(userDataStr)?.AccountId) : undefined;

      if (savedCourseId && currentUserId) {
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

          let syllabusCount = 0;
          let itemCount = 0;

          for (const s of list) {
            try {
              const syllabusPayload = {
                courseID: savedCourseId,
                title: s.title || `${formData.courseCode || formData.name} Syllabus`,
                description: s.description || '',
                createdBy: currentUserId,
              };

              const createSyllabusRes = await createSyllabus(syllabusPayload);

              // Handle the response structure from our new API
              const syllabusId = createSyllabusRes?.data?.syllabusID || createSyllabusRes?.data?.SyllabusID || createSyllabusRes?.data?.id || createSyllabusRes?.data?.Id;
              if (!syllabusId) {
                continue;
              }

              syllabusCount++;

              // Create items if any
              if (s.items && s.items.length > 0) {
                for (const it of s.items) {
                  try {
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
                    itemCount++;
                  } catch (itemError: any) {
                    console.error('Failed to create syllabus item:', itemError);
                    // Continue with other items even if one fails
                  }
                }
              }
            } catch (syllabusError) {
              console.error('Failed to create syllabus:', syllabusError);
              // Continue with other syllabi even if one fails
            }
          }
        } catch (e) {
          // Non-blocking: log and continue navigation
          console.error('Failed to create syllabus or item', e);
        }
      }

      // Learning material creation removed (requires classMeetingID)

      // Show success message
      if (isEdit) {
        showSuccessMessage("Course updated successfully!");
      } else {
        showSuccessMessage("Course created successfully!");
      }

      // Navigate after a short delay to allow toast to be seen
      setTimeout(() => {
        navigate('/staff/courses');
      }, 1000);
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
      formData.syllabus || syllabusFile || syllabusUrl
     
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
              onClick={() => setShowSuccessToast(false)}
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
              onClick={() => setShowErrorToast(false)}
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
               {formData.categoryID ? 
                 <CheckCircle className="w-3 h-3 text-green-500" /> : 
                 <AlertCircle className="w-3 h-3 text-amber-500" />
               }
               Category
             </div>
            <div className="flex items-center gap-1">
              {(formData.syllabus || syllabusFile || syllabusUrl) ? 
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
                            className="!bg-red-500 text-white hover:text-white hover:!bg-red-600"
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
                      options={courseLevelOptions}
                    />
                  </div>

                  <div>
                    <Label required>
                      Course Format
                    </Label>
                    <Select
                      value={formData.courseFormatID || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, courseFormatID: e.target.value }))}
                      options={courseFormatOptions}
                    />
                  </div>

                  <div>
                    <Label required>
                      Category
                    </Label>
                    <Select
                      value={formData.categoryID || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryID: e.target.value }))}
                      options={categoryOptions}
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
                                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
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
                            
                            {skillOptions.length === 0 && (
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                                <Zap className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No skills available</p>
                                <p className="text-sm text-gray-500 mt-1">Skills will appear here once loaded from the system</p>
                              </div>
                            )}
                            
                            {skillOptions.length > 0 && (
                              <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-2">
                                  {skillOptions.map((skill) => (
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
                                        const skill = skillOptions.find(s => s.value === skillId);
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
                            
                            {benefitOptions.length === 0 && (
                              <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6 text-center">
                                <Gift className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No benefits available</p>
                                <p className="text-sm text-gray-500 mt-1">Benefits will appear here once loaded from the system</p>
                              </div>
                            )}
                            
                            {benefitOptions.length > 0 && (
                              <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-2">
                                  {benefitOptions.map((benefit) => (
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
                                        const benefit = benefitOptions.find(b => b.value === benefitId);
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
                            
                            {requirementOptions.length === 0 && (
                              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 text-center">
                                <CheckCircle className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No requirements available</p>
                                <p className="text-sm text-gray-500 mt-1">Requirements will appear here once loaded from the system</p>
                              </div>
                            )}
                            
                            {requirementOptions.length > 0 && (
                              <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-2">
                                  {requirementOptions.map((requirement) => (
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
                                        const requirement = requirementOptions.find(r => r.value === requirementId);
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

                          {/* Schedules */}
                          <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-800">Schedules</h3>
                                  <p className="text-sm text-gray-500">Define class timing and days</p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={addSchedule}
                                className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white border-0"
                                iconLeft={<PlusCircle className="w-4 h-4" />}
                              >
                                Add Schedule
                              </Button>
                            </div>
                            
                            {schedules.length === 0 && (
                              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 text-center">
                                <Calendar className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No schedules defined</p>
                                <p className="text-sm text-gray-500 mt-1">Set up class times and days for better organization</p>
                              </div>
                            )}
                            
                            <div className="space-y-4">
                              {schedules.map((sch, idx) => (
                                <div key={idx} className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="text-sm font-semibold text-indigo-600">{idx + 1}</span>
                                      </div>
                                      <h4 className="font-medium text-gray-700">Schedule #{idx + 1}</h4>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="secondary" 
                                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                      onClick={() => removeSchedule(idx)}
                                      iconLeft={<Trash2 className="w-3 h-3" />}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600 mb-2">Time Slot</Label>
                                      <Select 
                                        value={sch.timeSlotID} 
                                        onChange={(e) => updateScheduleField(idx, 'timeSlotID', e.target.value)} 
                                        options={timeslotOptions}
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600 mb-2">Day of Week</Label>
                                      <Select 
                                        value={String(sch.dayOfWeek)} 
                                        onChange={(e) => updateScheduleField(idx, 'dayOfWeek', Number(e.target.value))} 
                                        options={[
                                          { label: 'Sunday', value: '0' },
                                          { label: 'Monday', value: '1' },
                                          { label: 'Tuesday', value: '2' },
                                          { label: 'Wednesday', value: '3' },
                                          { label: 'Thursday', value: '4' },
                                          { label: 'Friday', value: '5' },
                                          { label: 'Saturday', value: '6' }
                                        ]}
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
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
                      {syllabi.map((s, sIdx) => (
                        <div key={sIdx} className="border rounded-md p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">Syllabus #{sIdx + 1}</h5>
                            <Button size="sm" variant="secondary" className="text-red-600 hover:text-red-700" onClick={() => removeSyllabus(sIdx)}>Remove</Button>
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
                          <div className="space-y-3">
                            {s.items.map((it, iIdx) => (
                              <div key={iIdx} className="border rounded p-3 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                          <Button size="sm" variant="secondary" className="text-red-600 hover:text-red-700" onClick={() => removeObjectiveFromItem(sIdx, iIdx, oIdx)}>Remove</Button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-500">No objectives. Add one.</p>
                                  )}
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Content Summary</Label>
                                  <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500" value={it.contentSummary} onChange={(e) => updateSyllabusItemField(sIdx, iIdx, 'contentSummary', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Pre-reading URL</Label>
                                  <Input type="url" value={it.preReadingUrl} onChange={(e) => updateSyllabusItemField(sIdx, iIdx, 'preReadingUrl', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                  <Button size="sm" variant="secondary" className="text-red-600 hover:text-red-700" onClick={() => removeItemFromSyllabus(sIdx, iIdx)}>Remove Item</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
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
                      <p className="font-semibold text-gray-800">{getOptionLabel(categoryOptions, formData.categoryID)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-indigo-500 mt-1" />
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Format</span>
                      <p className="font-semibold text-gray-800">{getOptionLabel(courseFormatOptions, formData.courseFormatID)}</p>
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
                            {getLabelsFromIds(skillOptions, selectedSkills).join(', ') || 'Not set'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Gift className="w-3 h-3 text-purple-600 mt-0.5" />
                        <div>
                          <span className="text-xs text-gray-600">Benefits:</span>
                          <span className="text-xs font-medium ml-1">
                            {getLabelsFromIds(benefitOptions, selectedBenefits).join(', ') || 'Not set'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-orange-600 mt-0.5" />
                        <div>
                          <span className="text-xs text-gray-600">Requirements:</span>
                          <span className="text-xs font-medium ml-1">
                            {getLabelsFromIds(requirementOptions, selectedRequirements).join(', ') || 'Not set'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="w-3 h-3 text-indigo-600 mt-0.5" />
                        <div>
                          <span className="text-xs text-gray-600">Schedules:</span>
                          <span className="text-xs font-medium ml-1">
                            {schedules.length
                              ? schedules.map(s => `${dayNames[s.dayOfWeek]} • ${getOptionLabel(timeslotOptions, s.timeSlotID)}`).join('; ')
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
