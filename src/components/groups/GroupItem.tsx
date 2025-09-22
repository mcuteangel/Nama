import React, { useState } from "react";
import { 
  Edit, 
  Trash2, 
  MoreVertical, 
  UserPlus,
  Users as UsersIcon,
  Clock,
  Tag,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import StandardizedDeleteDialog from "@/components/common/StandardizedDeleteDialog";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

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
  member_count?: number;
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
  const { t, i18n } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { storeTriggerElement } = useDialogFocus();

  // Use provided member count or generate a random one
  const memberCount = group.member_count || Math.floor(Math.random() * 100) + 1;
  const completionRate = Math.min(100, Math.floor(Math.random() * 120));
  
  // تاریخ ایجاد گروه
  const createdAt = group.created_at 
    ? new Date(group.created_at) 
    : new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);

  const formattedDate = formatDistanceToNow(createdAt, { 
    addSuffix: true,
    locale: i18n.language === 'fa' ? faIR : undefined 
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
    storeTriggerElement();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(group);
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(group.id, group.name);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "h-full transition-all duration-300",
          isDeleting ? "opacity-50 pointer-events-none" : "hover:shadow-lg"
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
              <DropdownMenu onOpenChange={setIsMenuOpen}>
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
                  <UsersIcon className="h-4 w-4 mr-1" />
                  <span>{memberCount} {t('groups.members')}</span>
                  
                  <span className="mx-2">•</span>
                  
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

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t('groups.completion')}</span>
                  <span className="font-mono">{completionRate}%</span>
                </div>
                <Progress 
                  value={completionRate} 
                  className="h-2 bg-muted"
                  indicatorClassName={cn(
                    completionRate >= 100 
                      ? "bg-green-500" 
                      : completionRate >= 70 
                        ? "bg-blue-500" 
                        : "bg-yellow-500"
                  )}
                />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {t('groups.default_tag')}
                </Badge>
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
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(4, memberCount) }).map((_, i) => (
                  <Avatar 
                    key={i} 
                    className="h-8 w-8 border-2 border-background"
                  >
                    <AvatarFallback className="text-xs">
                      {String.fromCharCode(65 + (i % 26))}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {memberCount > 4 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                    +{memberCount - 4}
                  </div>
                )}
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
                <Button 
                  size="sm" 
                  className="h-8 rounded-full"
                  onClick={() => {/* Handle add member */}}
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  {t('groups.add_member')}
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <StandardizedDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('groups.delete_confirm_title')}
        description={t('groups.delete_confirm_description', { name: group.name })}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default GroupItem;
