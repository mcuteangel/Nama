import React from 'react';
import { X } from 'lucide-react';
import { Tag as TagType, TAG_COLOR_VARIANTS } from '@/types/tag';
import { cn } from '@/lib/utils';

export interface TagProps {
  tag: TagType;
  onRemove?: (tagId: string) => void;
  removable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  tag,
  onRemove,
  removable = false,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors',
        TAG_COLOR_VARIANTS[tag.color as keyof typeof TAG_COLOR_VARIANTS] || TAG_COLOR_VARIANTS.blue,
        sizeClasses[size],
        removable && 'pr-1',
        className
      )}
      style={{
        backgroundColor: `${tag.color}20`,
        borderColor: `${tag.color}40`,
        color: tag.color
      }}
    >
      <span className="truncate max-w-[120px]">{tag.name}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(tag.id);
          }}
          className="flex items-center justify-center rounded-full hover:bg-black/10 transition-colors p-0.5 ml-1"
          aria-label={`حذف تگ ${tag.name}`}
        >
          <X size={iconSizes[size]} className="text-current" />
        </button>
      )}
    </span>
  );
};

export interface TagListProps {
  tags: TagType[];
  onRemove?: (tagId: string) => void;
  removable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  className?: string;
}

export const TagList: React.FC<TagListProps> = ({
  tags,
  onRemove,
  removable = false,
  size = 'md',
  maxDisplay = 3,
  className
}) => {
  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {displayTags.map((tag) => (
        <Tag
          key={tag.id}
          tag={tag}
          onRemove={onRemove}
          removable={removable}
          size={size}
        />
      ))}

      {remainingCount > 0 && (
        <span className="text-sm text-muted-foreground px-2 py-1">
          +{remainingCount} بیشتر
        </span>
      )}
    </div>
  );
};

export interface TagInputProps {
  tags: TagType[];
  onAdd?: (tagName: string, color: string) => void;
  onRemove?: (tagId: string) => void;
  availableColors?: string[];
  placeholder?: string;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onAdd,
  onRemove,
  availableColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  placeholder = 'تگ جدید اضافه کنید...',
  className
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(availableColors[0]);
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleAddTag = () => {
    if (inputValue.trim() && onAdd) {
      onAdd(inputValue.trim(), selectedColor);
      setInputValue('');
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Existing tags */}
      {tags.length > 0 && (
        <TagList
          tags={tags}
          onRemove={onRemove}
          removable={true}
          size="md"
        />
      )}

      {/* Add new tag */}
      <div className="relative">
        <div className="flex items-center gap-2 p-3 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
          />

          {/* Color picker */}
          <div className="flex items-center gap-1">
            {availableColors.slice(0, 5).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'w-6 h-6 rounded-full border-2 transition-all',
                  selectedColor === color
                    ? 'border-foreground scale-110'
                    : 'border-muted-foreground/30 hover:border-muted-foreground/60'
                )}
                style={{ backgroundColor: color }}
                aria-label={`انتخاب رنگ ${color}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddTag}
            disabled={!inputValue.trim()}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            اضافه
          </button>
        </div>
      </div>
    </div>
  );
};