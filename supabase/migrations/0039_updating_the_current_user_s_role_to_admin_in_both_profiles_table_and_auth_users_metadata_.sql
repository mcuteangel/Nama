-- Update the role in the public.profiles table for the current user
UPDATE public.profiles
SET role = 'admin'
WHERE id = auth.uid();

-- Update the user_metadata in auth.users table for the current user
-- This requires elevated privileges, which dyad-execute-sql provides.
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"',
    true
)
WHERE id = auth.uid();