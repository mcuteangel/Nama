-- اطمینان از اینکه کاربر postgres (مالک تابع) دسترسی SELECT بر روی جدول contacts را دارد.
-- این معمولاً به صورت پیش‌فرض وجود دارد، اما برای اطمینان مجدد آن را اضافه می‌کنیم.
GRANT SELECT ON public.contacts TO postgres;

-- بازسازی تابع get_upcoming_birthdays با تنظیم صریح search_path به 'public'
CREATE OR REPLACE FUNCTION public.get_upcoming_birthdays(user_id_param uuid)
 RETURNS TABLE(first_name text, last_name text, birthday date)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public -- تنظیم صریح search_path به 'public'
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
    c.user_id = user_id_param
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

-- اعطای دسترسی EXECUTE به تابع get_upcoming_birthdays برای نقش authenticated
-- این مرحله قبلاً انجام شده، اما برای اطمینان مجدد آن را تکرار می‌کنیم.
GRANT EXECUTE ON FUNCTION public.get_upcoming_birthdays(uuid) TO authenticated;