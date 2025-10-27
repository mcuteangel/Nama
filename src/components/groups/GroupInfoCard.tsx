import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Calendar, Users, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { GlassButton } from '@/components/ui/glass-button';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { Group } from '@/types/group.types';

export interface GroupInfoCardProps {
  group: Group;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

const GroupInfoCard: React.FC<GroupInfoCardProps> = ({
  group,
  onEdit,
  onDelete,
  className = ''
}) => {
  const { t, i18n } = useTranslation();

  const createdAt = group.created_at
    ? new Date(group.created_at)
    : new Date();

  const formattedDate = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: i18n.language === 'fa' ? faIR : undefined
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`mb-12 ${className}`}
    >
      <div
        className="relative rounded-3xl overflow-hidden p-6"
        style={{
          background: `linear-gradient(135deg, ${group.color}15 0%, ${group.color}05 100%)`,
          border: `2px solid ${group.color}30`,
          backdropFilter: 'blur(15px)',
          boxShadow: `0 25px 50px -12px ${group.color}20`
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, ${group.color} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${group.color} 0%, transparent 50%)`
            }}
          />
        </div>

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Group Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <div
              className="relative w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-white/20"
              style={{ backgroundColor: group.color }}
            >
              {group.name.charAt(0).toUpperCase()}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
            </div>
          </motion.div>

          {/* Group Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4">
              {/* Action Buttons - Top */}
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <GlassButton
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50"
                  >
                    <Edit size={18} />
                    <span>{t('actions.edit')}</span>
                  </GlassButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <GlassButton
                    onClick={onDelete}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/50"
                  >
                    <Trash2 size={18} />
                    <span>{t('actions.delete')}</span>
                  </GlassButton>
                </motion.div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold text-foreground">
                    {t('groups.contacts_count', { count: group.contacts?.length || 0 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: group.color,
                      color: group.color,
                      backgroundColor: `${group.color}10`
                    }}
                  >
                    {group.color}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupInfoCard;
