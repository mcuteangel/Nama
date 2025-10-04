/**
 * انواع داده‌های پیشرفته برای سیستم پیشنهادات هوش مصنوعی
 * این فایل شامل تمام انواع مورد نیاز برای مدیریت پیشنهادات است
 */

import { ExtractedContactInfo } from '@/hooks/use-contact-extractor';

/**
 * وضعیت پردازش پیشنهادات
 */
export type SuggestionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'discarded';

/**
 * نوع پیشنهاد هوش مصنوعی
 */
export type SuggestionType = 'contact_extraction' | 'gender_suggestion' | 'duplicate_detection' | 'smart_grouping';

/**
 * اولویت پیشنهاد
 */
export type SuggestionPriority = 'high' | 'medium' | 'low';

/**
 * سطح اطمینان هوش مصنوعی
 */
export interface ConfidenceLevel {
  score: number; // 0-100
  factors: string[]; // عوامل مؤثر در محاسبه اطمینان
  lastUpdated: Date;
}

/**
 * اطلاعات آماری پیشنهاد
 */
export interface SuggestionStats {
  totalFields: number;
  confidence: ConfidenceLevel;
  processingTime?: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * اطلاعات تماس موجود برای مقایسه
 */
export interface ExistingContactMatch {
  id: string;
  firstName: string;
  lastName: string;
  emailAddresses: string[];
  phoneNumbers: string[];
  similarity: number; // 0-100
  matchType: 'exact' | 'similar' | 'partial';
}

/**
 * پیشنهاد پایه هوش مصنوعی
 */
export interface BaseAISuggestion {
  id: string;
  type: SuggestionType;
  status: SuggestionStatus;
  priority: SuggestionPriority;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  tags: string[];
  metadata?: Record<string, any>;
}

/**
 * پیشنهاد استخراج مخاطب
 */
export interface ContactExtractionSuggestion extends BaseAISuggestion {
  type: 'contact_extraction';
  extractedData: ExtractedContactInfo;
  existingContact?: ExistingContactMatch;
  stats: SuggestionStats;
  source: {
    text: string;
    method: 'text_input' | 'speech_to_text' | 'file_upload' | 'email_parsing';
    confidence: number;
  };
}

/**
 * پیشنهاد جنسیت
 */
export interface GenderSuggestion extends BaseAISuggestion {
  type: 'gender_suggestion';
  contactId: string;
  contactName: string;
  currentGender: 'male' | 'female' | 'not_specified';
  suggestedGender: 'male' | 'female';
  confidence: ConfidenceLevel;
  reasoning: string[];
}

/**
 * پیشنهاد تشخیص مخاطبان تکراری
 */
export interface DuplicateContactSuggestion extends BaseAISuggestion {
  type: 'duplicate_detection';
  contactId: string;
  contactName: string;
  duplicates: ExistingContactMatch[];
  confidence: ConfidenceLevel;
  mergeStrategy?: 'manual' | 'automatic' | 'smart_merge';
}

/**
 * پیشنهاد گروه‌بندی هوشمند
 */
export interface SmartGroupSuggestion extends BaseAISuggestion {
  type: 'smart_grouping';
  suggestedGroups: {
    name: string;
    description: string;
    contacts: string[]; // contact IDs
    criteria: string[];
    confidence: number;
  }[];
  basedOn: 'behavior' | 'relationships' | 'attributes' | 'ai_analysis';
}

/**
 * اتحاد تمام انواع پیشنهادات
 */
export type AISuggestion =
  | ContactExtractionSuggestion
  | GenderSuggestion
  | DuplicateContactSuggestion
  | SmartGroupSuggestion;

/**
 * فیلترهای جستجو برای پیشنهادات
 */
export interface SuggestionFilters {
  type?: SuggestionType[];
  status?: SuggestionStatus[];
  priority?: SuggestionPriority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  searchQuery?: string;
  minConfidence?: number;
}

/**
 * گزینه‌های مرتب‌سازی پیشنهادات
 */
export type SuggestionSortBy = 'createdAt' | 'updatedAt' | 'priority' | 'confidence' | 'status' | 'type';
export type SortOrder = 'asc' | 'desc';

/**
 * نتایج صفحه‌بندی شده پیشنهادات
 */
export interface PaginatedSuggestions {
  suggestions: AISuggestion[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * آمار کلی سیستم پیشنهادات
 */
export interface SuggestionSystemStats {
  totalSuggestions: number;
  pendingSuggestions: number;
  processingSuggestions: number;
  completedSuggestions: number;
  failedSuggestions: number;
  averageProcessingTime: number;
  successRate: number;
  suggestionsByType: Record<SuggestionType, number>;
  suggestionsByPriority: Record<SuggestionPriority, number>;
  recentActivity: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
}

/**
 * تنظیمات نمایش پیشنهادات
 */
export interface SuggestionDisplaySettings {
  compactMode: boolean;
  showConfidence: boolean;
  showStats: boolean;
  groupByType: boolean;
  autoExpand: boolean;
  animationEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
}

/**
 * رویدادهای پیشنهادات برای ردیابی
 */
export interface SuggestionEvent {
  suggestionId: string;
  event: 'created' | 'viewed' | 'processed' | 'discarded' | 'failed' | 'expired';
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * اکشن‌های قابل انجام روی پیشنهادات
 */
export interface SuggestionActions {
  process: (suggestion: AISuggestion) => Promise<void>;
  discard: (suggestionId: string) => Promise<void>;
  edit: (suggestion: AISuggestion) => Promise<void>;
  extendExpiry: (suggestionId: string, newExpiry: Date) => Promise<void>;
  updatePriority: (suggestionId: string, priority: SuggestionPriority) => Promise<void>;
  addTags: (suggestionId: string, tags: string[]) => Promise<void>;
  removeTags: (suggestionId: string, tags: string[]) => Promise<void>;
}
