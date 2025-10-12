"use client";

import { useState, useCallback } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Dialog } from "@/components/ui/dialog";
import { Trash2, Edit, ClipboardList } from "lucide-react";
import { CustomFieldTemplateService } from "@/services/custom-field-template-service"; // Updated import
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { useSession } from "@/integrations/supabase/auth";
import CustomFieldTemplateForm from "./CustomFieldTemplateForm";
import AddCustomFieldTemplateDialog from "./AddCustomFieldTemplateDialog";
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers";
import FormDialogWrapper from "./common/FormDialogWrapper";
import LoadingMessage from "./common/LoadingMessage";
import EmptyState from './common/EmptyState';
import LoadingSpinner from './common/LoadingSpinner';
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from 'react-i18next';
import StandardizedDeleteDialog from './common/StandardizedDeleteDialog';

type TemplateType = 'text' | 'number' | 'date' | 'list';

interface TemplateViewModel {
  id: string;
  name: string;
  type: TemplateType;
  options?: string[];
  description?: string;
  required: boolean;
}

export function GlobalCustomFieldsManagement() {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const { toast } = useToast(); // Added toast hook
  const [customFields, setCustomFields] = useState<TemplateViewModel[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldTemplate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);
  const [isDialogClosing, setIsDialogClosing] = useState(false);

  const onSuccessFetchTemplates = useCallback((result: { data: CustomFieldTemplate[] | null; error: string | null; fromCache: boolean }) => {
    setCustomFields(result.data!.map((t: CustomFieldTemplate) => ({
      id: t.id,
      name: t.name,
      type: t.type as TemplateType,
      options: t.options || [],
      description: t.description || "",
      required: t.required
    })));
    if (!result.fromCache) {
      toast.success(t('custom_field_template.templates_loaded_success'));
    }
  }, [toast, t]);

  const onErrorFetchTemplates = useCallback((err: Error) => {
    console.error("Error loading custom field templates:", err);
    toast.error(t('custom_field_template.error_loading_templates', { error: ErrorManager.getErrorMessage(err) || t('common.unknown_error') }));
    setCustomFields([]);
  }, [toast, t]);

  const {
    isLoading: loadingTemplates,
    executeAsync: executeLoadTemplates,
  } = useErrorHandler<{ data: CustomFieldTemplate[] | null; error: string | null; fromCache: boolean }>(null, {
    showToast: false,
    onSuccess: onSuccessFetchTemplates,
    onError: onErrorFetchTemplates,
  });

  const loadTemplates = useCallback(async () => {
    console.log('GlobalCustomFieldsManagement: loadTemplates called');
    if (isSessionLoading || !session?.user) {
      setCustomFields([]);
      return;
    }
    await executeLoadTemplates(async () => {
      const cacheKey = `custom_field_templates_${session.user.id}`;
      const { data, error, fromCache } = await fetchWithCache<CustomFieldTemplate[]>(
        cacheKey,
        async () => {
          const res = await CustomFieldTemplateService.getAllCustomFieldTemplates(); // Updated service call
          if (res.error) {
            throw new Error(res.error || t('custom_field_template.error_loading_templates', { error: t('custom_field_template.unknown_error') }));
          }
          return { data: res.data, error: null };
        }
      );
      if (error) {
        throw new Error(error);
      }
      return { data, error: null, fromCache };
    });
  }, [session, isSessionLoading, executeLoadTemplates, t]);

  const onSuccessOperation = useCallback(() => {
    ErrorManager.notifyUser(t('custom_field_template.delete_success'), "success");
    invalidateCache(`custom_field_templates_${session?.user?.id}`);
    loadTemplates();
  }, [session, loadTemplates, t]);

  const onErrorOperation = useCallback((error: Error) => {
    ErrorManager.logError(error, {
      component: 'GlobalCustomFieldsManagement',
      action: 'customFieldsOperation',
      metadata: {
        operation: 'unknown' // Default to unknown since context is already logged separately
      }
    });
  }, []);

  const {
    isLoading: isOperationLoading,
    executeAsync: executeOperation,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: t('custom_field_template.operation_error'),
    onSuccess: onSuccessOperation,
    onError: onErrorOperation,
  });

  const handleDeleteField = async (id: string) => {
    await executeOperation(async () => {
      const res = await CustomFieldTemplateService.deleteCustomFieldTemplate(id); // Updated service call
      if (res.error) {
        throw new Error(res.error || t('custom_field_template.delete_error'));
      }
    });
    setIsDeleteDialogOpen(false);
    setDeletingFieldId(null);
    setIsDialogClosing(false);
    // Refresh the templates list after successful deletion
    loadTemplates();
  };

  const handleDeleteClick = (id: string) => {
    if (isDialogClosing) return; // Prevent opening if dialog is closing
    setDeletingFieldId(id);
    setIsDeleteDialogOpen(true);
    setIsDialogClosing(false);
  };

  const handleEditClick = (field: CustomFieldTemplate) => {
    setEditingField(field);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingField(null);
    invalidateCache(`custom_field_templates_${session?.user?.id}`);
    loadTemplates();
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingField(null);
  };

  return (
    <ModernCard variant="glass" className="w-full max-w-4xl rounded-xl p-6">
      <ModernCardHeader className="text-center">
        <ModernCardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('custom_field_template.management_title')}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        <div className="flex justify-end items-center mb-6">
          <AddCustomFieldTemplateDialog onTemplateAdded={loadTemplates} />
        </div>

        {loadingTemplates && customFields.length === 0 ? (
          <LoadingMessage message={t('custom_field_template.loading_templates')} />
        ) : customFields.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={t('custom_field_template.no_templates_title')}
            description={t('custom_field_template.no_templates_description')}
          />
        ) : (
          <div className="grid gap-4">
            {customFields.map((field) => (
              <div key={field.id} className="glass p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{field.name}</h3>
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                        {field.type === 'text' ? t('custom_field_template.field_types.text') :
                         field.type === 'number' ? t('custom_field_template.field_types.number') :
                         field.type === 'date' ? t('custom_field_template.field_types.date') : t('custom_field_template.field_types.list')}
                      </span>
                      {field.required && (
                        <span className="px-2 py-1 bg-destructive text-destructive-foreground rounded text-xs">
                          {t('custom_field_template.required')}
                        </span>
                      )}
                    </div>
                    {field.description && (
                      <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                    )}
                    {field.type === 'list' && field.options && field.options.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {t('custom_field_template.options')}: {field.options.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <GlassButton
                      variant="glass"
                      size="sm"
                      onClick={() => handleEditClick(field as CustomFieldTemplate)}
                      className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200"
                    >
                      <Edit size={16} />
                    </GlassButton>

                    <GlassButton
                      variant="glass"
                      size="sm"
                      onClick={() => handleDeleteClick(field.id)}
                      className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200"
                      disabled={isOperationLoading || isDialogClosing}
                    >
                      {isOperationLoading ? <LoadingSpinner size={16} /> : <Trash2 size={16} />}
                    </GlassButton>

                    <StandardizedDeleteDialog
                      key={`delete-${field.id}`}
                      open={isDeleteDialogOpen && deletingFieldId === field.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          // Set closing flag to prevent any immediate re-opening
                          setIsDialogClosing(true);
                          setIsDeleteDialogOpen(false);
                          setDeletingFieldId(null);

                          // Remove the flag after a short delay
                          setTimeout(() => {
                            setIsDialogClosing(false);
                          }, 50); // Increased delay to match dialog delay
                        } else {
                          setIsDeleteDialogOpen(true);
                          setDeletingFieldId(field.id);
                          setIsDialogClosing(false);
                        }
                      }}
                      onConfirm={() => handleDeleteField(field.id)}
                      title={t('custom_field_template.delete_confirm_title')}
                      description={t('custom_field_template.delete_confirm_description')}
                      isDeleting={isOperationLoading && deletingFieldId === field.id}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModernCardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <FormDialogWrapper 
          title={t('custom_field_template.edit_title')}
          description={t('custom_field_template.edit_description')}
        >
          <CustomFieldTemplateForm
            initialData={editingField || undefined}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </FormDialogWrapper>
      </Dialog>
    </ModernCard>
  );
}