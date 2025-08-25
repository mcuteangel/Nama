import { GlobalCustomFieldsManagement } from "@/components/GlobalCustomFieldsManagement";
import { MadeWithDyad } from "@/components/made-with-dyad";
import EmptyState from '@/components/EmptyState';
import { ClipboardList } from 'lucide-react';

const CustomFields = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <GlobalCustomFieldsManagement />
      <MadeWithDyad />
    </div>
  );
};

export default CustomFields;