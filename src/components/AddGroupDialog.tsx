import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog"; // Removed DialogHeader, DialogTitle, DialogTrigger
import GroupForm from "./GroupForm";

interface AddGroupDialogProps {
  onGroupAdded: () => void;
  open: boolean; // New prop to control dialog open state
  onOpenChange: (open: boolean) => void; // New prop to update open state
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
    <Dialog open={open} onOpenChange={onOpenChange}> {/* Use controlled props */}
      <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
        <GroupForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupDialog;