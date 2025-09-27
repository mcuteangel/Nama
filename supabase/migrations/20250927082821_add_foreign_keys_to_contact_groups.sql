-- Add foreign key constraint for group_id to ensure it references a valid group.
-- ON DELETE CASCADE means if a group is deleted, all its entries in contact_groups are also removed.
ALTER TABLE public.contact_groups
ADD CONSTRAINT contact_groups_group_id_fkey
FOREIGN KEY (group_id)
REFERENCES public.groups(id)
ON DELETE CASCADE;

-- Add foreign key constraint for contact_id to ensure it references a valid contact.
-- ON DELETE CASCADE means if a contact is deleted, all its group associations are also removed.
ALTER TABLE public.contact_groups
ADD CONSTRAINT contact_groups_contact_id_fkey
FOREIGN KEY (contact_id)
REFERENCES public.contacts(id)
ON DELETE CASCADE;
