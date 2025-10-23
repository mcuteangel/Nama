import React from 'react';
import { Check } from "lucide-react";

interface ContactCheckboxProps {
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}

export const ContactCheckbox: React.FC<ContactCheckboxProps> = ({
  isSelected,
  onSelect
}) => {
  return (
    <div
      className={`absolute top-3 right-3 z-20 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
        isSelected
          ? 'border-primary-500 bg-primary-500'
          : 'border-gray-300 bg-white group-hover:border-primary-400'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(!isSelected);
      }}
    >
      {isSelected && (
        <Check className="h-4 w-4 text-white transition-transform duration-200" />
      )}
    </div>
  );
};
