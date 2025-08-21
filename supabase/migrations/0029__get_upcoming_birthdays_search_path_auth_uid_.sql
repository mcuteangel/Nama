-- مرحله 1: تابع get_upcoming_birthdays با امضای قدیمی (با پارامتر uuid) را حذف کنید.
-- این کار تضمین می‌کند که هیچ ابهامی در مورد امضای تابع وجود نداشته باشد.
DROP FUNCTION IF EXISTS public.get_upcoming_birthdays(uuid);

-- مرحله 2: تابع get_upcoming_birthdays را بدون هیچ پارامتری بازسازی کنید.
-- این تابع اکنون مستقیماً از auth.uid() برای شناسایی کاربر فعلی استفاده می‌کند.
-- search_path شامل public, auth, pg_temp برای دسترسی کامل‌تر است.
CREATE OR REPLACE FUNCTION public.get_upcoming_birthdays()
 RETURNS TABLE(first_name text, last_name text, birthday date)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, auth, pg_temp -- Added 'auth' and 'pg_temp' to search path for robustness
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

-- مرحله 3: دسترسی EXECUTE را به تابع جدید (بدون پارامتر) برای نقش authenticated اعطا کنید.
-- این دسترسی برای فراخوانی تابع از طریق API Supabase ضروری است.
GRANT EXECUTE ON FUNCTION public.get_upcoming_birthdays() TO authenticated;