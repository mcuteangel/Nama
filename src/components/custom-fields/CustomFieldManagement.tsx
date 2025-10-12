import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Type, Hash, Calendar, ListChecks, Search, ListFilter, Plus } from "lucide-react";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ModernInput } from "@/components/ui/modern-input";
import { 
  ModernSelect, 
  ModernSelectContent, 
  ModernSelectItem, 
  ModernSelectTrigger
} from "@/components/ui/modern-select";
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from "@/components/ui/modern-tooltip";
import { CustomFieldList } from "./CustomFieldList";
import { useCustomFields } from "@/hooks/use-custom-fields";
import { designTokens } from '@/lib/design-tokens';
import CustomFieldForm from "./CustomFieldForm";
import { useCustomFieldFilters, type TemplateType } from "@/hooks/use-custom-field-filters";
import PageHeader from "../ui/PageHeader";
import useAppSettings from "@/hooks/use-app-settings";
import { useIsMobile } from "@/hooks/use-mobile";

const CustomFieldManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldTemplate | null>(null);

  const { settings } = useAppSettings();
  const isMobile = useIsMobile();
  const isRTL = useMemo(() => settings.language === 'fa', [settings.language]);

  // Use custom hooks
  const { customFields, deleteCustomField, handleSuccess } = useCustomFields();
  const { searchTerm, setSearchTerm, filterType, setFilterType, filteredFields } = useCustomFieldFilters(customFields);

  // Responsive styles
  const searchInputWidth = isMobile ? "w-full" : "w-64";

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

  const containerStyle = {
    padding: designTokens.spacing[6],
    paddingBottom: isMobile ? '100px' : designTokens.spacing[6], // اضافه کردن فضای بیشتر در پایین برای موبایل
  };

  return (
    <div
      className={`min-h-screen w-full ${settings.theme === 'dark' ? 'dark' : ''}`}
      style={containerStyle}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Add Floating Action Button */}
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className={`fixed ${isMobile 
            ? 'bottom-20 right-4' 
            : isRTL 
              ? 'bottom-8 left-8' 
              : 'bottom-8 right-8'} z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110`}
          style={{
            background: 'linear-gradient(135deg, var(--gradient-from, #8b5cf6) 0%, var(--gradient-to, #ec4899) 100%)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
          }}
          aria-label={t('custom_field_management.add_field')}
        >
          <Plus size={24} className="text-white" />
        </Button>
        <div className="space-y-6">
          <PageHeader
            title={t('custom_field_management.title')}
            description={t('custom_field_management.description')}
            {...(!isMobile && {
              onAddClick: () => setIsAddDialogOpen(true),
              addButtonLabel: t('custom_field_management.add_field')
            })}
          />
          
          <div className="flex flex-col sm:flex-row gap-4 w-full mb-6">
            <div className={`relative ${searchInputWidth}`}>
              <ModernInput
                type="text"
                placeholder={t('common.search')}
                className="w-full pl-12 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-500/30"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                value={searchTerm}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: `2px solid ${designTokens.colors.glass.border}`,
                  backdropFilter: 'blur(10px)',
                  fontSize: designTokens.typography.sizes.base,
                  fontFamily: designTokens.typography.fonts.primary,
                  boxShadow: designTokens.shadows.glass,
                  transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                size={18}
                style={{ color: designTokens.colors.gray[500] }}
              />
            </div>
            
            <ModernTooltip>
              <ModernTooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <ModernSelect 
                    onValueChange={handleFilterChange} 
                    value={filterType || "all"}
                  >
                    <ModernSelectTrigger 
                      className="w-full sm:w-16 h-10 rounded-xl border-2"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderColor: designTokens.colors.glass.border,
                        backdropFilter: 'blur(10px)',
                        boxShadow: designTokens.shadows.glass,
                      }}
                    >
                      <div className="flex items-center justify-center w-full">
                        {filterType === 'text' && <Type size={18} className="text-blue-500" />}
                        {filterType === 'number' && <Hash size={18} className="text-green-500" />}
                        {filterType === 'date' && <Calendar size={18} className="text-purple-500" />}
                        {filterType === 'list' && <ListChecks size={18} className="text-yellow-500" />}
                        {(filterType === 'all' || !filterType) && <ListFilter size={18} className="text-gray-500" />}
                      </div>
                    </ModernSelectTrigger>
                    <ModernSelectContent 
                      className="min-w-[180px] rounded-xl border-2"
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                        borderColor: designTokens.colors.glass.border,
                        backdropFilter: 'blur(10px)',
                        boxShadow: designTokens.shadows.glass,
                      }}
                    >
                      <ModernSelectItem value="all">
                        <div className="flex items-center gap-2">
                          <ListFilter size={16} className="text-gray-500" />
                          <span>{t('common.all_types')}</span>
                        </div>
                      </ModernSelectItem>
                      {availableTypes.map((type) => (
                        <ModernSelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            {type === 'text' && <Type size={16} className="text-blue-500" />}
                            {type === 'number' && <Hash size={16} className="text-green-500" />}
                            {type === 'date' && <Calendar size={16} className="text-purple-500" />}
                            {type === 'list' && <ListChecks size={16} className="text-yellow-500" />}
                            <span>{t(`custom_field_types.${type}`, type)}</span>
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
          
          {/* Fields List Section */}
          <div className="mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <CustomFieldList
                fields={filteredFields}
                isLoading={false}
                isDeleting={false}
                onEdit={(field) => {
                  setEditingField(field);
                  setIsEditDialogOpen(true);
                }}
                onDelete={deleteCustomField}
                onAddNew={() => setIsAddDialogOpen(true)}
              />
            </div>
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
