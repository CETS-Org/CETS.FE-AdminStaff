import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Plus } from "lucide-react";

interface CourseBasicInfoProps {
  formData: {
    name: string;
    level: string;
    duration: string;
    price: string;
  };
  errors: Record<string, string>;
  onFormDataChange: (field: string, value: string) => void;
}

export default function CourseBasicInfo({ formData, errors, onFormDataChange }: CourseBasicInfoProps) {
  const levelOptions = [
    { label: "Beginner", value: "Beginner" },
    { label: "A1", value: "A1" },
    { label: "A2", value: "A2" },
    { label: "B1", value: "B1" },
    { label: "B2", value: "B2" },
    { label: "C1", value: "C1" },
    { label: "C2", value: "C2" },
    { label: "A1-B1", value: "A1-B1" },
    { label: "B2-C1", value: "B2-C1" },
    { label: "All levels", value: "All levels" }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Basic Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Course Name *"
          placeholder="Enter course name"
          value={formData.name}
          onChange={(e) => onFormDataChange('name', e.target.value)}
          error={errors.name}
        />
        <Select
          label="Level *"
          value={formData.level}
          onChange={(e) => onFormDataChange('level', e.target.value)}
          options={levelOptions}
          error={errors.level}
        />
        <Input
          label="Duration *"
          placeholder="e.g., 6 months, 12 weeks"
          value={formData.duration}
          onChange={(e) => onFormDataChange('duration', e.target.value)}
          error={errors.duration}
        />
        <Input
          label="Price (VND) *"
          type="number"
          placeholder="Enter price"
          value={formData.price}
          onChange={(e) => onFormDataChange('price', e.target.value)}
          error={errors.price}
        />
      </div>
    </div>
  );
}
