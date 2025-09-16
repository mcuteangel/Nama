import { supabase } from "@/integrations/supabase/client";
import { Tag } from "@/types/tag";

export const TagsService = {
  // Get all tags for a user
  async getAllTags(userId: string): Promise<{ data: Tag[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;
      return { data: data as Tag[], error: null };
    } catch (error) {
      console.error('Error fetching tags:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  // Create a new tag
  async createTag(tag: Omit<Tag, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Tag | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([tag])
        .select()
        .single();

      if (error) throw error;
      return { data: data as Tag, error: null };
    } catch (error) {
      console.error('Error creating tag:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  // Update a tag
  async updateTag(id: string, updates: Partial<Tag>): Promise<{ data: Tag | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Tag, error: null };
    } catch (error) {
      console.error('Error updating tag:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  // Delete a tag
  async deleteTag(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting tag:', error);
      return { error: (error as Error).message };
    }
  },

  // Get tags for a specific contact
  async getContactTags(contactId: string): Promise<{ data: Tag[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .select('tags (*)')
        .eq('contact_id', contactId);

      if (error) throw error;
      
      // Extract tags from the join result
      const tags = data.map((item: any) => item.tags) as Tag[];
      return { data: tags, error: null };
    } catch (error) {
      console.error('Error fetching contact tags:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  // Add tags to a contact
  async addTagsToContact(contactId: string, tagIds: string[]): Promise<{ error: string | null }> {
    try {
      // First, remove all existing tags for this contact
      const { error: deleteError } = await supabase
        .from('contact_tags')
        .delete()
        .eq('contact_id', contactId);

      if (deleteError) throw deleteError;

      // Then add the new tags
      if (tagIds.length > 0) {
        const tagData = tagIds.map(tagId => ({
          contact_id: contactId,
          tag_id: tagId
        }));

        const { error: insertError } = await supabase
          .from('contact_tags')
          .insert(tagData);

        if (insertError) throw insertError;
      }

      return { error: null };
    } catch (error) {
      console.error('Error adding tags to contact:', error);
      return { error: (error as Error).message };
    }
  }
};