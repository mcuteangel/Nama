import { MadeWithDyad } from "@/components/made-with-dyad";
import { 
  ModernCard, 
  ModernCardContent, 
  ModernCardDescription, 
  ModernCardHeader, 
  ModernCardTitle 
} from "@/components/ui/modern-card";
import { ModernButton } from "@/components/ui/modern-button";
import GroupList from "@/components/groups/GroupList";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Groups = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full fade-in-up">
      <ModernCard variant="glass" hover="lift" className="w-full max-w-4xl">
        <ModernCardHeader className="text-center">
          <ModernCardTitle className="text-4xl font-bold mb-2 text-gradient">
            مدیریت گروه‌ها
          </ModernCardTitle>
          <ModernCardDescription className="text-lg">
            ایجاد، ویرایش و حذف گروه‌های مخاطبین
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          <GroupList />
          <ModernButton
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full hover-lift"
          >
            <ArrowLeft size={20} className="me-2" />
            بازگشت به مخاطبین
          </ModernButton>
        </ModernCardContent>
      </ModernCard>
      <MadeWithDyad />
    </div>
  );
};

export default Groups;