import { 
  ModernCard, 
  ModernCardContent} from "@/components/ui/modern-card";
import GroupsManagement from "@/components/groups/GroupsManagement";

const Groups = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full fade-in-up">
      <ModernCard variant="glass" hover="lift" className="w-full max-w-6xl">
        <ModernCardContent className="p-0">
          <GroupsManagement />
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default Groups;
