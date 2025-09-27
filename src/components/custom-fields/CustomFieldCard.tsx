import React from "react";
import { 
  Edit, 
  Trash2, 
  Type,
  Hash,
  Calendar,
  TextCursorInput,
  CheckSquare,
  Check,
  List} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSettings } from '@/hooks/use-app-settings';
import { cn } from "@/lib/utils";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "../ui/modern-card";

type TemplateType = 'text' | 'number' | 'date' | 'list' | 'checklist';

interface CustomFieldCardProps {
  field: CustomFieldTemplate;
  onEdit: (field: CustomFieldTemplate) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean; // Marked as optional since it's not used
}

const CustomFieldCard: React.FC<CustomFieldCardProps> = ({
  field,
  onEdit,
  onDelete,
  isDeleting: _isDeleting // Prefix with _ to indicate it's intentionally unused
}) => {
  const { t } = useTranslation();
  const { settings } = useAppSettings();
  const isRTL = settings.language === 'fa';

  const getTypeIcon = (type: TemplateType) => {
    const iconClass = "w-4 h-4 flex-shrink-0";
    switch (type) {
      case 'text': return <TextCursorInput className={iconClass} />;
      case 'number': return <Hash className={iconClass} />;
      case 'date': return <Calendar className={iconClass} />;
      case 'list': return <List className={iconClass} />;
      case 'checklist': return <CheckSquare className={iconClass} />;
      default: return <Type className={iconClass} />;
    }
  };

  const getTypeLabel = (type: TemplateType) => {
    switch (type) {
      case 'text': return t('contact_form.text');
      case 'number': return t('contact_form.number');
      case 'date': return t('contact_form.date');
      case 'list': return t('contact_form.list');
      case 'checklist': return t('contact_form.checklist');
      default: return type;
    }
  };


  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'number':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'date':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'list':
      case 'checklist':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
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
          className={cn(
            "absolute inset-0 opacity-10 dark:opacity-5 transition-opacity duration-300",
            getTypeColor(field.type).split(' ')[0] // استفاده از کلاس رنگی متناظر
          )}
          style={{
            background: field.type === 'text' 
              ? 'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(147, 51, 234) 100%)' // Purple gradient for text
              : field.type === 'number'
              ? 'linear-gradient(135deg, rgb(14, 165, 233) 0%, rgb(59, 130, 246) 100%)' // Blue gradient for number
              : field.type === 'date'
              ? 'linear-gradient(135deg, rgb(22, 163, 74) 0%, rgb(34, 197, 94) 100%)' // Green gradient for date
              : 'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(219, 39, 119) 100%)', // Pink gradient for list
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
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-5 w-5 text-red-600" />
          </Button>
        </div>

        {/* Field Content */}
        <ModernCardHeader className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {getTypeIcon(field.type as TemplateType)}
          </div>
          <ModernCardTitle
            id={`field-${field.id}-title`}
            className="text-lg font-bold"
          >
            {field.name}
          </ModernCardTitle>
        </ModernCardHeader>

        <ModernCardContent className="flex flex-col gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {field.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            <Badge
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                getTypeColor(field.type)
              )}
              style={{
                backgroundColor: getTypeColor(field.type).split(' ')[0] + '15',
                borderColor: getTypeColor(field.type).split(' ')[0] + '30'
              }}
            >
              {getTypeIcon(field.type as TemplateType)}
              <span className="text-xs font-medium">
                {getTypeLabel(field.type as TemplateType)}
              </span>
            </Badge>
            
            {field.required && (
              <Badge
                variant="outline"
                className="text-xs font-medium px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
              >
                {isRTL ? 'الزامی' : 'Required'}
              </Badge>
            )}
          </div>

            {/* Options for list/checklist type */}
            {(field.type === 'list' || field.type === 'checklist') && field.options && field.options.length > 0 && (
              <div className="border-t border-gray-200/60 dark:border-gray-700/60 pt-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    {field.type === 'checklist' 
                      ? isRTL ? 'گزینه‌های چک‌لیست' : 'Checklist Options'
                      : isRTL ? 'گزینه‌های لیست' : 'List Options'}
                  </p>
                </div>
                <div className="space-y-2">
                  {field.options.slice(0, 3).map((option, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border ${
                        field.type === 'checklist' 
                          ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {field.type === 'checklist' ? (
                        <>
                          <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="truncate">{option}</span>
                        </>
                      ) : (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                        >
                          {option}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {field.options.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
                      {isRTL 
                        ? `+${field.options.length - 3} گزینه دیگر`
                        : `+${field.options.length - 3} more options`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      </motion.div>
    );
};

export default CustomFieldCard;