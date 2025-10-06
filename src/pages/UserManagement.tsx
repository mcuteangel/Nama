import {
  ModernCard,
  ModernCardContent,
  ModernCardDescription,
  ModernCardHeader,
  ModernCardTitle
} from "@/components/ui/modern-card";
import { UserList } from "@/features/user-management/components";
import { useTranslation } from "react-i18next";

const UserManagement = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full fade-in-up">
      <ModernCard variant="glass" hover="lift" className="w-full max-w-4xl">
        <ModernCardHeader className="text-center">
          <ModernCardTitle className="text-4xl font-bold mb-2 text-gradient">
            {t('user_management.title')}
          </ModernCardTitle>
          <ModernCardDescription className="text-lg">
            {t('user_management.description')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          <UserList />
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default UserManagement;