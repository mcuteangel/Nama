import React, { useState } from "react";
import { Edit, Trash2, Users, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard } from "@/components/ui/modern-card";
import StandardizedDeleteDialog from "@/components/common/StandardizedDeleteDialog";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Group {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
}

interface GroupItemProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (groupId: string, groupName: string) => void;
  isDeleting?: boolean;
}

const GroupItem: React.FC<GroupItemProps> = ({
  group,
  onEdit,
  onDelete,
  isDeleting = false
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{id: string, name: string} | null>(null);
  const { storeTriggerElement } = useDialogFocus();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGroup({ id: group.id, name: group.name });
    setDeleteDialogOpen(true);
    storeTriggerElement();
  };

  return (
    <>
      <ModernCard
        variant="glass"
        hover="lift"
        className={`
          group relative overflow-hidden
          p-6 rounded-3xl shadow-xl
          border-2 border-white/40 dark:border-gray-600/40
          backdrop-blur-xl
          bg-gradient-to-br from-white/50 via-white/30 to-white/20
          dark:from-gray-800/50 dark:via-gray-800/30 dark:to-gray-800/20
          hover:from-white/60 hover:via-white/40 hover:to-white/30
          dark:hover:from-gray-700/60 dark:hover:via-gray-700/40 dark:hover:to-gray-700/30
          transition-all duration-500 ease-out
          transform hover:-translate-y-2 hover:scale-[1.02]
          hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-900/30
          hover:border-purple-300/50 dark:hover:border-purple-600/50
          ${isDeleting ? 'opacity-75 pointer-events-none' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="article"
        aria-labelledby={`group-${group.id}-title`}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

        {/* Sparkle effect on hover */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
          <Sparkles size={20} className="text-purple-400 animate-pulse" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Enhanced avatar with better animations */}
              <div
                className={`
                  relative w-20 h-20 rounded-2xl flex items-center justify-center
                  border-3 border-white/60 dark:border-gray-400/60
                  shadow-2xl backdrop-blur-md
                  transform transition-all duration-500 ease-out
                  group-hover:scale-110 group-hover:rotate-3
                  ${group.color ? '' : 'bg-gradient-to-br from-gray-400 to-gray-600'}
                `}
                style={{
                  backgroundColor: group.color ? `${group.color}E6` : undefined,
                  boxShadow: group.color ? `0 20px 40px ${group.color}40, inset 0 1px 0 rgba(255,255,255,0.2)` : undefined
                }}
                aria-hidden="true"
              >
                <Users
                  size={32}
                  className="text-white drop-shadow-lg transform transition-transform duration-300 group-hover:scale-110"
                />

                {/* Inner glow effect */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle, ${group.color || '#6366f1'} 0%, transparent 70%)`
                  }}
                ></div>
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  id={`group-${group.id}-title`}
                  className="font-bold text-2xl text-gray-800 dark:text-white mb-2 truncate drop-shadow-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300"
                >
                  {group.name}
                </h3>

                {group.color && (
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {t('groups.color')}:
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white/50 shadow-lg"
                        style={{ backgroundColor: group.color }}
                        aria-hidden="true"
                      ></div>
                      <span className="px-3 py-1.5 rounded-xl text-white text-sm font-semibold shadow-lg backdrop-blur-sm bg-black/20 border border-white/20">
                        {group.color.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced action buttons */}
          <div className={`
            flex gap-4 mt-auto pt-6
            border-t border-white/30 dark:border-gray-700/50
            transition-all duration-300
            ${isHovered ? 'opacity-100 transform translate-y-0' : 'opacity-80 transform translate-y-1'}
          `}>
            <GlassButton
              variant="glass"
              size="sm"
              onClick={() => onEdit(group)}
              className="
                flex-1 flex items-center justify-center gap-3
                text-blue-600 dark:text-blue-300
                hover:bg-blue-500/20 dark:hover:bg-blue-400/20
                hover:text-blue-700 dark:hover:text-blue-200
                transition-all duration-300 ease-out
                hover-lift hover:shadow-lg hover:shadow-blue-500/30
                py-3 px-4 rounded-2xl
                border-2 border-blue-200/50 dark:border-blue-800/50
                hover:border-blue-300/70 dark:hover:border-blue-700/70
                font-semibold text-base
                focus:ring-4 focus:ring-blue-500/30 focus:outline-none
              "
              aria-label={`${t('actions.edit')} ${group.name}`}
            >
              <Edit size={20} className="transition-transform duration-300 group-hover:scale-110" />
              <span>{t('actions.edit')}</span>
            </GlassButton>

            <GlassButton
              variant="glass"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="
                flex-1 flex items-center justify-center gap-3
                text-red-600 dark:text-red-400
                hover:bg-red-500/20 dark:hover:bg-red-400/20
                hover:text-red-700 dark:hover:text-red-200
                transition-all duration-300 ease-out
                hover-lift hover:shadow-lg hover:shadow-red-500/30
                py-3 px-4 rounded-2xl
                border-2 border-red-200/50 dark:border-red-800/50
                hover:border-red-300/70 dark:hover:border-red-700/70
                font-semibold text-base
                focus:ring-4 focus:ring-red-500/30 focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              aria-label={`${t('actions.delete')} ${group.name}`}
            >
              {isDeleting ? (
                <LoadingSpinner size={20} className="text-red-500" />
              ) : (
                <Trash2 size={20} className="transition-transform duration-300 group-hover:scale-110" />
              )}
              <span>{isDeleting ? t('common.deleting') : t('actions.delete')}</span>
            </GlassButton>
          </div>
        </div>
      </ModernCard>

      {/* Enhanced Delete Dialog */}
      {selectedGroup && (
        <StandardizedDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={() => {
            if (selectedGroup) {
              onDelete(selectedGroup.id, selectedGroup.name);
            }
          }}
          title={t('groups.delete_confirm_title')}
          description={t('groups.delete_confirm_description', { name: selectedGroup.name })}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default GroupItem;