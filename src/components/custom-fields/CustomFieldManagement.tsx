import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { useToast } from "@/hooks/use-toast";
import { GlassButton, GradientButton } from "@/components/ui/glass-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModernInput } from "@/components/ui/modern-input";
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from "@/components/ui/modern-tooltip";
import useAppSettings from '@/hooks/use-app-settings';
import { useIsMobile } from '@/hooks/use-mobile';
import { designTokens } from '@/lib/design-tokens';
import CustomFieldForm from "./CustomFieldForm";
import { CustomFieldList } from "./CustomFieldList";
import { useCustomFields } from "@/hooks/use-custom-fields";
import { useCustomFieldFilters, type TemplateType } from "@/hooks/use-custom-field-filters";

const CustomFieldManagement: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldTemplate | null>(null);

  const { settings } = useAppSettings();
  const isMobile = useIsMobile();

  // Determine if we're in RTL mode based on the current language setting
  const isRTL = useMemo(() => settings.language === 'fa', [settings.language]);

  // Use custom hooks
  const { customFields, isLoading, isDeleting, deleteCustomField, handleSuccess } = useCustomFields();
  const { searchTerm, setSearchTerm, filterType, setFilterType, filteredFields } = useCustomFieldFilters(customFields);

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    handleSuccess();
    toast({
      title: t('custom_field_template.create_success'),
      description: t('custom_field_template.create_success_description')
    });
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingField(null);
    handleSuccess();
    toast({
      title: t('custom_field_template.update_success'),
      description: t('custom_field_template.update_success_description')
    });
  };

  const handleEditClick = (field: CustomFieldTemplate) => {
    setEditingField(field);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    await deleteCustomField(id);
  };

  const handleAddFieldClick = () => {
    setIsAddDialogOpen(true);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (value: TemplateType | "all") => {
    setFilterType(value);
  };

  // Get available field types for filter
  const availableTypes = useMemo(() => {
    const types = new Set<TemplateType>();
    customFields.forEach(field => {
      if (field.type) {
        types.add(field.type as TemplateType);
      }
    });
    return Array.from(types);
  }, [customFields]);

  return (
    <div
      className={`min-h-screen w-full ${settings.theme === 'dark' ? 'dark' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: designTokens.spacing[6]
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Compact Header Section */}
        <div
          className="text-center py-8 px-6 rounded-2xl"
          style={{
            background: designTokens.colors.glass.background,
            border: `1px solid ${designTokens.colors.glass.border}`,
            backdropFilter: 'blur(15px)',
            boxShadow: designTokens.shadows.glass
          }}
        >
          <div className="flex items-center justify-start mb-4">
            <GradientButton
              onClick={() => navigate(-1)}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur-sm border-white/50 shadow-lg hover:bg-white transition-all duration-300"
              style={{
                border: `2px solid ${designTokens.colors.glass.border}`,
                backdropFilter: 'blur(10px)'
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </GradientButton>
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              background: designTokens.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: designTokens.typography.fonts.primary
            }}
          >
            {t('custom_field_management.title')}
          </h1>
          <p
            className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            style={{
              fontFamily: designTokens.typography.fonts.secondary
            }}
          >
            {t('custom_field_management.description')}
          </p>
        </div>

        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: designTokens.colors.glass.background,
            border: `1px solid ${designTokens.colors.glass.border}`,
            backdropFilter: 'blur(15px)',
            boxShadow: designTokens.shadows.glass
          }}
        >
          {/* Compact Search and Actions Section */}
          <div
            className="px-8 py-6 border-b"
            style={{
              borderColor: designTokens.colors.glass.border,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-grow">
                {/* Search Input */}
                <div className="relative flex-grow max-w-md">
                  <ModernInput
                    type="text"
                    placeholder={t('custom_field_management.search_placeholder')}
                    className="w-full pl-12 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-500/30"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: `2px solid ${designTokens.colors.glass.border}`,
                      backdropFilter: 'blur(10px)',
                      fontSize: designTokens.typography.sizes.base,
                      fontFamily: designTokens.typography.fonts.primary,
                      boxShadow: designTokens.shadows.glass,
                      transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                    }}
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    size={18}
                    style={{ color: designTokens.colors.gray[500] }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <ModernTooltip>
                    <ModernTooltipTrigger asChild>
                      <GradientButton
                        gradientType="primary"
                        onClick={handleAddFieldClick}
                        className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-white hover:text-white/90"
                        style={{
                          background: designTokens.gradients.primary,
                          boxShadow: designTokens.shadows.primary,
                          fontFamily: designTokens.typography.fonts.primary,
                          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                        }}
                      >
                        <Plus size={20} className="text-white" />
                        <span className="hidden sm:inline">{t('custom_field_management.add_field')}</span>
                      </GradientButton>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent>
                      <p>{t('custom_field_management.add_field')}</p>
                    </ModernTooltipContent>
                  </ModernTooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Filters Section */}
          <div
            className="px-8 py-4"
            style={{
              background: designTokens.colors.glass.background,
              borderBottom: `1px solid ${designTokens.colors.glass.border}`,
              backdropFilter: 'blur(15px)'
            }}
          >
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-stretch ${isMobile ? '' : 'lg:items-center'} gap-4 ${isMobile ? '' : 'lg:justify-between'}`}>
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-stretch ${isMobile ? '' : 'sm:items-center'} gap-4`}>
                {/* Type Filter */}
                <ModernTooltip>
                  <ModernTooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <ModernSelect onValueChange={handleFilterChange} value={filterType || "all"}>
                        <ModernSelectTrigger
                          className="w-full sm:w-48 rounded-xl focus:ring-4 focus:ring-blue-500/30 text-gray-800 dark:text-gray-100 rtl:text-right ltr:text-left"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: `2px solid ${designTokens.colors.glass.border}`,
                            backdropFilter: 'blur(10px)',
                            fontSize: designTokens.typography.sizes.sm,
                            boxShadow: designTokens.shadows.glass
                          }}
                        >
                          <ModernSelectValue placeholder={t('custom_field_management.all_types')} />
                        </ModernSelectTrigger>
                        <ModernSelectContent
                          className="rtl:text-right ltr:text-left"
                          style={{
                            background: designTokens.colors.glass.background,
                            border: `1px solid ${designTokens.colors.glass.border}`,
                            backdropFilter: 'blur(15px)'
                          }}
                        >
                          <ModernSelectItem value="all">{t('custom_field_management.all_types')}</ModernSelectItem>
                          {availableTypes.map((type) => (
                            <ModernSelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  {type === 'text' ? '📝' : type === 'number' ? '🔢' : type === 'date' ? '📅' : '📋'}
                                </span>
                                {t(`contact_form.${type}`)}
                              </div>
                            </ModernSelectItem>
                          ))}
                        </ModernSelectContent>
                      </ModernSelect>
                    </div>
                  </ModernTooltipTrigger>
                  <ModernTooltipContent>
                    <p>{t('custom_field_management.filter_by_type')}</p>
                  </ModernTooltipContent>
                </ModernTooltip>
              </div>
            </div>
          </div>

          {/* Fields List Section */}
          <div
            className="p-8"
            style={{
              background: 'rgba(255,255,255,0.05)',
              minHeight: '500px'
            }}
          >
            <CustomFieldList
              fields={filteredFields}
              isLoading={isLoading}
              isDeleting={isDeleting}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onAddNew={() => setIsAddDialogOpen(true)}
            />
          </div>
        </div>

        {/* Add Field Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px] p-0 border-none bg-transparent shadow-none">
            <DialogHeader className="sr-only">
              <DialogTitle>{t('custom_field_template.add_title')}</DialogTitle>
            </DialogHeader>
            <CustomFieldForm
              onSuccess={handleAddSuccess}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Field Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] p-0 border-none bg-transparent shadow-none">
            <DialogHeader className="sr-only">
              <DialogTitle>{t('custom_field_template.edit_title')}</DialogTitle>
            </DialogHeader>
            {editingField && (
              <CustomFieldForm
                initialData={editingField}
                onSuccess={handleEditSuccess}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingField(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomFieldManagement;