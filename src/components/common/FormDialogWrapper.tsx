"use client";

import React from "react";
import { DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FormDialogWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

const FormDialogWrapper: React.FC<FormDialogWrapperProps> = ({ 
  children, 
  className,
  title = "Form Dialog",
  description = "Form content"
}) => {
  return (
    <DialogContent className={cn("sm:max-w-[500px] p-0 border-none bg-transparent shadow-none", className)}>
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <DialogDescription className="sr-only">{description}</DialogDescription>
      {children}
    </DialogContent>
  );
};

export default FormDialogWrapper;