import { useState } from 'react';
import type { SyllabusUI, SyllabusItemUI } from '../types/course-form.types';

export const useCourseSyllabus = () => {
  const [syllabi, setSyllabi] = useState<SyllabusUI[]>([]);
  const [originalSyllabi, setOriginalSyllabi] = useState<SyllabusUI[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
      items: [...s.items, { 
        sessionNumber: (s.items.length + 1), 
        topicTitle: '', 
        totalSlots: undefined, 
        required: true, 
        objectives: [], 
        contentSummary: '', 
        preReadingUrl: '' 
      }]
    } : s));
  };

  const removeItemFromSyllabus = (syllabusIndex: number, itemIndex: number) => {
    setSyllabi(prev => prev.map((s, i) => i === syllabusIndex ? {
      ...s,
      items: s.items.filter((_, j) => j !== itemIndex)
    } : s));
  };

  const toggleItemExpanded = (syllabusIndex: number, itemIndex: number) => {
    const key = `${syllabusIndex}-${itemIndex}`;
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const updateSyllabusItemField = (
    syllabusIndex: number, 
    itemIndex: number, 
    field: keyof SyllabusItemUI, 
    value: string | number | boolean
  ) => {
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

  const loadSyllabi = (apiSyllabi: any[]) => {
    console.log('Loading syllabi:', apiSyllabi); // Debug log
    
    const mappedSyllabi: SyllabusUI[] = apiSyllabi.map((syl: any) => {
      // Handle different field name variations from API
      const syllabusId = syl.id || syl.syllabusID || syl.SyllabusID;
      const syllabusItems = syl.syllabusItems || syl.items || syl.SyllabusItems || [];
      
      console.log('Syllabus:', { id: syllabusId, title: syl.title, itemCount: syllabusItems.length }); // Debug log
      
      return {
        id: syllabusId,
        title: syl.title  || '',
        description: syl.description || '',
        items: syllabusItems.map((item: any) => ({
          id: item.id ,
          sessionNumber: item.sessionNumber || 1,
          topicTitle: item.topicTitle || '',
          totalSlots: item.totalSlots ,
          required: item.required  !== undefined ? item.required : true,
          objectives: item.objectives
            ? (Array.isArray(item.objectives ) 
              ? (item.objectives ) 
              : [item.objectives]) 
            : [],
          contentSummary: item.contentSummary  || '',
          preReadingUrl: item.preReadingUrl || ''
        }))
      };
    });
    
    console.log('Mapped syllabi:', mappedSyllabi); // Debug log
    setSyllabi(mappedSyllabi);
    setOriginalSyllabi(JSON.parse(JSON.stringify(mappedSyllabi)));
  };

  const resetSyllabi = () => {
    setSyllabi([]);
    setOriginalSyllabi([]);
    setExpandedItems(new Set());
  };

  return {
    syllabi,
    originalSyllabi,
    expandedItems,
    setSyllabi,
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
  };
};

