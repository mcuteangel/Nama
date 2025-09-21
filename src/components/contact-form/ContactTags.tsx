import React, { useState, useEffect } from 'react';
import { Tag, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tag as TagType, TagWithCount } from '@/types/tag';
import { TagsService } from '@/services/tags-service';
import { TagInput, TagList } from '@/components/ui/tag';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSession } from '@/integrations/supabase/auth';
import { designTokens } from '@/lib/design-tokens';

export interface ContactTagsProps {
  contactId?: string;
  selectedTags: TagType[];
  onTagsChange: (tags: TagType[]) => void;
  className?: string;
}

const ContactTags: React.FC<ContactTagsProps> = ({
  selectedTags,
  onTagsChange,
  className
}) => {
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
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {/* Header Section with New Design */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
           style={{
             background: designTokens.gradients.warning,
             boxShadow: designTokens.shadows.glass3d
           }}>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20"></div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              <Tag size={24} className="sm:w-8 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2"
                  style={{ fontFamily: designTokens.typography.fonts.primary }}>
                تگ‌ها
              </h2>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                تگ‌های مرتبط با مخاطب را انتخاب یا ایجاد کنید
              </p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4"
                    style={{ fontFamily: designTokens.typography.fonts.primary }}>
                  تگ‌های انتخاب شده
                </h4>
                <TagList
                  tags={selectedTags}
                  onRemove={handleRemoveTag}
                  removable={true}
                  size="lg"
                  className="gap-2 sm:gap-3"
                />
              </div>
            )}

            {/* Add new tag */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
              <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4"
                  style={{ fontFamily: designTokens.typography.fonts.primary }}>
                ایجاد تگ جدید
              </h4>
              <TagInput
                tags={[]}
                onAdd={handleAddTag}
                placeholder="نام تگ جدید را وارد کنید..."
                className="bg-white/20 border-white/30 text-white placeholder-white/60"
              />
            </div>

            {/* Available tags */}
            {availableTags.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4"
                    style={{ fontFamily: designTokens.typography.fonts.primary }}>
                  تگ‌های موجود
                </h4>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleSelectExistingTag(tag)}
                      disabled={selectedTags.some(t => t.id === tag.id)}
                      className={cn(
                        'inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl border transition-all duration-300',
                        'hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl',
                        'backdrop-blur-md',
                        selectedTags.some(t => t.id === tag.id)
                          ? 'bg-white/20 border-white/40 text-white cursor-default'
                          : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/40 text-white'
                      )}
                      style={{
                        backgroundColor: selectedTags.some(t => t.id === tag.id)
                          ? `${tag.color}40`
                          : undefined,
                        borderColor: selectedTags.some(t => t.id === tag.id)
                          ? tag.color
                          : undefined,
                        color: selectedTags.some(t => t.id === tag.id)
                          ? tag.color
                          : undefined
                      }}
                    >
                      <div
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="font-medium"
                            style={{ fontFamily: designTokens.typography.fonts.secondary }}>
                        {tag.name}
                      </span>
                      {tag.contact_count !== undefined && tag.contact_count > 0 && (
                        <span className="text-xs opacity-80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-black/20">
                          ({tag.contact_count})
                        </span>
                      )}
                      {selectedTags.some(t => t.id === tag.id) && (
                        <CheckCircle size={14} className="sm:w-4 text-green-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Loader2 size={20} className="sm:w-6 text-white animate-spin" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl sm:rounded-2xl animate-pulse"></div>
                </div>
                <div className="mr-3 sm:mr-4">
                  <p className="text-base sm:text-lg font-bold text-white mb-1">در حال بارگذاری...</p>
                  <p className="text-white/80 text-sm sm:text-base">تگ‌ها در حال بارگذاری هستند</p>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-red-50/10 backdrop-blur-md border border-red-200/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-500/20 flex items-center justify-center">
                    <XCircle size={16} className="sm:w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold text-red-400 mb-1">خطا در بارگذاری</p>
                    <p className="text-red-300 text-sm sm:text-base">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactTags;