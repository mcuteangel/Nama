import React, { useState } from "react";
import {
  Edit,
  Trash2,
  MoreVertical,
  Clock
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";

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

interface GroupItemProps {
  group: Group;
  onEdit?: (group: Group) => void;
  onDelete?: (groupId: string, groupName: string) => void;
}

const GroupItem: React.FC<GroupItemProps> = ({
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "h-full transition-all duration-300",
        isHovered ? "shadow-lg" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-labelledby={`group-${group.id}-title`}
    >
      <Card
        className={cn(
          "h-full flex flex-col overflow-hidden border border-border/30",
          "transition-all duration-300 hover:border-primary/30 hover:shadow-md"
        )}
      >
        {/* Card Header */}
        <CardHeader className="relative pb-2">
          <div className="absolute top-4 right-4">
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

          <div className="flex items-center space-x-4 pt-2">
            <Avatar
              className={cn(
                "h-16 w-16 border-4 border-background shadow-md",
                "transition-transform duration-300 group-hover:scale-110"
              )}
              style={group.color ? { backgroundColor: group.color } : undefined}
            >
              <AvatarImage src={`/api/group-avatar/${group.id}`} alt={group.name} />
              <AvatarFallback className="text-xl font-bold">
                {getInitials(group.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <CardTitle
                className="text-xl font-bold truncate"
                id={`group-${group.id}-title`}
              >
                {group.name}
              </CardTitle>

              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="flex-1 py-4">
          <div className="space-y-4">
            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {group.description}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {group.color && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1"
                  style={{ borderColor: group.color, color: group.color }}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  {t('groups.custom_color')}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        {/* Card Footer */}
        <CardFooter className="border-t bg-muted/20 py-3 px-4">
          <div className="flex items-center justify-between w-full">
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
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default GroupItem;
