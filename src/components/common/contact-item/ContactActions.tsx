import React from 'react';
import { Edit, Trash2 } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import LoadingSpinner from '../LoadingSpinner';

interface ContactActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  isDialogClosing: boolean;
}

export const ContactActions: React.FC<ContactActionsProps> = ({
  onEdit,
  onDelete,
  isDeleting,
  isDialogClosing
}) => {
  return (
    <div className="absolute top-0 left-3 bottom-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0" style={{ pointerEvents: 'auto' }}>

      <GlassButton
        variant="ghost"
        size="icon"
        className="w-9 h-9 hover:scale-105 rounded-xl shadow-md backdrop-blur-md border-0 hover:shadow-lg transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))',
          boxShadow: '0 6px 20px -6px rgba(59, 130, 246, 0.4)'
        }}
        onClick={onEdit}
      >
        <Edit size={15} style={{ color: 'white' }} />
      </GlassButton>

      <GlassButton
        variant="ghost"
        size="icon"
        className="w-9 h-9 hover:scale-105 rounded-xl shadow-md backdrop-blur-md border-0 hover:shadow-lg transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))',
          boxShadow: '0 6px 20px -6px rgba(239, 68, 68, 0.4)'
        }}
        onClick={onDelete}
        disabled={isDeleting || isDialogClosing}
      >
        {isDeleting ? (
          <LoadingSpinner size={16} className="text-white" />
        ) : (
          <Trash2 size={15} style={{ color: 'white' }} />
        )}
      </GlassButton>
    </div>
  );
};
