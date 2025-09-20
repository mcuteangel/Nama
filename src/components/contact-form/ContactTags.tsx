import React, { useState, useEffect } from 'react';
import { Tag, Plus, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tag as TagType, TagWithCount } from '@/types/tag';
import { TagsService } from '@/services/tags-service';
import { TagInput, TagList } from '@/components/ui/tag';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSession } from '@/integrations/supabase/auth';

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
  const { session } = useSession(); // Get session from useSession hook
  const [availableTags, setAvailableTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      // Don't load if user is not authenticated
      if (!session?.user?.id) {
        setError('User not authenticated');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await TagsService.getAllTags(session.user.id); // Use actual user ID

        if (error) {
          setError(error);
          toast({
            title: t('common.error'),
            description: t('contact_form.tags.load_error'),
            variant: 'destructive'
          });
        } else {
          setAvailableTags(data || []);
        }
      } catch (err) {
        setError('Failed to load tags');
        console.error('Error loading tags:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, [t, toast, session]);

  // Handle adding a new tag
  const handleAddTag = async (tagName: string, color: string) => {
    // Don't create tag if user is not authenticated
    if (!session?.user?.id) {
      toast({
        title: t('common.error'),
        description: t('contact_form.tags.create_error'),
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await TagsService.createTag({
        name: tagName,
        color: color,
        user_id: session.user.id // Use actual user ID
      });

      if (error) {
        toast({
          title: t('common.error'),
          description: t('contact_form.tags.create_error'),
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
          title: t('common.success'),
          description: t('contact_form.tags.created_successfully')
        });
      }
    } catch (err) {
      console.error('Error creating tag:', err);
      toast({
        title: t('common.error'),
        description: t('contact_form.tags.create_error'),
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
    <CollapsibleSection
      title={t('contact_form.tags.title')}
      icon={<Tag size={20} />}
      className={cn('space-y-4', className)}
    >
      <div className="space-y-4">
        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">
              {t('contact_form.tags.selected_tags')}
            </h4>
            <TagList
              tags={selectedTags}
              onRemove={handleRemoveTag}
              removable={true}
              size="md"
            />
          </div>
        )}

        {/* Add new tag */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">
            {t('contact_form.tags.add_new')}
          </h4>
          <TagInput
            tags={[]}
            onAdd={handleAddTag}
            placeholder={t('contact_form.tags.new_tag_placeholder')}
          />
        </div>

        {/* Available tags */}
        {availableTags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">
              {t('contact_form.tags.available_tags')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleSelectExistingTag(tag)}
                  disabled={selectedTags.some(t => t.id === tag.id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border transition-all',
                    'hover:scale-105 active:scale-95',
                    selectedTags.some(t => t.id === tag.id)
                      ? 'bg-primary/10 border-primary text-primary cursor-default'
                      : 'bg-muted/50 border-muted-foreground/30 hover:bg-muted/70 hover:border-muted-foreground/50'
                  )}
                  style={{
                    backgroundColor: selectedTags.some(t => t.id === tag.id)
                      ? `${tag.color}20`
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
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.name}</span>
                  {tag.contact_count !== undefined && tag.contact_count > 0 && (
                    <span className="text-xs opacity-70">
                      ({tag.contact_count})
                    </span>
                  )}
                  {selectedTags.some(t => t.id === tag.id) && (
                    <Plus size={12} className="rotate-45" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
            <span className="mr-2 text-sm text-muted-foreground">
              {t('common.loading')}
            </span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default ContactTags;