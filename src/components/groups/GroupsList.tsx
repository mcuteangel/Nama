import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Users,
  Plus,
  Sparkles,
  Grid3X3,
  LayoutGrid,
  Eye,
  EyeOff
} from "lucide-react";
import { GlassButton, GradientGlassButton } from "@/components/ui/glass-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmptyState from "../common/EmptyState";
import GroupItem from "./GroupItem";
import AddGroupDialog from "./AddGroupDialog";

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
  searchTerm,
  colorFilter,
  clearFilters,
  handleEditGroup,
  handleDeleteGroup,
  isDeleting,
  storeTriggerElement,
  isAddDialogOpen,
  setIsAddDialogOpen,
  handleGroupSuccess,
  viewMode,
  setViewMode
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="space-y-6"
    >
      {/* List Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('groups.existing_groups')} ({stats.filteredGroups})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('groups.groups_list_description')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white/60 dark:bg-gray-800/60 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <GlassButton
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Grid3X3 size={16} />
            </GlassButton>
            <GlassButton
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <LayoutGrid size={16} />
            </GlassButton>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {stats.filteredGroups} {t('groups.of', 'از')} {stats.totalGroups}
            </div>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-center">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <GradientGlassButton
              className="flex items-center gap-4 px-8 py-5 text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 rounded-2xl group"
            >
              <Plus size={28} className="animate-pulse group-hover:rotate-180 transition-transform duration-500" />
              {t('groups.add_new')}
              <Sparkles className="w-5 h-5 animate-pulse group-hover:scale-125 transition-transform duration-300" />
            </GradientGlassButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 border-none bg-transparent shadow-none">
            <DialogHeader className="sr-only">
              <DialogTitle>{t('groups.add_title', 'افزودن گروه جدید')}</DialogTitle>
            </DialogHeader>
            <AddGroupDialog
              open={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              onGroupAdded={handleGroupSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Groups Display */}
      {filteredGroups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10 rounded-2xl"></div>
          <div className="relative p-8">
            <EmptyState
              icon={Users}
              title={searchTerm || colorFilter !== 'all' ? t('groups.no_filtered_groups', 'هیچ گروهی با فیلترهای انتخابی یافت نشد') : t('groups.empty_title')}
              description={searchTerm || colorFilter !== 'all' ? t('groups.try_different_filters', 'فیلترهای خود را تغییر دهید یا پاک کنید') : t('groups.empty_description')}
            >
              {(searchTerm || colorFilter !== 'all') && (
                <GlassButton
                  variant="glass"
                  onClick={clearFilters}
                  className="px-6 py-3 hover:scale-105 transition-transform duration-300"
                >
                  {t('actions.clear_filters')}
                </GlassButton>
              )}
            </EmptyState>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredGroups.map((group: any, index: number) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              className={viewMode === 'list' ? "max-w-full" : ""}
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
      )}

      {/* Quick Stats */}
      {filteredGroups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex items-center justify-center gap-6 p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl border border-indigo-200/30 dark:border-indigo-800/30 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-indigo-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('groups.showing', 'نمایش')} {stats.filteredGroups} {t('groups.groups', 'گروه')}
            </span>
          </div>

          {stats.filteredGroups !== stats.totalGroups && (
            <div className="flex items-center gap-2">
              <EyeOff size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stats.totalGroups - stats.filteredGroups} {t('groups.hidden', 'مخفی')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {viewMode === 'grid' ? t('groups.grid_view', 'نمای شبکه') : t('groups.list_view', 'نمای لیست')}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GroupsList;