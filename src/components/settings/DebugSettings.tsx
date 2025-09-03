import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wrench, Cpu } from 'lucide-react';
import SettingsCard from './SettingsCard';

const DebugSettings: React.FC = () => {
  useTranslation();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <SettingsCard
      title="Debug Settings"
      description="Development tools and debugging options"
      icon={<Wrench size={16} />}
      gradient="pink"
    >
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Cpu size={14} />
        <span>Development Mode Active</span>
      </div>
    </SettingsCard>
  );
};

export default DebugSettings;