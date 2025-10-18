import React from "react";
import { useTranslation } from "react-i18next";
import { 
  ClipboardList, 
  Plus, 
  Sparkles, 
  Grid, 
  Lightbulb,
  Building2,
  Target,
  MapPin,
  Cake,
  Star,
  Phone
} from "lucide-react";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { GlassButton } from "@/components/ui/glass-button";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import CustomFieldCard from "./CustomFieldCard";
import { ModernCard, ModernCardContent } from "../ui/modern-card";

interface CustomFieldListProps {
  fields: CustomFieldTemplate[];
  isLoading: boolean;
  isDeleting: boolean;
  onEdit: (field: CustomFieldTemplate) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const CustomFieldList: React.FC<CustomFieldListProps> = ({
  fields,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
  onAddNew
}) => {
  const { t } = useTranslation();

  // Loading state with enhanced design
  if (isLoading && fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
            <Sparkles className="w-3 h-3 text-yellow-900" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('custom_field_management.loading.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('custom_field_management.loading.please_wait')}
          </p>
        </div>
        <LoadingSpinner size={40} className="text-blue-600" />
      </div>
    );
  }

  // Enhanced empty state
  if (!isLoading && fields.length === 0) {
    return (
      <ModernCard
        variant="glass"
        hover="glass-3d"
        className="relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10"></div>

        <ModernCardContent className="relative p-8">
          <EmptyState
            icon={ClipboardList}
            title={t('custom_field_management.empty_state.title')}
            description={t('custom_field_management.empty_state.description')}
          >
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <GlassButton
                variant="glass"
                onClick={onAddNew}
                className="flex items-center gap-3 px-6 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Plus size={24} />
                {t('custom_field_management.empty_state.create_first_field')}
                <Sparkles className="w-5 h-5 animate-pulse" />
              </GlassButton>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span>{t('custom_field_management.empty_state.getting_started')}</span>
              </div>
            </div>

            {/* Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {[
                { 
                  icon: <Building2 className="w-6 h-6" />, 
                  key: 'company',
                  title: t('custom_field_management.empty_state.suggestions.company.title'), 
                  desc: t('custom_field_management.empty_state.suggestions.company.description') 
                },
                { 
                  icon: <Target className="w-6 h-6" />, 
                  key: 'position',
                  title: t('custom_field_management.empty_state.suggestions.position.title'), 
                  desc: t('custom_field_management.empty_state.suggestions.position.description') 
                },
                { 
                  icon: <MapPin className="w-6 h-6" />, 
                  key: 'city',
                  title: t('custom_field_management.empty_state.suggestions.city.title'), 
                  desc: t('custom_field_management.empty_state.suggestions.city.description') 
                },
                { 
                  icon: <Cake className="w-6 h-6" />, 
                  key: 'birthday',
                  title: t('custom_field_management.empty_state.suggestions.birthday.title'), 
                  desc: t('custom_field_management.empty_state.suggestions.birthday.description') 
                },
                { 
                  icon: <Star className="w-6 h-6" />, 
                  key: 'priority',
                  title: t('custom_field_management.empty_state.suggestions.priority.title'), 
                  desc: t('custom_field_management.empty_state.suggestions.priority.description') 
                },
                { 
                  icon: <Phone className="w-6 h-6" />, 
                  key: 'secondary_phone',
                  title: t('custom_field_management.empty_state.suggestions.secondary_phone.title'), 
                  desc: t('custom_field_management.empty_state.suggestions.secondary_phone.description') 
                }
              ].map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer group"
                  onClick={onAddNew}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform duration-200">
                      {React.cloneElement(suggestion.icon, { className: "w-5 h-5 text-blue-600 dark:text-blue-400" })}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {suggestion.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {suggestion.desc}
                  </p>
                </div>
              ))}
            </div>
          </EmptyState>
        </ModernCardContent>
      </ModernCard>
    );
  }

  // Fields list with enhanced grid
  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <ModernCard
        variant="glass"
        hover="glass-3d"
        className="relative overflow-hidden"
      >
        <ModernCardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <Grid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('custom_field_management.custom_fields')} <span className="text-purple-600 dark:text-purple-400">({fields.length})</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('custom_field_management.manage_fields')}
                </p>
              </div>
            </div>

            <div className="px-4 py-2 bg-white/70 dark:bg-gray-800/70 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200 border border-purple-100 dark:border-purple-900/50 backdrop-blur-sm">
              {fields.length} {t('common.fields')}
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {fields.map((field) => (
          <CustomFieldCard
            key={field.id}
            field={field}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
};