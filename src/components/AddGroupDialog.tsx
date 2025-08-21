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
          className="w-full px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
        >
          {/* Wrap the children in a single span */}
          <span className="flex items-center gap-2">
            <PlusCircle size={20} className="me-2" />
            افزودن گروه جدید
          </span>
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