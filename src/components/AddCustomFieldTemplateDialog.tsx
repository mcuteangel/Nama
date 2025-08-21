import React, { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CustomFieldTemplateForm from "./CustomFieldTemplateForm";
import FormDialogWrapper from "./FormDialogWrapper"; // Import the new wrapper

interface AddCustomFieldTemplateDialogProps {
  onTemplateAdded: () => void;
}

const AddCustomFieldTemplateDialog: React.FC<AddCustomFieldTemplateDialogProps> = ({ onTemplateAdded }) => {
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <span className="flex items-center gap-1">
            <Plus size={16} />
            افزودن فیلد جدید
          </span>
        </Button>
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