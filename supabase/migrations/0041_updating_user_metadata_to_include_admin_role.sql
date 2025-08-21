UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE id = '0f62f926-50ab-4a67-bd6f-6cd2615ccfa5';