import React from "react";
import { Edit, Trash2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { ModernCard } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { GlassButton } from "@/components/ui/glass-button";
import LoadingSpinner from "@/components/common/LoadingSpinner";

type TemplateType = 'text' | 'number' | 'date' | 'list' | 'checklist';

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
  const { t } = useTranslation();

  const getTypeBadgeVariant = (type: TemplateType) => {
    switch (type) {
      case 'text': return 'default';
      case 'number': return 'secondary';
      case 'date': return 'outline';
      case 'list': return 'secondary';
      case 'checklist': return 'success';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: TemplateType) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'list': return '📋';
      case 'checklist': return '✅';
      default: return '📝';
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

  return (
    <ModernCard
      variant="glass"
      className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-2 border border-white/30 dark:border-gray-700/40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-purple-50/20 to-pink-50/40 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-pink-900/20 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse" />

      {/* Sparkle effect on hover */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200">
        <Sparkles className="w-5 h-5 text-yellow-400 animate-bounce" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                {getTypeIcon(field.type)}
              </span>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {field.name}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge
                variant={getTypeBadgeVariant(field.type)}
                className="text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 group-hover:scale-105 shadow-sm"
              >
                {getTypeLabel(field.type)}
              </Badge>
              {field.required && (
                <Badge
                  variant="destructive"
                  className="text-sm font-semibold px-4 py-2 rounded-full animate-pulse shadow-sm"
                >
                  ⭐ {t('contact_form.required')}
                </Badge>
              )}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {new Date(field.created_at).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 delay-100">
            <GlassButton
              variant="glass"
              size="sm"
              onClick={() => onEdit(field)}
              className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-lg"
              aria-label={`${t('actions.edit')} ${field.name}`}
            >
              <Edit size={20} />
            </GlassButton>

            <GlassButton
              variant="glass"
              size="sm"
              onClick={() => onDelete(field.id)}
              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all duration-300 hover:scale-110 hover:-rotate-6 shadow-lg"
              disabled={isDeleting}
              aria-label={`${t('actions.delete')} ${field.name}`}
            >
              {isDeleting ? <LoadingSpinner size={20} /> : <Trash2 size={20} />}
            </GlassButton>
          </div>
        </div>

        {field.description && (
          <div className="mb-5">
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
              {field.description}
            </p>
          </div>
        )}

        {(field.type === 'list' || field.type === 'checklist') && field.options && field.options.length > 0 && (
          <div className="border-t border-gray-200/60 dark:border-gray-700/60 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{getTypeIcon(field.type)}</span>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {field.type === 'checklist' 
                  ? t('contact_form.checklist_options') 
                  : t('contact_form.list_options')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {field.options.slice(0, 4).map((option, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-sm px-4 py-2 rounded-xl border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  {option}
                </Badge>
              ))}
              {field.options.length > 4 && (
                <Badge
                  variant="secondary"
                  className="text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 font-semibold shadow-sm"
                >
                  ✨ +{field.options.length - 4} {t('common.more')}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </ModernCard>
  );
};

export default CustomFieldCard;