-- ایجاد تابع get_recent_activity برای آمار فعالیت مخاطبین
CREATE OR REPLACE FUNCTION get_recent_activity(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 5,
  start_date_param DATE DEFAULT NULL,
  end_date_param DATE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  last_activity TEXT,
  activity_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.first_name,
    c.last_name,
    c.updated_at::TEXT as last_activity,
    'update' as activity_type
  FROM contacts c
  WHERE c.user_id = user_id_param
    AND (start_date_param IS NULL OR c.created_at >= start_date_param)
    AND (end_date_param IS NULL OR c.created_at <= end_date_param)
  ORDER BY c.updated_at DESC
  LIMIT limit_param;
END;
$$;
