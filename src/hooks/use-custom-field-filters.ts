import { useState, useMemo } from "react";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";

export type TemplateType = 'text' | 'number' | 'date' | 'list';

export const useCustomFieldFilters = (customFields: CustomFieldTemplate[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TemplateType | "all">("all");

  // Apply filters using useMemo for performance
  const filteredFields = useMemo(() => {
    let result = [...customFields];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(field =>
        field.name.toLowerCase().includes(term) ||
        (field.description && field.description.toLowerCase().includes(term))
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      result = result.filter(field => field.type === filterType);
    }

    return result;
  }, [customFields, searchTerm, filterType]);

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filteredFields
  };
};