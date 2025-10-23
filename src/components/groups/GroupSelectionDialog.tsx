import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Users, CheckCircle, AlertCircle } from "lucide-react";
import { useGroups } from "@/hooks/use-groups";
import { useSession } from "@/integrations/supabase/auth";
import { useTranslation } from "react-i18next";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard } from "@/components/ui/modern-card";
import LoadingSpinner from "../common/LoadingSpinner";
import LoadingMessage from "../common/LoadingMessage";

interface GroupSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupSelected: (groupId: string) => void;
  selectedContactCount: number;
}

const GroupSelectionDialog: React.FC<GroupSelectionDialogProps> = ({
  open,
  onOpenChange,
  onGroupSelected,
  selectedContactCount
}) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { groups, loadingGroups, fetchGroups } = useGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  // فراخوانی fetchGroups وقتی دیالوگ باز میشه
  React.useEffect(() => {
    if (open && session?.user) {
      fetchGroups();
    }
  }, [open, session, fetchGroups]);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleConfirm = () => {
    if (selectedGroupId) {
      onGroupSelected(selectedGroupId);
      onOpenChange(false);
      setSelectedGroupId("");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedGroupId("");
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-3xl border-2 border-white/50 dark:border-gray-600/50 shadow-3xl p-0 overflow-hidden max-w-md w-full">
        <div className="relative">
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-white/30 dark:border-gray-700/50">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Users size={24} className="text-white" />
              </div>
              <div className="text-center">
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t('groups.select_group')}
                </DialogTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('groups.select_group_for_contacts', { count: selectedContactCount })}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-6">
            {loadingGroups ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <LoadingSpinner size={32} className="text-blue-500 mx-auto" />
                  <LoadingMessage message={t('common.loading_groups')} />
                </div>
              </div>
            ) : groups.length === 0 ? (
              <ModernCard className="w-full rounded-2xl p-6 border-2 border-orange-200/40 dark:border-orange-800/40 backdrop-blur-sm bg-orange-50/60 dark:bg-orange-900/20 text-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto">
                    <AlertCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-2">
                      {t('groups.no_groups_found')}
                    </h3>
                    <p className="text-orange-500 dark:text-orange-300 text-sm">
                      {t('groups.no_groups_found_desc')}
                    </p>
                  </div>
                  <GlassButton
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                  >
                    {t('actions.close')}
                  </GlassButton>
                </div>
              </ModernCard>
            ) : (
              <div className="space-y-4">
                {/* Group List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => handleGroupSelect(group.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedGroupId === group.id
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white/60 dark:bg-gray-700/60 hover:bg-gray-50/80 dark:hover:bg-gray-600/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: group.color || '#60A5FA' }}
                          />
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">
                              {group.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {t('groups.contact_count', { count: group.contact_count || 0 })}
                            </div>
                          </div>
                        </div>
                        {selectedGroupId === group.id && (
                          <CheckCircle size={20} className="text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <GlassButton
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '2px solid rgba(239, 68, 68, 0.3)',
                      color: 'rgb(239, 68, 68)'
                    }}
                  >
                    {t('actions.cancel')}
                  </GlassButton>
                  <GlassButton
                    onClick={handleConfirm}
                    disabled={!selectedGroupId}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: selectedGroupId ? 'rgba(59, 130, 246, 0.15)' : 'rgba(156, 163, 175, 0.1)',
                      border: `2px solid ${selectedGroupId ? 'rgba(59, 130, 246, 0.3)' : 'rgba(156, 163, 175, 0.3)'}`,
                      color: selectedGroupId ? 'rgb(59, 130, 246)' : 'rgb(156, 163, 175)'
                    }}
                  >
                    {t('actions.confirm')}
                  </GlassButton>
                </div>

                {/* Selected Group Info */}
                {selectedGroup && (
                  <div className="mt-4 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-800/30">
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <CheckCircle size={16} />
                      <span>
                        {t('groups.selected_group')}: {selectedGroup.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSelectionDialog;
