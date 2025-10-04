import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Copy } from "lucide-react";
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from "@/components/ui/modern-tooltip";
import { GradientButton } from "@/components/ui/glass-button";

interface ShareStatisticsProps {
  filters?: {
    quickRange: string;
    fromDate?: string;
    toDate?: string;
    selectedCompany?: string;
    selectedPosition?: string;
    selectedContactMethod?: string;
  };
}

const ShareStatistics: React.FC<ShareStatisticsProps> = ({ filters }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const generateShareableLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    if (filters) {
      if (filters.quickRange !== '12m') params.set('range', filters.quickRange);
      if (filters.fromDate) params.set('from', filters.fromDate);
      if (filters.toDate) params.set('to', filters.toDate);
      if (filters.selectedCompany && filters.selectedCompany !== 'all') params.set('company', filters.selectedCompany);
      if (filters.selectedPosition && filters.selectedPosition !== 'all') params.set('position', filters.selectedPosition);
      if (filters.selectedContactMethod && filters.selectedContactMethod !== 'all') params.set('method', filters.selectedContactMethod);
    }

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  const copyToClipboard = async () => {
    try {
      const link = generateShareableLink();
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <ModernTooltip>
      <ModernTooltipTrigger asChild>
        <GradientButton
          gradientType="primary"
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl"
        >
          {copied ? (
            <>
              <Check size={18} className="text-green-600" />
              <span className="hidden sm:inline">{t('share_statistics.copy_success')}</span>
            </>
          ) : (
            <>
              <Copy size={18} />
              <span className="hidden sm:inline">{t('share_statistics.share_link')}</span>
            </>
          )}
        </GradientButton>
      </ModernTooltipTrigger>
      <ModernTooltipContent>
        <p>{t('share_statistics.tooltip')}</p>
      </ModernTooltipContent>
    </ModernTooltip>
  );
};

export default ShareStatistics;
