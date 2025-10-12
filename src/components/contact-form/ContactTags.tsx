import React, { useState, useEffect } from 'react';
import { Tag, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tag as TagType, TagWithCount } from '@/types/tag';
import { TagsService } from '@/services/tags-service';
import { TagInput, TagList } from '@/components/ui/tag';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSession } from '@/integrations/supabase/auth';
import { FormCard } from '@/components/ui/FormCard';
import { FormSection } from '@/components/ui/FormSection';

export interface ContactTagsProps {
  contactId?: string;
  selectedTags: TagType[];
  onTagsChange: (tags: TagType[]) => void;
  className?: string;
}

const ContactTags: React.FC<ContactTagsProps> = ({
  selectedTags,
  onTagsChange}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { session } = useSession();
  const [availableTags, setAvailableTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      if (!session?.user?.id) {
        setError('کاربر احراز هویت نشده');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await TagsService.getAllTags(session.user.id);

        if (error) {
          setError(error);
          toast({
            title: 'خطا',
            description: 'بارگذاری تگ‌ها با مشکل مواجه شد',
            variant: 'destructive'
          });
        } else {
          setAvailableTags(data || []);
        }
      } catch (err) {
        setError('بارگذاری تگ‌ها ناموفق بود');
        console.error('Error loading tags:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, [t, toast, session]);

  // Handle adding a new tag
  const handleAddTag = async (tagName: string, color: string) => {
    if (!session?.user?.id) {
      toast({
        title: 'خطا',
        description: 'برای ایجاد تگ جدید باید وارد سیستم شوید',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await TagsService.createTag({
        name: tagName,
        color: color,
        user_id: session.user.id
      });

      if (error) {
        toast({
          title: 'خطا',
          description: 'ایجاد تگ جدید با مشکل مواجه شد',
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        const newTagWithCount: TagWithCount = { ...data, contact_count: 0 };
        setAvailableTags(prev => [...prev, newTagWithCount]);

        // Add to selected tags
        const updatedTags = [...selectedTags, data];
        onTagsChange(updatedTags);

        toast({
          title: 'موفقیت',
          description: 'تگ جدید با موفقیت ایجاد شد'
        });
      }
    } catch (err) {
      console.error('Error creating tag:', err);
      toast({
        title: 'خطا',
        description: 'ایجاد تگ جدید ناموفق بود',
        variant: 'destructive'
      });
    }
  };

  // Handle removing a tag from contact
  const handleRemoveTag = (tagId: string) => {
    const updatedTags = selectedTags.filter(tag => tag.id !== tagId);
    onTagsChange(updatedTags);
  };

  // Handle selecting an existing tag
  const handleSelectExistingTag = (tag: TagType) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      const updatedTags = [...selectedTags, tag];
      onTagsChange(updatedTags);
    }
  };

  return (
    <FormCard
      title="تگ‌ها"
      description="تگ‌های مرتبط با مخاطب را انتخاب یا ایجاد کنید"
      icon={Tag}
      iconColor="#8b5cf6"
    >
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Loader2 size={24} className="mx-auto mb-2 opacity-50 animate-spin" />
            <p className="text-sm">در حال بارگذاری تگ‌ها...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <XCircle size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">بارگذاری تگ‌ها با خطا مواجه شد</p>
          </div>
        ) : (
          <>
            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <FormSection
                variant="card"
                title=""
                className="relative"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <CheckCircle size={10} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    تگ‌های انتخاب شده
                  </span>
                </div>
                <TagList
                  tags={selectedTags}
                  onRemove={handleRemoveTag}
                  removable={true}
                  size="lg"
                  className="gap-2"
                />
              </FormSection>
            )}

            {/* Add new tag */}
            <FormSection
              variant="card"
              title=""
              className="relative"
            >
              <TagInput
                tags={[]}
                onAdd={handleAddTag}
                placeholder="نام تگ جدید را وارد کنید..."
                label="ایجاد تگ جدید"
              />
            </FormSection>

            {/* Available tags */}
            {availableTags.length > 0 && (
              <FormSection
                variant="card"
                title=""
                className="relative"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Tag size={10} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    تگ‌های موجود
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleSelectExistingTag(tag)}
                      disabled={selectedTags.some(t => t.id === tag.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all duration-200',
                        selectedTags.some(t => t.id === tag.id)
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 cursor-default'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:scale-105'
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="font-medium truncate">
                        {tag.name}
                      </span>
                      {tag.contact_count !== undefined && tag.contact_count > 0 && (
                        <span className="text-xs opacity-80 px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                          ({tag.contact_count})
                        </span>
                      )}
                      {selectedTags.some(t => t.id === tag.id) && (
                        <CheckCircle size={14} className="text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              </FormSection>
            )}
          </>
        )}
      </div>
    </FormCard>
  );
};

export default ContactTags;