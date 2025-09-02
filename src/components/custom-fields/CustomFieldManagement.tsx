"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, ClipboardList, Search, Filter } from "lucide-react";
import { useSession } from "@/integrations/supabase/auth";
import { CustomFieldTemplateService } from "@/services/custom-field-template-service";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { useToast } from "@/hooks/use-toast";
import { ErrorManager } from "@/lib/error-manager";
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ModernInput } from "@/components/ui/modern-input";
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import CancelButton from "@/components/common/CancelButton";
import CustomFieldForm from "./CustomFieldForm.tsx";

type TemplateType = 'text' | 'number' | 'date' | 'list';

interface CustomFieldViewModel {
  id: string;
  name: string;
  type: TemplateType;
  options?: string[];
  description?: string;
  required: boolean;
  created_at: string;
}

const CustomFieldManagement: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const { toast } = useToast();
  
  const [customFields, setCustomFields] = useState<CustomFieldViewModel[]>([]);
  const [filteredFields, setFilteredFields] = useState<CustomFieldViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TemplateType | "all">("all");
  const [isDeleting, setIsDeleting] = useState(false);

  // Load custom fields
  const loadCustomFields = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setCustomFields([]);
      return;
    }

    try {
      setIsLoading(true);
      const cacheKey = `custom_field_templates_${session.user.id}`;
      const { data, error } = await fetchWithCache<CustomFieldTemplate[]>(
        cacheKey,
        async () => {
          const res = await CustomFieldTemplateService.getAllCustomFieldTemplates();
          if (res.error) {
            throw new Error(res.error);
          }
          return { data: res.data, error: null };
        }
      );

      if (error) {
        throw new Error(error);
      }

      const viewModelFields = (data || []).map(field => ({
        id: field.id,
        name: field.name,
        type: field.type as TemplateType,
        options: field.options || [],
        description: field.description || "",
        required: field.required,
        created_at: field.created_at
      }));

      setCustomFields(viewModelFields);
    } catch (error) {
      console.error("Error loading custom fields:", error);
      toast({
        title: t('errors.load_custom_fields_failed'),
        description: ErrorManager.getErrorMessage(error),
        variant: "destructive"
      });
      setCustomFields([]);
    } finally {
      setIsLoading(false);
    }
  }, [session, isSessionLoading, toast, t]);

  // Apply filters
  useEffect(() => {
    let result = [...customFields];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(field => 
        field.name.toLowerCase().includes(term) || 
        (field.description && field.description.toLowerCase().includes(term))
      );
    }
    
    // Apply type filter
    if (filterType !== "all") {
      result = result.filter(field => field.type === filterType);
    }
    
    setFilteredFields(result);
  }, [customFields, searchTerm, filterType]);

  // Initial load
  useEffect(() => {
    loadCustomFields();
  }, [loadCustomFields]);

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    invalidateCache(`custom_field_templates_${session?.user?.id}`);
    loadCustomFields();
    toast({
      title: t('custom_field_template.create_success'),
      description: t('custom_field_template.create_success_description')
    });
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingField(null);
    invalidateCache(`custom_field_templates_${session?.user?.id}`);
    loadCustomFields();
    toast({
      title: t('custom_field_template.update_success'),
      description: t('custom_field_template.update_success_description')
    });
  };

  const handleDeleteField = async (id: string) => {
    if (!session?.user) return;
    
    try {
      setIsDeleting(true);
      const res = await CustomFieldTemplateService.deleteCustomFieldTemplate(id);
      
      if (res.error) {
        throw new Error(res.error);
      }
      
      invalidateCache(`custom_field_templates_${session.user.id}`);
      loadCustomFields();
      
      toast({
        title: t('custom_field_template.delete_success'),
        description: t('custom_field_template.delete_success_description')
      });
    } catch (error) {
      console.error("Error deleting custom field:", error);
      toast({
        title: t('errors.delete_custom_field_failed'),
        description: ErrorManager.getErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (field: CustomFieldTemplate) => {
    setEditingField(field);
    setIsEditDialogOpen(true);
  };

  const getTypeBadgeVariant = (type: TemplateType) => {
    switch (type) {
      case 'text': return 'default';
      case 'number': return 'secondary';
      case 'date': return 'default';
      case 'list': return 'secondary';
      default: return 'default';
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

  return (
    <ModernCard variant="glass" className="w-full max-w-6xl mx-auto rounded-xl p-6">
      <ModernCardHeader className="text-center">
        <ModernCardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('custom_field_management.title')}
        </ModernCardTitle>
        <p className="text-gray-600 dark:text-gray-300">
          {t('custom_field_management.description')}
        </p>
      </ModernCardHeader>
      
      <ModernCardContent>
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <ModernInput
                placeholder={t('custom_field_management.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                variant="glass"
              />
            </div>
            
            <ModernSelect value={filterType} onValueChange={(value) => setFilterType(value as TemplateType | "all")}>
              <ModernSelectTrigger variant="glass" className="w-full sm:w-40">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <ModernSelectValue placeholder={t('custom_field_management.filter_all')} />
                </div>
              </ModernSelectTrigger>
              <ModernSelectContent variant="glass">
                <ModernSelectItem value="all">{t('custom_field_management.filter_all')}</ModernSelectItem>
                <ModernSelectItem value="text">{t('contact_form.text')}</ModernSelectItem>
                <ModernSelectItem value="number">{t('contact_form.number')}</ModernSelectItem>
                <ModernSelectItem value="date">{t('contact_form.date')}</ModernSelectItem>
                <ModernSelectItem value="list">{t('contact_form.list')}</ModernSelectItem>
              </ModernSelectContent>
            </ModernSelect>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <GlassButton
                variant="glass"
                className="flex items-center gap-2 px-4 py-2"
              >
                <Plus className="h-4 w-4" />
                {t('custom_field_management.add_field')}
              </GlassButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent shadow-none">
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

        {/* Loading state */}
        {isLoading && customFields.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size={32} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredFields.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title={t('custom_field_management.empty_title')}
            description={t('custom_field_management.empty_description')}
          >
            <GlassButton
              variant="glass"
              onClick={() => setIsAddDialogOpen(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 me-2" />
              {t('custom_field_management.add_first_field')}
            </GlassButton>
          </EmptyState>
        )}

        {/* Fields list */}
        {!isLoading && filteredFields.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFields.map((field) => (
              <ModernCard 
                key={field.id} 
                variant="glass" 
                className="rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      {field.name}
                      {field.required && (
                        <Badge variant="destructive" className="text-xs py-0.5 px-1.5">
                          {t('contact_form.required')}
                        </Badge>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getTypeBadgeVariant(field.type)} className="text-xs py-0.5 px-1.5">
                        {getTypeLabel(field.type)}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(field.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <GlassButton
                      variant="glass"
                      size="sm"
                      onClick={() => handleEditClick(field as CustomFieldTemplate)}
                      className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50"
                    >
                      <Edit size={16} />
                    </GlassButton>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <GlassButton 
                          variant="glass" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50"
                          disabled={isDeleting}
                        >
                          {isDeleting ? <LoadingSpinner size={16} /> : <Trash2 size={16} />}
                        </GlassButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass rounded-xl p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-800 dark:text-gray-100">
                            {t('custom_field_management.delete_confirm_title')}
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                            {t('custom_field_management.delete_confirm_description')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <CancelButton onClick={() => {}} text={t('actions.cancel')} />
                          <GlassButton 
                            variant="glass"
                            onClick={() => handleDeleteField(field.id)} 
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold" 
                            disabled={isDeleting}
                          >
                            {isDeleting && <LoadingSpinner size={16} className="me-2" />}
                            {t('actions.delete')}
                          </GlassButton>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                {field.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {field.description}
                  </p>
                )}
                
                {field.type === 'list' && field.options && field.options.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('contact_form.list_options')}:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {field.options.slice(0, 3).map((option, index) => (
                        <Badge key={index} variant="secondary" className="text-xs py-0.5 px-1.5">
                          {option}
                        </Badge>
                      ))}
                      {field.options.length > 3 && (
                        <Badge variant="outline" className="text-xs py-0.5 px-1.5">
                          +{field.options.length - 3} {t('common.more')}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </ModernCard>
            ))}
          </div>
        )}
      </ModernCardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent shadow-none">
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