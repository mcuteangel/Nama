import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  X,
  Sparkles,
  Palette,
  Target
} from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernInput } from "@/components/ui/modern-input";
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { Badge } from "@/components/ui/badge";

interface GroupsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  colorFilter: string;
  setColorFilter: (color: string) => void;
  availableColors: string[];
  clearFilters: () => void;
  isRTL: boolean;
}

const GroupsFilters: React.FC<GroupsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  colorFilter,
  setColorFilter,
  availableColors,
  clearFilters,
  isRTL
}) => {
  const { t } = useTranslation();

  const getColorIcon = (color: string | undefined) => {
    return color ? '🎨' : '⚪';
  };

  const getColorLabel = (color: string | undefined) => {
    if (!color) return t('groups.no_color', 'بدون رنگ');
    return `${t('groups.color', 'رنگ')} ${color}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-6"
    >
      {/* Filters Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('groups.filters_title', 'فیلترها')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('groups.filters_description', 'گروه‌ها را بر اساس نام و رنگ فیلتر کنید')}
            </p>
          </div>
        </div>

        {(searchTerm || colorFilter !== 'all') && (
          <GlassButton
            variant="glass"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-105 group"
          >
            <X size={16} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
            {t('actions.clear_filters', 'پاک کردن فیلترها')}
          </GlassButton>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Input */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300`} size={20} />
            <ModernInput
              placeholder={t('groups.search_placeholder', 'جستجو گروه‌ها...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl`}
              variant="glass"
            />
            {searchTerm && (
              <div className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2`}>
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {t('groups.search_term')}: {searchTerm}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Color Filter */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
          <div className="relative">
            <ModernSelect
              value={colorFilter}
              onValueChange={setColorFilter}
            >
              <ModernSelectTrigger
                variant="glass"
                className="w-full py-4 text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getColorIcon(colorFilter === 'all' ? undefined : colorFilter)}</span>
                  <ModernSelectValue placeholder={t('groups.filter_all_colors', 'همه رنگ‌ها')} />
                </div>
              </ModernSelectTrigger>
              <ModernSelectContent
                variant="glass"
                className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl"
              >
                <ModernSelectItem
                  value="all"
                  className="py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🎯</span>
                    <span className="font-medium">{t('groups.filter_all_colors')}</span>
                    <Sparkles size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </ModernSelectItem>
                {availableColors.map((color) => (
                  <ModernSelectItem
                    key={color}
                    value={color}
                    className="py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getColorIcon(color)}</span>
                      <span className="font-medium">{getColorLabel(color)}</span>
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white/50 shadow-lg"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                    </div>
                  </ModernSelectItem>
                ))}
              </ModernSelectContent>
            </ModernSelect>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(searchTerm || colorFilter !== 'all') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 backdrop-blur-sm"
        >
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('groups.active_filters', 'فیلترهای فعال')}:
            </span>
            {searchTerm && (
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600 hover:scale-105 transition-transform duration-300">
                <Search size={12} className="mr-1" />
                {t('groups.search')}: "{searchTerm}"
              </Badge>
            )}
            {colorFilter !== 'all' && (
              <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600 hover:scale-105 transition-transform duration-300">
                <Palette size={12} className="mr-1" />
                {t('groups.color')}: {getColorLabel(colorFilter)}
                <div
                  className="w-3 h-3 rounded-full ml-2 border border-white/50"
                  style={{ backgroundColor: colorFilter }}
                  aria-hidden="true"
                />
              </Badge>
            )}
          </div>
        </motion.div>
      )}

      {/* Quick Filter Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-wrap items-center gap-3"
      >
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {t('groups.quick_filters', 'فیلترهای سریع')}:
        </span>

        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => setColorFilter('all')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
            colorFilter === 'all'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Target size={14} className="mr-1" />
          {t('groups.all', 'همه')}
        </GlassButton>

        {availableColors.slice(0, 3).map((color) => (
          <GlassButton
            key={color}
            variant="ghost"
            size="sm"
            onClick={() => setColorFilter(color)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
              colorFilter === color
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full mr-2 border border-white/50"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            {color.toUpperCase()}
          </GlassButton>
        ))}

        {availableColors.length > 3 && (
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => setColorFilter(availableColors[3])}
            className="px-3 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
          >
            <Palette size={14} className="mr-1" />
            +{availableColors.length - 3}
          </GlassButton>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GroupsFilters;