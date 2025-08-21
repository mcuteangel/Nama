import React from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import GroupForm from "./GroupForm";
import FormDialogWrapper from "./FormDialogWrapper"; // Import the new wrapper

interface AddGroupDialogProps {
  onGroupAdded: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddGroupDialog: React.FC<AddGroupDialogProps> = ({ onGroupAdded, open, onOpenChange }) => {
  const handleSuccess = () => {
    onOpenChange(false); // Close dialog on success
    onGroupAdded();
  };

  const handleCancel = () => {
    onOpenChange(false); // Close dialog on cancel
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <span className="flex items-center gap-1">
            <Plus size={16} />
            افزودن گروه جدید
          </span>
        </Button>
      </DialogTrigger>
      <FormDialogWrapper> {/* Use the new wrapper */}
        <GroupForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </FormDialogWrapper>
    </Dialog>
  );
};

export default AddGroupDialog;