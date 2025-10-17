import { useState } from 'react';
import type { RelationshipData } from '../types/course-form.types';

export const useCourseRelationships = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);

  const [originalSkillRelations, setOriginalSkillRelations] = useState<RelationshipData[]>([]);
  const [originalBenefitRelations, setOriginalBenefitRelations] = useState<RelationshipData[]>([]);
  const [originalRequirementRelations, setOriginalRequirementRelations] = useState<RelationshipData[]>([]);

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

  const loadSkills = (courseSkills: any[]) => {
    setSelectedSkills(courseSkills.map((skill: any) => skill.skillID));
    setOriginalSkillRelations(courseSkills.map((skill: any) => ({
      relationshipId: skill.id,
      lookupId: skill.skillID
    })));
  };

  const loadBenefits = (benefits: any[]) => {
    setSelectedBenefits(benefits.map((benefit: any) => benefit.benefitID));
    setOriginalBenefitRelations(benefits.map((benefit: any) => ({
      relationshipId: benefit.id,
      lookupId: benefit.benefitID
    })));
  };

  const loadRequirements = (requirements: any[]) => {
    setSelectedRequirements(requirements.map((req: any) => req.requirementID));
    setOriginalRequirementRelations(requirements.map((req: any) => ({
      relationshipId: req.id,
      lookupId: req.requirementID
    })));
  };

  const resetRelationships = () => {
    setSelectedSkills([]);
    setSelectedBenefits([]);
    setSelectedRequirements([]);
    setOriginalSkillRelations([]);
    setOriginalBenefitRelations([]);
    setOriginalRequirementRelations([]);
  };

  return {
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
  };
};

