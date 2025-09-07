import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { useToast } from "@/hooks/use-toast";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CustomFieldForm from "./CustomFieldForm";
import { CustomFieldList } from "./CustomFieldList";
import { CustomFieldFilters } from "./CustomFieldFilters";
import { useCustomFields } from "@/hooks/use-custom-fields";
import { useCustomFieldFilters } from "@/hooks/use-custom-field-filters";

const CustomFieldManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldTemplate | null>(null);

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

  return (
    <ModernCard variant="glass" className="w-full max-w-7xl mx-auto rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl bg-gradient-to-br from-white/90 via-blue-50/30 to-purple-50/30 dark:from-gray-900/90 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-xl border border-white/40 dark:border-gray-700/40">
      <ModernCardHeader className="text-center mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="relative">
            <ModernCardTitle className="text-4xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('custom_field_management.title')}
            </ModernCardTitle>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              {t('custom_field_management.description')}
            </p>
          </div>
        </div>
      </ModernCardHeader>

      <ModernCardContent className="space-y-8">
        {/* Filters */}
        <CustomFieldFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterType={filterType}
          onFilterChange={setFilterType}
        />

        {/* Add Button */}
        <div className="flex justify-center">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <GlassButton
                variant="glass"
                className="flex items-center gap-4 px-8 py-5 text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 rounded-2xl"
              >
                <Plus size={28} className="animate-pulse" />
                {t('custom_field_management.add_field')}
                <span className="text-2xl animate-bounce">✨</span>
              </GlassButton>
            </DialogTrigger>
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
        </div>

        {/* Fields List */}
        <CustomFieldList
          fields={filteredFields}
          isLoading={isLoading}
          isDeleting={isDeleting}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onAddNew={() => setIsAddDialogOpen(true)}
        />
      </ModernCardContent>

      {/* Edit Dialog */}
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
    </ModernCard>
  );
};

export default CustomFieldManagement;