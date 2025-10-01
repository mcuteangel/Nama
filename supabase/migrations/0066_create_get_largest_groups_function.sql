-- ایجاد تابع get_largest_groups برای آمار گروه‌های با بیشترین اعضا
CREATE OR REPLACE FUNCTION get_largest_groups(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 5,
  start_date_param DATE DEFAULT NULL,
  end_date_param DATE DEFAULT NULL
)
RETURNS TABLE (
  name TEXT,
  color TEXT,
  count BIGINT,
  growth NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH group_stats AS (
    SELECT
      g.name,
      g.color,
      COUNT(cg.contact_id) as member_count,
      COUNT(cg.contact_id) - LAG(COUNT(cg.contact_id)) OVER (ORDER BY g.name) as growth
    FROM groups g
    LEFT JOIN contact_groups cg ON g.id = cg.group_id
    LEFT JOIN contacts c ON cg.contact_id = c.id AND c.user_id = user_id_param
    WHERE g.user_id = user_id_param
      AND (start_date_param IS NULL OR c.created_at >= start_date_param)
      AND (end_date_param IS NULL OR c.created_at <= end_date_param)
    GROUP BY g.id, g.name, g.color
  )
  SELECT
    gs.name::TEXT,
    gs.color::TEXT,
    gs.member_count,
    COALESCE(gs.growth, 0)::NUMERIC as growth
  FROM group_stats gs
  ORDER BY gs.member_count DESC
  LIMIT limit_param;
END;
$$;
