/**
 * انواع داده‌های پیشرفته برای سیستم پیشنهادات هوش مصنوعی مخاطبین
 * این فایل شامل تمام انواع مورد نیاز برای صفحه AISuggestions است
 */

import { PhoneNumberFormData, EmailAddressFormData, SocialLinkFormData } from "@/types/contact";

/**
 * نمایش ساده از پیشنهاد استخراج مخاطب برای استفاده در UI
 */
export interface AISuggestionDisplay {
  id: string;
  type: 'contact_extraction';
  extractedData: {
    firstName: string;
    lastName: string;
    company: string;
    position: string;
    phoneNumbers: PhoneNumberFormData[];
    emailAddresses: EmailAddressFormData[];
    socialLinks: SocialLinkFormData[];
    notes: string;
  };
  existingContact?: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddresses: string[];
    phoneNumbers: string[];
    similarity: number;
    matchType: 'exact' | 'similar' | 'partial';
  };
  stats: {
    totalFields: number;
    confidence: {
      score: number;
      factors: string[];
      lastUpdated: Date;
    };
    processingTime?: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  confidence: {
    score: number;
    factors: string[];
    lastUpdated: Date;
  };
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'discarded';
  source: {
    text: string;
    method: 'text_input' | 'speech_to_text' | 'file_upload' | 'email_parsing';
    confidence: number;
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  tags: string[];
  metadata?: {
    /** Additional context or notes about the suggestion */
    notes?: string;
    /** Source of the suggestion if different from the main source */
    sourceDetails?: {
      type?: string;
      id?: string;
      confidence?: number;
    };
    /** Any custom fields that don't fit the above */
    [key: string]: unknown;
  };
}

/**
 * آمار پیشنهادات
 */
export interface SuggestionStats {
  newContacts: number;
  updates: number;
  total: number;
}
