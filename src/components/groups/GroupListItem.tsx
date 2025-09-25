import React from "react";
import {
  Edit,
  Trash2,
  Clock
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import { useAppSettings } from '@/hooks/use-app-settings';
import {
  ModernCard
} from "@/components/ui/modern-card";

// تابع کمکی برای استخراج حروف اول نام گروه
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

interface Group {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
  description?: string;
}

interface GroupListItemProps {
  group: Group;
  onEdit?: (group: Group) => void;
  onDelete?: (groupId: string, groupName: string) => void;
}

const GroupListItem: React.FC<GroupListItemProps> = ({
  group,
  onEdit,
  onDelete
}) => {
  const { i18n } = useTranslation();
  const { settings } = useAppSettings();

  // تشخیص زبان برای موقعیت دکمه‌ها
  const isRTL = settings.language === 'fa';

  // تاریخ ایجاد گروه
  const createdAt = group.created_at
    ? new Date(group.created_at)
    : new Date();

  const formattedDate = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: i18n.language === 'fa' ? faIR : undefined
  });

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(group);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(group.id, group.name);
  };

  return (
    <ModernCard
      variant="3d-card"
      hover="glass-3d"
      className="flex items-center justify-between p-4 relative group"
    >
      {/* Gradient Background on Hover */}
      <div
        className="absolute inset-0 opacity-5 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, rgb(250, 112, 154) 0%, rgb(254, 225, 64) 100%)',
          borderRadius: '1.5rem'
        }}
      />

      <div className="flex items-center space-x-4 flex-1 relative z-10">
        <Avatar
          className={cn(
            "h-12 w-12 border-2 border-background shadow-sm"
          )}
          style={group.color ? { backgroundColor: group.color } : undefined}
        >
          <AvatarImage src={`/api/group-avatar/${group.id}`} alt={group.name} />
          <AvatarFallback className="text-sm font-bold">
            {getInitials(group.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 relative z-10">
          <h3 className="font-semibold text-lg truncate">
            {group.name}
          </h3>

          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className={cn(
        "flex items-center space-x-2 transition-all duration-300 relative z-20",
        "opacity-100 scale-100",
        isRTL ? "flex-row-reverse" : "flex-row"
      )}>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-2xl bg-white/90 backdrop-blur-sm border-white/50 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
          style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '2px solid rgb(125, 211, 252)',
            backdropFilter: 'blur(10px)'
          }}
          onClick={handleEditClick}
        >
          <Edit className="h-5 w-5 text-blue-600" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-2xl bg-white/90 backdrop-blur-sm border-white/50 shadow-lg hover:bg-red-50 hover:scale-110 transition-all duration-300"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgb(252, 165, 165)',
            backdropFilter: 'blur(10px)'
          }}
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-5 w-5 text-red-600" />
        </Button>
      </div>
    </ModernCard>
  );
};

export default GroupListItem;
