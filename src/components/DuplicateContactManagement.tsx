import React from 'react';
import { useTranslation } from "react-i18next";
import LoadingMessage from "./common/LoadingMessage";
import { useDuplicateContactManagement } from '@/hooks/use-duplicate-contact-management';
import {
  DuplicateContactScanner,
  DuplicateContactList
} from './duplicate-contact-management';

const DuplicateContactManagement: React.FC = React.memo(() => {
  const { t } = useTranslation();

  const {
    duplicatePairs,
    isScanning,
    hoveredPair,
    isLoading,
    setHoveredPair,
    fetchDuplicates,
    mergeContacts,
    discardDuplicate,
  } = useDuplicateContactManagement();

  if (isLoading) {
    return <LoadingMessage message={t('ai_suggestions.loading_duplicate_management_data')} />;
  }

  return (
    <div className="space-y-6">
      <DuplicateContactScanner
        isScanning={isScanning}
        onScan={fetchDuplicates}
      />

      <DuplicateContactList
        duplicatePairs={duplicatePairs}
        hoveredPair={hoveredPair}
        onMouseEnter={setHoveredPair}
        onMouseLeave={() => setHoveredPair(null)}
        onMerge={mergeContacts}
        onDiscard={discardDuplicate}
      />
    </div>
  );
});

DuplicateContactManagement.displayName = 'DuplicateContactManagement';

export default DuplicateContactManagement;
