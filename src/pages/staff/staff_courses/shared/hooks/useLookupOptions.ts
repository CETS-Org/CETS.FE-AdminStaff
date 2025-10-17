import { useState, useEffect } from 'react';
import { getLookupsByTypeCode, getTimeslots } from '@/api';
import { getCourseCategories, getCourseSkills, getCourseBenefits, getCourseRequirements } from '@/api/course.api';
import type { LookupOption } from '../types/course-form.types';
import { toOptions, toCategoryOptions, toRelationshipOptions, toTimeslotOptions } from '../utils/course-form.utils';

export const useLookupOptions = (isEdit: boolean) => {
  const [courseLevelOptions, setCourseLevelOptions] = useState<LookupOption[]>([]);
  const [courseFormatOptions, setCourseFormatOptions] = useState<LookupOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<LookupOption[]>([]);
  const [skillOptions, setSkillOptions] = useState<LookupOption[]>([]);
  const [benefitOptions, setBenefitOptions] = useState<LookupOption[]>([]);
  const [requirementOptions, setRequirementOptions] = useState<LookupOption[]>([]);
  const [timeslotOptions, setTimeslotOptions] = useState<LookupOption[]>([]);
  const [defaultValues, setDefaultValues] = useState<{
    courseLevelID: string;
    courseFormatID: string;
    categoryID: string;
  } | null>(null);

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

        const levelOpts = toOptions(levelsRes.data);
        const formatOpts = toOptions(formatsRes.data);
        const catOptions = toCategoryOptions(categoriesRes.data);

        setCourseLevelOptions(levelOpts);
        setCourseFormatOptions(formatOpts);
        setCategoryOptions(catOptions);
        setSkillOptions(toRelationshipOptions(skillsRes.data));
        setBenefitOptions(toRelationshipOptions(benefitsRes.data));
        setRequirementOptions(toRelationshipOptions(requirementsRes.data));
        setTimeslotOptions(toTimeslotOptions(timeslotsRes.data));

        if (!isEdit) {
          setDefaultValues({
            courseLevelID: levelOpts[0]?.value || '',
            courseFormatID: formatOpts[0]?.value || '',
            categoryID: catOptions[0]?.value || ''
          });
        }
      } catch (err) {
        console.error('Failed to load lookup options', err);
      }
    };
    loadLookups();
  }, [isEdit]);

  return {
    courseLevelOptions,
    courseFormatOptions,
    categoryOptions,
    skillOptions,
    benefitOptions,
    requirementOptions,
    timeslotOptions,
    defaultValues
  };
};

