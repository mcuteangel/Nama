import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassButton } from '@/components/ui/glass-button';

export interface GroupActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

const GroupActions: React.FC<GroupActionsProps> = ({
  onEdit,
  onDelete,
  className = ''
}) => {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
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
  );
};

export default GroupActions;
