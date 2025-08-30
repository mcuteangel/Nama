import { ModernCard } from "@/components/ui/modern-card";
import { ModernTextarea } from "@/components/ui/modern-textarea";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface NotesCardProps {
  notes?: string | null;
}

export const NotesCard = ({ notes }: NotesCardProps) => {
  const { t } = useTranslation();
  
  // Only render if there are notes
  if (!notes) {
    return null;
  }

  return (
    <ModernCard 
      variant="glass" 
      hover="lift"
      className="h-full"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Info size={20} />
        {t('contact_detail.notes')}
      </h2>
      <ModernTextarea 
        value={notes} 
        readOnly 
        variant="glass"
        className="min-h-[150px]"
      />
    </ModernCard>
  );
};