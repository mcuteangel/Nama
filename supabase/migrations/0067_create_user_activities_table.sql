-- ایجاد جدول فعالیت‌های سیستم برای ردیابی فعالیت‌های کاربر
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'contact_created', 'contact_updated', 'group_created', 'group_updated', 'custom_field_created', etc.
  entity_type TEXT NOT NULL, -- 'contact', 'group', 'custom_field', etc.
  entity_id UUID, -- ID of the entity being acted upon
  entity_name TEXT, -- Name or description of the entity
  description TEXT, -- Human-readable description of the activity
  metadata JSONB, -- Additional data related to the activity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فعال کردن RLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- سیاست RLS: کاربران فقط فعالیت‌های خودشون رو ببینن
CREATE POLICY "Users can view their own activities" ON user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ایندکس برای عملکرد بهتر
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);

-- تابع برای دریافت فعالیت‌های اخیر کاربر
CREATE OR REPLACE FUNCTION get_user_activities(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 10,
  activity_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  activity_type TEXT,
  entity_type TEXT,
  entity_name TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ua.id,
    ua.activity_type,
    ua.entity_type,
    ua.entity_name,
    ua.description,
    ua.metadata,
    ua.created_at
  FROM user_activities ua
  WHERE ua.user_id = user_id_param
    AND (activity_types IS NULL OR ua.activity_type = ANY(activity_types))
  ORDER BY ua.created_at DESC
  LIMIT limit_param;
END;
$$;
