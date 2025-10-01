-- ایجاد تابع get_birthdays_by_month برای آمار تولدها در ماه‌های مختلف
CREATE OR REPLACE FUNCTION get_birthdays_by_month(
  user_id_param UUID,
  start_date_param DATE DEFAULT NULL,
  end_date_param DATE DEFAULT NULL
)
RETURNS TABLE (
  month TEXT,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH month_birthdays AS (
    SELECT
      CASE
        WHEN EXTRACT(MONTH FROM c.birthday) = 1 THEN 'فروردین'
        WHEN EXTRACT(MONTH FROM c.birthday) = 2 THEN 'اردیبهشت'
        WHEN EXTRACT(MONTH FROM c.birthday) = 3 THEN 'خرداد'
        WHEN EXTRACT(MONTH FROM c.birthday) = 4 THEN 'تیر'
        WHEN EXTRACT(MONTH FROM c.birthday) = 5 THEN 'مرداد'
        WHEN EXTRACT(MONTH FROM c.birthday) = 6 THEN 'شهریور'
        WHEN EXTRACT(MONTH FROM c.birthday) = 7 THEN 'مهر'
        WHEN EXTRACT(MONTH FROM c.birthday) = 8 THEN 'آبان'
        WHEN EXTRACT(MONTH FROM c.birthday) = 9 THEN 'آذر'
        WHEN EXTRACT(MONTH FROM c.birthday) = 10 THEN 'دی'
        WHEN EXTRACT(MONTH FROM c.birthday) = 11 THEN 'بهمن'
        WHEN EXTRACT(MONTH FROM c.birthday) = 12 THEN 'اسفند'
      END as month_name,
      COUNT(*) as birthday_count
    FROM contacts c
    WHERE c.user_id = user_id_param
      AND c.birthday IS NOT NULL
      AND (start_date_param IS NULL OR c.created_at >= start_date_param)
      AND (end_date_param IS NULL OR c.created_at <= end_date_param)
    GROUP BY month_name
  )
  SELECT
    mb.month_name::TEXT,
    mb.birthday_count
  FROM month_birthdays mb
  ORDER BY
    CASE mb.month_name
      WHEN 'فروردین' THEN 1
      WHEN 'اردیبهشت' THEN 2
      WHEN 'خرداد' THEN 3
      WHEN 'تیر' THEN 4
      WHEN 'مرداد' THEN 5
      WHEN 'شهریور' THEN 6
      WHEN 'مهر' THEN 7
      WHEN 'آبان' THEN 8
      WHEN 'آذر' THEN 9
      WHEN 'دی' THEN 10
      WHEN 'بهمن' THEN 11
      WHEN 'اسفند' THEN 12
    END;
END;
$$;
