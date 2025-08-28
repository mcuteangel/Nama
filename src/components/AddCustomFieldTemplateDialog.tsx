import React, { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ModernButton } from "@/components/ui/modern-button";
import { Plus } from "lucide-react";
import CustomFieldTemplateForm from "./CustomFieldTemplateForm";
import FormDialogWrapper from "./common/FormDialogWrapper"; // Import the new wrapper
import { useTranslation } from 'react-i18next';

interface AddCustomFieldTemplateDialogProps {
  onTemplateAdded: () => void;
}

const AddCustomFieldTemplateDialog: React.FC<AddCustomFieldTemplateDialogProps> = ({ onTemplateAdded }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onTemplateAdded();
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <ModernButton
          type="button"
          variant="gradient-primary"
          size="sm"
          className="flex items-center gap-1 px-3 py-1 rounded-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
        >
          <span className="flex items-center gap-1">
            <Plus size={16} />
            {t('actions.add_new_field')}
          </span>
        </ModernButton>
      </DialogTrigger>
      <FormDialogWrapper> {/* Use the new wrapper */}
        <CustomFieldTemplateForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </FormDialogWrapper>
    </Dialog>
  );
};

export default AddCustomFieldTemplateDialog;