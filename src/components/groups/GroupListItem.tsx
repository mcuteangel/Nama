import React, { useState } from "react";
import {
  Edit,
  Trash2,
  MoreVertical,
  Clock
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

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
  const { t, i18n } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  // تاریخ ایجاد گروه
  const createdAt = group.created_at
    ? new Date(group.created_at)
    : new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);

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
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
        "hover:shadow-md hover:border-primary/30",
        isHovered ? "bg-muted/20" : "bg-card"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-4 flex-1">
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

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">
            {group.name}
          </h3>

          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-full"
          onClick={handleEditClick}
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          {t('common.edit')}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">{t('common.more_options')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              <span>{t('common.edit')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{t('common.delete')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default GroupListItem;
