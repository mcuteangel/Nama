import React from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, Sparkles, X } from "lucide-react";
import { ModernInput } from "@/components/ui/modern-input";
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { GlassButton } from "@/components/ui/glass-button";
import { Badge } from "@/components/ui/badge";

type TemplateType = 'text' | 'number' | 'date' | 'list' | 'checklist';

interface CustomFieldFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: TemplateType | "all";
  onFilterChange: (value: TemplateType | "all") => void;
}

export const CustomFieldFilters: React.FC<CustomFieldFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange
}) => {
  const { t } = useTranslation();

  const getTypeIcon = (type: TemplateType | "all") => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'list': return '📋';
      case 'checklist': return '✅';
      default: return '🎯';
    }
  };

  const getTypeLabel = (type: TemplateType | "all") => {
    switch (type) {
      case 'text': return t('contact_form.text');
      case 'number': return t('contact_form.number');
      case 'date': return t('contact_form.date');
      case 'list': return t('contact_form.list');
      case 'checklist': return t('contact_form.checklist');
      default: return t('custom_field_management.filter_all');
    }
  };

  const clearFilters = () => {
    onSearchChange("");
    onFilterChange("all");
  };

  const hasActiveFilters = searchTerm || filterType !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('custom_field_management.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('custom_field_management.filter_description')}
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <GlassButton
            variant="glass"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-105"
          >
            <X size={16} className="mr-2" />
            {t('actions.clear_filters')}
          </GlassButton>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" size={20} />
              <ModernInput
                placeholder={t('custom_field_management.search_placeholder')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 pr-4 py-4 text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
                variant="glass"
              />
              {searchTerm && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {t('custom_field_management.search_term')}: {searchTerm}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
            <div className="relative">
              <ModernSelect
                value={filterType}
                onValueChange={onFilterChange}
              >
                <ModernSelectTrigger
                  variant="glass"
                  className="w-full py-4 text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getTypeIcon(filterType)}</span>
                    <ModernSelectValue placeholder={t('custom_field_management.filter_all')} />
                  </div>
                </ModernSelectTrigger>
                <ModernSelectContent
                  variant="glass"
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl"
                >
                  <ModernSelectItem
                    value="all"
                    className="py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🎯</span>
                      <span className="font-medium">{t('custom_field_management.filter_all')}</span>
                    </div>
                  </ModernSelectItem>
                  <ModernSelectItem
                    value="text"
                    className="py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📝</span>
                      <span className="font-medium">{t('contact_form.text')}</span>
                    </div>
                  </ModernSelectItem>
                  <ModernSelectItem
                    value="number"
                    className="py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🔢</span>
                      <span className="font-medium">{t('contact_form.number')}</span>
                    </div>
                  </ModernSelectItem>
                  <ModernSelectItem
                    value="date"
                    className="py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📅</span>
                      <span className="font-medium">{t('contact_form.date')}</span>
                    </div>
                  </ModernSelectItem>
                  <ModernSelectItem
                    value="list"
                    className="py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📋</span>
                      <span className="font-medium">{t('contact_form.list')}</span>
                    </div>
                  </ModernSelectItem>
                  <ModernSelectItem
                    value="checklist"
                    className="py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">✅</span>
                      <span className="font-medium">{t('contact_form.checklist')}</span>
                    </div>
                  </ModernSelectItem>
                </ModernSelectContent>
              </ModernSelect>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('custom_field_management.active_filters')}:
            </span>
            {searchTerm && (
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600">
                {t('custom_field_management.search')}: "{searchTerm}"
              </Badge>
            )}
            {filterType !== "all" && (
              <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600">
                {t('custom_field_management.type')}: {getTypeLabel(filterType)}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};