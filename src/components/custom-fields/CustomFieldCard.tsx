import React from "react";
import { Edit, Trash2, Sparkles, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSettings } from '@/hooks/use-app-settings';
import { cn } from "@/lib/utils";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import {
  ModernCard,
  ModernCardHeader,
  ModernCardContent,
  ModernCardTitle
} from "@/components/ui/modern-card";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/common/LoadingSpinner";

type TemplateType = 'text' | 'number' | 'date' | 'list';

interface CustomFieldCardProps {
  field: CustomFieldTemplate;
  onEdit: (field: CustomFieldTemplate) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const CustomFieldCard: React.FC<CustomFieldCardProps> = ({
  field,
  onEdit,
  onDelete,
  isDeleting
}) => {
  const { t, i18n } = useTranslation();
  const { settings } = useAppSettings();

  // تشخیص زبان برای موقعیت دکمه‌ها
  const isRTL = settings.language === 'fa';

  // تاریخ ایجاد فیلد
  const createdAt = field.created_at
    ? new Date(field.created_at)
    : new Date();

  const formattedDate = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: i18n.language === 'fa' ? faIR : undefined
  });

  const getTypeIcon = (type: TemplateType) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'list': return '📋';
      default: return '📝';
    }
  };

  const getTypeLabel = (type: TemplateType) => {
    switch (type) {
      case 'text': return t('contact_form.text');
      case 'number': return t('contact_form.number');
      case 'date': return t('contact_form.date');
      case 'list': return t('contact_form.list');
      default: return type;
    }
  };

  const getTypeBadgeVariant = (type: TemplateType) => {
    switch (type) {
      case 'text': return 'default' as const;
      case 'number': return 'secondary' as const;
      case 'date': return 'outline' as const;
      case 'list': return 'secondary' as const;
      default: return 'default' as const;
    }
  };

  const getTypeColor = (type: TemplateType) => {
    switch (type) {
      case 'text': return '#3b82f6';
      case 'number': return '#10b981';
      case 'date': return '#f59e0b';
      case 'list': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(field);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(field.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "h-full transition-all duration-300 relative"
      )}
      role="article"
      aria-labelledby={`field-${field.id}-title`}
    >
      <ModernCard
        variant="3d-card"
        hover="glass-3d"
        className="h-full flex flex-col overflow-hidden relative group cursor-pointer"
      >
        {/* Gradient Background on Hover */}
        <div
          className="absolute inset-0 opacity-5 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, rgb(250, 112, 154) 0%, rgb(254, 225, 64) 100%)',
            borderRadius: '1rem'
          }}
        />

        {/* Floating Action Buttons */}
        <div className={cn(
          "absolute top-4 flex gap-2 transition-all duration-300 z-20",
          "opacity-100 scale-100",
          isRTL ? "left-4" : "right-4"
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
            disabled={isDeleting}
          >
            {isDeleting ? <LoadingSpinner size={20} /> : <Trash2 className="h-5 w-5 text-red-600" />}
          </Button>
        </div>

        {/* Card Header */}
        <ModernCardHeader className="pb-2">
          <div className="flex items-center space-x-4 pt-2">
            <Avatar
              className={cn(
                "h-16 w-16 border-4 border-background shadow-md",
                "transition-transform duration-300 group-hover:scale-110"
              )}
              style={{ backgroundColor: getTypeColor(field.type) }}
            >
              <AvatarFallback className="text-2xl font-bold text-white">
                {getTypeIcon(field.type)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <ModernCardTitle
                className="text-xl font-bold truncate"
                id={`field-${field.id}-title`}
              >
                {field.name}
              </ModernCardTitle>

              <div className="flex items-center text-sm text-muted-foreground mt-1 space-x-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </ModernCardHeader>

        {/* Card Content */}
        <ModernCardContent className="flex-1 py-4">
          <div className="space-y-4">
            {field.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {field.description}
              </p>
            )}

            {/* Type Badge */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={getTypeBadgeVariant(field.type)}
                className="flex items-center gap-1"
              >
                <span className="text-sm">{getTypeIcon(field.type)}</span>
                {getTypeLabel(field.type)}
              </Badge>
              {field.required && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <span>⭐</span>
                  ضروری
                </Badge>
              )}
            </div>

            {/* Options for list type */}
            {field.type === 'list' && field.options && field.options.length > 0 && (
              <div className="border-t border-gray-200/60 dark:border-gray-700/60 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{getTypeIcon(field.type)}</span>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    گزینه‌های لیست
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {field.options.slice(0, 3).map((option, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs px-3 py-1 rounded-lg border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    >
                      {option}
                    </Badge>
                  ))}
                  {field.options.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-3 py-1 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 font-semibold"
                    >
                      +{field.options.length - 3} گزینه دیگر
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </ModernCardContent>
      </ModernCard>
    </motion.div>
  );
};

export default CustomFieldCard;