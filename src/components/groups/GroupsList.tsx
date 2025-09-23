import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Users, Plus, Grid, List, Filter, Search, X, Eye, EyeOff, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmptyState from "../common/EmptyState";
import GroupItem from "./GroupItem";
import AddGroupDialog from "./AddGroupDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ModernCard } from "@/components/ui/modern-card";

// رنگ‌های پیش‌فرض برای فیلتر رنگ
const colorOptions = [
  { value: "all", label: "All Colors", color: "currentColor" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "8b5cf6", label: "Purple" },
];

interface Group {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
}

interface GroupsListProps {
  filteredGroups: Group[];
  stats: {
    filteredGroups: number;
    totalGroups: number;
  };
  searchTerm: string;
  colorFilter: string;
  clearFilters: () => void;
  handleEditGroup: (group: Group) => void;
  handleDeleteGroup: (groupId: string, groupName: string) => void;
  isDeleting: string | null;
  storeTriggerElement: () => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  handleGroupSuccess: () => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const GroupsList: React.FC<GroupsListProps> = ({
  filteredGroups,
  stats,
  searchTerm: initialSearchTerm,
  colorFilter: initialColorFilter,
  clearFilters,
  handleEditGroup,
  handleDeleteGroup,
  isDeleting,
  storeTriggerElement,
  isAddDialogOpen,
  setIsAddDialogOpen,
  handleGroupSuccess,
  viewMode: initialViewMode,
  setViewMode: setInitialViewMode
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [colorFilter, setColorFilter] = useState(initialColorFilter);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update parent state when local state changes
  React.useEffect(() => {
    setInitialViewMode(viewMode);
  }, [viewMode, setInitialViewMode]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleColorFilterChange = (value: string) => {
    setColorFilter(value);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setColorFilter('all');
    clearFilters();
  };

  const hasActiveFilters = searchTerm || (colorFilter && colorFilter !== 'all');

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <ModernCard className="p-6 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/50 border border-white/20 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t('groups.existing_groups')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('groups.groups_list_description')}
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 glass-advanced text-foreground border border-white/20 hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-md h-10 px-4 py-2 hover-lift gap-2"
                onClick={() => storeTriggerElement()}
              >
                <Plus className="h-4 w-4" />
                {t('groups.add_new')}
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('groups.add_group')}</DialogTitle>
              </DialogHeader>
              <AddGroupDialog 
                open={isAddDialogOpen} 
                onOpenChange={setIsAddDialogOpen} 
                onGroupAdded={handleGroupSuccess} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="mt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder={t('groups.search_groups')}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all duration-200 backdrop-blur-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative group">
                <Select value={colorFilter} onValueChange={handleColorFilterChange}>
                  <SelectTrigger className="w-[180px] bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700/50 transition-colors">
                    <SelectValue placeholder={t('groups.filter_by_color')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
                    {colorOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center">
                          {option.color && option.color !== 'all' && (
                            <span 
                              className="w-3 h-3 rounded-full mr-2 shadow-sm" 
                              style={{ backgroundColor: option.color }}
                            />
                          )}
                          <span className="text-gray-800 dark:text-gray-200">
                            {option.label}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-white/70 dark:hover:bg-gray-700/50 transition-colors md:hidden"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                      <Filter className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{t('common.filters')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="hidden md:flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{t('groups.grid_view')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{t('groups.list_view')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

        </div>
        {/* Active filters */}
        {hasActiveFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap items-center gap-3 mt-4 p-3 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
              {t('common.filters')}:
            </span>
            
            <div className="flex flex-wrap items-center gap-2">
              {searchTerm && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center bg-white/70 dark:bg-gray-800/70 px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <span className="text-gray-800 dark:text-gray-200 mr-2">
                    {t('common.search')}: <span className="font-medium">{searchTerm}</span>
                  </span>
                  <button 
                    className="p-0.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => setSearchTerm('')}
                    aria-label={t('actions.remove_filter')}
                  >
                    <X className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                  </button>
                </motion.div>
              )}
              
              {colorFilter && colorFilter !== 'all' && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center bg-white/70 dark:bg-gray-800/70 px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <span className="text-gray-800 dark:text-gray-200 mr-2">
                    {t('groups.color')}: 
                    <span className="font-medium inline-flex items-center">
                      <span 
                        className="w-2.5 h-2.5 rounded-full mr-1.5 inline-block"
                        style={{ backgroundColor: colorFilter }}
                      />
                      {colorOptions.find(c => c.value === colorFilter)?.label}
                    </span>
                  </span>
                  <button 
                    className="p-0.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => setColorFilter('all')}
                    aria-label={t('actions.remove_filter')}
                  >
                    <X className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                  </button>
                </motion.div>
              )}
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={clearAllFilters}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center px-2 py-1 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
              >
                <X className="h-3.5 w-3.5 ml-1" />
                {t('actions.clear_all')}
              </motion.button>
            </div>
          </motion.div>
        )}

      </ModernCard>

      {/* Groups List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4 -mr-4">
          {filteredGroups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full flex items-center justify-center py-12"
            >
              <EmptyState
                icon={Users}
                title={
                  searchTerm || colorFilter !== 'all' 
                    ? t('groups.no_filtered_groups') 
                    : t('groups.empty_title')
                }
                description={
                  searchTerm || colorFilter !== 'all'
                    ? t('groups.try_different_filters')
                    : t('groups.empty_description')
                }
              >
                {(searchTerm || colorFilter !== 'all') && (
                  <button 
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30"
                  >
                    <X className="h-3.5 w-3.5" />
                    {t('actions.clear_filters')}
                  </button>
                )}
              </EmptyState>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6'
                    : 'space-y-4 pb-6',
                  'py-2' // Add some padding for better scroll appearance
                )}
              >
                {filteredGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.03,
                      type: "spring",
                      stiffness: 100
                    }}
                    className={cn(
                      'transform transition-all duration-300 hover:-translate-y-1',
                      viewMode === 'list' && 'w-full max-w-3xl mx-auto'
                    )}
                  >
                    <GroupItem
                      group={group}
                      onEdit={handleEditGroup}
                      onDelete={(groupId: string, groupName: string) => {
                        handleDeleteGroup(groupId, groupName);
                        storeTriggerElement();
                      }}
                      isDeleting={isDeleting === group.id}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </div>

      {/* Quick Stats */}
      {filteredGroups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm"
        >
          <div className="flex items-center gap-2 bg-indigo-50/70 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg">
              <Eye size={16} className="text-indigo-600 dark:text-indigo-300" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('groups.showing')} <span className="font-bold text-indigo-700 dark:text-indigo-300">{stats.filteredGroups}</span> {t('groups.groups')}
            </span>
          </div>

          {stats.filteredGroups !== stats.totalGroups && (
            <div className="flex items-center gap-2 bg-amber-50/70 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-800/50 rounded-lg">
                <EyeOff size={16} className="text-amber-600 dark:text-amber-300" />
              </div>
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {stats.totalGroups - stats.filteredGroups} {t('groups.hidden')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-purple-50/70 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
              <Sparkles size={16} className="text-purple-600 dark:text-purple-300" />
            </div>
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {viewMode === 'grid' ? t('groups.grid_view') : t('groups.list_view')}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GroupsList;