import { UserList } from "@/features/user-management/components";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/ui/PageHeader";

const UserManagement = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <PageHeader
        title={t('user_management.title')}
        description={t('user_management.description')}
        showBackButton={true}
        className="mb-6"
      />
      
      <div className="mt-6">
        <UserList />
      </div>
    </div>
  );
};

export default UserManagement;