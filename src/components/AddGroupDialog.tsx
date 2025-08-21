import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import GroupForm from "./GroupForm";

interface AddGroupDialogProps {
  onGroupAdded: () => void;
}

const AddGroupDialog: React.FC<AddGroupDialogProps> = ({ onGroupAdded }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onGroupAdded();
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
          size="icon"
          className="h-10 w-10 mt-auto bg-blue-500 hover:bg-blue-600 text-white border-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800 dark:border-blue-700"
        >
          <PlusCircle size={20} />
        </Button>
      </DialogTrigger>
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