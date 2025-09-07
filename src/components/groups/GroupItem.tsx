import React, { useState } from "react";
import { Edit, Trash2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard } from "@/components/ui/modern-card";
import StandardizedDeleteDialog from "@/components/common/StandardizedDeleteDialog";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

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
        className="flex flex-col p-6 rounded-2xl shadow-lg border-2 border-white/30 dark:border-gray-600/30 backdrop-blur-lg bg-white/30 dark:bg-gray-800/40 hover:bg-white/40 dark:hover:bg-gray-700/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-white/50 dark:border-gray-400/50 shadow-xl backdrop-blur-md bg-white/30 dark:bg-gray-800/40 transform transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: group.color || "#cccccc" }}
            >
              <Users size={24} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-1 drop-shadow-sm">
                {group.name}
              </h3>
              {group.color && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('groups.color')}:</span>
                  <span
                    className="px-3 py-1 rounded-full text-white font-medium shadow-lg glass-advanced"
                    style={{ backgroundColor: group.color }}
                  >
                    {group.color}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-auto pt-4 border-t border-white/20 dark:border-gray-700/50">
          <GlassButton
            variant="glass"
            size="sm"
            onClick={() => onEdit(group)}
            className="flex-1 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-300 hover:bg-blue-100/40 dark:hover:bg-blue-900/30 transition-all duration-300 hover-lift py-2.5 border-2 border-blue-200/50 dark:border-blue-800/50 rounded-xl hover:shadow-md hover:shadow-blue-200/30 dark:hover:shadow-blue-900/20"
          >
            <Edit size={18} />
            {t('actions.edit')}
          </GlassButton>

          <GlassButton
            variant="glass"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-100/40 dark:hover:bg-red-900/30 transition-all duration-300 hover-lift py-2.5 px-4 rounded-xl border-2 border-red-200/50 dark:border-red-800/50 hover:shadow-md hover:shadow-red-200/30 dark:hover:shadow-red-900/20 text-sm font-medium"
          >
            <Trash2 size={18} />
            {t('actions.delete')}
          </GlassButton>
        </div>
      </ModernCard>

      {/* Standardized Delete Dialog */}
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
          description={t('groups.delete_confirm_description')}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default GroupItem;