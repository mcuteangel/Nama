-- ایجاد تابع get_company_growth برای آمار شرکت‌های با رشد ماهانه
CREATE OR REPLACE FUNCTION get_company_growth(
  user_id_param UUID,
  start_date_param DATE DEFAULT NULL,
  end_date_param DATE DEFAULT NULL
)
RETURNS TABLE (
  company TEXT,
  current_count BIGINT,
  previous_count BIGINT,
  growth NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH company_stats AS (
    SELECT
      c.company,
      COUNT(*) as current_count,
      LAG(COUNT(*)) OVER (ORDER BY c.company) as previous_count
    FROM contacts c
    WHERE c.user_id = user_id_param
      AND c.company IS NOT NULL
      AND c.company != ''
      AND (start_date_param IS NULL OR c.created_at >= start_date_param)
      AND (end_date_param IS NULL OR c.created_at <= end_date_param)
    GROUP BY c.company
  ),
  growth_calculations AS (
    SELECT
      company,
      current_count,
      previous_count,
      CASE
        WHEN previous_count > 0 THEN
          ROUND(((current_count::NUMERIC - previous_count::NUMERIC) / previous_count::NUMERIC) * 100, 2)
        ELSE
          0
      END as growth_percentage
    FROM company_stats
  )
  SELECT
    gc.company::TEXT,
    gc.current_count,
    COALESCE(gc.previous_count, 0) as previous_count,
    gc.growth_percentage
  FROM growth_calculations gc
  WHERE gc.current_count > 0
  ORDER BY gc.current_count DESC
  LIMIT 10;
END;
$$;
