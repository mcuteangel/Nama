import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertCircle, Plus } from 'lucide-react';
import { Tag as TagType, TAG_COLOR_VARIANTS } from '@/types/tag';
import { cn } from '@/lib/utils';
import { GlassButton } from "@/components/ui/glass-button";

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
  const { t } = useTranslation();
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
          aria-label={`${t('common.delete')} ${tag.name}`}
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
  const { t } = useTranslation();
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
          +{remainingCount} {t('common.more')}
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
  error?: string;
  label?: string;
  required?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onAdd,
  onRemove,
  availableColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  placeholder: placeholderProp,
  className,
  error,
  label: labelProp,
  required = false
}) => {
  const { t } = useTranslation();
  const placeholder = placeholderProp || t('tag_input.placeholder');
  const label = labelProp || t('tag_input.label');
  const [inputValue, setInputValue] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(availableColors[0]);
  const [, setIsOpen] = React.useState(false);
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
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
        {required && <span className="text-red-500">*</span>}
      </div>

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
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border-2 border-slate-200/60 dark:border-slate-600/60 backdrop-blur-md transition-all duration-300 ease-out focus-within:ring-4 focus-within:ring-primary-500/30 focus-within:border-primary-400 hover:bg-slate-100/90 dark:hover:bg-slate-700/70 shadow-lg hover:shadow-xl w-full">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-700 dark:text-slate-300"
            />

            <GlassButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddTag}
              disabled={!inputValue.trim()}
              className="bg-slate-100/80 hover:bg-slate-200/90 dark:bg-slate-700/80 dark:hover:bg-slate-600/90 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-3 py-1.5 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Plus size={14} className="ml-2" />
              {t('common.add')}
            </GlassButton>
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-1">
            {availableColors.slice(0, 5).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-all hover:scale-110 shadow-lg',
                  selectedColor === color
                    ? 'border-slate-900 dark:border-slate-100 scale-110 shadow-xl'
                    : 'border-slate-300/60 dark:border-slate-600/60 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-lg'
                )}
                style={{ backgroundColor: color }}
                aria-label={`${t('tag_input.select_color')} ${color}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};