import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const colors = [
  '#EF4444', // red-500
  '#F97316', // orange-500
  '#F59E0B', // amber-500
  '#EAB308', // yellow-500
  '#84CC16', // lime-500
  '#22C55E', // green-500
  '#10B981', // emerald-500
  '#06B6D4', // cyan-500
  '#0EA5E9', // sky-500
  '#3B82F6', // blue-500
  '#6366F1', // indigo-500
  '#8B5CF6', // violet-500
  '#A855F7', // purple-500
  '#D946EF', // fuchsia-500
  '#EC4899', // pink-500
  '#F43F5E', // rose-500
  '#6B7280', // gray-500
  '#374151', // gray-700
];

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal mt-1"
          style={{ backgroundColor: selectedColor, color: '#fff' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-700"
              style={{ backgroundColor: selectedColor }}
            />
            <span>{selectedColor}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="grid grid-cols-5 gap-2 p-2">
          {colors.map((color) => (
            <div
              key={color}
              className={cn(
                "w-8 h-8 rounded-full cursor-pointer border-2 border-transparent transition-all duration-200",
                selectedColor === color && "border-blue-500 dark:border-blue-400"
              )}
              style={{ backgroundColor: color }}
              onClick={() => onSelectColor(color)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;