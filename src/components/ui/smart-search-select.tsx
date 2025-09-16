import * as React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SmartSearchSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string; keywords?: string[] }>;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  disabled?: boolean;
  maxVisibleItems?: number;
}

const SmartSearchSelect = React.forwardRef<
  React.ElementRef<typeof ModernSelect>,
  SmartSearchSelectProps
>(({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  noResultsText,
  className,
  triggerClassName,
  contentClassName,
  itemClassName,
  disabled = false,
  maxVisibleItems = 10,
}, ref) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    
    const term = searchTerm.toLowerCase().trim();
    if (!term) return options;
    
    return options.filter(option => {
      // Check if the search term matches the label
      if (option.label.toLowerCase().includes(term)) return true;
      
      // Check if the search term matches the value
      if (option.value.toLowerCase().includes(term)) return true;
      
      // Check if the search term matches any keywords
      if (option.keywords) {
        return option.keywords.some(keyword => 
          keyword.toLowerCase().includes(term)
        );
      }
      
      return false;
    });
  }, [options, searchTerm]);

  // Limit the number of visible items
  const visibleOptions = useMemo(() => {
    return filteredOptions.slice(0, maxVisibleItems);
  }, [filteredOptions, maxVisibleItems]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure the dropdown is fully rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const selectedOption = options.find(option => option.value === value);

  return (
    <ModernSelect 
      value={value}
      onValueChange={onValueChange}
      open={isOpen}
      onOpenChange={setIsOpen}
      disabled={disabled}
    >
      <ModernSelectTrigger 
        variant="glass"
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl border-2 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm transition-all duration-300 ease-out focus:ring-4 focus:ring-primary-500/30 focus:border-primary-400 hover:bg-white/80 dark:hover:bg-gray-600/80 hover:shadow-lg hover:shadow-primary-500/20 border-white/50 dark:border-gray-600/50",
          triggerClassName
        )}
      >
        <ModernSelectValue placeholder={placeholder || t('common.select_placeholder', 'Select an option')}>
          {selectedOption ? (
            <span className="truncate">{selectedOption.label}</span>
          ) : null}
        </ModernSelectValue>
      </ModernSelectTrigger>
      
      <ModernSelectContent 
        variant="glass"
        className={cn(
          "bg-white/90 dark:bg-gray-800/90 border border-white/30 dark:border-gray-600/30 rounded-2xl p-0",
          "max-h-[300px] overflow-hidden",
          contentClassName
        )}
        align="start"
      >
        {/* Search Input */}
        <div className="sticky top-0 z-10 p-2 bg-white/80 dark:bg-gray-800/80 border-b border-white/30 dark:border-gray-600/30">
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" 
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder || t('common.search_placeholder', 'Search...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm rounded-lg border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        {/* Options List */}
        <div className="max-h-[200px] overflow-y-auto">
          {visibleOptions.length > 0 ? (
            visibleOptions.map((option) => (
              <ModernSelectItem
                key={option.value}
                value={option.value}
                className={cn(
                  "px-4 py-3 text-sm hover:bg-white/20 dark:hover:bg-gray-700/50 rounded-lg m-1 transition-colors",
                  itemClassName,
                  value === option.value && "bg-primary-100/50 dark:bg-primary-900/30"
                )}
              >
                <div className="flex items-center">
                  <span className="truncate">{option.label}</span>
                </div>
              </ModernSelectItem>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {noResultsText || t('common.no_results_found', 'No results found')}
            </div>
          )}
        </div>
      </ModernSelectContent>
    </ModernSelect>
  );
});

SmartSearchSelect.displayName = "SmartSearchSelect";

export { SmartSearchSelect };