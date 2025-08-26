"use client";

import React from "react";
import { DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FormDialogWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const FormDialogWrapper: React.FC<FormDialogWrapperProps> = ({ children, className }) => {
  return (
    <DialogContent className={cn("sm:max-w-[500px] p-0 border-none bg-transparent shadow-none", className)}>
      {children}
    </DialogContent>
  );
};

export default FormDialogWrapper;