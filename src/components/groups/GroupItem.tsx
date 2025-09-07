import React, { useState, useEffect } from "react";
import { Edit, Trash2, Users, Sparkles, Star, Heart, Crown, Gem, Rocket, Wand2, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
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
  const [sparkleEffect, setSparkleEffect] = useState(false);
  const [magicEffect, setMagicEffect] = useState(false);
  const { storeTriggerElement } = useDialogFocus();

  // Random sparkle effect
  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setSparkleEffect(true);
        setTimeout(() => setSparkleEffect(false), 1000);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  // Magic effect on first hover
  useEffect(() => {
    if (isHovered && !magicEffect) {
      setMagicEffect(true);
    }
  }, [isHovered, magicEffect]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGroup({ id: group.id, name: group.name });
    setDeleteDialogOpen(true);
    storeTriggerElement();
  };

  // Random decorative icons
  const decorativeIcons = [Star, Heart, Crown, Gem, Rocket, Wand2, Zap];
  const RandomIcon = decorativeIcons[Math.floor(Math.random() * decorativeIcons.length)];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -8 }}
        className="group"
      >
        <ModernCard
          variant="glass"
          hover="lift"
          className={`
            relative overflow-hidden
            p-6 rounded-3xl shadow-xl
            border-2 border-white/40 dark:border-gray-600/40
            backdrop-blur-xl
            bg-gradient-to-br from-white/50 via-white/30 to-white/20
            dark:from-gray-800/50 dark:via-gray-800/30 dark:to-gray-800/20
            hover:from-white/60 hover:via-white/40 hover:to-white/30
            dark:hover:from-gray-700/60 dark:hover:via-gray-700/40 dark:hover:to-gray-700/30
            transition-all duration-500 ease-out
            transform hover:scale-[1.02]
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

          {/* Floating particles */}
          <AnimatePresence>
            {isHovered && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100,
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                    className="absolute w-2 h-2 bg-purple-400 rounded-full"
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Sparkle effect */}
          <AnimatePresence>
            {sparkleEffect && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute top-4 right-4"
              >
                <Sparkles size={24} className="text-yellow-400 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Magic effect */}
          <AnimatePresence>
            {magicEffect && (
              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute top-4 left-4"
              >
                <Wand2 size={20} className="text-purple-400" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Random decorative icon */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.3 : 0.1 }}
            className="absolute bottom-4 right-4"
          >
            <RandomIcon size={16} className="text-purple-300" />
          </motion.div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Enhanced avatar with better animations */}
                <motion.div
                  className={`
                    relative w-20 h-20 rounded-2xl flex items-center justify-center
                    border-3 border-white/60 dark:border-gray-400/60
                    shadow-2xl backdrop-blur-md
                    ${group.color ? '' : 'bg-gradient-to-br from-gray-400 to-gray-600'}
                  `}
                  style={{
                    backgroundColor: group.color ? `${group.color}E6` : undefined,
                    boxShadow: group.color ? `0 20px 40px ${group.color}40, inset 0 1px 0 rgba(255,255,255,0.2)` : undefined
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  aria-hidden="true"
                >
                  <motion.div
                    animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Users
                      size={32}
                      className="text-white drop-shadow-lg"
                    />
                  </motion.div>

                  {/* Inner glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 0.3 : 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      background: `radial-gradient(circle, ${group.color || '#6366f1'} 0%, transparent 70%)`
                    }}
                  />

                  {/* Pulsing ring */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-white/30"
                    initial={{ scale: 1, opacity: 0 }}
                    animate={isHovered ? { scale: 1.2, opacity: 0.5 } : { scale: 1, opacity: 0 }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                  />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.h3
                    id={`group-${group.id}-title`}
                    className="font-bold text-2xl text-gray-800 dark:text-white mb-2 truncate drop-shadow-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300"
                    animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {group.name}
                  </motion.h3>

                  {group.color && (
                    <motion.div
                      className="flex items-center gap-3 mt-3"
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1 }}
                    >
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {t('groups.color')}:
                      </span>
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.div
                          className="w-4 h-4 rounded-full border-2 border-white/50 shadow-lg"
                          style={{ backgroundColor: group.color }}
                          animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                          transition={{ duration: 0.5 }}
                          aria-hidden="true"
                        />
                        <motion.span
                          className="px-3 py-1.5 rounded-xl text-white text-sm font-semibold shadow-lg backdrop-blur-sm bg-black/20 border border-white/20"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {group.color.toUpperCase()}
                        </motion.span>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced action buttons */}
            <motion.div
              className={`
                flex gap-4 mt-auto pt-6
                border-t border-white/30 dark:border-gray-700/50
              `}
              initial={{ opacity: 0.8, y: 4 }}
              animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0.8, y: 4 }}
              transition={{ duration: 0.3 }}
            >
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
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Edit size={20} />
                </motion.div>
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
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Trash2 size={20} />
                  </motion.div>
                )}
                <span>{isDeleting ? t('common.deleting') : t('actions.delete')}</span>
              </GlassButton>
            </motion.div>
          </div>
        </ModernCard>
      </motion.div>

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