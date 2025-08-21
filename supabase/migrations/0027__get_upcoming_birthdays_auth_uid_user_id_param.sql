-- بازسازی تابع get_upcoming_birthdays بدون پارامتر ورودی
CREATE OR REPLACE FUNCTION public.get_upcoming_birthdays()
 RETURNS TABLE(first_name text, last_name text, birthday date)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    c.first_name,
    c.last_name,
    c.birthday
  FROM
    public.contacts c
  WHERE
    c.user_id = auth.uid() -- استفاده مستقیم از auth.uid()
    AND c.birthday IS NOT NULL
    AND (
      (EXTRACT(MONTH FROM c.birthday) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(DAY FROM c.birthday) >= EXTRACT(DAY FROM NOW()))
      OR
      (EXTRACT(MONTH FROM c.birthday) > EXTRACT(MONTH FROM NOW()))
    )
  ORDER BY
    EXTRACT(MONTH FROM c.birthday) ASC,
    EXTRACT(DAY FROM c.birthday) ASC;
END;
$function$;

-- لغو دسترسی EXECUTE قبلی برای تابع با پارامتر uuid
REVOKE EXECUTE ON FUNCTION public.get_upcoming_birthdays(uuid) FROM authenticated;

-- اعطای دسترسی EXECUTE به تابع جدید (بدون پارامتر) برای نقش authenticated
GRANT EXECUTE ON FUNCTION public.get_upcoming_birthdays() TO authenticated;