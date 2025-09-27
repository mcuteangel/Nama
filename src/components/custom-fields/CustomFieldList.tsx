import React from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, Plus, Sparkles, Grid } from "lucide-react";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { GlassButton } from "@/components/ui/glass-button";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import CustomFieldCard from "./CustomFieldCard";

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
  const { t } = useTranslation(['common', 'custom_field_management']);

  // Loading state with enhanced design
  if (isLoading && fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-xs font-bold text-yellow-900">⚡</span>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            در حال بارگذاری فیلدهای سفارشی...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            لطفاً کمی صبر کنید
          </p>
        </div>
        <LoadingSpinner size={40} className="text-blue-600" />
      </div>
    );
  }

  // Enhanced empty state
  if (!isLoading && fields.length === 0) {
    return (
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10 rounded-2xl"></div>

        <div className="relative p-8">
          <EmptyState
            icon={ClipboardList}
            title="هنوز فیلد سفارشی‌ای ایجاد نشده!"
            description="با ایجاد فیلدهای سفارشی، اطلاعات بیشتری از مخاطبین خود جمع‌آوری کنید و داده‌های ساخت‌یافته‌تری داشته باشید."
          >
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <GlassButton
                variant="glass"
                onClick={onAddNew}
                className="flex items-center gap-3 px-6 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Plus size={24} />
                ایجاد اولین فیلد سفارشی
                <Sparkles className="w-5 h-5 animate-pulse" />
              </GlassButton>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>💡</span>
                <span>ایده‌هایی برای شروع:</span>
              </div>
            </div>

            {/* Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {[
                { icon: "🏢", title: "شرکت", desc: "نام شرکت مخاطب" },
                { icon: "🎯", title: "سمت", desc: "عنوان شغلی یا تخصص" },
                { icon: "📍", title: "شهر", desc: "محل زندگی یا کار" },
                { icon: "🎂", title: "تاریخ تولد", desc: "برای یادآوری تولد" },
                { icon: "⭐", title: "اولویت", desc: "سطح اهمیت مخاطب" },
                { icon: "📞", title: "تلفن دوم", desc: "شماره تلفن اضافی" }
              ].map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer group"
                  onClick={onAddNew}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {suggestion.icon}
                    </span>
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
        </div>
      </div>
    );
  }

  // Fields list with enhanced grid
  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg">
            <Grid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('custom_field_management.custom_fields')} ({fields.length})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('custom_field_management.manage_fields')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {fields.length} {t('common.fields')}
          </div>
        </div>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="animate-in slide-in-from-bottom-4 duration-500"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <CustomFieldCard
              field={field}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          </div>
        ))}
      </div>

      {/* Quick Actions Footer */}
      <div className="flex justify-center pt-8">
        <button
          onClick={onAddNew}
          className="flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl text-white hover:text-white/90 transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, var(--gradient-from, #8b5cf6) 0%, var(--gradient-to, #ec4899) 100%)',
            boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)',
            fontFamily: 'var(--font-sans)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Plus size={24} className="text-white" />
          {t('custom_field_management.add_field')}
        </button>
      </div>
    </div>
  );
};