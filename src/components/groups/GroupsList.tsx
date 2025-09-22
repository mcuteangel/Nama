import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Users, Plus, Grid, List, Filter, Search, X, Eye, EyeOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('groups.existing_groups')}
            </h1>
            <p className="text-muted-foreground">
              {t('groups.groups_list_description')}
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('groups.add_new')}
              </Button>
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
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('groups.search_groups')}
              className="pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={colorFilter} onValueChange={handleColorFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by color" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      {option.color && option.color !== 'all' && (
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4" />
            </Button>

            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('common.filters')}:
            </span>
            {searchTerm && (
              <div className="inline-flex items-center bg-muted px-3 py-1 rounded-full text-sm">
                <span className="mr-2">{t('common.search')}: {searchTerm}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {colorFilter && colorFilter !== 'all' && (
              <div className="inline-flex items-center bg-muted px-3 py-1 rounded-full text-sm">
                <span className="mr-2">
                  {t('groups.color')}: {colorOptions.find(c => c.value === colorFilter)?.label}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => setColorFilter('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-sm text-primary"
              onClick={clearAllFilters}
            >
              {t('actions.clear_all')}
            </Button>
          </div>
        )}
      </div>

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
                  <Button 
                    variant="outline" 
                    onClick={clearAllFilters}
                    className="mt-4"
                  >
                    {t('actions.clear_filters')}
                  </Button>
                )}
              </EmptyState>
            </motion.div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
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
                      delay: index * 0.05,
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
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center gap-6 p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl border border-indigo-200/30 dark:border-indigo-800/30 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-indigo-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('groups.showing')} {stats.filteredGroups} {t('groups.groups')}
            </span>
          </div>

          {stats.filteredGroups !== stats.totalGroups && (
            <div className="flex items-center gap-2">
              <EyeOff size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stats.totalGroups - stats.filteredGroups} {t('groups.hidden')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {viewMode === 'grid' ? t('groups.grid_view') : t('groups.list_view')}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GroupsList;